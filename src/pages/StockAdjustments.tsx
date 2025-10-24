import { useState, useEffect } from "react";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Minus, Plus, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface StockAdjustment {
  id: string;
  product_id: string;
  adjustment_type: string;
  quantity: number;
  comment: string | null;
  created_at: string;
  products?: {
    name: string;
    sku: string;
  };
}

const adjustmentTypes = [
  "Stock Transfer",
  "Stock Write-Off",
  "Stock Markdown",
  "Other Adjustment",
  "Delivery Confirmed"
];

export default function StockAdjustments() {
  const { selectedStore } = useView();
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedStore]);

  const loadData = async () => {
    if (!selectedStore) return;

    try {
      setLoading(true);

      // Get store ID
      const { data: storeData } = await supabase
        .from("stores")
        .select("id")
        .eq("name", selectedStore)
        .single();

      if (!storeData) return;

      // Load products
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, sku")
        .order("name");

      if (productsData) {
        setProducts(productsData);
      }

      // Load stock adjustments
      const { data: adjustmentsData } = await supabase
        .from("stock_adjustments")
        .select(`
          id,
          product_id,
          adjustment_type,
          quantity,
          comment,
          created_at,
          products (
            name,
            sku
          )
        `)
        .eq("store_id", storeData.id)
        .order("created_at", { ascending: false });

      if (adjustmentsData) {
        setAdjustments(adjustmentsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load stock adjustments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !adjustmentType || quantity === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      // Get store ID
      const { data: storeData } = await supabase
        .from("stores")
        .select("id")
        .eq("name", selectedStore)
        .single();

      if (!storeData) {
        toast.error("Store not found");
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Insert adjustment
      const { error } = await supabase
        .from("stock_adjustments")
        .insert({
          store_id: storeData.id,
          product_id: selectedProduct,
          adjustment_type: adjustmentType,
          quantity: quantity,
          comment: comment || null,
          created_by: user.id
        });

      if (error) throw error;

      toast.success("Stock adjustment recorded");
      
      // Reset form
      setSelectedProduct("");
      setAdjustmentType("");
      setQuantity(0);
      setComment("");
      
      // Reload adjustments
      loadData();
    } catch (error) {
      console.error("Error submitting adjustment:", error);
      toast.error("Failed to record stock adjustment");
    } finally {
      setSubmitting(false);
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => prev + delta);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Stock Adjustments</h1>
          <p className="text-muted-foreground">
            Log and track all stock adjustments for {selectedStore}
          </p>
        </div>

        {/* Adjustment Form */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Log New Adjustment
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adjustment-type">Adjustment Type *</Label>
                <Select
                  value={adjustmentType}
                  onValueChange={setAdjustmentType}
                >
                  <SelectTrigger id="adjustment-type" className="bg-background">
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {adjustmentTypes.filter(type => type !== "Delivery Confirmed").map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger id="product" className="bg-background">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(-1)}
                  className="shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="text-center text-lg font-semibold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(1)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use positive numbers for stock additions, negative for reductions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional notes about this adjustment..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedProduct || !adjustmentType || quantity === 0}
              className="w-full md:w-auto bg-[#ff914d] hover:bg-[#ff914d]/90"
            >
              {submitting ? "Recording..." : "Confirm Adjustment"}
            </Button>
          </form>
        </div>

        {/* Adjustments Log */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-6">Adjustment Log</h2>
          
          {adjustments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No stock adjustments recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Adjustment Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell className="font-medium">
                        {format(new Date(adjustment.created_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {adjustment.products?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          adjustment.adjustment_type === "Delivery Confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : adjustment.adjustment_type === "Stock Write-Off"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}>
                          {adjustment.adjustment_type}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        adjustment.quantity > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {adjustment.quantity > 0 ? "+" : ""}{adjustment.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {adjustment.comment || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
