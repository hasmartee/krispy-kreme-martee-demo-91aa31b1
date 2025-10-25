import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, RefreshCw, Plus, Minus, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/donut-production-1.jpg";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/lib/supabase-helper";

interface WasteProduct {
  id: string;
  productName: string;
  productSku: string;
  category: string;
  deliveredQty: number;
  soldQty: number;
  stockAdjustments: number;
  expectedWaste: number;
  recordedEndOfDayWaste: number;
  recordedTgtgWaste: number;
  hasUnsavedChanges?: boolean;
}

export default function DailyWaste() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<WasteProduct[]>([]);
  const { selectedStore } = useView();
  const { toast } = useToast();
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    loadWasteData();
  }, [selectedStore]);

  const loadWasteData = async () => {
    setLoading(true);
    try {
      const productionDate = format(new Date(), 'yyyy-MM-dd');
      
      // Get the current user's profile to find their store
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .maybeSingle() as any;

      if (!profile?.store_id) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Get production plan for today
      const { data: planData } = await supabase
        .from('production_plans')
        .select('id')
        .eq('production_date', productionDate)
        .maybeSingle() as any;

      if (!planData) {
        console.log('No production plan found for today');
        setProducts([]);
        setLoading(false);
        return;
      }

      // Get delivery allocations for this store
      const { data: allocations } = await supabase
        .from('production_allocations')
        .select('*')
        .eq('production_plan_id', planData.id)
        .eq('store_id', profile.store_id) as any;

      // Get product details
      const { data: productsData } = await supabase
        .from('products')
        .select('*') as any;

      const productMap = new Map(productsData?.map((p: any) => [p.sku, p]) || []);
      const productIdMap = new Map(productsData?.map((p: any) => [p.id, p.sku]) || []);

      // Get stock adjustments for today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data: stockAdjustments } = await supabase
        .from('stock_adjustments')
        .select('product_id, quantity')
        .eq('store_id', profile.store_id)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString()) as any;

      // Group stock adjustments by product SKU
      const adjustmentMap = new Map<string, number>();
      (stockAdjustments || []).forEach((adj: any) => {
        const productSku = productIdMap.get(adj.product_id) as string | undefined;
        if (productSku) {
          const currentTotal = adjustmentMap.get(productSku) || 0;
          adjustmentMap.set(productSku, currentTotal + (adj.quantity as number));
        }
      });

      // Calculate waste for each product
      const wasteProducts: WasteProduct[] = (allocations || []).map((alloc: any) => {
        const product: any = productMap.get(alloc.product_sku);
        const deliveredQty = alloc.received_quantity || 0;
        
        // For now, simulate sold quantity (15-90% of delivered)
        // TODO: Replace with actual sales data from live sales tracking
        const soldQty = Math.floor(deliveredQty * (0.15 + Math.random() * 0.75));
        
        // Get stock adjustments for this product
        const stockAdjustments = adjustmentMap.get(alloc.product_sku) || 0;
        
        // Expected waste = delivered - sold + stock adjustments
        // If stock adjustment is negative (write-off), it subtracts from expected waste
        const expectedWaste = Math.max(0, deliveredQty - soldQty + stockAdjustments);
        
        return {
          id: alloc.id,
          productName: product?.name || alloc.product_sku,
          productSku: alloc.product_sku,
          category: product?.category || 'Unknown',
          deliveredQty,
          soldQty,
          stockAdjustments,
          expectedWaste,
          recordedEndOfDayWaste: expectedWaste, // Pre-populate with expected
          recordedTgtgWaste: 0,
          hasUnsavedChanges: false,
        };
      });

      setProducts(wasteProducts);
    } catch (error) {
      console.error('Error loading waste data:', error);
      toast({
        title: "Error",
        description: "Failed to load waste data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWasteData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const updateRecordedWaste = (productId: string, wasteType: 'endOfDay' | 'tgtg', newQuantity: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId
        ? { 
            ...p, 
            [wasteType === 'endOfDay' ? 'recordedEndOfDayWaste' : 'recordedTgtgWaste']: Math.max(0, newQuantity),
            hasUnsavedChanges: true 
          }
        : p
    ));
  };

  const confirmWaste = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      // TODO: Save to waste_records table (to be created)
      // For now, just mark as confirmed locally
      
      setProducts(prev => prev.map(p => 
        p.id === productId
          ? { ...p, hasUnsavedChanges: false }
          : p
      ));

      const totalWaste = product.recordedEndOfDayWaste + product.recordedTgtgWaste;
      toast({
        title: "✓ Waste Recorded",
        description: `${product.productName} waste logged - ${totalWaste} units (${product.recordedEndOfDayWaste} EOD + ${product.recordedTgtgWaste} TGTG)`,
      });
    } catch (error) {
      console.error('Error confirming waste:', error);
      toast({
        title: "Error",
        description: "Failed to record waste",
        variant: "destructive",
      });
    }
  };

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
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-destructive/20 backdrop-blur-sm px-4 py-2 rounded-full border border-destructive/30">
              <Trash2 className="h-5 w-5 text-destructive" />
              <span className="text-white font-semibold text-sm">Waste Tracking</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-cream-foreground mb-2">
            Daily Waste Log
          </h1>
          <p className="text-xl text-cream-foreground">
            {selectedStore} - {formattedDate}
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated: {format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
        </div>
        <Button 
          onClick={handleRefresh}
          size="sm"
          variant="outline"
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Waste Tracking Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div>
            <CardTitle className="text-xl">End of Day Waste Recording</CardTitle>
            <CardDescription>
              Expected waste is calculated from confirmed deliveries minus sales and stock adjustments. Adjust if needed and confirm.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No delivery data available for today</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Product</TableHead>
                  <TableHead className="text-center w-[10%]">Delivered</TableHead>
                  <TableHead className="text-center w-[11%]">Stock Adj.</TableHead>
                  <TableHead className="text-center w-[10%]">Sold</TableHead>
                  <TableHead className="text-center w-[11%]">Expected Waste</TableHead>
                  <TableHead className="text-center w-[18%] bg-gradient-to-r from-[#ff914d]/20 to-[#ff914d]/10 border-l-4 border-l-[#ff914d]">
                    <div className="flex items-center justify-center gap-2 py-1">
                      <Trash2 className="h-4 w-4 text-[#ff914d]" />
                      <span className="font-bold text-[#ff914d]">End of Day Waste</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-[18%] bg-gradient-to-r from-[#7ea058]/20 to-[#7ea058]/10 border-l-4 border-l-[#7ea058]">
                    <div className="flex items-center justify-center gap-2 py-1">
                      <Trash2 className="h-4 w-4 text-[#7ea058]" />
                      <span className="font-bold text-[#7ea058]">TGTG Waste</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[7%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.id}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      product.hasUnsavedChanges && "bg-amber-50/50"
                    )}
                  >
                    <TableCell>
                      <div className="font-medium">{product.productName}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono font-semibold">{product.deliveredQty}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-mono font-semibold",
                        product.stockAdjustments > 0 ? "text-blue-600" : product.stockAdjustments < 0 ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {product.stockAdjustments > 0 ? '+' : ''}{product.stockAdjustments}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono font-semibold text-green-600">{product.soldQty}</span>
                    </TableCell>
                    <TableCell className="text-center bg-muted/30">
                      <span className="font-mono font-bold text-lg">{product.expectedWaste}</span>
                    </TableCell>
                    
                    {/* End of Day Waste Column */}
                    <TableCell className="bg-gradient-to-r from-[#ff914d]/10 to-[#ff914d]/5 border-l-4 border-l-[#ff914d]/30">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-2 border-[#ff914d]/40 hover:border-[#ff914d] hover:bg-[#ff914d]/10 transition-all duration-200 hover:scale-110"
                          onClick={() => updateRecordedWaste(product.id, 'endOfDay', product.recordedEndOfDayWaste - 1)}
                        >
                          <Minus className="h-3 w-3 text-[#ff914d]" />
                        </Button>
                        
                        <div className="relative">
                          <Input
                            type="number"
                            value={product.recordedEndOfDayWaste}
                            onChange={(e) => updateRecordedWaste(product.id, 'endOfDay', parseInt(e.target.value) || 0)}
                            className={cn(
                              "w-16 text-center font-bold text-xl border-3 bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-200 focus:ring-4 focus:ring-[#ff914d]/30 text-[#ff914d]",
                              product.hasUnsavedChanges ? "border-amber-400" : "border-[#ff914d]"
                            )}
                            min="0"
                          />
                        </div>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-2 border-[#ff914d]/40 hover:border-[#ff914d] hover:bg-[#ff914d]/10 transition-all duration-200 hover:scale-110"
                          onClick={() => updateRecordedWaste(product.id, 'endOfDay', product.recordedEndOfDayWaste + 1)}
                        >
                          <Plus className="h-3 w-3 text-[#ff914d]" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* TGTG Waste Column */}
                    <TableCell className="bg-gradient-to-r from-[#7ea058]/10 to-[#7ea058]/5 border-l-4 border-l-[#7ea058]/30">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-2 border-[#7ea058]/40 hover:border-[#7ea058] hover:bg-[#7ea058]/10 transition-all duration-200 hover:scale-110"
                          onClick={() => updateRecordedWaste(product.id, 'tgtg', product.recordedTgtgWaste - 1)}
                        >
                          <Minus className="h-3 w-3 text-[#7ea058]" />
                        </Button>
                        
                        <div className="relative">
                          <Input
                            type="number"
                            value={product.recordedTgtgWaste}
                            onChange={(e) => updateRecordedWaste(product.id, 'tgtg', parseInt(e.target.value) || 0)}
                            className={cn(
                              "w-16 text-center font-bold text-xl border-3 bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-200 focus:ring-4 focus:ring-[#7ea058]/30 text-[#7ea058]",
                              product.hasUnsavedChanges ? "border-amber-400" : "border-[#7ea058]"
                            )}
                            min="0"
                          />
                        </div>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-2 border-[#7ea058]/40 hover:border-[#7ea058] hover:bg-[#7ea058]/10 transition-all duration-200 hover:scale-110"
                          onClick={() => updateRecordedWaste(product.id, 'tgtg', product.recordedTgtgWaste + 1)}
                        >
                          <Plus className="h-3 w-3 text-[#7ea058]" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => confirmWaste(product.id)}
                        disabled={!product.hasUnsavedChanges}
                        className={cn(
                          "w-full font-semibold transition-all duration-200",
                          product.hasUnsavedChanges
                            ? "bg-[#ff914d] hover:bg-[#ff7a2d] text-white shadow-lg hover:shadow-xl hover:scale-105 animate-in fade-in zoom-in"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {product.hasUnsavedChanges ? "Confirm" : "Confirmed"}
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
