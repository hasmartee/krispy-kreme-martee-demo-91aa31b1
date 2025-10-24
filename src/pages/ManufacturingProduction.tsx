import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { RefreshCw, Loader2, CalendarIcon, Package, CheckCircle, Clock, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-food.jpg";
import { supabase } from "@/lib/supabase-helper";

interface AggregatedProduct {
  productSku: string;
  productName: string;
  category: string;
  plannedQuantity: number;
  manufacturedQuantity: number;
  status: 'pending' | 'confirmed';
  isLocked: boolean;
}

export default function ManufacturingProduction() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [products, setProducts] = useState<AggregatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [planStatus, setPlanStatus] = useState<'pending' | 'confirmed'>('pending');
  const { toast } = useToast();
  
  const formattedDate = selectedDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Product name mapping
  const productNames: Record<string, { name: string; category: string }> = {
    "KK-G001": { name: "Original Glazed", category: "Glazed" },
    "KK-G002": { name: "Chocolate Iced Glazed", category: "Glazed" },
    "KK-G003": { name: "Maple Iced", category: "Glazed" },
    "KK-G004": { name: "Glazed Blueberry", category: "Glazed" },
    "KK-G005": { name: "Caramel Iced", category: "Glazed" },
    "KK-G006": { name: "Coffee Glazed", category: "Glazed" },
    "KK-G007": { name: "Dulce de Leche", category: "Glazed" },
    "KK-I001": { name: "Strawberry Iced with Sprinkles", category: "Iced" },
    "KK-I002": { name: "Chocolate Iced with Sprinkles", category: "Iced" },
    "KK-I003": { name: "Vanilla Iced with Sprinkles", category: "Iced" },
    "KK-F001": { name: "Raspberry Filled", category: "Filled" },
    "KK-F002": { name: "Lemon Filled", category: "Filled" },
    "KK-F003": { name: "Boston Kreme", category: "Filled" },
    "KK-F004": { name: "Chocolate Kreme Filled", category: "Filled" },
    "KK-C001": { name: "Powdered Sugar", category: "Cake" },
    "KK-C002": { name: "Cinnamon Sugar", category: "Cake" },
    "KK-C003": { name: "Double Chocolate", category: "Cake" },
    "KK-S001": { name: "Cookies and Kreme", category: "Specialty" },
    "KK-S002": { name: "Apple Fritter", category: "Specialty" },
    "KK-S003": { name: "Glazed Cruller", category: "Specialty" },
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const productionDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Get production plan
      const { data: productionPlan } = await supabase
        .from('production_plans')
        .select('id, status')
        .eq('production_date', productionDate)
        .maybeSingle() as any;

      console.log('📋 Manufacturing: Production plan:', productionPlan);

      if (!productionPlan) {
        setProducts([]);
        setPlanStatus('pending');
        setLoading(false);
        return;
      }

      setPlanStatus(productionPlan.status);

      // Load allocations
      const { data: allocationsData } = await supabase
        .from('production_allocations')
        .select('product_sku, quantity, manufactured_quantity')
        .eq('production_plan_id', productionPlan.id) as any;

      console.log('📦 Manufacturing: Loaded allocations:', allocationsData?.length);

      if (allocationsData && allocationsData.length > 0) {
        // Aggregate by product SKU
        const aggregated: Record<string, AggregatedProduct> = allocationsData.reduce((acc: Record<string, AggregatedProduct>, alloc: any) => {
          if (!acc[alloc.product_sku]) {
            const productInfo = productNames[alloc.product_sku] || { name: alloc.product_sku, category: 'Other' };
            acc[alloc.product_sku] = {
              productSku: alloc.product_sku,
              productName: productInfo.name,
              category: productInfo.category,
              plannedQuantity: 0,
              manufacturedQuantity: 0,
              status: productionPlan.status,
              isLocked: false,
            };
          }
          acc[alloc.product_sku].plannedQuantity += alloc.quantity;
          acc[alloc.product_sku].manufacturedQuantity += alloc.manufactured_quantity || 0;
          return acc;
        }, {});

        const productsList: AggregatedProduct[] = Object.values(aggregated).sort((a, b) => 
          a.category.localeCompare(b.category) || a.productName.localeCompare(b.productName)
        );

        console.log('✅ Manufacturing: Aggregated products:', productsList.length);
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Manufacturing: Error loading data:", error);
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

  const updateManufacturedQuantity = async (productSku: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const product = products.find(p => p.productSku === productSku);
    if (product?.isLocked) {
      toast({
        title: "Product Locked",
        description: "This product has been confirmed and cannot be modified",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setProducts(products.map(p => 
      p.productSku === productSku
        ? { ...p, manufacturedQuantity: newQuantity }
        : p
    ));

    // Update database
    try {
      const productionDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: productionPlan } = await supabase
        .from('production_plans')
        .select('id')
        .eq('production_date', productionDate)
        .single() as any;

      if (!productionPlan) {
        throw new Error('Production plan not found');
      }

      // Update all allocations for this product
      const { error } = await supabase
        .from('production_allocations')
        .update({ manufactured_quantity: Math.floor(newQuantity / products.find(p => p.productSku === productSku)?.plannedQuantity || 1) })
        .eq('production_plan_id', productionPlan.id)
        .eq('product_sku', productSku) as any;

      if (error) {
        console.error('Error updating manufactured quantity:', error);
        toast({
          title: "Error",
          description: "Failed to update manufactured quantity",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating manufactured quantity:', error);
    }
  };

  const confirmProduct = async (productSku: string) => {
    const product = products.find(p => p.productSku === productSku);
    if (!product) return;

    // Update local state
    setProducts(products.map(p => 
      p.productSku === productSku
        ? { ...p, isLocked: true }
        : p
    ));

    toast({
      title: "Product Confirmed",
      description: `${product.productName} production has been locked`,
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      "Glazed": "bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm",
      "Iced": "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-sm",
      "Filled": "bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-sm",
      "Cake": "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-sm",
      "Specialty": "bg-gradient-to-r from-[#7ea058] to-[#6d9148] text-white shadow-sm",
    };
    return <Badge className={colors[category] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm"}>{category}</Badge>;
  };

  const getStatusBadge = (status: 'pending' | 'confirmed', isLocked: boolean = false) => {
    if (status === 'confirmed' || isLocked) {
      return (
        <Badge className="bg-gradient-to-r from-[#7ea058] to-[#6d9148] text-white border-0 shadow-md font-semibold px-3 py-1">
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
          Confirmed
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-[#ff914d] to-[#ff7a2f] text-white border-0 shadow-md font-semibold px-3 py-1">
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPlanned = products.reduce((sum, p) => sum + p.plannedQuantity, 0);
  const totalManufactured = products.reduce((sum, p) => sum + p.manufacturedQuantity, 0);
  const completionRate = totalPlanned > 0 ? ((totalManufactured / totalPlanned) * 100).toFixed(1) : '0';

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Hero Section */}
      <div 
        className="relative h-48 rounded-2xl overflow-hidden bg-cover bg-center shadow-2xl"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Manufacturing Production Plan
          </h1>
          <p className="text-xl text-white/90">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Date Picker and Summary */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Production Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "EEEE, MMM d, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPlanned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Manufactured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalManufactured.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#7ea058]">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">of planned quantity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex justify-start">{getStatusBadge(planStatus)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Production Items</CardTitle>
          <CardDescription>
            {products.length > 0 
              ? `${products.length} products in production plan`
              : 'No production plan for this date'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Planned Qty</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right bg-[#ff914d]/20 border-l-4 border-[#ff914d]">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-[#ff914d]">Manufactured Qty</span>
                        <Package className="h-4 w-4 text-[#ff914d]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => {
                    const variance = product.manufacturedQuantity - product.plannedQuantity;
                    const variancePercent = product.plannedQuantity > 0 
                      ? ((variance / product.plannedQuantity) * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <TableRow key={product.productSku} className={product.isLocked ? 'bg-green-50/30' : ''}>
                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {product.productName}
                            {product.isLocked && <Lock className="h-3.5 w-3.5 text-green-600" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCategoryBadge(product.category)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {product.plannedQuantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(product.status, product.isLocked)}
                        </TableCell>
                        <TableCell className="bg-[#ff914d]/20 border-l-4 border-[#ff914d]">
                          <Input
                            type="number"
                            min="0"
                            value={product.manufacturedQuantity}
                            onChange={(e) => updateManufacturedQuantity(product.productSku, parseInt(e.target.value) || 0)}
                            disabled={product.isLocked}
                            className={cn(
                              "w-32 ml-auto text-right font-bold text-lg",
                              product.isLocked 
                                ? "bg-muted cursor-not-allowed" 
                                : "border-2 border-[#ff914d] focus:border-[#ff7a2f] shadow-lg bg-white focus:ring-2 focus:ring-[#ff914d]/30"
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`font-semibold ${variance >= 0 ? 'text-[#7ea058]' : 'text-red-600'}`}>
                            {variance >= 0 ? '+' : ''}{variance}
                            <span className="text-xs ml-1">({variancePercent}%)</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {!product.isLocked ? (
                            <Button
                              size="sm"
                              onClick={() => confirmProduct(product.productSku)}
                              className="bg-gradient-to-r from-[#7ea058] to-[#6d9148] hover:from-[#6d9148] hover:to-[#5c8038] text-white shadow-md"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                          ) : (
                            <Badge className="bg-[#7ea058]/20 text-[#7ea058] border border-[#7ea058]/30">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Production Plan Available
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                There is no production plan for the selected date. Production plans are created by HQ.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
