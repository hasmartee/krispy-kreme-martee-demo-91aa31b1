import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, RefreshCw, Plus, Minus, CloudRain, AlertTriangle, Sparkles, Download, Send, Loader2, CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/donut-production-1.jpg";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/lib/supabase-helper";
import { getCategoryBadgeClass } from "@/lib/category-utils";

interface Product {
  id: string;
  productName: string;
  category: string;
  store: string;
  storeId: string;
  currentStock: number;
  recommendedOrder: number;
  finalOrder: number;
  manufacturedQty: number;
  trend: "up" | "down" | "stable";
  historicalSales: number;
  predictedSales: number;
  allocationId?: string;
  capacityMin?: number;
  capacityMax?: number;
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
  const [productCapacities, setProductCapacities] = useState<Record<string, { min: number; max: number }>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const { toast } = useToast();
  
  const formattedDate = selectedDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    loadData();
    loadProductCapacities();
  }, [viewMode, selectedStore, selectedDate]);

  const loadProductCapacities = async () => {
    try {
      const { data, error } = await supabase
        .from('product_capacities')
        .select('*');
      
      if (error) {
        console.error('Error loading capacities:', error);
        return;
      }
      
      if (data) {
        const capacitiesMap: Record<string, { min: number; max: number }> = {};
        data.forEach((cap: any) => {
          const key = `${cap.product_sku}-${cap.store_id}`;
          capacitiesMap[key] = {
            min: cap.capacity_min || 0,
            max: cap.capacity_max || 0,
          };
        });
        setProductCapacities(capacitiesMap);
      }
    } catch (error) {
      console.error('Error loading product capacities:', error);
    }
  };

  // Krispy Kreme product templates matching StoreProductRange
  const getProductsForCluster = (cluster: string) => {
    const allProducts = [
      { id: "KK-G001", name: "Original Glazed", category: "Glazed" },
      { id: "KK-G002", name: "Chocolate Iced Glazed", category: "Glazed" },
      { id: "KK-G003", name: "Maple Iced", category: "Glazed" },
      { id: "KK-G004", name: "Glazed Blueberry", category: "Glazed" },
      { id: "KK-G005", name: "Caramel Iced", category: "Glazed" },
      { id: "KK-G006", name: "Coffee Glazed", category: "Glazed" },
      { id: "KK-G007", name: "Dulce de Leche", category: "Glazed" },
      { id: "KK-I001", name: "Strawberry Iced with Sprinkles", category: "Iced" },
      { id: "KK-I002", name: "Chocolate Iced with Sprinkles", category: "Iced" },
      { id: "KK-I003", name: "Vanilla Iced with Sprinkles", category: "Iced" },
      { id: "KK-F001", name: "Raspberry Filled", category: "Filled" },
      { id: "KK-F002", name: "Lemon Filled", category: "Filled" },
      { id: "KK-F003", name: "Boston Kreme", category: "Filled" },
      { id: "KK-F004", name: "Chocolate Kreme Filled", category: "Filled" },
      { id: "KK-C001", name: "Powdered Sugar", category: "Cake" },
      { id: "KK-C002", name: "Cinnamon Sugar", category: "Cake" },
      { id: "KK-C003", name: "Double Chocolate", category: "Cake" },
      { id: "KK-S001", name: "Cookies and Kreme", category: "Specialty" },
      { id: "KK-S002", name: "Apple Fritter", category: "Specialty" },
      { id: "KK-S003", name: "Glazed Cruller", category: "Specialty" },
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
      console.log('🔍 PRODUCTION PAGE: Loading data...');
      const productionDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('name') as any;

      console.log('🏪 PRODUCTION PAGE: Stores loaded:', storesData?.length);

      if (storesData) {
        setStores(storesData);
        
        const targetStores = viewMode === "store_manager" 
          ? storesData.filter((s: any) => s.name === selectedStore)
          : storesData;

        console.log('🎯 PRODUCTION PAGE: Target stores:', targetStores.length);

        // Try to load existing production plan
        const { data: productionPlan } = await supabase
          .from('production_plans')
          .select('id, status')
          .eq('production_date', productionDate)
          .single() as any;

        console.log('📋 PRODUCTION PAGE: Production plan:', productionPlan);

        let productsToDisplay: Product[] = [];

        if (productionPlan) {
          // Load existing allocations from database
          const { data: allocationsData } = await supabase
            .from('production_allocations')
            .select('id, store_id, product_sku, quantity, manufactured_quantity')
            .eq('production_plan_id', productionPlan.id) as any;

          console.log('📦 PRODUCTION PAGE: Loaded allocations:', allocationsData?.length);

          // Build products from allocations
          if (allocationsData && allocationsData.length > 0) {
            const storeMap = new Map(storesData.map((s: any) => [s.id, s]));
            
            allocationsData.forEach((alloc: any) => {
              const store: any = storeMap.get(alloc.store_id);
              if (!store) return;

              const productTemplate = getProductsForCluster(store.cluster || 'high_street')
                .find(p => p.id === alloc.product_sku);
              
              if (productTemplate) {
                // Always initialize manufactured_qty to match planned quantity
                console.log('Loading product:', alloc.product_sku, 'quantity:', alloc.quantity, 'manufactured:', alloc.manufactured_quantity);
                const capacityKey = `${alloc.product_sku}-${alloc.store_id}`;
                const capacity = productCapacities[capacityKey] || { min: 0, max: 0 };
                
                productsToDisplay.push({
                  id: alloc.product_sku,
                  productName: productTemplate.name,
                  category: productTemplate.category,
                  store: store.name,
                  storeId: store.id,
                  currentStock: alloc.quantity,
                  recommendedOrder: alloc.quantity,
                  finalOrder: alloc.quantity,
                  manufacturedQty: alloc.quantity,
                  trend: "stable" as const,
                  historicalSales: alloc.quantity * 0.9,
                  predictedSales: alloc.quantity * 1.05,
                  allocationId: alloc.id,
                  capacityMin: capacity.min,
                  capacityMax: capacity.max,
                });
                console.log('Added product with manufacturedQty:', alloc.quantity);
              }
            });
            console.log('✅ PRODUCTION PAGE: Loaded from DB:', productsToDisplay.length);
          }
        }

        // If no existing data, generate mock products
        if (productsToDisplay.length === 0) {
          console.log('🆕 PRODUCTION PAGE: No existing data, generating mock data');
          targetStores.forEach((store: any) => {
            const storeProducts = getProductsForCluster(store.cluster || 'high_street');
            
            storeProducts.forEach(product => {
              const baseQty = 15 + Math.floor(Math.random() * 15);
              const capacityKey = `${product.id}-${store.id}`;
              const capacity = productCapacities[capacityKey] || { min: 0, max: 0 };
              
              productsToDisplay.push({
                id: product.id,
                productName: product.name,
                category: product.category,
                store: store.name,
                storeId: store.id,
                currentStock: baseQty,
                recommendedOrder: baseQty,
                finalOrder: baseQty,
                manufacturedQty: baseQty,
                trend: Math.random() > 0.3 ? "up" : "down",
                historicalSales: baseQty * 0.9,
                predictedSales: baseQty * 1.05,
                capacityMin: capacity.min,
                capacityMax: capacity.max,
              });
            });
          });

          // Save initial mock data to database
          console.log('💾 PRODUCTION PAGE: Saving initial mock data...');
          await savePendingAllocations(productsToDisplay);
        }

        console.log('✅ PRODUCTION PAGE: Total products:', productsToDisplay.length);
        setProducts(productsToDisplay);
      }
    } catch (error) {
      console.error("❌ PRODUCTION PAGE: Error loading data:", error);
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

  const savePendingAllocations = async (productsToSave: Product[]) => {
    try {
      const productionDate = format(selectedDate, 'yyyy-MM-dd');
      console.log('🔄 SAVING ALLOCATIONS for date:', productionDate);
      console.log('🔄 Products to save:', productsToSave.length);
      
      // Get or create production plan
      const { data: existingPlans } = await supabase
        .from('production_plans')
        .select('id, status')
        .eq('production_date', productionDate) as any;

      let planId = existingPlans?.[0]?.id;
      console.log('🔄 Existing plan ID:', planId);

      if (!planId) {
        console.log('🔄 Creating new production plan...');
        const { data: newPlan, error: planError } = await supabase
          .from('production_plans')
          .insert({
            production_date: productionDate,
            status: 'pending',
          })
          .select()
          .single() as any;

        if (planError) {
          console.error('❌ Error creating plan:', planError);
          throw planError;
        }
        planId = newPlan?.id;
        console.log('✅ Created new plan ID:', planId);
      }

      if (!planId) {
        console.error('❌ No plan ID available');
        return { success: false, error: 'No plan ID' };
      }

      // Save all allocations
      const allocations = productsToSave.map(p => ({
        production_plan_id: planId,
        store_id: p.storeId,
        product_sku: p.id,
        quantity: p.finalOrder,
        day_part: 'morning', // Default day_part
      }));

      console.log('🔄 Upserting', allocations.length, 'allocations');

      const { data: upsertResult, error } = await supabase
        .from('production_allocations')
        .upsert(allocations, {
          onConflict: 'production_plan_id,store_id,product_sku,day_part'
        })
        .select() as any;

      if (error) {
        console.error('❌ Upsert error:', error);
        return { success: false, error };
      }
      
      // Update production plan status to 'confirmed' when quantities are adjusted
      const { error: statusError } = await supabase
        .from('production_plans')
        .update({ status: 'confirmed' })
        .eq('id', planId) as any;

      if (statusError) {
        console.error('❌ Error updating plan status:', statusError);
      } else {
        console.log('✅ Updated plan status to confirmed');
      }

      console.log('✅ Upserted successfully:', upsertResult?.length, 'records');
      return { success: true, count: upsertResult?.length };
    } catch (error) {
      console.error('❌ Error saving pending allocations:', error);
      return { success: false, error };
    }
  };

  const updateFinalOrder = async (productId: string, storeId: string, delta: number) => {
    // If in aggregated view (By Total), update all stores for this product
    const isAggregated = storeId === 'aggregated';
    
    const updatedProducts = products.map(p => 
      isAggregated
        ? (p.id === productId ? { ...p, finalOrder: Math.max(0, p.finalOrder + delta) } : p)
        : (p.id === productId && p.storeId === storeId ? { ...p, finalOrder: Math.max(0, p.finalOrder + delta) } : p)
    );
    setProducts(updatedProducts);

    // Save updated products to database
    const productsToSave = isAggregated
      ? updatedProducts.filter(p => p.id === productId)
      : updatedProducts.filter(p => p.id === productId && p.storeId === storeId);
    
    if (productsToSave.length > 0) {
      await savePendingAllocations(productsToSave);
    }
  };

  const updateManufacturedQty = async (productId: string, storeId: string, delta: number) => {
    const updatedProducts = products.map(p => 
      p.id === productId && p.storeId === storeId
        ? { ...p, manufacturedQty: Math.max(0, p.manufacturedQty + delta) }
        : p
    );
    setProducts(updatedProducts);

    // Save manufactured quantity to database
    const updatedProduct = updatedProducts.find(p => p.id === productId && p.storeId === storeId);
    if (updatedProduct?.allocationId) {
      const { error } = await supabase
        .from('production_allocations')
        .update({ manufactured_quantity: updatedProduct.manufacturedQty })
        .eq('id', updatedProduct.allocationId) as any;

      if (error) {
        console.error('Error updating manufactured quantity:', error);
        toast({
          title: "Error",
          description: "Failed to update manufactured quantity",
          variant: "destructive",
        });
      }
    }
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


  // Aggregate products by product ID when groupByProduct is true
  const displayProducts = useMemo(() => {
    if (viewMode === "hq" && groupByProduct) {
      return Object.values(
        products.reduce((acc, product) => {
          if (!acc[product.id]) {
            acc[product.id] = {
              id: product.id,
              productName: product.productName,
              category: product.category,
              storeId: 'aggregated',
              store: '',
              currentStock: 0,
              recommendedOrder: 0,
              finalOrder: 0,
              manufacturedQty: 0,
              trend: product.trend,
              historicalSales: 0,
              predictedSales: 0,
              capacityMin: 0,
              capacityMax: 0,
            };
          }
          acc[product.id].currentStock += product.currentStock;
          acc[product.id].recommendedOrder += product.recommendedOrder;
          acc[product.id].finalOrder += product.finalOrder;
          acc[product.id].manufacturedQty += product.manufacturedQty;
          acc[product.id].historicalSales += product.historicalSales;
          acc[product.id].predictedSales += product.predictedSales;
          return acc;
        }, {} as Record<string, Product>)
      );
    }
    return products;
  }, [viewMode, groupByProduct, products]);

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
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/60 to-green-700/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-[#ff914d]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#ff914d]/30">
              <Sparkles className="h-5 w-5 text-[#ff914d] animate-pulse" />
              <span className="text-white font-semibold text-sm">AI-Powered Suggestions</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Production Plan</h1>
          <p className="text-xl text-primary/90">
            {viewMode === "hq" ? "All Stores" : selectedStore} - {formattedDate}
          </p>
        </div>
      </div>

      {/* 14-Day Production Forecast */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">14-Day Production Forecast</h2>
          <p className="text-muted-foreground">Your rolling production plan, updated daily with additional data</p>
        </div>
        
        {/* Horizontal Date Selector */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {Array.from({ length: 14 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const dayOfWeek = format(date, 'EEE');
            const dayOfMonth = format(date, 'dd');
            const isPending = !isToday;
            
            return (
              <Button
                key={i}
                variant={isSelected ? "default" : "outline"}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1 h-auto py-3 px-6 min-w-[100px] relative mt-2",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-md border-2 border-primary" 
                    : "bg-background hover:bg-muted text-muted-foreground"
                )}
              >
                {isToday && (
                  <div className="absolute -top-2 -right-2 bg-[#7ea058] text-white text-[9px] font-semibold px-2 py-0.5 rounded-full border border-white shadow-sm">
                    Live
                  </div>
                )}
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
          <div className="flex items-center gap-2">
            {viewMode === "hq" && (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={!groupByProduct ? "default" : "ghost"}
                  onClick={() => setGroupByProduct(false)}
                  className="h-8"
                >
                  By Store
                </Button>
                <Button
                  size="sm"
                  variant={groupByProduct ? "default" : "ghost"}
                  onClick={() => setGroupByProduct(true)}
                  className="h-8"
                >
                  By Total
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
      <Card className={cn(
        "shadow-card",
        format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && "bg-muted/50 border-muted"
      )}>
        <CardHeader className={cn(
          format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && "bg-muted/30"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Daily Production Plan
                {format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
                  <Badge variant="secondary" className="text-xs">Pending</Badge>
                )}
              </CardTitle>
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
          <Table key={groupByProduct ? 'total' : 'store'}>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                {!groupByProduct && viewMode === "hq" && <TableHead>Store</TableHead>}
                {!groupByProduct && viewMode === "hq" && <TableHead className="text-center">Capacity</TableHead>}
                <TableHead className="bg-gradient-to-r from-[#ff914d]/20 to-[#ff914d]/10 border-l-4 border-l-[#ff914d] text-center">
                  <div className="flex items-center justify-center gap-2 py-1">
                    <Sparkles className="h-5 w-5 text-[#ff914d] animate-pulse" />
                    <span className="font-bold text-[#ff914d] text-lg">AI Recommended</span>
                  </div>
                </TableHead>
                <TableHead className="bg-gradient-to-r from-[#7ea058]/20 to-[#7ea058]/10 border-l-4 border-l-[#7ea058] text-center">
                  <div className="flex items-center justify-center gap-2 py-1">
                    <span className="font-bold text-[#7ea058] text-lg">Final Quantity</span>
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.map((product) => (
                <TableRow key={groupByProduct ? product.id : `${product.id}-${product.storeId}`}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {product.productName}
                        </div>
                        {editingCategory === `${product.id}-${product.storeId}` && viewMode === "hq" ? (
                          <Select
                            value={product.category}
                            onValueChange={(newCategory) => {
                              setProducts(products.map(p => 
                                (p.id === product.id && p.storeId === product.storeId)
                                  ? { ...p, category: newCategory }
                                  : p
                              ));
                              setEditingCategory(null);
                            }}
                          >
                            <SelectTrigger className="w-[130px] h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Glazed">Glazed</SelectItem>
                              <SelectItem value="Iced">Iced</SelectItem>
                              <SelectItem value="Filled">Filled</SelectItem>
                              <SelectItem value="Cake">Cake</SelectItem>
                              <SelectItem value="Specialty">Specialty</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge 
                            className={`${getCategoryBadgeClass(product.category)} ${viewMode === "hq" ? "cursor-pointer hover:opacity-80" : ""}`}
                            onClick={() => viewMode === "hq" && setEditingCategory(`${product.id}-${product.storeId}`)}
                          >
                            {product.category}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{product.id}</div>
                    </div>
                  </TableCell>
                  {!groupByProduct && viewMode === "hq" && (
                    <TableCell>
                      <span className="font-medium">{product.store}</span>
                    </TableCell>
                  )}
                  {!groupByProduct && viewMode === "hq" && (
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono text-sm">
                        {product.capacityMin || 0} / {product.capacityMax || 0}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="bg-gradient-to-r from-[#ff914d]/10 to-[#ff914d]/5 border-l-4 border-l-[#ff914d]/30">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-[#ff914d]">
                        {product.recommendedOrder}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="bg-gradient-to-r from-[#7ea058]/10 to-[#7ea058]/5 border-l-4 border-l-[#7ea058]/30">
                    <div className="flex items-center gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateFinalOrder(product.id, product.storeId, -1)}
                        className="h-10 w-10 rounded-full border-2 border-[#7ea058]/40 hover:border-[#7ea058] hover:bg-[#7ea058]/10 transition-all duration-200 hover:scale-110"
                      >
                        <Minus className="h-4 w-4 text-[#7ea058]" />
                      </Button>
                      <span className="text-2xl font-bold text-[#7ea058] w-16 text-center">
                        {product.finalOrder}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateFinalOrder(product.id, product.storeId, 1)}
                        className="h-10 w-10 rounded-full border-2 border-[#7ea058]/40 hover:border-[#7ea058] hover:bg-[#7ea058]/10 transition-all duration-200 hover:scale-110"
                      >
                        <Plus className="h-4 w-4 text-[#7ea058]" />
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