import { useState, useEffect } from "react";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, AlertCircle, CheckCircle, XCircle, Edit2, Search, ClipboardCheck, Plus, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
}

interface InventoryItem {
  product: Product;
  current_stock: number;
  status: "in_stock" | "low_stock" | "sold_out";
  store_name?: string;
  store_id?: string;
}

// Cluster product mapping from StoreProductRange
const clusterProducts = {
  residential: [
    "SK051", "SK052", "SK053", "SK054", "SK055", "SK056", "SK057", "SK058", // Breakfast items
    "SK001", "SK002", "SK003", "SK004", "SK005", "SK006", "SK007", "SK008" // Lunch/Afternoon items
  ],
  business_district: [
    "SK051", "SK052", "SK053", "SK054", "SK055", "SK056", // Breakfast items
    "SK001", "SK002", "SK003", "SK004", "SK005", "SK006" // Lunch/Afternoon items
  ],
  transport_hub: [
    "SK051", "SK052", "SK053", "SK054", "SK055", // Breakfast items
    "SK001", "SK002", "SK003", "SK004", "SK005" // Lunch/Afternoon items
  ],
  high_street: [
    "SK051", "SK052", "SK053", "SK054", "SK055", "SK056", "SK057", // Breakfast items
    "SK001", "SK002", "SK003", "SK004", "SK005", "SK006", "SK007", "SK008" // Lunch/Afternoon items
  ],
};

