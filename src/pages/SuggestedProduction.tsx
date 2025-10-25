import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, RefreshCw, Plus, Minus, CloudRain, AlertTriangle, Sparkles, Download, Send, Loader2, CalendarIcon, Package, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/donut-production-1.jpg";
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
  capacityMin?: number;
  capacityMax?: number;
}

interface Store {
  id: string;
  name: string;
  cluster: string;
}

interface DeliveryItem {
  id: string;
  productName: string;
  productSku: string;
  category: string;
  expectedQuantity: number;
  receivedQuantity: number;
  allocationId: string;
  hasUnsavedChanges?: boolean;
}

export default function SuggestedProduction() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { viewMode, selectedStore } = useView();
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingProduction, setConfirmingProduction] = useState<string | null>(null);
  const [groupByProduct, setGroupByProduct] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [productCapacities, setProductCapacities] = useState<Record<string, { min: number; max: number }>>({});
  const { toast } = useToast();
  
  const formattedDate = selectedDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const loadAllData = async () => {
      if (viewMode === "store_manager") {
        await loadStoreDeliveries();
      } else {
        const capacities = await loadProductCapacities();
        await loadData(capacities);
      }
    };
    loadAllData();
  }, [viewMode, selectedStore, selectedDate]);

  // Load store deliveries from production_allocations
  const loadStoreDeliveries = async () => {
    setLoading(true);
    try {
      const productionDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Get the current user's profile to find their store
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found');
        setDeliveryItems([]);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .maybeSingle() as any;

      if (!profile?.store_id) {
        console.log('No store assigned to user');
        setDeliveryItems([]);
        setLoading(false);
        return;
      }

      const { data: storeData } = await supabase
        .from('stores')
        .select('id, name')
        .eq('id', profile.store_id)
        .maybeSingle() as any;

      if (!storeData) {
        console.log('Store not found for ID:', profile.store_id);
        setDeliveryItems([]);
        setLoading(false);
        return;
      }

      // Get production plan for the date
      const { data: planData } = await supabase
        .from('production_plans')
        .select('id')
        .eq('production_date', productionDate)
        .maybeSingle() as any;

      if (!planData) {
        console.log('No production plan found for date:', productionDate);
        setDeliveryItems([]);
        setLoading(false);
        return;
      }

      // Get allocations for this store
      const { data: allocations } = await supabase
        .from('production_allocations')
        .select('*')
        .eq('production_plan_id', planData.id)
        .eq('store_id', storeData.id) as any;

      console.log('Store deliveries loaded:', allocations);

      // Get product details
      const { data: productsData } = await supabase
        .from('products')
        .select('*') as any;

      const productMap = new Map(productsData?.map((p: any) => [p.sku, p]) || []);

      const items: DeliveryItem[] = (allocations || []).map((alloc: any) => {
        const product: any = productMap.get(alloc.product_sku);
        // Use manufactured quantity if set, otherwise fall back to planned quantity
        const expectedQty = (alloc.manufactured_quantity && alloc.manufactured_quantity > 0) 
          ? alloc.manufactured_quantity 
          : alloc.quantity;
        
        // Pre-populate received quantity with expected quantity if not already set
        const receivedQty = (alloc.received_quantity && alloc.received_quantity > 0) 
          ? alloc.received_quantity 
          : expectedQty;
        
        return {
          id: alloc.id,
          productName: product?.name || alloc.product_sku,
          productSku: alloc.product_sku,
          category: product?.category || 'Unknown',
          expectedQuantity: expectedQty,
          receivedQuantity: receivedQty,
          allocationId: alloc.id,
        };
      });

      setDeliveryItems(items);
    } catch (error) {
      console.error('Error loading store deliveries:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProductCapacities = async () => {
    try {
      console.log('📊 Loading product capacities...');
      const { data, error } = await supabase
        .from('product_capacities')
        .select('*');
      
      if (error) {
        console.error('Error loading capacities:', error);
        return {};
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
        console.log('✅ Loaded capacities:', Object.keys(capacitiesMap).length);
        setProductCapacities(capacitiesMap);
        return capacitiesMap;
      }
    } catch (error) {
      console.error('Error loading product capacities:', error);
    }
    return {};
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

  const loadData = async (capacities?: Record<string, { min: number; max: number }>) => {
    setLoading(true);
    // Use provided capacities or fall back to state
    const capacitiesMap = capacities || productCapacities;
    try {
      console.log('🔍 PRODUCTION PAGE: Loading data...');
      console.log('📊 Using capacities:', Object.keys(capacitiesMap).length, 'entries');
      console.log('📊 Sample capacity keys:', Object.keys(capacitiesMap).slice(0, 5));
      
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('name') as any;

      console.log('🏪 PRODUCTION PAGE: Stores loaded:', storesData?.length, storesData);

      if (storesData) {
        setStores(storesData);
        
        const mockProducts: Product[] = [];
        const targetStores = viewMode === "store_manager" 
          ? storesData.filter((s: any) => s.name === selectedStore)
          : storesData;

        console.log('🎯 PRODUCTION PAGE: Target stores:', targetStores.length);

        targetStores.forEach((store: any) => {
          const storeProducts = getProductsForCluster(store.cluster || 'high_street');
          console.log(`📦 PRODUCTION PAGE: Store ${store.name} (${store.cluster}) - ${storeProducts.length} products`);
          
          storeProducts.forEach(product => {
            const baseQty = 15 + Math.floor(Math.random() * 15);
            const capacityKey = `${product.id}-${store.id}`;
            const capacity = capacitiesMap[capacityKey];
            
            console.log(`🔍 Product: ${product.id}, Store: ${store.id}, Key: ${capacityKey}`);
            console.log(`🔍 Capacity found:`, capacity);
            console.log(`🔍 All capacity keys:`, Object.keys(capacitiesMap).filter(k => k.startsWith(product.id)));
            
            if (capacity) {
              console.log(`✅ Found capacity for ${product.id} at ${store.name}:`, capacity);
            } else {
              console.log(`⚠️ No capacity found for key: ${capacityKey}`);
            }
            
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
              capacityMin: capacity?.min || 0,
              capacityMax: capacity?.max || 0,
            });
          });
        });

        console.log('✅ PRODUCTION PAGE: Total products generated:', mockProducts.length);
        console.log('📊 Sample capacities:', mockProducts.slice(0, 3).map(p => ({ 
          name: p.productName, 
          store: p.store,
          min: p.capacityMin, 
          max: p.capacityMax 
        })));
        setProducts(mockProducts);

        // Automatically save to database as pending allocations
        console.log('💾 PRODUCTION PAGE: About to save pending allocations...');
        const saveResult = await savePendingAllocations(mockProducts);
        console.log('💾 PRODUCTION PAGE: Save result:', saveResult);
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
    if (viewMode === "store_manager") {
      await loadStoreDeliveries();
    } else {
      await loadData();
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const savePendingAllocations = async (productsToSave: Product[]) => {
    try {
      const productionDate = format(selectedDate, 'yyyy-MM-dd');
      console.log('🔄 SAVING ALLOCATIONS for date:', productionDate);
      console.log('🔄 Products to save:', productsToSave.length);
      console.log('🔄 First product:', productsToSave[0]);
      
      // Get or create production plan
      const { data: existingPlans } = await supabase
        .from('production_plans')
        .select('id, status')
        .eq('production_date', productionDate) as any;

      let planId = existingPlans?.[0]?.id;
      console.log('🔄 Existing plan ID:', planId, 'from query:', existingPlans);

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
        console.error('❌ No plan ID available after creation attempt');
        return { success: false, error: 'No plan ID' };
      }

      // Save all allocations
      const allocations = productsToSave.map(p => ({
        production_plan_id: planId,
        store_id: p.storeId,
        product_sku: p.id,
        quantity: p.finalOrder,
      }));

      console.log('🔄 Upserting', allocations.length, 'allocations');
      console.log('🔄 Sample allocation:', allocations[0]);

      const { data: upsertResult, error } = await supabase
        .from('production_allocations')
        .upsert(allocations, {
          onConflict: 'production_plan_id,store_id,product_sku'
        })
        .select() as any;

      if (error) {
        console.error('❌ Upsert error:', error);
        return { success: false, error };
      } else {
        console.log('✅ Upserted successfully:', upsertResult?.length, 'records');
        return { success: true, count: upsertResult?.length };
      }
    } catch (error) {
      console.error('❌ Error saving pending allocations:', error);
      return { success: false, error };
    }
  };

  const updateReceivedQuantity = (allocationId: string, newQuantity: number) => {
    // Update local state and mark as having unsaved changes
    setDeliveryItems(items =>
      items.map(item =>
        item.allocationId === allocationId
          ? { ...item, receivedQuantity: newQuantity, hasUnsavedChanges: true }
          : item
      )
    );
  };

  const confirmReceivedQuantity = async (allocationId: string) => {
    const item = deliveryItems.find(i => i.allocationId === allocationId);
    if (!item) return;

    try {
      const { error } = await supabase
        .from('production_allocations')
        .update({ received_quantity: item.receivedQuantity })
        .eq('id', allocationId) as any;

      if (error) throw error;

      // Clear unsaved changes flag
      setDeliveryItems(items =>
        items.map(i =>
          i.allocationId === allocationId
            ? { ...i, hasUnsavedChanges: false }
            : i
        )
      );

      toast({
        title: "✓ Confirmed",
        description: `${item.productName} delivery confirmed - ${item.receivedQuantity} units`,
      });
    } catch (error) {
      console.error('Error confirming received quantity:', error);
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive",
      });
    }
  };

  const updateFinalOrder = async (productId: string, storeId: string, delta: number) => {
    const updatedProducts = products.map(p => 
      p.id === productId && p.storeId === storeId
        ? { ...p, finalOrder: Math.max(0, p.finalOrder + delta) }
        : p
    );
    setProducts(updatedProducts);

    // Find the updated product and save to database
    const updatedProduct = updatedProducts.find(p => p.id === productId && p.storeId === storeId);
    if (updatedProduct) {
      await savePendingAllocations([updatedProduct]);
    }
  };

  const handleConfirmProduction = async (product: Product) => {
    setConfirmingProduction(`${product.id}-${product.storeId}`);
    
    try {
      const productionDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Get the production plan
      const { data: plan } = await supabase
        .from('production_plans')
        .select('id')
        .eq('production_date', productionDate)
        .single() as any;

      if (!plan) {
        throw new Error('Production plan not found');
      }

      // Update the allocation to mark it as confirmed (status will be on the plan level)
      // For now, we just ensure the allocation is saved with the current finalOrder
      await savePendingAllocations([product]);

      toast({
        title: viewMode === "hq" ? "✓ Production Confirmed" : "✓ Delivery Logged",
        description: viewMode === "hq" 
          ? `${product.productName} confirmed for ${product.store}`
          : `${product.productName} delivery logged - ${product.finalOrder} units received`,
      });
    } catch (error) {
      console.error('Error confirming production:', error);
      toast({
        title: "Error",
        description: "Failed to confirm production",
        variant: "destructive",
      });
    } finally {
      setConfirmingProduction(null);
    }
  };

  const handleExportCSV = () => {
    const headers = viewMode === "hq" 
      ? ["Product", "Category", "Store", "Current Stock", "Recommended Qty", "Final Qty"]
      : ["Product", "Category", "Current Stock", "Recommended Qty", "Final Qty"];
    
    const rows = products.map(p => 
      viewMode === "hq"
        ? [p.productName, p.category, p.store, p.currentStock, p.recommendedOrder, p.finalOrder]
        : [p.productName, p.category, p.currentStock, p.recommendedOrder, p.finalOrder]
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

  // Store Manager View - Show Deliveries
  if (viewMode === "store_manager") {
    return (
      <div className="flex-1 space-y-6 p-6">
        {/* Hero Section */}
        <div 
          className="relative h-48 rounded-2xl overflow-hidden bg-cover bg-center shadow-2xl"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <h1 className="text-4xl font-bold text-cream-foreground mb-2">Store Deliveries</h1>
            <p className="text-xl text-cream-foreground">{selectedStore} - {formattedDate}</p>
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Delivery Date:</span>
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
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Deliveries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Expected & Confirmed Deliveries
            </CardTitle>
            <CardDescription>
              Review expected quantities and confirm what was actually received
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveryItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No deliveries scheduled for this date</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Product</TableHead>
                    <TableHead className="text-center w-[20%]">Expected Delivery</TableHead>
                    <TableHead className="text-center w-[35%] bg-gradient-to-r from-[#ff914d]/20 to-[#ff914d]/10 border-l-4 border-l-[#ff914d]">
                      <div className="flex items-center justify-center gap-2 py-1">
                        <CheckCircle2 className="h-5 w-5 text-[#ff914d] animate-pulse" />
                        <span className="font-bold text-[#ff914d] text-lg">Confirmed Delivery</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-[15%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryItems.map((item) => (
                    <TableRow 
                      key={item.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        item.hasUnsavedChanges && "bg-amber-50/50"
                      )}
                    >
                      <TableCell className="font-medium text-base">{item.productName}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-lg font-semibold text-muted-foreground">{item.expectedQuantity}</span>
                      </TableCell>
                      <TableCell className="bg-gradient-to-r from-[#ff914d]/10 to-[#ff914d]/5 border-l-4 border-l-[#ff914d]/30">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full border-2 border-[#ff914d]/40 hover:border-[#ff914d] hover:bg-[#ff914d]/10 transition-all duration-200 hover:scale-110"
                            onClick={() => {
                              const newValue = Math.max(0, item.receivedQuantity - 1);
                              updateReceivedQuantity(item.allocationId, newValue);
                            }}
                          >
                            <Minus className="h-4 w-4 text-[#ff914d]" />
                          </Button>
                          
                          <div className="relative">
                            <Input
                              type="number"
                              value={item.receivedQuantity}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 0;
                                updateReceivedQuantity(item.allocationId, newValue);
                              }}
                              className={cn(
                                "w-24 text-center font-bold text-2xl border-3 bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-200 focus:ring-4 focus:ring-[#ff914d]/30 text-[#ff914d]",
                                item.hasUnsavedChanges ? "border-amber-400 animate-pulse" : "border-[#ff914d]"
                              )}
                              min="0"
                            />
                            {item.receivedQuantity !== item.expectedQuantity && (
                              <Badge 
                                variant="outline" 
                                className="absolute -top-2 -right-2 bg-[#ff914d] text-white border-[#ff914d] text-xs px-1.5 py-0.5 animate-in fade-in zoom-in duration-200"
                              >
                                {item.receivedQuantity > item.expectedQuantity ? '+' : ''}
                                {item.receivedQuantity - item.expectedQuantity}
                              </Badge>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full border-2 border-[#ff914d]/40 hover:border-[#ff914d] hover:bg-[#ff914d]/10 transition-all duration-200 hover:scale-110"
                            onClick={() => {
                              const newValue = item.receivedQuantity + 1;
                              updateReceivedQuantity(item.allocationId, newValue);
                            }}
                          >
                            <Plus className="h-4 w-4 text-[#ff914d]" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => confirmReceivedQuantity(item.allocationId)}
                          disabled={!item.hasUnsavedChanges}
                          className={cn(
                            "w-full font-semibold transition-all duration-200",
                            item.hasUnsavedChanges
                              ? "bg-[#ff914d] hover:bg-[#ff7a2d] text-white shadow-lg hover:shadow-xl hover:scale-105 animate-in fade-in zoom-in"
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {item.hasUnsavedChanges ? "Confirm" : "Confirmed"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // HQ View - Existing Production Plan
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
            {isToday && (
              <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-bold animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold text-cream-foreground mb-2">Production Plan</h1>
          <p className="text-xl text-cream-foreground">All Stores - {formattedDate}</p>
        </div>
      </div>

      {/* Date Picker and View Toggle */}
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
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
                By Product
              </Button>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <Card className={cn(
        !isToday && "bg-muted/50 border-muted"
      )}>
        <CardHeader className={cn(
          !isToday && "bg-muted/30"
        )}>
          <CardTitle className="flex items-center gap-2">
            Production Recommendations
            {!isToday ? (
              <Badge variant="secondary" className="text-xs">Pending</Badge>
            ) : (
              <Badge className="bg-red-500 text-white text-xs animate-pulse">LIVE</Badge>
            )}
          </CardTitle>
          <CardDescription>
            AI-powered production suggestions based on historical data and predicted demand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                {viewMode === "hq" && <TableHead>Store</TableHead>}
                <TableHead className="text-center">Current Stock</TableHead>
                <TableHead className="text-center bg-muted/30 text-muted-foreground">Min Cap</TableHead>
                <TableHead className="text-center bg-muted/30 text-muted-foreground">Max Cap</TableHead>
                <TableHead className="text-center bg-gradient-to-r from-[#ff914d]/20 to-[#ff914d]/10 border-l-4 border-l-[#ff914d]">
                  <div className="flex items-center justify-center gap-2 py-1">
                    <Sparkles className="h-5 w-5 text-[#ff914d] animate-pulse" />
                    <span className="font-bold text-[#ff914d] text-lg">AI Recommended</span>
                  </div>
                </TableHead>
                <TableHead className="text-center bg-gradient-to-r from-primary/20 to-primary/10 border-l-4 border-l-primary">
                  <div className="flex items-center justify-center gap-2 py-1">
                    <span className="font-bold text-primary text-lg">Final Quantity</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.map((product) => (
                <TableRow key={`${product.id}-${product.storeId}`}>
                  <TableCell className="font-medium">{product.productName}</TableCell>
                  <TableCell>{getCategoryBadge(product.category)}</TableCell>
                  {viewMode === "hq" && <TableCell>{product.store}</TableCell>}
                  <TableCell className="text-center">{product.currentStock}</TableCell>
                  <TableCell className="text-center bg-muted/20 text-muted-foreground">
                    {product.capacityMin || 0}
                  </TableCell>
                  <TableCell className="text-center bg-muted/20 text-muted-foreground">
                    {product.capacityMax || 0}
                  </TableCell>
                  <TableCell className="text-center bg-gradient-to-r from-[#ff914d]/10 to-[#ff914d]/5 border-l-4 border-l-[#ff914d]/30">
                    <div className="flex items-center justify-center gap-2">
                      {product.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {product.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                      <span className="text-2xl font-bold text-[#ff914d]">{product.recommendedOrder}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-l-primary/30">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2 border-primary/40 hover:border-primary hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                        onClick={() => updateFinalOrder(product.id, product.storeId, -1)}
                        disabled={product.storeId === 'aggregated'}
                      >
                        <Minus className="h-4 w-4 text-primary" />
                      </Button>
                      
                      <span className="text-2xl font-bold text-primary w-16">{product.finalOrder}</span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-2 border-primary/40 hover:border-primary hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                        onClick={() => updateFinalOrder(product.id, product.storeId, 1)}
                        disabled={product.storeId === 'aggregated'}
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      onClick={() => handleConfirmProduction(product)}
                      disabled={confirmingProduction === `${product.id}-${product.storeId}` || product.storeId === 'aggregated'}
                    >
                      {confirmingProduction === `${product.id}-${product.storeId}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Confirm
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
