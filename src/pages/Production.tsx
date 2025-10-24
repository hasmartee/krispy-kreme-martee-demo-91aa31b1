import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, RefreshCw, Plus, Minus, CloudRain, AlertTriangle, Sparkles, Download, Send, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import heroImage from "@/assets/hero-food.jpg";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/lib/supabase-helper";

interface Product {
  id: string;
  productName: string;
  category: string;
  store: string;
  storeId: string;
  currentStock: number;
  recommendedOrder: number;
  finalOrder: number;
  trend: "up" | "down" | "stable";
  historicalSales: number;
  predictedSales: number;
  dayPart?: string;
}

interface Store {
  id: string;
  name: string;
  cluster: string;
}

export default function Production() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { viewMode, selectedStore } = useView();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingProduction, setConfirmingProduction] = useState<string | null>(null);
  const [groupByProduct, setGroupByProduct] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  const formattedDate = selectedDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    loadData();
  }, [viewMode, selectedStore]);

  // Krispy Kreme product templates matching StoreProductRange
  const getProductsForCluster = (cluster: string) => {
    const allProducts = [
      { id: "KK-G001", name: "Original Glazed", category: "Glazed", dayPart: "Morning" },
      { id: "KK-G002", name: "Chocolate Iced Glazed", category: "Glazed", dayPart: "Morning" },
      { id: "KK-G003", name: "Maple Iced", category: "Glazed", dayPart: "Morning" },
      { id: "KK-G004", name: "Glazed Blueberry", category: "Glazed", dayPart: "Morning" },
      { id: "KK-G005", name: "Caramel Iced", category: "Glazed", dayPart: "Afternoon" },
      { id: "KK-G006", name: "Coffee Glazed", category: "Glazed", dayPart: "Morning" },
      { id: "KK-G007", name: "Dulce de Leche", category: "Glazed", dayPart: "Afternoon" },
      { id: "KK-I001", name: "Strawberry Iced with Sprinkles", category: "Iced", dayPart: "Afternoon" },
      { id: "KK-I002", name: "Chocolate Iced with Sprinkles", category: "Iced", dayPart: "Afternoon" },
      { id: "KK-I003", name: "Vanilla Iced with Sprinkles", category: "Iced", dayPart: "Afternoon" },
      { id: "KK-F001", name: "Raspberry Filled", category: "Filled", dayPart: "Morning" },
      { id: "KK-F002", name: "Lemon Filled", category: "Filled", dayPart: "Morning" },
      { id: "KK-F003", name: "Boston Kreme", category: "Filled", dayPart: "Afternoon" },
      { id: "KK-F004", name: "Chocolate Kreme Filled", category: "Filled", dayPart: "Afternoon" },
      { id: "KK-C001", name: "Powdered Sugar", category: "Cake", dayPart: "Morning" },
      { id: "KK-C002", name: "Cinnamon Sugar", category: "Cake", dayPart: "Morning" },
      { id: "KK-C003", name: "Double Chocolate", category: "Cake", dayPart: "Afternoon" },
      { id: "KK-S001", name: "Cookies and Kreme", category: "Specialty", dayPart: "Afternoon" },
      { id: "KK-S002", name: "Apple Fritter", category: "Specialty", dayPart: "Morning" },
      { id: "KK-S003", name: "Glazed Cruller", category: "Specialty", dayPart: "Afternoon" },
    ];

    // Match StoreProductRange logic
    switch (cluster) {
      case "transport_hub":
        return allProducts.slice(0, 20);
      case "business_district":
        return allProducts.slice(0, 25);
      case "residential":
      case "high_street":
        return allProducts;
      default:
        return allProducts.slice(0, 15);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('name') as any;

      if (storesData) {
        setStores(storesData);
        
        const mockProducts: Product[] = [];
        const targetStores = viewMode === "store_manager" 
          ? storesData.filter((s: any) => s.name === selectedStore)
          : storesData;

        targetStores.forEach((store: any) => {
          const storeProducts = getProductsForCluster(store.cluster || 'high_street');
          
          storeProducts.forEach(product => {
            const baseQty = 15 + Math.floor(Math.random() * 15);
            mockProducts.push({
              id: product.id,
              productName: product.name,
              category: product.category,
              store: store.name,
              storeId: store.id,
              currentStock: baseQty,
              recommendedOrder: baseQty,
              finalOrder: baseQty,
              trend: Math.random() > 0.3 ? "up" : "down",
              historicalSales: baseQty * 0.9,
              predictedSales: baseQty * 1.05,
              dayPart: product.dayPart,
            });
          });
        });

        setProducts(mockProducts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load production data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const updateFinalOrder = (productId: string, storeId: string, delta: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId && p.storeId === storeId
        ? { ...p, finalOrder: Math.max(0, p.finalOrder + delta) }
        : p
    ));
  };

  const handleConfirmProduction = async (product: Product) => {
    setConfirmingProduction(`${product.id}-${product.storeId}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "✓ Production Confirmed",
      description: `${product.productName} added to production queue for ${product.store}`,
    });
    
    setConfirmingProduction(null);
  };

  const handleExportCSV = () => {
    const headers = viewMode === "hq" 
      ? ["Product", "Store", "Recommended Qty", "Final Qty"]
      : ["Product", "Recommended Qty", "Final Qty"];
    
    const rows = products.map(p => 
      viewMode === "hq"
        ? [p.productName, p.store, p.recommendedOrder, p.finalOrder]
        : [p.productName, p.recommendedOrder, p.finalOrder]
    );
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "CSV Exported",
      description: "Production plan has been exported successfully",
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      "Glazed": "bg-amber-100 text-amber-800",
      "Iced": "bg-pink-100 text-pink-800",
      "Filled": "bg-purple-100 text-purple-800",
      "Cake": "bg-orange-100 text-orange-800",
      "Specialty": "bg-blue-100 text-blue-800",
    };
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>;
  };

  const getDayPartBadge = (dayPart: string | undefined) => {
    if (!dayPart) return null;
    const colors: Record<string, string> = {
      "Morning": "bg-amber-100 text-amber-800 border-amber-300",
      "Lunch": "bg-blue-100 text-blue-800 border-blue-300",
      "Afternoon": "bg-purple-100 text-purple-800 border-purple-300",
    };
    return <Badge variant="outline" className={colors[dayPart] || "bg-gray-100 text-gray-800"}>{dayPart}</Badge>;
  };

  // Aggregate products by product ID when groupByProduct is true
  const displayProducts = viewMode === "hq" && groupByProduct
    ? Object.values(
        products.reduce((acc, product) => {
          if (!acc[product.id]) {
            acc[product.id] = {
              ...product,
              storeId: 'aggregated', // Unique ID for aggregated view
              store: `${products.filter(p => p.id === product.id).length} stores`,
              currentStock: 0,
              recommendedOrder: 0,
              finalOrder: 0,
            };
          }
          acc[product.id].currentStock += product.currentStock;
          acc[product.id].recommendedOrder += product.recommendedOrder;
          acc[product.id].finalOrder += product.finalOrder;
          return acc;
        }, {} as Record<string, Product>)
      )
    : products;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Hero Section */}
      <div 
        className="relative h-48 rounded-2xl overflow-hidden bg-cover bg-center shadow-2xl"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-[#ff914d]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#ff914d]/30">
              <Sparkles className="h-5 w-5 text-[#ff914d] animate-pulse" />
              <span className="text-white font-semibold text-sm">AI-Powered Suggestions</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Suggested Production Plan</h1>
          <p className="text-xl text-white/90">
            {viewMode === "hq" ? "All Stores" : selectedStore} - {formattedDate}
          </p>
        </div>
      </div>

      {/* Date Picker and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Production Date:</span>
          <Select
            value={selectedDate.toISOString()}
            onValueChange={(value) => setSelectedDate(new Date(value))}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 14 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return (
                  <SelectItem key={i} value={date.toISOString()}>
                    {format(date, "EEEE, MMM d, yyyy")}
                    {i === 0 && " (Today)"}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === "hq" && (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={!groupByProduct ? "default" : "ghost"}
                  onClick={() => setGroupByProduct(false)}
                  className="h-8"
                >
                  By Line
                </Button>
                <Button
                  size="sm"
                  variant={groupByProduct ? "default" : "ghost"}
                  onClick={() => setGroupByProduct(true)}
                  className="h-8"
                >
                  By Product
                </Button>
              </div>
            )}
            <Button 
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Production Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Daily Production Plan</CardTitle>
              <CardDescription>
                AI-powered production quantities for tomorrow's service
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleExportCSV}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                {viewMode === "hq" && !groupByProduct && <TableHead>Store</TableHead>}
                <TableHead className="bg-gradient-to-r from-[#ff914d]/20 to-[#ff914d]/10 relative text-center">
                  <div className="flex items-center justify-center gap-2 relative">
                    <div className="absolute inset-0 bg-[#ff914d]/5 blur-sm" />
                    <Sparkles className="h-4 w-4 text-[#ff914d] relative z-10 animate-pulse" />
                    <span className="relative z-10 font-semibold bg-gradient-to-r from-[#ff914d] to-[#ff914d]/70 bg-clip-text text-transparent">
                      AI Recommended Qty
                    </span>
                  </div>
                </TableHead>
                <TableHead className="bg-brand-green/10 text-center">Final Qty</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.map((product) => (
                <TableRow key={`${product.id}-${product.storeId}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {product.productName}
                      </div>
                      <div className="text-sm text-muted-foreground">{product.id}</div>
                    </div>
                  </TableCell>
                  {viewMode === "hq" && !groupByProduct && (
                    <TableCell>
                      <span className="font-medium">{product.store}</span>
                    </TableCell>
                  )}
                  <TableCell className="bg-gradient-to-r from-[#ff914d]/10 to-transparent relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff914d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <span className="font-mono font-semibold text-foreground">
                        {product.recommendedOrder}
                      </span>
                      <Sparkles className="h-3 w-3 text-[#ff914d] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell className="bg-brand-green/5">
                    <div className="flex items-center gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFinalOrder(product.id, product.storeId, -1)}
                        className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-mono font-bold text-brand-green min-w-[2.5rem] text-center text-lg">
                        {product.finalOrder}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFinalOrder(product.id, product.storeId, 1)}
                        className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground"
                      disabled={!!confirmingProduction}
                      onClick={() => handleConfirmProduction(product)}
                    >
                      {confirmingProduction === `${product.id}-${product.storeId}` ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        'Confirm'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}