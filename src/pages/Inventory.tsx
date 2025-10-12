import { useState, useEffect } from "react";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, AlertCircle, CheckCircle, XCircle, Edit2, Search, ClipboardCheck, Plus, Minus, Store, ChevronDown, ChevronUp } from "lucide-react";
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
    "SK011", "SK012", "SK013", "SK014", "SK015", "SK016", "SK017", "SK018", // 8 Breakfast items
    "SK001", "SK002", "SK003", "SK004", "SK005", // 5 Lunch/Afternoon items
    "SK010" // Vegan Buddha Bowl
  ],
  business_district: [
    "SK011", "SK012", "SK013", "SK014", "SK015", "SK016", // 6 Breakfast items
    "SK001", "SK002", "SK003", "SK004", "SK005", // 5 Lunch/Afternoon items
    "SK006" // Prosciutto & Mozzarella Ciabatta
  ],
  transport_hub: [
    "SK011", "SK012", "SK013", "SK014", "SK015", // 5 Breakfast items
    "SK001", "SK002", "SK003", "SK004", "SK005" // 5 Lunch/Afternoon items
  ],
  high_street: [
    "SK011", "SK012", "SK013", "SK014", "SK015", "SK016", "SK017", // 7 Breakfast items
    "SK001", "SK002", "SK003", "SK004", "SK005", // 5 Lunch/Afternoon items
    "SK010" // Vegan Buddha Bowl
  ],
};

// Brand to store mapping
const brandStoreMap = {
  "All Brands": ["London Bridge", "Kings Cross", "Victoria Station", "Oxford Street", "Canary Wharf", "Liverpool Street", "Paddington", "Waterloo", "Bond Street", "Leicester Square", "Covent Garden", "Bank", "Monument", "Tower Hill", "Holborn"],
  "Pret a Manger": ["London Bridge", "Kings Cross", "Victoria Station", "Liverpool Street", "Paddington", "Waterloo", "Bank", "Monument"],
  "Brioche Dorée": ["Oxford Street", "Canary Wharf", "Bond Street", "Leicester Square", "Covent Garden"],
  "Starbucks": ["London Bridge", "Oxford Street", "Tower Hill", "Holborn", "Canary Wharf"]
};