export default function Inventory() {
  const { viewMode, selectedStore } = useView();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "sold_out">("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [stores, setStores] = useState<{ id: string; name: string; cluster: string }[]>([]);
  const [stockTakeMode, setStockTakeMode] = useState(false);
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});

  useEffect(() => {
    loadStores();
    loadInventory();
  }, [viewMode, selectedStore]);

  const loadStores = async () => {
    try {
      const { data } = await supabase
        .from("stores")
        .select("id, name, cluster")
        .order("name");
      
      if (data) {
        setStores(data);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  const getStockStatus = (currentStock: number): "in_stock" | "low_stock" | "sold_out" => {
    if (currentStock === 0) return "sold_out";
    if (currentStock <= 5) return "low_stock";
    return "in_stock";
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      if (viewMode === "store") {
        // Store view: Show products ranged in this store based on cluster
        const { data: storeData } = await supabase
          .from("stores")
          .select("id, cluster")
          .eq("name", selectedStore)
          .maybeSingle();

        if (!storeData || !storeData.cluster) {
          setInventory([]);
          setLoading(false);
          return;
        }

        // Get products based on store cluster
        const clusterSkus = clusterProducts[storeData.cluster as keyof typeof clusterProducts] || [];
        
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .in("sku", clusterSkus)
          .order("name");

        if (!products) {
          setInventory([]);
          setLoading(false);
          return;
        }

        const inventoryItems: InventoryItem[] = [];

        for (const product of products) {
          // Get inventory
          const { data: stockData } = await supabase
            .from("store_inventory")
            .select("current_stock")
            .eq("store_id", storeData.id)
            .eq("product_id", product.id)
            .maybeSingle();

          const currentStock = stockData?.current_stock || 0;

          inventoryItems.push({
            product,
            current_stock: currentStock,
            status: getStockStatus(currentStock),
          });
        }

        setInventory(inventoryItems);
      } else {
        // HQ view: Show all products across all stores
        const { data: storesData } = await supabase
          .from("stores")
          .select("id, name, cluster")
          .order("name");

        if (!storesData) {
          setInventory([]);
          setLoading(false);
          return;
        }

        const allItems: InventoryItem[] = [];

        // For each store, show only products in their cluster range
        for (const store of storesData) {
          const clusterSkus = clusterProducts[store.cluster as keyof typeof clusterProducts] || [];
          
          const { data: products } = await supabase
            .from("products")
            .select("*")
            .in("sku", clusterSkus)
            .order("name");

          if (!products) continue;

          for (const product of products) {
            // Get inventory
            const { data: stockData } = await supabase
              .from("store_inventory")
              .select("current_stock")
              .eq("store_id", store.id)
              .eq("product_id", product.id)
              .maybeSingle();

            const currentStock = stockData?.current_stock || 0;

            allItems.push({
              product,
              current_stock: currentStock,
              status: getStockStatus(currentStock),
              store_name: store.name,
              store_id: store.id,
            });
          }
        }

        setInventory(allItems);
      }
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockTakeMode = () => {
    setStockTakeMode(!stockTakeMode);
    if (!stockTakeMode) {
      // Initialize editing stocks with current values
      const stocks: Record<string, number> = {};
      inventory.forEach(item => {
        const key = item.store_id 
          ? `${item.store_id}-${item.product.id}`
          : item.product.id;
        stocks[key] = item.current_stock;
      });
      setEditingStocks(stocks);
    }
  };

  const adjustStock = (itemKey: string, delta: number) => {
    setEditingStocks(prev => ({
      ...prev,
      [itemKey]: Math.max(0, (prev[itemKey] || 0) + delta)
    }));
  };

  const handleSaveStocks = async () => {
    try {
      for (const item of inventory) {
        const key = item.store_id 
          ? `${item.store_id}-${item.product.id}`
          : item.product.id;
        const newStock = editingStocks[key];
        
        if (newStock !== item.current_stock && item.store_id) {
          // Update stock in database
          const { error } = await supabase
            .from("store_inventory")
            .upsert({
              store_id: item.store_id,
              product_id: item.product.id,
              current_stock: newStock,
              last_updated: new Date().toISOString(),
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Stock levels updated successfully",
      });
      
      setStockTakeMode(false);
      loadInventory();
    } catch (error) {
      console.error("Error saving stocks:", error);
      toast({
        title: "Error",
        description: "Failed to save stock levels",
        variant: "destructive",
      });
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesStore = storeFilter === "all" || item.store_name === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const getStatusBadge = (status: InventoryItem["status"]) => {
    const config = {
      in_stock: { icon: CheckCircle, label: "In Stock", className: "bg-success text-white" },
      low_stock: { icon: AlertCircle, label: "Low Stock", className: "bg-warning text-white" },
      sold_out: { icon: XCircle, label: "Out of Stock", className: "bg-destructive text-white" },
    };

    const { icon: Icon, label, className } = config[status];
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {viewMode === "store" ? `${selectedStore} - Live Availability` : "Live Availability - All Stores"}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === "store" 
              ? "Real-time product availability for your store"
              : "Monitor product availability across all stores"
            }
          </p>
        </div>
        <Button 
          size="lg"
          variant={stockTakeMode ? "default" : "outline"}
          onClick={handleStockTakeMode}
          className="shadow-brand"
        >
          <ClipboardCheck className="h-5 w-5 mr-2" />
          {stockTakeMode ? "Save Stock Take" : "Stock Take Mode"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="sold_out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            {viewMode === "hq" && (
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.name}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Availability
            {stockTakeMode && (
              <Badge variant="outline" className="ml-2 animate-pulse">
                Stock Take Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading inventory...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  {viewMode === "hq" && <TableHead>Store</TableHead>}
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  {!stockTakeMode && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const itemKey = item.store_id 
                    ? `${item.store_id}-${item.product.id}`
                    : item.product.id;
                  const displayStock = stockTakeMode ? editingStocks[itemKey] : item.current_stock;

                  return (
                    <TableRow key={itemKey}>
                      <TableCell className="font-medium">{item.product.sku}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      {viewMode === "hq" && <TableCell>{item.store_name}</TableCell>}
                      <TableCell>
                        {stockTakeMode ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => adjustStock(itemKey, -1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className={`font-bold text-lg min-w-[3rem] text-center ${stockTakeMode ? 'animate-wobble' : ''}`}>
                              {displayStock}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => adjustStock(itemKey, 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium">{displayStock}</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(getStockStatus(displayStock))}</TableCell>
                      {!stockTakeMode && (
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredInventory.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {stockTakeMode && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setStockTakeMode(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveStocks} className="shadow-brand">
            Save All Changes
          </Button>
        </div>
      )}

      <style>{`
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .animate-wobble {
          animation: wobble 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
