import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Loader2, CalendarIcon, Package, Truck, Store, Download, CheckCircle, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/donut-production-1.jpg";
import { supabase } from "@/lib/supabase-helper";

interface StoreAllocation {
  storeName: string;
  plannedQuantity: number;
  deliveryQuantity: number;
}

interface ProductAllocation {
  productSku: string;
  productName: string;
  category: string;
  totalPlanned: number;
  totalManufactured: number;
  adjustmentRatio: number;
  storeAllocations: StoreAllocation[];
}

interface ProductInStore {
  productSku: string;
  productName: string;
  category: string;
  plannedQuantity: number;
  deliveryQuantity: number;
  adjustmentRatio: number;
}

interface StoreView {
  storeName: string;
  products: ProductInStore[];
  totalPlanned: number;
  totalDelivery: number;
}

export default function DeliveryPlan() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [products, setProducts] = useState<ProductAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [planStatus, setPlanStatus] = useState<'pending' | 'confirmed'>('pending');
  const [viewMode, setViewMode] = useState<'store' | 'product'>('store');
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

      console.log('📋 Delivery Plan: Production plan:', productionPlan);

      if (!productionPlan) {
        setProducts([]);
        setPlanStatus('pending');
        setLoading(false);
        return;
      }

      setPlanStatus(productionPlan.status);

      // Load allocations with store names
      const { data: allocationsData } = await supabase
        .from('production_allocations')
        .select(`
          product_sku,
          quantity,
          manufactured_quantity,
          stores!inner(name)
        `)
        .eq('production_plan_id', productionPlan.id) as any;

      console.log('📦 Delivery Plan: Loaded allocations:', allocationsData?.length);

      if (allocationsData && allocationsData.length > 0) {
        // Aggregate by product SKU
        const productMap: Record<string, ProductAllocation> = {};

        allocationsData.forEach((alloc: any) => {
          if (!productMap[alloc.product_sku]) {
            const productInfo = productNames[alloc.product_sku] || { name: alloc.product_sku, category: 'Other' };
            productMap[alloc.product_sku] = {
              productSku: alloc.product_sku,
              productName: productInfo.name,
              category: productInfo.category,
              totalPlanned: 0,
              totalManufactured: 0,
              adjustmentRatio: 1,
              storeAllocations: [],
            };
          }

          const product = productMap[alloc.product_sku];
          product.totalPlanned += alloc.quantity;
          product.totalManufactured += alloc.manufactured_quantity || 0;

          product.storeAllocations.push({
            storeName: alloc.stores.name,
            plannedQuantity: alloc.quantity,
            deliveryQuantity: alloc.quantity, // Default to planned quantity
          });
        });

        // Calculate adjustment ratios and delivery quantities
        Object.values(productMap).forEach(product => {
          if (product.totalPlanned > 0 && product.totalManufactured > 0) {
            product.adjustmentRatio = product.totalManufactured / product.totalPlanned;
            
            // Calculate proportional delivery quantities only if manufactured
            product.storeAllocations.forEach(store => {
              store.deliveryQuantity = Math.floor(store.plannedQuantity * product.adjustmentRatio);
            });
          } else {
            // Use planned quantities when no manufacturing data
            product.adjustmentRatio = 1;
          }
        });

        const productsList = Object.values(productMap).sort((a, b) => 
          a.category.localeCompare(b.category) || a.productName.localeCompare(b.productName)
        );

        console.log('✅ Delivery Plan: Aggregated products:', productsList.length);
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Delivery Plan: Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load delivery plan data",
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

  const getStoreView = (): StoreView[] => {
    const storeMap: Record<string, StoreView> = {};

    products.forEach(product => {
      product.storeAllocations.forEach(store => {
        if (!storeMap[store.storeName]) {
          storeMap[store.storeName] = {
            storeName: store.storeName,
            products: [],
            totalPlanned: 0,
            totalDelivery: 0,
          };
        }

        storeMap[store.storeName].products.push({
          productSku: product.productSku,
          productName: product.productName,
          category: product.category,
          plannedQuantity: store.plannedQuantity,
          deliveryQuantity: store.deliveryQuantity,
          adjustmentRatio: product.adjustmentRatio,
        });

        storeMap[store.storeName].totalPlanned += store.plannedQuantity;
        storeMap[store.storeName].totalDelivery += store.deliveryQuantity;
      });
    });

    return Object.values(storeMap).sort((a, b) => a.storeName.localeCompare(b.storeName));
  };

  const exportToCSV = () => {
    if (viewMode === 'store') {
      const storeViews = getStoreView();
      let csvContent = "Store,Product,SKU,Planned Quantity,Delivery Quantity,Adjustment\n";
      
      storeViews.forEach(store => {
        store.products.forEach(product => {
          const diff = product.deliveryQuantity - product.plannedQuantity;
          csvContent += `"${store.storeName}","${product.productName}","${product.productSku}",${product.plannedQuantity},${product.deliveryQuantity},${diff}\n`;
        });
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delivery-plan-by-store-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      let csvContent = "Product,SKU,Store,Planned Quantity,Delivery Quantity,Adjustment\n";
      
      products.forEach(product => {
        product.storeAllocations.forEach(store => {
          const diff = store.deliveryQuantity - store.plannedQuantity;
          csvContent += `"${product.productName}","${product.productSku}","${store.storeName}",${store.plannedQuantity},${store.deliveryQuantity},${diff}\n`;
        });
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delivery-plan-by-product-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }

    toast({
      title: "Export Successful",
      description: "Delivery plan exported to CSV",
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalDelivery = products.reduce((sum, p) => 
    sum + p.storeAllocations.reduce((storeSum, s) => storeSum + s.deliveryQuantity, 0), 0
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Hero Section */}
      <div 
        className="relative h-48 rounded-2xl overflow-hidden bg-cover bg-center shadow-2xl"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/60 to-green-700/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Delivery Plan
          </h1>
          <p className="text-xl text-cream-foreground">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* 14-Day Delivery Forecast */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">14-Day Delivery Forecast</h2>
          <p className="text-muted-foreground">Delivery plan across all stores</p>
        </div>
        
        {/* Horizontal Date Selector */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {Array.from({ length: 14 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isPending = !isToday && !isPast;
            const dayOfWeek = format(date, 'EEE');
            const dayOfMonth = format(date, 'dd');
            
            return (
              <Button
                key={i}
                variant={isSelected ? "default" : "outline"}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1 h-auto py-3 px-6 min-w-[100px] relative mt-2",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-md border-2 border-primary" 
                    : isPast
                    ? "bg-background hover:bg-muted text-muted-foreground"
                    : isToday
                    ? "bg-background hover:bg-muted text-foreground"
                    : "bg-muted/30 hover:bg-muted/50 text-muted-foreground"
                )}
              >
                {isPending && (
                  <div className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-border shadow-sm">
                    P
                  </div>
                )}
                <span className="text-sm font-medium">{dayOfWeek}</span>
                <span className="text-lg font-bold">{dayOfMonth}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'store' | 'product')}>
            <TabsList>
              <TabsTrigger value="store" className="gap-2">
                <Store className="h-4 w-4" />
                By Store
              </TabsTrigger>
              <TabsTrigger value="product" className="gap-2">
                <Package className="h-4 w-4" />
                By Product
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={exportToCSV} variant="outline" disabled={products.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">unique items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units for Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalDelivery.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex justify-start">
              {planStatus === 'confirmed' ? (
                <Badge className="bg-gradient-to-r from-[#7ea058] to-[#6d9148] text-white border-0 shadow-md font-semibold px-3 py-1.5">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Confirmed
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-[#f8b29c] to-[#f6a389] text-white border-0 shadow-md font-semibold px-3 py-1.5">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Plan Table */}
      <Card className={cn(
        "shadow-lg",
        format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && "bg-muted/50 border-muted"
      )}>
        <CardHeader className={cn(
          format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && "bg-muted/30"
        )}>
          <CardTitle className="text-2xl flex items-center gap-2">
            {viewMode === 'store' ? 'Delivery Allocations by Store' : 'Delivery Allocations by Product'}
            {format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
              <Badge variant="secondary" className="text-xs">Pending</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {products.length > 0 
              ? viewMode === 'store' 
                ? `${getStoreView().length} stores to receive deliveries`
                : `${products.length} products to be delivered`
              : 'No delivery plan for this date'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            viewMode === 'store' ? (
              // By Store View
              <div className="space-y-6">
                {getStoreView().map((store) => (
                  <div key={store.storeName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Store className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold text-lg">{store.storeName}</h3>
                          <p className="text-sm text-muted-foreground">{store.products.length} products</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Delivery</div>
                        <div className="text-xl font-bold text-primary">{store.totalDelivery}</div>
                      </div>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Planned</TableHead>
                            <TableHead className="text-right">Delivery</TableHead>
                            <TableHead className="text-right">Adjustment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {store.products.map((product) => {
                            const diff = product.deliveryQuantity - product.plannedQuantity;
                            return (
                              <TableRow key={product.productSku}>
                                <TableCell className="font-medium">{product.productName}</TableCell>
                                <TableCell className="text-right">{product.plannedQuantity}</TableCell>
                                <TableCell className="text-right font-semibold text-primary">
                                  {product.deliveryQuantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className={`font-semibold ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-600' : ''}`}>
                                    {diff >= 0 ? '+' : ''}{diff}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-muted/50 font-semibold">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right">{store.totalPlanned}</TableCell>
                            <TableCell className="text-right text-primary">{store.totalDelivery}</TableCell>
                            <TableCell className="text-right">
                              {store.totalDelivery - store.totalPlanned >= 0 ? '+' : ''}
                              {store.totalDelivery - store.totalPlanned}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // By Product View
              <div className="space-y-6">
                {products.map((product) => (
                <div key={product.productSku} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-lg">{product.productName}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {product.productSku}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getCategoryBadge(product.category)}
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Adjustment Ratio</div>
                        <div className={`font-semibold ${product.adjustmentRatio < 1 ? 'text-red-600' : product.adjustmentRatio > 1 ? 'text-green-600' : ''}`}>
                          {(product.adjustmentRatio * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Store</TableHead>
                          <TableHead className="text-right">Planned Quantity</TableHead>
                          <TableHead className="text-right">Delivery Quantity</TableHead>
                          <TableHead className="text-right">Adjustment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.storeAllocations.map((store, idx) => {
                          const diff = store.deliveryQuantity - store.plannedQuantity;
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{store.storeName}</TableCell>
                              <TableCell className="text-right">{store.plannedQuantity}</TableCell>
                              <TableCell className="text-right font-semibold text-primary">
                                {store.deliveryQuantity}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-600' : ''}`}>
                                  {diff >= 0 ? '+' : ''}{diff}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-muted/50 font-semibold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">
                            {product.storeAllocations.reduce((sum, s) => sum + s.plannedQuantity, 0)}
                          </TableCell>
                          <TableCell className="text-right text-primary">
                            {product.storeAllocations.reduce((sum, s) => sum + s.deliveryQuantity, 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.totalManufactured - product.totalPlanned >= 0 ? '+' : ''}
                            {product.totalManufactured - product.totalPlanned}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Delivery Plan Available
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                There is no delivery plan for the selected date. Plans are created based on confirmed production.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
