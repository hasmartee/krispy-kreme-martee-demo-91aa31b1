import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Store, TrendingUp, AlertTriangle, Download, Lock, Unlock, Edit, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-helper";
import { format } from "date-fns";

// Mock stores data - will be loaded from database
const initialStores: string[] = [];

// Mock products - will be loaded from database
const initialProducts: any[] = [];

interface StoreAllocation {
  storeName: string;
  allocated: number;
}

interface ProductAllocation {
  productId: number;
  productName: string;
  sku: string;
  produced: number;
  dayPart: string;
  confirmed: boolean;
  stores: StoreAllocation[];
  totalAllocated: number;
  remaining: number;
  overridden: boolean;
}

interface StoreView {
  storeName: string;
  products: {
    productId: number;
    productName: string;
    sku: string;
    dayPart: string;
    allocated: number;
    confirmed: boolean;
  }[];
}

const getDayPartBadge = (dayPart: string) => {
  switch (dayPart) {
    case "Morning":
      return <Badge variant="default" className="bg-amber-500">{dayPart}</Badge>;
    case "Lunch":
      return <Badge variant="default" className="bg-green-500">{dayPart}</Badge>;
    case "Afternoon":
      return <Badge variant="default" className="bg-blue-500">{dayPart}</Badge>;
    default:
      return <Badge variant="secondary">{dayPart}</Badge>;
  }
};

