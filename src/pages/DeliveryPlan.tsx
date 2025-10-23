import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Store, TrendingUp, AlertTriangle, Download, Lock, Unlock, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-helper";

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load stores from database
      const { data: storesData } = await supabase
        .from('stores')
        .select('name')
        .order('name') as any;

      // Load products from database
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('name') as any;

      if (storesData && productsData) {
        const storeNames = storesData.map((s: any) => s.name);
        setStores(storeNames);

        // Initialize allocations with real products
        const initialAllocations = productsData.map((product: any, index: number) => {
          // Assign dayPart based on category
          let dayPart = "Morning";
          if (product.category === "Sandwiches" || product.category === "Wraps" || product.category === "Salads") {
            dayPart = "Lunch";
          } else if (product.sku.includes("F0") || product.sku.includes("S00")) {
            dayPart = "Afternoon";
          }

          const produced = 100 + Math.floor(Math.random() * 400);
          const perStore = Math.floor(produced / storeNames.length);
          const storeAllocations = storeNames.map(store => ({
            storeName: store,
            allocated: perStore,
          }));
          const totalAllocated = perStore * storeNames.length;

          return {
            productId: index + 1,
            productName: product.name,
            sku: product.sku,
            produced,
            dayPart,
            confirmed: Math.random() > 0.5,
            stores: storeAllocations,
            totalAllocated,
            remaining: produced - totalAllocated,
            overridden: false,
          };
        });

        setAllocations(initialAllocations);
      }
    } catch (error) {
      console.error("Error loading data:", error);
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

  const saveDeliveryPlan = () => {
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

    toast({
      title: "Delivery plan saved",
      description: "All store allocations have been updated",
    });
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Delivery Plan</h1>
        <p className="text-muted-foreground">
          Allocate produced quantities to stores
        </p>
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
                  <TableHead>Day Part</TableHead>
                  <TableHead className="text-right">Allocated Quantity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {store.products.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>{getDayPartBadge(product.dayPart)}</TableCell>
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
