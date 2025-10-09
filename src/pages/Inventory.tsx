import { useState, useEffect } from "react";
import { useView } from "@/contexts/ViewContext";
import { ViewSelector } from "@/components/ViewSelector";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, AlertCircle, CheckCircle, XCircle, Edit2, Sparkles, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  par_level: number;
  status: "in_stock" | "low_stock" | "sold_out";
  store_name?: string;
  store_id?: string;
  is_ai_suggested?: boolean;
}

interface StockUpdate {
  item_id: string;
  item_name: string;
  old_stock: number;
  new_stock: number;
  timestamp: string;
}

interface IngredientInventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock_level: number;
  status: "in_stock" | "low_stock" | "sold_out";
  store_name?: string;
  suppliers: string[];
}

interface ParLevelEdit {
  store_id: string;
  product_id: string;
  product_name: string;
  category: string;
  current_value: number;
  new_value: number;
  is_ai_suggested: boolean;
  reasoning?: string;
}

export default function Inventory() {
  const { viewMode, selectedStore } = useView();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [ingredientsInventory, setIngredientsInventory] = useState<IngredientInventoryItem[]>([]);
  const [inventoryType, setInventoryType] = useState<"prepared" | "ingredients">("prepared");
  const [loading, setLoading] = useState(true);
  const [editingPar, setEditingPar] = useState<ParLevelEdit | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAiSuggestion, setLoadingAiSuggestion] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "sold_out">("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockUpdateDialog, setStockUpdateDialog] = useState<StockUpdate | null>(null);

  useEffect(() => {
    loadStores();
    if (inventoryType === "prepared") {
      loadInventory();
    } else {
      loadIngredientsInventory();
    }
  }, [viewMode, selectedStore, inventoryType]);

  const loadStores = async () => {
    try {
      const { data } = await supabase
        .from("stores")
        .select("id, name")
        .order("name");
      
      if (data) {
        setStores(data);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  const getCurrentParLevel = (storeId: string, productId: string) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const month = now.getMonth() + 1;
    return { dayOfWeek, month };
  };

  const getStockStatus = (currentStock: number, parLevel: number): "in_stock" | "low_stock" | "sold_out" => {
    if (currentStock === 0) return "sold_out";
    if (currentStock < parLevel) return "low_stock";
    return "in_stock";
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      if (viewMode === "store") {
        // Store view: Show all products in range with their stock levels
        const { data: stores } = await supabase
          .from("stores")
          .select("name")
          .eq("name", selectedStore)
          .single();

        if (!stores) {
          setInventory([]);
          setLoading(false);
          return;
        }

        const { data: storeData } = await supabase
          .from("stores")
          .select("id")
          .eq("name", selectedStore)
          .single();

        if (!storeData) {
          setInventory([]);
          setLoading(false);
          return;
        }

        const { data: products } = await supabase
          .from("products")
          .select("*")
          .order("name");

        if (!products) {
          setInventory([]);
          setLoading(false);
          return;
        }

        const inventoryItems: InventoryItem[] = [];

        for (const product of products) {
          const { dayOfWeek, month } = getCurrentParLevel(storeData.id, product.id);

          // Get inventory
          const { data: stockData } = await supabase
            .from("store_inventory")
            .select("current_stock")
            .eq("store_id", storeData.id)
            .eq("product_id", product.id)
            .maybeSingle();

          // Get par level
          const { data: parData } = await supabase
            .from("par_levels")
            .select("suggested_par_level, manual_override, is_overridden")
            .eq("store_id", storeData.id)
            .eq("product_id", product.id)
            .eq("day_of_week", dayOfWeek)
            .eq("month", month)
            .maybeSingle();

          const currentStock = stockData?.current_stock || 0;
          const parLevel = parData?.is_overridden && parData.manual_override
            ? parData.manual_override
            : parData?.suggested_par_level || 10;
          const isAiSuggested = parData && !parData.is_overridden;

          inventoryItems.push({
            product,
            current_stock: currentStock,
            par_level: parLevel,
            status: getStockStatus(currentStock, parLevel),
            is_ai_suggested: isAiSuggested,
          });
        }

        setInventory(inventoryItems);
      } else {
        // HQ view: Show all items across all stores
        const { data: stores } = await supabase
          .from("stores")
          .select("id, name")
          .order("name");

        if (!stores) {
          setInventory([]);
          setLoading(false);
          return;
        }

        const allItems: InventoryItem[] = [];

        for (const store of stores) {
          const { data: products } = await supabase
            .from("products")
            .select("*")
            .order("name");

          if (!products) continue;

          for (const product of products) {
            const { dayOfWeek, month } = getCurrentParLevel(store.id, product.id);

            // Get inventory
            const { data: stockData } = await supabase
              .from("store_inventory")
              .select("current_stock")
              .eq("store_id", store.id)
              .eq("product_id", product.id)
              .maybeSingle();

            // Get par level
            const { data: parData } = await supabase
              .from("par_levels")
              .select("suggested_par_level, manual_override, is_overridden")
              .eq("store_id", store.id)
              .eq("product_id", product.id)
              .eq("day_of_week", dayOfWeek)
              .eq("month", month)
              .maybeSingle();

            const currentStock = stockData?.current_stock || 0;
            const parLevel = parData?.is_overridden && parData.manual_override
              ? parData.manual_override
              : parData?.suggested_par_level || 10;
            const isAiSuggested = parData && !parData.is_overridden;

            allItems.push({
              product,
              current_stock: currentStock,
              par_level: parLevel,
              status: getStockStatus(currentStock, parLevel),
              store_name: store.name,
              store_id: store.id,
              is_ai_suggested: isAiSuggested,
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

  const handleGetAiSuggestion = async () => {
    if (!editingPar) return;

    setLoadingAiSuggestion(true);
    try {
      const { dayOfWeek, month } = getCurrentParLevel(
        editingPar.store_id,
        editingPar.product_id
      );

      const { data, error } = await supabase.functions.invoke("suggest-par-level", {
        body: {
          productName: editingPar.product_name,
          category: editingPar.category,
          dayOfWeek,
          month,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Rate limits")) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
        } else if (data.error.includes("Payment required")) {
          toast({
            title: "Payment Required",
            description: "Please add credits to your workspace.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setEditingPar({
        ...editingPar,
        new_value: data.suggestedParLevel,
        is_ai_suggested: true,
        reasoning: data.reasoning,
      });

      toast({
        title: "AI Suggestion Ready",
        description: data.reasoning,
      });
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestion",
        variant: "destructive",
      });
    } finally {
      setLoadingAiSuggestion(false);
    }
  };

  const handleUpdateParLevel = async () => {
    if (!editingPar) return;

    try {
      const { dayOfWeek, month } = getCurrentParLevel(
        editingPar.store_id,
        editingPar.product_id
      );

      const { error } = await supabase
        .from("par_levels")
        .upsert({
          store_id: editingPar.store_id,
          product_id: editingPar.product_id,
          day_of_week: dayOfWeek,
          month,
          suggested_par_level: editingPar.is_ai_suggested ? editingPar.new_value : editingPar.current_value,
          manual_override: editingPar.is_ai_suggested ? null : editingPar.new_value,
          is_overridden: !editingPar.is_ai_suggested,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Par level updated successfully",
      });

      setEditingPar(null);
      loadInventory();
    } catch (error) {
      console.error("Error updating par level:", error);
      toast({
        title: "Error",
        description: "Failed to update par level",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            In Stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Low Stock
          </Badge>
        );
      case "sold_out":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Sold Out
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStockUpdate = async (
    itemId: string,
    itemName: string,
    newStock: number,
    oldStock: number,
    isIngredient: boolean = false,
    storeId?: string
  ) => {
    console.log('handleStockUpdate called:', { itemId, itemName, newStock, oldStock, isIngredient, storeId });
    
    try {
      if (isIngredient) {
        // For now, just update local state for ingredients (mock data)
        setIngredientsInventory(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, current_stock: newStock, status: getStockStatus(newStock, item.min_stock_level) }
              : item
          )
        );
      } else {
        // Update prepared goods in database
        if (!storeId) {
          console.error('No store ID provided for stock update');
          toast({
            title: "Error",
            description: "Store information missing",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from("store_inventory")
          .upsert({
            store_id: storeId,
            product_id: itemId,
            current_stock: newStock,
            updated_by: (await supabase.auth.getUser()).data.user?.id,
          });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Update local state
        setInventory(prev =>
          prev.map(i =>
            i.product.id === itemId
              ? { ...i, current_stock: newStock, status: getStockStatus(newStock, i.par_level) }
              : i
          )
        );
      }

      // Show stock update dialog
      const now = new Date();
      const updateInfo = {
        item_id: itemId,
        item_name: itemName,
        old_stock: oldStock,
        new_stock: newStock,
        timestamp: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      };
      
      console.log('Setting stock update dialog:', updateInfo);
      setStockUpdateDialog(updateInfo);

      setEditingStock(null);

      // Auto-close after 3 seconds
      setTimeout(() => {
        console.log('Auto-closing dialog');
        setStockUpdateDialog(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: "Failed to update stock level",
        variant: "destructive",
      });
    }
  };

  const loadIngredientsInventory = async () => {
    setLoading(true);
    try {
      // Mock ingredients inventory data
      const mockIngredients: IngredientInventoryItem[] = [
        { id: "1", name: "Chicken Breast", category: "Protein", current_stock: 5, min_stock_level: 20, status: "low_stock", store_name: selectedStore, suppliers: ["Premium Proteins Co"] },
        { id: "2", name: "Romaine Lettuce", category: "Vegetables", current_stock: 12, min_stock_level: 20, status: "low_stock", store_name: selectedStore, suppliers: ["Fresh Farms Ltd"] },
        { id: "3", name: "Parmesan Cheese", category: "Dairy", current_stock: 8, min_stock_level: 15, status: "low_stock", store_name: selectedStore, suppliers: ["Dairy Direct"] },
        { id: "4", name: "Caesar Dressing", category: "Condiments", current_stock: 0, min_stock_level: 10, status: "sold_out", store_name: selectedStore, suppliers: ["Gourmet Condiments Ltd"] },
        { id: "5", name: "Bacon", category: "Protein", current_stock: 0, min_stock_level: 18, status: "sold_out", store_name: selectedStore, suppliers: ["Premium Proteins Co"] },
        { id: "6", name: "Tomato", category: "Vegetables", current_stock: 35, min_stock_level: 25, status: "in_stock", store_name: selectedStore, suppliers: ["Fresh Farms Ltd"] },
        { id: "7", name: "Whole Wheat Bread", category: "Bakery", current_stock: 18, min_stock_level: 30, status: "low_stock", store_name: selectedStore, suppliers: ["Artisan Bakery Supply"] },
        { id: "8", name: "Feta Cheese", category: "Dairy", current_stock: 0, min_stock_level: 12, status: "sold_out", store_name: selectedStore, suppliers: ["Mediterranean Foods Import"] },
        { id: "9", name: "Cucumber", category: "Vegetables", current_stock: 40, min_stock_level: 30, status: "in_stock", store_name: selectedStore, suppliers: ["Fresh Farms Ltd"] },
        { id: "10", name: "Kalamata Olives", category: "Vegetables", current_stock: 15, min_stock_level: 10, status: "in_stock", store_name: selectedStore, suppliers: ["Mediterranean Foods Import"] },
        { id: "11", name: "Smoked Salmon", category: "Protein", current_stock: 8, min_stock_level: 15, status: "low_stock", store_name: selectedStore, suppliers: ["Premium Proteins Co"] },
        { id: "12", name: "Cream Cheese", category: "Dairy", current_stock: 6, min_stock_level: 20, status: "low_stock", store_name: selectedStore, suppliers: ["Dairy Direct"] },
        { id: "13", name: "Bagel", category: "Bakery", current_stock: 32, min_stock_level: 40, status: "low_stock", store_name: selectedStore, suppliers: ["Artisan Bakery Supply"] },
        { id: "14", name: "Avocado", category: "Vegetables", current_stock: 50, min_stock_level: 35, status: "in_stock", store_name: selectedStore, suppliers: ["Fresh Farms Ltd"] },
        { id: "15", name: "Hummus", category: "Condiments", current_stock: 20, min_stock_level: 12, status: "in_stock", store_name: selectedStore, suppliers: ["Mediterranean Foods Import"] },
        { id: "16", name: "Tortilla Wrap", category: "Bakery", current_stock: 45, min_stock_level: 50, status: "low_stock", store_name: selectedStore, suppliers: ["Artisan Bakery Supply"] },
        { id: "17", name: "Cherry Tomatoes", category: "Vegetables", current_stock: 0, min_stock_level: 25, status: "sold_out", store_name: selectedStore, suppliers: ["Fresh Farms Ltd"] },
        { id: "18", name: "Olive Oil", category: "Condiments", current_stock: 3, min_stock_level: 15, status: "low_stock", store_name: selectedStore, suppliers: ["Mediterranean Foods Import"] },
        { id: "19", name: "Ciabatta Bread", category: "Bakery", current_stock: 0, min_stock_level: 40, status: "sold_out", store_name: selectedStore, suppliers: ["Artisan Bakery Supply"] },
      ];

      if (viewMode === "store") {
        setIngredientsInventory(mockIngredients);
      } else {
        // HQ view: show only out of stock ingredients
        const outOfStockIngredients = mockIngredients.filter(ing => ing.status === "sold_out");
        setIngredientsInventory(outOfStockIngredients);
      }
    } catch (error) {
      console.error("Error loading ingredients inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load ingredients inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    const matchesStore = storeFilter === "all" || item.store_name === storeFilter;
    
    return matchesSearch && matchesStatus && matchesStore;
  });

  const filteredIngredientsInventory = ingredientsInventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    const matchesStore = storeFilter === "all" || item.store_name === storeFilter;
    
    return matchesSearch && matchesStatus && matchesStore;
  });

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Inventory</h1>
                <p className="text-sm text-muted-foreground">
                  {viewMode === "store"
                    ? `Manage stock levels for ${selectedStore}`
                    : "Monitor inventory across all stores"}
                </p>
              </div>
            </div>
            <ViewSelector />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="mb-6">
          <Tabs value={inventoryType} onValueChange={(value) => setInventoryType(value as "prepared" | "ingredients")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="prepared">Prepared Goods</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients Supplies</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {inventoryType === "prepared" 
                    ? (viewMode === "store" ? "Prepared Goods Inventory" : "All Prepared Goods")
                    : (viewMode === "store" ? "Ingredients Supplies Inventory" : "All Ingredients")
                  }
                </CardTitle>
                <Input
                  placeholder={`Search ${inventoryType === "prepared" ? "products" : "ingredients"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                  </SelectContent>
                </Select>

                {viewMode === "hq" && (
                  <Select value={storeFilter} onValueChange={setStoreFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stores</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.name}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading inventory...
              </div>
            ) : inventoryType === "prepared" ? (
              filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No products match your filters
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      {viewMode === "hq" && <TableHead>Store</TableHead>}
                      <TableHead>Current Stock</TableHead>
                      {viewMode === "store" && <TableHead>Par Level</TableHead>}
                      <TableHead>Status</TableHead>
                      {viewMode === "store" && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item, index) => (
                      <TableRow key={index} className="group">
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell>{item.product.sku}</TableCell>
                        <TableCell>{item.product.category || "-"}</TableCell>
                        {viewMode === "hq" && <TableCell>{item.store_name}</TableCell>}
                        <TableCell 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            console.log('Clicked to edit stock for:', item.product.id, item.product.name);
                            setEditingStock(item.product.id);
                          }}
                        >
                          {editingStock === item.product.id ? (
                            <Input
                              type="number"
                              defaultValue={item.current_stock}
                              autoFocus
                              className="w-24"
                              onClick={(e) => e.stopPropagation()}
                              onBlur={async (e) => {
                                const newValue = parseInt(e.target.value) || 0;
                                console.log('Blur event - newValue:', newValue, 'current:', item.current_stock);
                                if (newValue !== item.current_stock) {
                                  // Get store ID
                                  let storeId = item.store_id;
                                  if (!storeId && viewMode === "store") {
                                    const { data: storeData } = await supabase
                                      .from("stores")
                                      .select("id")
                                      .eq("name", selectedStore)
                                      .single();
                                    storeId = storeData?.id;
                                  }
                                  
                                  await handleStockUpdate(
                                    item.product.id,
                                    item.product.name,
                                    newValue,
                                    item.current_stock,
                                    false,
                                    storeId
                                  );
                                } else {
                                  setEditingStock(null);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                } else if (e.key === 'Escape') {
                                  setEditingStock(null);
                                }
                              }}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{item.current_stock} {item.product.unit}</span>
                              <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            </div>
                          )}
                        </TableCell>
                        {viewMode === "store" && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.par_level} {item.product.unit}
                              {item.is_ai_suggested && (
                                <Badge variant="outline" className="gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  AI
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        {viewMode === "store" && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                const { data: storeData } = await supabase
                                  .from("stores")
                                  .select("id")
                                  .eq("name", selectedStore)
                                  .single();
                                
                                if (storeData) {
                                    setEditingPar({
                                      store_id: storeData.id,
                                      product_id: item.product.id,
                                      product_name: item.product.name,
                                      category: item.product.category || "General",
                                      current_value: item.par_level,
                                      new_value: item.par_level,
                                      is_ai_suggested: false,
                                    });
                                }
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              filteredIngredientsInventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No ingredients match your filters
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Category</TableHead>
                      {viewMode === "hq" && <TableHead>Store</TableHead>}
                      <TableHead>Current Stock</TableHead>
                      {viewMode === "store" && <TableHead>Min Stock Level</TableHead>}
                      {viewMode === "store" && <TableHead>Suppliers</TableHead>}
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredientsInventory.map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        {viewMode === "hq" && <TableCell>{item.store_name}</TableCell>}
                        <TableCell 
                          className="cursor-pointer hover:bg-muted/50 font-semibold"
                          onClick={() => {
                            console.log('Clicked to edit ingredient stock for:', item.id, item.name);
                            setEditingStock(`ingredient-${item.id}`);
                          }}
                        >
                          {editingStock === `ingredient-${item.id}` ? (
                            <Input
                              type="number"
                              defaultValue={item.current_stock}
                              autoFocus
                              className="w-24"
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                const newValue = parseInt(e.target.value) || 0;
                                console.log('Ingredient blur - newValue:', newValue, 'current:', item.current_stock);
                                if (newValue !== item.current_stock) {
                                  handleStockUpdate(
                                    item.id,
                                    item.name,
                                    newValue,
                                    item.current_stock,
                                    true
                                  );
                                } else {
                                  setEditingStock(null);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                } else if (e.key === 'Escape') {
                                  setEditingStock(null);
                                }
                              }}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{item.current_stock} kg</span>
                              <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            </div>
                          )}
                        </TableCell>
                        {viewMode === "store" && (
                          <TableCell className="text-muted-foreground">{item.min_stock_level} kg</TableCell>
                        )}
                        {viewMode === "store" && (
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.suppliers.map((supplier) => (
                                <Badge key={supplier} variant="secondary" className="text-xs">
                                  {supplier}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingPar} onOpenChange={() => setEditingPar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Par Level</DialogTitle>
            <DialogDescription>
              Get AI suggestions for optimal par levels or set your own custom threshold.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Current Par Level</label>
              <Input
                type="number"
                value={editingPar?.current_value || 0}
                disabled
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleGetAiSuggestion}
                disabled={loadingAiSuggestion}
              >
                {loadingAiSuggestion ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting Suggestion...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get AI Suggestion
                  </>
                )}
              </Button>
            </div>

            {editingPar?.reasoning && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">AI Reasoning:</span> {editingPar.reasoning}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                {editingPar?.is_ai_suggested ? "AI Suggested Par Level" : "Custom Par Level"}
              </label>
              <Input
                type="number"
                value={editingPar?.new_value || 0}
                onChange={(e) =>
                  setEditingPar(
                    editingPar
                      ? { 
                          ...editingPar, 
                          new_value: parseInt(e.target.value) || 0,
                          is_ai_suggested: false 
                        }
                      : null
                  )
                }
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Manually editing will override AI suggestions
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPar(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateParLevel}>Save Par Level</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Update Confirmation Dialog */}
      <Dialog open={!!stockUpdateDialog} onOpenChange={() => setStockUpdateDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Stock Check Recorded
            </DialogTitle>
            <DialogDescription>
              Inventory has been updated successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Product:</span>
                <span className="text-sm font-bold">{stockUpdateDialog?.item_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Time:</span>
                <span className="text-sm font-bold">{stockUpdateDialog?.timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Previous Stock:</span>
                <span className="text-sm">{stockUpdateDialog?.old_stock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">New Stock:</span>
                <span className="text-sm font-bold text-primary">{stockUpdateDialog?.new_stock}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>
                Stock check of <strong>{stockUpdateDialog?.item_name}</strong> at{" "}
                <strong>{stockUpdateDialog?.timestamp}</strong>
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setStockUpdateDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
