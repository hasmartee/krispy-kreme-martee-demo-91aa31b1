import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle2, Sparkles, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase-helper";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date()
  });

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
        // Generate product data matching each store's range plan
        const storesWithProducts: StoreData[] = storesData.map((store: any) => {
          const baseMultiplier = store.name.includes("Station") ? 1.2 : store.name.includes("Street") ? 1.1 : 1.0;
          const storeProducts = getProductsForCluster(store.cluster || 'high_street');
          
          const products: ProductData[] = storeProducts.map((productName: string) => {
            const planned = Math.round((50 + Math.floor(Math.random() * 100)) * baseMultiplier);
            const produced = Math.round(planned * (0.95 + Math.random() * 0.1));
            const delivered = Math.round(produced * (0.95 + Math.random() * 0.05));
            const sold = Math.round(delivered * (0.8 + Math.random() * 0.15));
            const wasted = Math.round(delivered * (0.03 + Math.random() * 0.07));
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

  // Generate AI insights
  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    stores.forEach((store) => {
      const totals = calculateStoreTotals(store.products);
      const wasteRate = (totals.wasted / totals.produced) * 100;
      const unaccountedRate = (totals.unaccountedFor / totals.produced) * 100;
      const sellThroughRate = (totals.sold / totals.delivered) * 100;
      
      if (wasteRate > 7) {
        insights.push({
          type: "warning",
          title: "High Waste Rate",
          description: `${store.storeName} has ${wasteRate.toFixed(1)}% waste rate. Consider reducing production volumes.`,
          store: store.storeName,
        });
      }
      
      if (unaccountedRate > 5) {
        insights.push({
          type: "warning",
          title: "Inventory Discrepancy",
          description: `${store.storeName} has ${unaccountedRate.toFixed(1)}% unaccounted items. Stock count review needed.`,
          store: store.storeName,
        });
      }
      
      if (sellThroughRate > 95) {
        insights.push({
          type: "success",
          title: "Excellent Performance",
          description: `${store.storeName} achieved ${sellThroughRate.toFixed(1)}% sell-through rate. Consider increasing allocation.`,
          store: store.storeName,
        });
      }
    });
    
    return insights;
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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

      {/* AI Insights Section */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">AI Insights</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, index) => (
              <Alert key={index} variant={insight.type === "warning" ? "destructive" : "default"}>
                {insight.type === "warning" && <AlertCircle className="h-4 w-4" />}
                {insight.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                {insight.type === "info" && <TrendingUp className="h-4 w-4" />}
                <AlertTitle>{insight.title}</AlertTitle>
                <AlertDescription>{insight.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {stores.map((store) => {
          const totals = calculateStoreTotals(store.products);
          const wasteRate = ((totals.wasted / totals.produced) * 100).toFixed(1);
          const sellThroughRate = ((totals.sold / totals.delivered) * 100).toFixed(1);

          return (
            <Card key={store.storeId} className="border-2">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {store.storeName}
                      <Badge variant="outline" className="ml-2">
                        {store.products.length} SKUs
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-base mt-1">Store ID: {store.storeId}</CardDescription>
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
              <CardContent className="pt-6">
                <ScrollArea className="h-[600px]">
                  <div className="rounded-lg border overflow-hidden">
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
                        <TableRow className="bg-primary/10 font-bold border-t-2 border-primary sticky bottom-0">
                          <TableCell className="text-lg">
                            <div className="flex items-center gap-2">
                              Store Total
                              <Badge variant="secondary" className="font-normal">
                                {totals.produced} units
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-lg">{totals.planned}</TableCell>
                          <TableCell className="text-right text-lg">{totals.produced}</TableCell>
                          <TableCell className="text-right text-lg">{totals.delivered}</TableCell>
                          <TableCell className="text-right text-lg">
                            <span className="text-green-700 flex items-center justify-end gap-1">
                              {totals.sold}
                              <TrendingUp className="h-4 w-4" />
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-lg">
                            <span className="text-red-700 flex items-center justify-end gap-1">
                              {totals.wasted}
                              <TrendingDown className="h-4 w-4" />
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-lg">
                            <span className="text-orange-700 flex items-center justify-end gap-1">
                              {totals.unaccountedFor}
                              <AlertCircle className="h-4 w-4" />
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LiveData;
