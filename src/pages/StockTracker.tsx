import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle2, Sparkles, CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase-helper";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useView } from "@/contexts/ViewContext";

interface ProductData {
  productName: string;
  planned: number;
  produced: number;
  delivered: number;
  sold: number;
  wasted: number;
  unaccountedFor: number;
}

interface StoreData {
  storeId: string;
  storeName: string;
  products: ProductData[];
}

interface AIInsight {
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  store?: string;
}

const LiveData = () => {
  const { viewMode } = useView();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date()
  });
  const [openStores, setOpenStores] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  // Krispy Kreme products matching StoreProductRange
  const allKrispyKremeProducts = [
    "Original Glazed", "Chocolate Iced Glazed", "Maple Iced", "Glazed Blueberry", 
    "Caramel Iced", "Coffee Glazed", "Dulce de Leche",
    "Strawberry Iced with Sprinkles", "Chocolate Iced with Sprinkles", "Vanilla Iced with Sprinkles",
    "Raspberry Filled", "Lemon Filled", "Boston Kreme", "Chocolate Kreme Filled",
    "Powdered Sugar", "Cinnamon Sugar", "Double Chocolate",
    "Cookies and Kreme", "Apple Fritter", "Glazed Cruller"
  ];

  const getProductsForCluster = (cluster: string) => {
    switch (cluster) {
      case "transport_hub":
        return allKrispyKremeProducts.slice(0, 20);
      case "business_district":
        return allKrispyKremeProducts.slice(0, 25);
      case "residential":
      case "high_street":
        return allKrispyKremeProducts;
      default:
        return allKrispyKremeProducts.slice(0, 15);
    }
  };

  const loadData = async () => {
    try {
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('name') as any;

      if (storesData) {
        // Generate product data with more varied scenarios
        const storesWithProducts: StoreData[] = storesData.map((store: any, storeIndex: number) => {
          const baseMultiplier = store.name.includes("Station") ? 1.2 : store.name.includes("Street") ? 1.1 : 1.0;
          const storeProducts = getProductsForCluster(store.cluster || 'high_street');
          
          // Create different scenario types for different stores
          const scenarioType = storeIndex % 4;
          
          const products: ProductData[] = storeProducts.map((productName: string, idx: number) => {
            const planned = Math.round((50 + Math.floor(Math.random() * 100)) * baseMultiplier);
            
            let produced: number;
            let delivered: number;
            let sold: number;
            let wasted: number;
            
            // Vary scenarios to create different types of issues
            switch (scenarioType) {
              case 0: // Production overrun scenario
                produced = Math.round(planned * (1.12 + Math.random() * 0.08)); // 12-20% over
                delivered = Math.round(produced * (0.96 + Math.random() * 0.04));
                sold = Math.round(delivered * (0.82 + Math.random() * 0.13));
                wasted = Math.round(delivered * (0.04 + Math.random() * 0.06));
                break;
              
              case 1: // Production shortfall scenario
                produced = Math.round(planned * (0.80 + Math.random() * 0.08)); // 12-20% under
                delivered = Math.round(produced * (0.95 + Math.random() * 0.05));
                sold = Math.round(delivered * (0.85 + Math.random() * 0.10));
                wasted = Math.round(delivered * (0.03 + Math.random() * 0.05));
                break;
              
              case 2: // Delivery variance scenario
                produced = Math.round(planned * (0.98 + Math.random() * 0.04));
                delivered = Math.round(produced * (0.85 + Math.random() * 0.05)); // 10-15% delivery loss
                sold = Math.round(delivered * (0.80 + Math.random() * 0.15));
                wasted = Math.round(delivered * (0.05 + Math.random() * 0.08));
                break;
              
              case 3: // Excellent performance scenario
                produced = Math.round(planned * (0.98 + Math.random() * 0.04));
                delivered = Math.round(produced * (0.97 + Math.random() * 0.03));
                sold = Math.round(delivered * (0.96 + Math.random() * 0.03)); // >95% sell-through
                wasted = Math.round(delivered * (0.01 + Math.random() * 0.02)); // <3% waste
                break;
              
              default:
                produced = Math.round(planned * (0.95 + Math.random() * 0.1));
                delivered = Math.round(produced * (0.95 + Math.random() * 0.05));
                sold = Math.round(delivered * (0.8 + Math.random() * 0.15));
                wasted = Math.round(delivered * (0.03 + Math.random() * 0.07));
            }
            
            const unaccountedFor = Math.max(0, delivered - sold - wasted);

            return {
              productName,
              planned,
              produced,
              delivered,
              sold,
              wasted,
              unaccountedFor,
            };
          });

          return {
            storeId: store.store_id || store.id,
            storeName: store.name,
            products,
          };
        });

        setStores(storesWithProducts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStoreTotals = (products: ProductData[]) => {
    return products.reduce(
      (totals, product) => ({
        planned: totals.planned + product.planned,
        produced: totals.produced + product.produced,
        delivered: totals.delivered + product.delivered,
        sold: totals.sold + product.sold,
        wasted: totals.wasted + product.wasted,
        unaccountedFor: totals.unaccountedFor + product.unaccountedFor,
      }),
      { planned: 0, produced: 0, delivered: 0, sold: 0, wasted: 0, unaccountedFor: 0 }
    );
  };

  // Generate AI insights - prioritize most significant issues
  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    stores.forEach((store) => {
      const totals = calculateStoreTotals(store.products);
      
      // Calculate various rates and discrepancies
      const wasteRate = (totals.wasted / totals.produced) * 100;
      const unaccountedRate = (totals.unaccountedFor / totals.produced) * 100;
      const sellThroughRate = (totals.sold / totals.delivered) * 100;
      const productionVariance = ((totals.produced - totals.planned) / totals.planned) * 100;
      const deliveryVariance = ((totals.delivered - totals.produced) / totals.produced) * 100;
      
      // Production Discrepancy - Planned vs Produced
      if (Math.abs(productionVariance) > 10) {
        insights.push({
          type: "warning",
          title: productionVariance > 0 ? "Overproduction Detected" : "Underproduction Issue",
          description: `${store.storeName} ${productionVariance > 0 ? 'produced' : 'fell short by'} ${Math.abs(productionVariance).toFixed(1)}% ${productionVariance > 0 ? 'more than planned' : 'of planned production'}. Review production capacity.`,
          store: store.storeName,
        });
      }
      
      // Delivery Discrepancy - Produced vs Delivered
      if (Math.abs(deliveryVariance) > 8) {
        insights.push({
          type: "warning",
          title: "Delivery Variance Alert",
          description: `${store.storeName} delivery ${deliveryVariance > 0 ? 'exceeded' : 'fell short of'} production by ${Math.abs(deliveryVariance).toFixed(1)}%. Check logistics and delivery processes.`,
          store: store.storeName,
        });
      }
      
      // High Waste Rate
      if (wasteRate > 8) {
        insights.push({
          type: "warning",
          title: "High Waste Rate",
          description: `${store.storeName} has ${wasteRate.toFixed(1)}% waste rate. Optimize production planning to reduce waste.`,
          store: store.storeName,
        });
      }
      
      // Critical Unaccounted Items
      if (unaccountedRate > 7) {
        insights.push({
          type: "warning",
          title: "Critical Inventory Gap",
          description: `${store.storeName} has ${unaccountedRate.toFixed(1)}% unaccounted items. Urgent stock reconciliation required.`,
          store: store.storeName,
        });
      }
      
      // Excellent Performance
      if (sellThroughRate > 95 && wasteRate < 5) {
        insights.push({
          type: "success",
          title: "Outstanding Performance",
          description: `${store.storeName} achieved ${sellThroughRate.toFixed(1)}% sell-through with minimal waste. Consider increasing allocation.`,
          store: store.storeName,
        });
      }
    });
    
    // Sort by priority (warnings first, then success) and limit to top 4 most significant
    const sortedInsights = insights.sort((a, b) => {
      if (a.type === "warning" && b.type !== "warning") return -1;
      if (a.type !== "warning" && b.type === "warning") return 1;
      return 0;
    });
    
    return sortedInsights.slice(0, 4);
  };

  const insights = generateInsights();

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const getWasteColor = (wasted: number, total: number) => {
    const rate = (wasted / total) * 100;
    if (rate > 10) return "text-red-600 font-bold";
    if (rate > 5) return "text-orange-600 font-semibold";
    return "text-muted-foreground";
  };

  const getUnaccountedColor = (unaccounted: number, total: number) => {
    const rate = (unaccounted / total) * 100;
    if (rate > 7) return "text-red-600 font-bold";
    if (rate > 3) return "text-orange-600 font-semibold";
    return "text-muted-foreground";
  };

  const hasDiscrepancy = (product: ProductData) => {
    // Check if produced doesn't match planned
    if (product.produced !== product.planned) return true;
    // Check if delivered doesn't match produced
    if (product.delivered !== product.produced) return true;
    // Check if sold + wasted + unaccounted doesn't match delivered
    if (product.sold + product.wasted + product.unaccountedFor !== product.delivered) return true;
    return false;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stock Tracker</h1>
          <p className="text-muted-foreground">
            Real-time tracking of product quantities across all stores
          </p>
        </div>
        
        {/* Enhanced Date Picker */}
        <Card className="shadow-lg border-2 border-primary animate-fade-in hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Date Range</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold text-base hover:text-primary transition-colors"
                    >
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        <span>Select dates</span>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={{ from: dateRange?.from, to: dateRange?.to }}
                      onSelect={(range: any) => range && setDateRange(range)}
                      numberOfMonths={2}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Key Insights Section - Only for HQ/Demand Planners */}
      {viewMode === "hq" && insights.length > 0 && (
        <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  AI Key Insights
                  <Sparkles className="h-4 w-4 text-orange-400" />
                </CardTitle>
                <CardDescription className="text-sm">Data-driven discoveries from your business operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl border ${
                  insight.type === "warning" 
                    ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200" 
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === "warning" && <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />}
                  {insight.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />}
                  {insight.type === "info" && <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />}
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className={`font-semibold ${insight.type === "warning" ? "text-orange-600" : "text-green-600"}`}>
                      {insight.title}
                    </span>
                    {" — "}
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {stores.map((store) => {
          const totals = calculateStoreTotals(store.products);
          const wasteRate = ((totals.wasted / totals.produced) * 100).toFixed(1);
          const sellThroughRate = ((totals.sold / totals.delivered) * 100).toFixed(1);
          const isOpen = openStores[store.storeId] ?? false;

          return (
            <Collapsible
              key={store.storeId}
              open={isOpen}
              onOpenChange={(open) => setOpenStores(prev => ({ ...prev, [store.storeId]: open }))}
            >
              <Card className="border-2 animate-fade-in">
                <CollapsibleTrigger asChild>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          {isOpen ? (
                            <ChevronUp className="h-6 w-6 text-primary" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            {store.storeName}
                            <Badge variant="outline" className="ml-2">
                              {store.products.length} SKUs
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-base mt-1">
                            Store ID: {store.storeId} • Click to {isOpen ? 'collapse' : 'expand'} details
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          {sellThroughRate}% sell-through
                        </Badge>
                        <Badge className="bg-orange-500 hover:bg-orange-600">
                          {wasteRate}% waste
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                {/* Summary Row - Always Visible */}
                <CardContent className="pt-4 pb-4">
                  <div className="rounded-lg border-2 border-primary/30 bg-primary/5 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary/10">
                          <TableHead className="w-[220px] font-bold">Summary</TableHead>
                          <TableHead className="text-right font-bold">Planned</TableHead>
                          <TableHead className="text-right font-bold">Produced</TableHead>
                          <TableHead className="text-right font-bold">Delivered</TableHead>
                          <TableHead className="text-right font-bold text-green-700">Sold</TableHead>
                          <TableHead className="text-right font-bold text-red-700">Wasted</TableHead>
                          <TableHead className="text-right font-bold text-orange-700">Unaccounted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-background font-bold text-lg">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              Store Total
                              <Badge variant="secondary" className="font-normal">
                                {totals.produced} units
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{totals.planned}</TableCell>
                          <TableCell className="text-right">{totals.produced}</TableCell>
                          <TableCell className="text-right">{totals.delivered}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-700 flex items-center justify-end gap-1">
                              {totals.sold}
                              <TrendingUp className="h-4 w-4" />
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-red-700 flex items-center justify-end gap-1">
                              {totals.wasted}
                              <TrendingDown className="h-4 w-4" />
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-orange-700 flex items-center justify-end gap-1">
                              {totals.unaccountedFor}
                              <AlertCircle className="h-4 w-4" />
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>

                {/* Detailed Product List - Collapsible */}
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-6">
                    <ScrollArea className="h-[600px] rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[220px] font-bold sticky top-0 bg-muted/50 z-10">Product</TableHead>
                            <TableHead className="text-right font-bold sticky top-0 bg-muted/50 z-10">Planned</TableHead>
                            <TableHead className="text-right font-bold sticky top-0 bg-muted/50 z-10">Produced</TableHead>
                            <TableHead className="text-right font-bold sticky top-0 bg-muted/50 z-10">Delivered</TableHead>
                            <TableHead className="text-right font-bold text-green-700 sticky top-0 bg-muted/50 z-10">Sold</TableHead>
                            <TableHead className="text-right font-bold text-red-700 sticky top-0 bg-muted/50 z-10">Wasted</TableHead>
                            <TableHead className="text-right font-bold text-orange-700 sticky top-0 bg-muted/50 z-10">Unaccounted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {store.products.map((product, index) => {
                            const hasIssue = hasDiscrepancy(product);
                            return (
                            <TableRow 
                              key={product.productName} 
                              className={`${index % 2 === 0 ? "bg-background" : "bg-muted/30"} ${hasIssue ? "bg-orange-50 dark:bg-orange-950/20 border-l-4 border-l-orange-500" : ""}`}
                            >
                              <TableCell className="font-medium">
                                {product.productName}
                                {hasIssue && <AlertCircle className="inline-block ml-2 h-4 w-4 text-orange-600" />}
                              </TableCell>
                              <TableCell className={`text-right ${product.planned !== product.produced ? "text-orange-600 font-bold" : "text-muted-foreground"}`}>
                                {product.planned}
                              </TableCell>
                              <TableCell className={`text-right ${product.produced !== product.planned ? "text-orange-600 font-bold" : "text-muted-foreground"}`}>
                                {product.produced}
                              </TableCell>
                              <TableCell className={`text-right ${product.delivered !== product.produced ? "text-orange-600 font-bold" : "text-muted-foreground"}`}>
                                {product.delivered}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-green-700 font-semibold">{product.sold}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={getWasteColor(product.wasted, product.produced)}>
                                  {product.wasted}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={getUnaccountedColor(product.unaccountedFor, product.produced)}>
                                  {product.unaccountedFor}
                                </span>
                              </TableCell>
                            </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default LiveData;