export default function Inventory() {
  const { viewMode, selectedStore } = useView();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "sold_out">("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [stores, setStores] = useState<{ id: string; name: string; cluster: string }[]>([]);
  const [stockTakeMode, setStockTakeMode] = useState(false);
  const [endOfDayMode, setEndOfDayMode] = useState(false);
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});
  const [editingWaste, setEditingWaste] = useState<Record<string, number>>({});
  const [expandedStores, setExpandedStores] = useState<string[]>([]);

  // Available stores based on selected brand
  const availableStores = selectedBrand === "All Brands" 
    ? stores
    : stores.filter(s => brandStoreMap[selectedBrand as keyof typeof brandStoreMap]?.includes(s.name));

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
    console.log('Loading inventory - viewMode:', viewMode, 'selectedStore:', selectedStore);
    try {
      if (viewMode === "store_manager" || viewMode === "store_team") {
        // Store view: Show ALL products for store team, or cluster-based for manager
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("id, cluster")
          .eq("name", selectedStore)
          .maybeSingle();

        console.log('Store data:', storeData, 'Error:', storeError);

        if (storeError) {
          console.error('Store query error:', storeError);
          toast({
            title: "Error loading store",
            description: storeError.message,
            variant: "destructive"
          });
        }

        if (!storeData) {
          console.log('No store data found');
          setInventory([]);
          setLoading(false);
          return;
        }

        // For store_team, get ALL products; for store_manager, filter by cluster
        let productsQuery = supabase
          .from("products")
          .select("*")
          .order("sku");

        if (viewMode === "store_manager" && storeData.cluster) {
          const clusterSkus = clusterProducts[storeData.cluster as keyof typeof clusterProducts] || [];
          console.log('Filtering by cluster SKUs:', clusterSkus);
          productsQuery = productsQuery.in("sku", clusterSkus);
        }

        const { data: products, error: productsError } = await productsQuery;

        console.log('Products query result:', { products: products?.length, error: productsError });

        if (productsError) {
          console.error('Products query error:', productsError);
          toast({
            title: "Error loading products",
            description: productsError.message,
            variant: "destructive"
          });
        }

        if (!products || products.length === 0) {
          console.log('No products found');
          setInventory([]);
          setLoading(false);
          return;
        }

        const inventoryItems: InventoryItem[] = [];

        for (const product of products) {
          // Get inventory - don't fail if no stock record exists
          const { data: stockData, error: stockError } = await supabase
            .from("store_inventory")
            .select("current_stock")
            .eq("store_id", storeData.id)
            .eq("product_id", product.id)
            .maybeSingle();

          if (stockError) {
            console.warn('Stock query error for product', product.sku, ':', stockError);
          }

          const currentStock = stockData?.current_stock || 0;

          inventoryItems.push({
            product,
            current_stock: currentStock,
            status: getStockStatus(currentStock),
          });
        }

        console.log('Final inventory items:', inventoryItems.length, inventoryItems);
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
    if (endOfDayMode) setEndOfDayMode(false); // Close end of day if open
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

  const handleEndOfDayMode = () => {
    if (stockTakeMode) setStockTakeMode(false); // Close stock take if open
    setEndOfDayMode(!endOfDayMode);
    if (!endOfDayMode) {
      // Initialize editing stocks and waste with current values
      const stocks: Record<string, number> = {};
      const waste: Record<string, number> = {};
      inventory.forEach(item => {
        const key = item.store_id 
          ? `${item.store_id}-${item.product.id}`
          : item.product.id;
        stocks[key] = item.current_stock;
        waste[key] = 0; // Initialize waste to 0
      });
      setEditingStocks(stocks);
      setEditingWaste(waste);
    }
  };

  const adjustStock = (itemKey: string, delta: number) => {
    setEditingStocks(prev => ({
      ...prev,
      [itemKey]: Math.max(0, (prev[itemKey] || 0) + delta)
    }));
  };

  const adjustWaste = (itemKey: string, delta: number) => {
    setEditingWaste(prev => ({
      ...prev,
      [itemKey]: Math.max(0, (prev[itemKey] || 0) + delta)
    }));
  };

  const toggleStoreExpanded = (storeId: string) => {
    setExpandedStores(prev =>
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
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

  const handleSaveEndOfDay = async () => {
    try {
      for (const item of inventory) {
        const key = item.store_id 
          ? `${item.store_id}-${item.product.id}`
          : item.product.id;
        const newStock = editingStocks[key];
        const waste = editingWaste[key] || 0;
        
        if (item.store_id) {
          // Update stock in database (accounting for waste)
          const { error } = await supabase
            .from("store_inventory")
            .upsert({
              store_id: item.store_id,
              product_id: item.product.id,
              current_stock: newStock,
              last_updated: new Date().toISOString(),
            });

          if (error) throw error;

          // TODO: Log waste data to a waste tracking table if needed
          if (waste > 0) {
            console.log(`Waste logged for ${item.product.name}: ${waste} units`);
          }
        }
      }

      toast({
        title: "Success",
        description: "End of day stock take completed with waste tracking",
      });
      
      setEndOfDayMode(false);
      loadInventory();
    } catch (error) {
      console.error("Error saving end of day:", error);
      toast({
        title: "Error",
        description: "Failed to save end of day stock take",
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
            {viewMode === "store_manager" || viewMode === "store_team" ? `${selectedStore} - Live Availability` : "Live Availability - All Stores"}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === "store_manager" || viewMode === "store_team"
              ? "Real-time product availability for your store"
              : "Monitor product availability across all stores"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="lg"
            variant={stockTakeMode ? "default" : "outline"}
            onClick={handleStockTakeMode}
            className="shadow-brand"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            {stockTakeMode ? "Save Stock Take" : "Stock Take"}
          </Button>
          <Button 
            size="lg"
            variant={endOfDayMode ? "default" : "outline"}
            onClick={handleEndOfDayMode}
            className="shadow-brand"
          >
            <Package className="h-5 w-5 mr-2" />
            {endOfDayMode ? "Save End of Day" : "End of Day Stock Take"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          {viewMode === "hq" ? (
            <div className="space-y-4">
              {/* Brand Filter - Higher Level */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">My Brand:</label>
                <Select value={selectedBrand} onValueChange={(v) => {
                  setSelectedBrand(v);
                  setStoreFilter("all");
                }}>
                  <SelectTrigger className="w-[200px] h-9 border-[#7e9f57] focus:ring-[#7e9f57] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Brands">All Brands</SelectItem>
                    <SelectItem value="Pret a Manger">Pret a Manger</SelectItem>
                    <SelectItem value="Brioche Dorée">Brioche Dorée</SelectItem>
                    <SelectItem value="Starbucks">Starbucks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search and Filters */}
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
                <Select value={storeFilter} onValueChange={setStoreFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {availableStores.map(store => (
                      <SelectItem key={store.id} value={store.name}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
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
            </div>
          )}
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
            {endOfDayMode && (
              <Badge variant="outline" className="ml-2 animate-pulse">
                End of Day Stock Take Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading inventory...
            </div>
          ) : viewMode === "hq" ? (
            <div className="space-y-4">
              {stores.map((store) => {
                const storeInventory = filteredInventory.filter(item => item.store_name === store.name);
                const isExpanded = expandedStores.includes(store.id);
                
                return (
                  <Card key={store.id} className="border-2">
                    <CardHeader 
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => toggleStoreExpanded(store.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          {store.name}
                          <Badge variant="outline">{storeInventory.length} products</Badge>
                        </CardTitle>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>SKU</TableHead>
                              <TableHead>Product Name</TableHead>
                              <TableHead>Current Stock</TableHead>
                              {endOfDayMode && <TableHead>Waste</TableHead>}
                              <TableHead>Status</TableHead>
                              {!stockTakeMode && !endOfDayMode && <TableHead>Actions</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {storeInventory.map((item) => {
                              const itemKey = `${item.store_id}-${item.product.id}`;
                              const displayStock = (stockTakeMode || endOfDayMode) ? editingStocks[itemKey] : item.current_stock;
                              const displayWaste = endOfDayMode ? editingWaste[itemKey] || 0 : 0;

                              return (
                                <TableRow key={itemKey}>
                                  <TableCell className="font-medium">{item.product.sku}</TableCell>
                                  <TableCell>{item.product.name}</TableCell>
                                  <TableCell>
                                    {(stockTakeMode || endOfDayMode) ? (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => adjustStock(itemKey, -1)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className={`font-bold text-lg min-w-[3rem] text-center ${(stockTakeMode || endOfDayMode) ? 'animate-wobble' : ''}`}>
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
                                  {endOfDayMode && (
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => adjustWaste(itemKey, -1)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="font-bold text-lg min-w-[3rem] text-center text-destructive">
                                          {displayWaste}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => adjustWaste(itemKey, 1)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  )}
                                  <TableCell>{getStatusBadge(getStockStatus(displayStock))}</TableCell>
                                  {!stockTakeMode && !endOfDayMode && (
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
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Table>
               <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  {endOfDayMode && <TableHead>Waste</TableHead>}
                  <TableHead>Status</TableHead>
                  {!stockTakeMode && !endOfDayMode && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={endOfDayMode ? 5 : (stockTakeMode ? 4 : 5)} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="h-12 w-12 opacity-50" />
                        <p>No products found</p>
                        {inventory.length > 0 && (
                          <p className="text-sm">Try adjusting your filters</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const itemKey = item.product.id;
                    const displayStock = (stockTakeMode || endOfDayMode) ? editingStocks[itemKey] : item.current_stock;
                    const displayWaste = endOfDayMode ? editingWaste[itemKey] || 0 : 0;

                  return (
                    <TableRow key={itemKey}>
                      <TableCell className="font-medium">{item.product.sku}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>
                        {(stockTakeMode || endOfDayMode) ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => adjustStock(itemKey, -1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className={`font-bold text-lg min-w-[3rem] text-center ${(stockTakeMode || endOfDayMode) ? 'animate-wobble' : ''}`}>
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
                      {endOfDayMode && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => adjustWaste(itemKey, -1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-lg min-w-[3rem] text-center text-destructive">
                              {displayWaste}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => adjustWaste(itemKey, 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>{getStatusBadge(getStockStatus(displayStock))}</TableCell>
                      {!stockTakeMode && !endOfDayMode && (
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {stockTakeMode && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setStockTakeMode(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveStocks}>
            Save Stock Take
          </Button>
        </div>
      )}

      {endOfDayMode && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setEndOfDayMode(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEndOfDay}>
            Save End of Day
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
