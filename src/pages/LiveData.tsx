import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

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

// Generate comprehensive product data
const generateProductData = (storeName: string): ProductData[] => {
  const baseMultiplier = storeName.includes("Station") ? 1.2 : storeName.includes("Street") ? 1.1 : 1.0;
  
  return [
    // Pastries
    { productName: "Cinnamon Swirl", planned: Math.round(60 * baseMultiplier), produced: Math.round(60 * baseMultiplier), delivered: Math.round(60 * baseMultiplier), sold: Math.round(52 * baseMultiplier), wasted: Math.round(5 * baseMultiplier), unaccountedFor: Math.round(3 * baseMultiplier) },
    { productName: "Poppy Seed Pastry", planned: Math.round(50 * baseMultiplier), produced: Math.round(50 * baseMultiplier), delivered: Math.round(50 * baseMultiplier), sold: Math.round(44 * baseMultiplier), wasted: Math.round(4 * baseMultiplier), unaccountedFor: Math.round(2 * baseMultiplier) },
    { productName: "Danish Pastry", planned: Math.round(70 * baseMultiplier), produced: Math.round(70 * baseMultiplier), delivered: Math.round(70 * baseMultiplier), sold: Math.round(63 * baseMultiplier), wasted: Math.round(5 * baseMultiplier), unaccountedFor: Math.round(2 * baseMultiplier) },
    { productName: "Butter Croissant", planned: Math.round(120 * baseMultiplier), produced: Math.round(120 * baseMultiplier), delivered: Math.round(120 * baseMultiplier), sold: Math.round(105 * baseMultiplier), wasted: Math.round(8 * baseMultiplier), unaccountedFor: Math.round(7 * baseMultiplier) },
    { productName: "Pain au Chocolat", planned: Math.round(100 * baseMultiplier), produced: Math.round(100 * baseMultiplier), delivered: Math.round(100 * baseMultiplier), sold: Math.round(92 * baseMultiplier), wasted: Math.round(5 * baseMultiplier), unaccountedFor: Math.round(3 * baseMultiplier) },
    { productName: "Almond Croissant", planned: Math.round(80 * baseMultiplier), produced: Math.round(80 * baseMultiplier), delivered: Math.round(80 * baseMultiplier), sold: Math.round(74 * baseMultiplier), wasted: Math.round(4 * baseMultiplier), unaccountedFor: Math.round(2 * baseMultiplier) },
    
    // Breads
    { productName: "Rye Bread Whole", planned: Math.round(30 * baseMultiplier), produced: Math.round(30 * baseMultiplier), delivered: Math.round(30 * baseMultiplier), sold: Math.round(26 * baseMultiplier), wasted: Math.round(2 * baseMultiplier), unaccountedFor: Math.round(2 * baseMultiplier) },
    { productName: "Sourdough Loaf", planned: Math.round(40 * baseMultiplier), produced: Math.round(40 * baseMultiplier), delivered: Math.round(40 * baseMultiplier), sold: Math.round(35 * baseMultiplier), wasted: Math.round(3 * baseMultiplier), unaccountedFor: Math.round(2 * baseMultiplier) },
    
    // Hot Breakfast
    { productName: "Scrambled Eggs on Sourdough", planned: Math.round(45 * baseMultiplier), produced: Math.round(45 * baseMultiplier), delivered: Math.round(45 * baseMultiplier), sold: Math.round(41 * baseMultiplier), wasted: Math.round(3 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    { productName: "Bacon & Egg Roll", planned: Math.round(55 * baseMultiplier), produced: Math.round(55 * baseMultiplier), delivered: Math.round(55 * baseMultiplier), sold: Math.round(50 * baseMultiplier), wasted: Math.round(4 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    { productName: "Ham & Cheese Croissant", planned: Math.round(40 * baseMultiplier), produced: Math.round(40 * baseMultiplier), delivered: Math.round(40 * baseMultiplier), sold: Math.round(36 * baseMultiplier), wasted: Math.round(3 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    { productName: "Avocado Toast with Egg", planned: Math.round(35 * baseMultiplier), produced: Math.round(35 * baseMultiplier), delivered: Math.round(35 * baseMultiplier), sold: Math.round(32 * baseMultiplier), wasted: Math.round(2 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    
    // Cold Breakfast
    { productName: "Granola Bowl", planned: Math.round(30 * baseMultiplier), produced: Math.round(30 * baseMultiplier), delivered: Math.round(30 * baseMultiplier), sold: Math.round(28 * baseMultiplier), wasted: Math.round(1 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    { productName: "Fruit Parfait", planned: Math.round(25 * baseMultiplier), produced: Math.round(25 * baseMultiplier), delivered: Math.round(25 * baseMultiplier), sold: Math.round(23 * baseMultiplier), wasted: Math.round(1 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    
    // Sandwiches
    { productName: "Classic BLT", planned: Math.round(50 * baseMultiplier), produced: Math.round(50 * baseMultiplier), delivered: Math.round(50 * baseMultiplier), sold: Math.round(45 * baseMultiplier), wasted: Math.round(3 * baseMultiplier), unaccountedFor: Math.round(2 * baseMultiplier) },
    { productName: "Chicken Bacon Sandwich", planned: Math.round(60 * baseMultiplier), produced: Math.round(60 * baseMultiplier), delivered: Math.round(60 * baseMultiplier), sold: Math.round(54 * baseMultiplier), wasted: Math.round(4 * baseMultiplier), unaccountedFor: Math.round(2 * baseMultiplier) },
    { productName: "Salmon & Cream Cheese Bagel", planned: Math.round(40 * baseMultiplier), produced: Math.round(40 * baseMultiplier), delivered: Math.round(40 * baseMultiplier), sold: Math.round(37 * baseMultiplier), wasted: Math.round(2 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    { productName: "Tuna Melt Panini", planned: Math.round(35 * baseMultiplier), produced: Math.round(35 * baseMultiplier), delivered: Math.round(35 * baseMultiplier), sold: Math.round(32 * baseMultiplier), wasted: Math.round(2 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    
    // Wraps
    { productName: "Chicken Caesar Wrap", planned: Math.round(55 * baseMultiplier), produced: Math.round(55 * baseMultiplier), delivered: Math.round(55 * baseMultiplier), sold: Math.round(50 * baseMultiplier), wasted: Math.round(3 * baseMultiplier), unaccountedFor: Math.round(2 * baseMultiplier) },
    { productName: "Avocado Hummus Wrap", planned: Math.round(45 * baseMultiplier), produced: Math.round(45 * baseMultiplier), delivered: Math.round(45 * baseMultiplier), sold: Math.round(41 * baseMultiplier), wasted: Math.round(3 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    { productName: "Breakfast Burrito", planned: Math.round(40 * baseMultiplier), produced: Math.round(40 * baseMultiplier), delivered: Math.round(40 * baseMultiplier), sold: Math.round(37 * baseMultiplier), wasted: Math.round(2 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    
    // Salads
    { productName: "Mediterranean Salad", planned: Math.round(35 * baseMultiplier), produced: Math.round(35 * baseMultiplier), delivered: Math.round(35 * baseMultiplier), sold: Math.round(32 * baseMultiplier), wasted: Math.round(2 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
    { productName: "Greek Feta Salad", planned: Math.round(30 * baseMultiplier), produced: Math.round(30 * baseMultiplier), delivered: Math.round(30 * baseMultiplier), sold: Math.round(28 * baseMultiplier), wasted: Math.round(1 * baseMultiplier), unaccountedFor: Math.round(1 * baseMultiplier) },
  ];
};

// Mock data with comprehensive product range
const mockStores: StoreData[] = [
  { storeId: "OS-001", storeName: "Kings Cross Station", products: generateProductData("Kings Cross Station") },
  { storeId: "OS-002", storeName: "Liverpool Street Station", products: generateProductData("Liverpool Street Station") },
  { storeId: "OS-003", storeName: "St Pancras International", products: generateProductData("St Pancras International") },
  { storeId: "OS-004", storeName: "Shoreditch High Street", products: generateProductData("Shoreditch High Street") },
  { storeId: "OS-005", storeName: "Bond Street", products: generateProductData("Bond Street") },
];

const LiveData = () => {
  const [stores] = useState<StoreData[]>(mockStores);

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Live Data</h1>
        <p className="text-muted-foreground">
          Real-time tracking of product quantities across all stores
        </p>
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
                        {store.products.map((product, index) => (
                          <TableRow key={product.productName} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                            <TableCell className="font-medium">{product.productName}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{product.planned}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{product.produced}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{product.delivered}</TableCell>
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
                        ))}
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