export default function DeliveryPlan() {
  const { toast } = useToast();
  const [selectedDayPart, setSelectedDayPart] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"store" | "product">("store");
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [stores, setStores] = useState<string[]>([]);
  const [allocations, setAllocations] = useState<ProductAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription to reload when allocations change
    const channel = supabase
      .channel('production-allocations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_allocations'
        },
        () => {
          console.log('Production allocations changed, reloading...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  // Krispy Kreme products matching StoreProductRange
  const allKrispyKremeProducts = [
    { id: "KK-G001", name: "Original Glazed", sku: "KK-G001", category: "Glazed", dayPart: "Morning" },
    { id: "KK-G002", name: "Chocolate Iced Glazed", sku: "KK-G002", category: "Glazed", dayPart: "Morning" },
    { id: "KK-G003", name: "Maple Iced", sku: "KK-G003", category: "Glazed", dayPart: "Morning" },
    { id: "KK-G004", name: "Glazed Blueberry", sku: "KK-G004", category: "Glazed", dayPart: "Morning" },
    { id: "KK-G005", name: "Caramel Iced", sku: "KK-G005", category: "Glazed", dayPart: "Afternoon" },
    { id: "KK-G006", name: "Coffee Glazed", sku: "KK-G006", category: "Glazed", dayPart: "Morning" },
    { id: "KK-G007", name: "Dulce de Leche", sku: "KK-G007", category: "Glazed", dayPart: "Afternoon" },
    { id: "KK-I001", name: "Strawberry Iced with Sprinkles", sku: "KK-I001", category: "Iced", dayPart: "Afternoon" },
    { id: "KK-I002", name: "Chocolate Iced with Sprinkles", sku: "KK-I002", category: "Iced", dayPart: "Afternoon" },
    { id: "KK-I003", name: "Vanilla Iced with Sprinkles", sku: "KK-I003", category: "Iced", dayPart: "Afternoon" },
    { id: "KK-F001", name: "Raspberry Filled", sku: "KK-F001", category: "Filled", dayPart: "Morning" },
    { id: "KK-F002", name: "Lemon Filled", sku: "KK-F002", category: "Filled", dayPart: "Morning" },
    { id: "KK-F003", name: "Boston Kreme", sku: "KK-F003", category: "Filled", dayPart: "Afternoon" },
    { id: "KK-F004", name: "Chocolate Kreme Filled", sku: "KK-F004", category: "Filled", dayPart: "Afternoon" },
    { id: "KK-C001", name: "Powdered Sugar", sku: "KK-C001", category: "Cake", dayPart: "Morning" },
    { id: "KK-C002", name: "Cinnamon Sugar", sku: "KK-C002", category: "Cake", dayPart: "Morning" },
    { id: "KK-C003", name: "Double Chocolate", sku: "KK-C003", category: "Cake", dayPart: "Afternoon" },
    { id: "KK-S001", name: "Cookies and Kreme", sku: "KK-S001", category: "Specialty", dayPart: "Afternoon" },
    { id: "KK-S002", name: "Apple Fritter", sku: "KK-S002", category: "Specialty", dayPart: "Morning" },
    { id: "KK-S003", name: "Glazed Cruller", sku: "KK-S003", category: "Specialty", dayPart: "Afternoon" },
  ];

  const loadData = async () => {
    try {
      // Get selected date for the production plan
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('📦 DELIVERY PLAN: Loading data for date:', dateStr);
      
      // Fetch stores with their IDs
      const { data: storesData } = await supabase
        .from('stores')
        .select('id, name')
        .order('name') as any;

      console.log('📦 DELIVERY PLAN: Stores loaded:', storesData?.length);

      if (!storesData) return;

      const storeNames = storesData.map((s: any) => s.name);
      const storeMap = new Map(storesData.map((s: any) => [s.id, s.name]));
      setStores(storeNames);

      // Fetch production plan for selected date
      const { data: productionPlan } = await supabase
        .from('production_plans')
        .select('id, status')
        .eq('production_date', dateStr)
        .single() as any;

      console.log('📦 DELIVERY PLAN: Production plan:', productionPlan);

      if (!productionPlan) {
        console.log('📦 DELIVERY PLAN: No production plan found for today');
        // No production plan yet, initialize with empty data
        const initialAllocations = allKrispyKremeProducts.map((product, index) => ({
          productId: index + 1,
          productName: product.name,
          sku: product.sku,
          produced: 0,
          dayPart: product.dayPart,
          confirmed: false,
          stores: storeNames.map(store => ({
            storeName: store,
            allocated: 0,
          })),
          totalAllocated: 0,
          remaining: 0,
          overridden: false,
        }));
        setAllocations(initialAllocations);
        setLoading(false);
        return;
      }

      // Fetch allocations for this production plan
      const { data: allocationsData } = await supabase
        .from('production_allocations')
        .select('store_id, product_sku, quantity, day_part')
        .eq('production_plan_id', productionPlan.id) as any;

      console.log('📦 DELIVERY PLAN: Allocations data:', allocationsData?.length, allocationsData);

      // Group allocations by product SKU
      const productAllocations = new Map<string, any[]>();
      if (allocationsData) {
        allocationsData.forEach((alloc: any) => {
          if (!productAllocations.has(alloc.product_sku)) {
            productAllocations.set(alloc.product_sku, []);
          }
          productAllocations.get(alloc.product_sku)!.push(alloc);
        });
      }

      console.log('📦 DELIVERY PLAN: Product allocations map:', Array.from(productAllocations.entries()));

      // Build allocations array
      const loadedAllocations = allKrispyKremeProducts.map((product, index) => {
        const productAllocs = productAllocations.get(product.sku) || [];
        console.log(`📦 DELIVERY PLAN: Product ${product.sku} - found ${productAllocs.length} allocations`);
        
        const storeAllocations = storeNames.map(storeName => {
          const storeId = storesData.find((s: any) => s.name === storeName)?.id;
          const allocation = productAllocs.find(a => a.store_id === storeId);
          return {
            storeName,
            allocated: allocation?.quantity || 0,
          };
        });
        
        const totalAllocated = storeAllocations.reduce((sum, s) => sum + s.allocated, 0);
        const produced = totalAllocated; // For now, produced = total allocated

        return {
          productId: index + 1,
          productName: product.name,
          sku: product.sku,
          produced,
          dayPart: product.dayPart,
          confirmed: productionPlan.status === 'confirmed',
          stores: storeAllocations,
          totalAllocated,
          remaining: produced - totalAllocated,
          overridden: false,
        };
      });

      console.log('📦 DELIVERY PLAN: Final allocations:', loadedAllocations.slice(0, 3));
      setAllocations(loadedAllocations);
    } catch (error) {
      console.error("❌ DELIVERY PLAN: Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load delivery plan data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAllocation = (productId: number, storeName: string, newValue: string) => {
    const value = parseInt(newValue) || 0;
    
    setAllocations(prev => prev.map(product => {
      if (product.productId === productId) {
        const updatedStores = product.stores.map(store => 
          store.storeName === storeName 
            ? { ...store, allocated: value }
            : store
        );
        const totalAllocated = updatedStores.reduce((sum, s) => sum + s.allocated, 0);
        
        return {
          ...product,
          stores: updatedStores,
          totalAllocated,
          remaining: product.produced - totalAllocated,
        };
      }
      return product;
    }));
  };

  const autoAllocate = (productId: number) => {
    setAllocations(prev => prev.map(product => {
      if (product.productId === productId) {
        const perStore = Math.floor(product.produced / stores.length);
        const remainder = product.produced % stores.length;
        
        const storeAllocations = stores.map((store, idx) => ({
          storeName: store,
          allocated: perStore + (idx < remainder ? 1 : 0),
        }));
        
        return {
          ...product,
          stores: storeAllocations,
          totalAllocated: product.produced,
          remaining: 0,
          overridden: false,
        };
      }
      return product;
    }));

    setEditingProduct(null);
    toast({
      title: "Auto-allocated",
      description: "Product quantities distributed evenly across stores",
    });
  };

  const toggleOverride = (productId: number) => {
    if (editingProduct === productId) {
      setEditingProduct(null);
      toast({
        title: "Override saved",
        description: "Custom allocations have been saved",
      });
    } else {
      setEditingProduct(productId);
      setAllocations(prev => prev.map(product => 
        product.productId === productId 
          ? { ...product, overridden: true }
          : product
      ));
    }
  };

  const exportToCSV = () => {
    const date = new Date().toISOString().split('T')[0];
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (viewMode === "product") {
      csvContent += "Product,SKU,Day Part,Produced,Status,";
      csvContent += stores.join(",") + ",Total Allocated,Remaining\n";
      
      filteredAllocations.forEach(allocation => {
        csvContent += `"${allocation.productName}","${allocation.sku}","${allocation.dayPart}",${allocation.produced},${allocation.confirmed ? 'Confirmed' : 'Pending'},`;
        csvContent += allocation.stores.map(s => s.allocated).join(",");
        csvContent += `,${allocation.totalAllocated},${allocation.remaining}\n`;
      });
    } else {
      csvContent += "Store,Product,SKU,Day Part,Allocated Quantity,Status\n";
      
      getStoreView().forEach(store => {
        store.products.forEach(product => {
          csvContent += `"${store.storeName}","${product.productName}","${product.sku}","${product.dayPart}",${product.allocated},${product.confirmed ? 'Confirmed' : 'Pending'}\n`;
        });
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivery-plan-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Delivery plan exported to CSV",
    });
  };

  const getStoreView = (): StoreView[] => {
    return stores.map(storeName => ({
      storeName,
      products: filteredAllocations.map(allocation => {
        const storeAllocation = allocation.stores.find(s => s.storeName === storeName);
        return {
          productId: allocation.productId,
          productName: allocation.productName,
          sku: allocation.sku,
          dayPart: allocation.dayPart,
          allocated: storeAllocation?.allocated || 0,
          confirmed: allocation.confirmed,
        };
      }),
    }));
  };

  const saveDeliveryPlan = async () => {
    // Check for over-allocations
    const overAllocated = allocations.filter(p => p.remaining < 0);
    
    if (overAllocated.length > 0) {
      toast({
        title: "Cannot save",
        description: `${overAllocated.length} product(s) are over-allocated`,
        variant: "destructive",
      });
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      // Update production plan status to confirmed
      const { error: updateError } = await supabase
        .from('production_plans')
        .update({ status: 'confirmed' })
        .eq('production_date', dateStr) as any;

      if (updateError) throw updateError;

      // Update all allocations to confirmed
      setAllocations(prev => prev.map(p => ({ ...p, confirmed: true })));

      toast({
        title: "Delivery plan confirmed",
        description: "All store allocations have been confirmed",
      });
    } catch (error) {
      console.error("Error saving delivery plan:", error);
      toast({
        title: "Error",
        description: "Failed to confirm delivery plan",
        variant: "destructive",
      });
    }
  };

  const filteredAllocations = allocations.filter(allocation => 
    selectedDayPart === "all" || allocation.dayPart === selectedDayPart
  );

  const totalProduced = filteredAllocations.reduce((sum, p) => sum + p.produced, 0);
  const totalAllocated = filteredAllocations.reduce((sum, p) => sum + p.totalAllocated, 0);
  const totalRemaining = filteredAllocations.reduce((sum, p) => sum + p.remaining, 0);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivery Plan</h1>
          <p className="text-muted-foreground">
            Allocate produced quantities to stores
          </p>
        </div>
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-md">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-foreground block mb-1.5">Delivery Date</label>
                <Select
                  value={selectedDate.toISOString()}
                  onValueChange={(value) => setSelectedDate(new Date(value))}
                >
                  <SelectTrigger className="w-[300px] h-12 border-2 border-primary/40 hover:border-primary bg-background font-medium transition-all hover:shadow-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const isToday = i === 0;
                      const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                      return (
                        <SelectItem 
                          key={i} 
                          value={date.toISOString()}
                          className={isSelected ? "bg-primary text-primary-foreground font-semibold" : ""}
                        >
                          {format(date, "EEEE, MMM d, yyyy")}
                          {isToday && " (Today)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Produced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProduced}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredAllocations.length} products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalAllocated / totalProduced) * 100).toFixed(1)}% of production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${totalRemaining < 0 ? 'text-destructive' : ''}`} />
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-destructive' : ''}`}>
              {totalRemaining}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalRemaining < 0 ? 'Over-allocated!' : 'Unallocated units'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "store" | "product")}>
                <TabsList>
                  <TabsTrigger value="store">Store View</TabsTrigger>
                  <TabsTrigger value="product">Product View</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Day Part:</label>
                <Select value={selectedDayPart} onValueChange={setSelectedDayPart}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Day Parts</SelectItem>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={saveDeliveryPlan} size="lg">
                Save Delivery Plan
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Store View */}
      {viewMode === "store" && getStoreView().map((store) => (
        <Card key={store.storeName}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="text-lg">{store.storeName}</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Products</div>
                <div className="text-2xl font-bold">{store.products.reduce((sum, p) => sum + p.allocated, 0)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Allocated Quantity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {store.products.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className={`text-right ${product.confirmed ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                      {product.allocated}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.confirmed ? (
                        <Badge variant="default" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Unlock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Product View */}
      {viewMode === "product" && filteredAllocations.map((allocation) => (
        <Card key={allocation.productId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-lg">{allocation.productName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{allocation.sku}</p>
                </div>
                {getDayPartBadge(allocation.dayPart)}
                {allocation.confirmed ? (
                  <Badge variant="default" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Confirmed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Unlock className="h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Produced</div>
                  <div className="text-2xl font-bold">{allocation.produced}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Allocated</div>
                  <div className="text-2xl font-bold">{allocation.totalAllocated}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className={`text-2xl font-bold ${allocation.remaining < 0 ? 'text-destructive' : ''}`}>
                    {allocation.remaining}
                  </div>
                </div>
                <Button onClick={() => autoAllocate(allocation.productId)} variant="outline">
                  Auto-Allocate
                </Button>
                <Button 
                  onClick={() => toggleOverride(allocation.productId)} 
                  variant={editingProduct === allocation.productId ? "default" : "outline"}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {editingProduct === allocation.productId ? "Save Override" : "Override Allocation"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Store</TableHead>
                  <TableHead className="text-right">Allocated Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocation.stores.map((store) => (
                  <TableRow key={store.storeName}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {store.storeName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        value={store.allocated}
                        onChange={(e) => updateAllocation(allocation.productId, store.storeName, e.target.value)}
                        disabled={!allocation.confirmed && editingProduct !== allocation.productId}
                        className={`w-24 ml-auto text-right ${
                          allocation.confirmed 
                            ? 'font-bold text-foreground' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
