import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, CalendarIcon, Award, AlertTriangle, Package, CheckCircle, Trash2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/lib/supabase-helper";

// Mock cluster performance data
const clusterPerformanceData = [
  {
    id: "high_street",
    name: "High Street",
    storeCount: 12,
    revenue: 52400,
    grossProfit: 23580,
    target: 50000,
    waste: 2890,
    topProduct: "Classic BLT",
    avgRevenue: 4367,
  },
  {
    id: "transport_hub",
    name: "Transport Hub",
    storeCount: 8,
    revenue: 38200,
    grossProfit: 17190,
    target: 36000,
    waste: 2140,
    topProduct: "Coffee & Pastry Combo",
    avgRevenue: 4775,
  },
  {
    id: "business_district",
    name: "Business District",
    storeCount: 15,
    revenue: 68500,
    grossProfit: 30825,
    target: 65000,
    waste: 3280,
    topProduct: "Mediterranean Salad",
    avgRevenue: 4567,
  },
  {
    id: "residential",
    name: "Residential",
    storeCount: 15,
    revenue: 45800,
    grossProfit: 20610,
    target: 48000,
    waste: 2450,
    topProduct: "Avocado Toast",
    avgRevenue: 3053,
  },
];

// Mock store performance data
const mockStorePerformance = [
  { id: "OS001", name: "Kings Cross Station", revenue: 41200, target: 40000, variance: 3.0, grossProfit: 16480, grossProfitMargin: 40.0, waste: 890, wastePercentage: 2.2, topProduct: "Almond Croissant" },
  { id: "OS002", name: "Liverpool Street Station", revenue: 38500, target: 37000, variance: 4.1, grossProfit: 15400, grossProfitMargin: 40.0, waste: 820, wastePercentage: 2.1, topProduct: "BLT Sandwich" },
  { id: "OS003", name: "St Pancras International", revenue: 42800, target: 41000, variance: 4.4, grossProfit: 17120, grossProfitMargin: 40.0, waste: 910, wastePercentage: 2.1, topProduct: "Pain au Chocolat" },
  { id: "OS004", name: "Canary Wharf Plaza", revenue: 35200, target: 34000, variance: 3.5, grossProfit: 14080, grossProfitMargin: 40.0, waste: 680, wastePercentage: 1.9, topProduct: "Caesar Wrap" },
  { id: "OS005", name: "Bond Street", revenue: 32600, target: 31000, variance: 5.2, grossProfit: 13040, grossProfitMargin: 40.0, waste: 720, wastePercentage: 2.2, topProduct: "Ham & Cheese Croissant" },
  { id: "OS006", name: "Bank Station", revenue: 36800, target: 35500, variance: 3.7, grossProfit: 14720, grossProfitMargin: 40.0, waste: 750, wastePercentage: 2.0, topProduct: "Salmon Bagel" },
];

// Mock product performance data
const mockProductPerformance = [
  { id: "OS101", name: "Almond Croissant", soldUnits: 2850, revenue: 11400, margin: 62.5, waste: 95, wastePercentage: 3.2, trend: "up" },
  { id: "OS102", name: "Pain au Chocolat", soldUnits: 2620, revenue: 10480, margin: 64.2, waste: 88, wastePercentage: 3.1, trend: "up" },
  { id: "OS103", name: "BLT Sandwich", soldUnits: 1940, revenue: 10670, margin: 58.2, waste: 72, wastePercentage: 3.6, trend: "up" },
  { id: "OS104", name: "Chicken Caesar Wrap", soldUnits: 1680, revenue: 10080, margin: 61.8, waste: 58, wastePercentage: 3.3, trend: "up" },
  { id: "OS105", name: "Mediterranean Salad Bowl", soldUnits: 1420, revenue: 9220, margin: 64.8, waste: 68, wastePercentage: 4.6, trend: "down" },
  { id: "OS106", name: "Salmon Cream Bagel", soldUnits: 1280, revenue: 9600, margin: 68.2, waste: 48, wastePercentage: 3.7, trend: "up" },
  { id: "OS107", name: "Ham & Cheese Croissant", soldUnits: 2180, revenue: 9810, margin: 55.8, waste: 86, wastePercentage: 3.8, trend: "up" },
  { id: "OS108", name: "Avocado Hummus Wrap", soldUnits: 1520, revenue: 9120, margin: 63.5, waste: 62, wastePercentage: 3.9, trend: "down" },
];

// Weekly trend data for Week Overview graph
const weeklyTrendData = [
  { day: "Mon", delivered: 8750, sold: 8100, wasted: 420 },
  { day: "Tue", delivered: 8950, sold: 8300, wasted: 385 },
  { day: "Wed", delivered: 9200, sold: 8650, wasted: 360 },
  { day: "Thu", delivered: 8880, sold: 8250, wasted: 410 },
  { day: "Fri", delivered: 9500, sold: 9100, wasted: 380 },
  { day: "Sat", delivered: 9800, sold: 9450, wasted: 340 },
  { day: "Sun", delivered: 9100, sold: 8520, wasted: 395 },
];

const weeklyTrendDataStore = [
  { day: "Mon", delivered: 320, sold: 298, wasted: 18 },
  { day: "Tue", delivered: 305, sold: 282, wasted: 16 },
  { day: "Wed", delivered: 335, sold: 315, wasted: 14 },
  { day: "Thu", delivered: 310, sold: 289, wasted: 15 },
  { day: "Fri", delivered: 360, sold: 345, wasted: 12 },
  { day: "Sat", delivered: 385, sold: 370, wasted: 13 },
  { day: "Sun", delivered: 340, sold: 318, wasted: 16 },
];

export default function Analytics() {
  const { viewMode, selectedStore: contextSelectedStore } = useView();
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [stores, setStores] = useState<Array<{ name: string; id: string }>>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [compareRange, setCompareRange] = useState<{ from: Date; to: Date } | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      const { data } = await supabase
        .from('stores')
        .select('id, name')
        .order('name');
      
      if (data) {
        setStores(data);
      }
    };
    
    loadStores();
  }, []);

  // Filter data based on view mode and selected store
  const filteredStorePerformance = viewMode === "store_manager" 
    ? mockStorePerformance.slice(0, 1)
    : selectedStore === "all" 
      ? mockStorePerformance 
      : mockStorePerformance.filter(s => s.name === selectedStore);

  const isSingleStoreView = viewMode === "store_manager" || (viewMode === "hq" && selectedStore !== "all");
  
  // Store-specific data
  const storeData = {
    revenue: 1286,
    grossProfit: 772,
    waste: 45,
    soldQty: 342,
    wastedQty: 18,
    deliveredQty: 360,
    revenueComparisonData: [
      { date: "Mon", predicted: 170, actual: 165, variance: -2.9 },
      { date: "Tue", predicted: 155, actual: 148, variance: -4.5 },
      { date: "Wed", predicted: 175, actual: 178, variance: 1.7 },
      { date: "Thu", predicted: 168, actual: 162, variance: -3.6 },
      { date: "Fri", predicted: 190, actual: 195, variance: 2.6 },
      { date: "Sat", predicted: 210, actual: 218, variance: 3.8 },
      { date: "Sun", predicted: 180, actual: 174, variance: -3.3 },
    ],
  };
  
  // HQ data
  const hqData = {
    revenue: 1840000,
    grossProfit: 736000,
    waste: 36800,
    soldQty: 8420,
    wastedQty: 395,
    deliveredQty: 8950,
    revenueComparisonData: [
      { date: "Mon", predicted: 260000, actual: 258000, variance: -0.8 },
      { date: "Tue", predicted: 248000, actual: 246000, variance: -0.8 },
      { date: "Wed", predicted: 270000, actual: 272000, variance: 0.7 },
      { date: "Thu", predicted: 256000, actual: 254000, variance: -0.8 },
      { date: "Fri", predicted: 285000, actual: 289000, variance: 1.4 },
      { date: "Sat", predicted: 310000, actual: 315000, variance: 1.6 },
      { date: "Sun", predicted: 265000, actual: 268000, variance: 1.1 },
    ],
  };
  
  const currentData = isSingleStoreView ? storeData : hqData;

  const getVarianceBadge = (variance: number) => {
    if (variance > 5) return <Badge className="bg-success text-success-foreground">+{variance.toFixed(1)}%</Badge>;
    if (variance < -5) return <Badge className="bg-destructive text-destructive-foreground">{variance.toFixed(1)}%</Badge>;
    return <Badge variant="outline">{variance > 0 ? '+' : ''}{variance.toFixed(1)}%</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  // Calculate average variance
  const avgVariance = currentData.revenueComparisonData.reduce((sum, d) => sum + d.variance, 0) / currentData.revenueComparisonData.length;
  
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analytics {viewMode === "store_manager" ? `- ${contextSelectedStore}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Key metrics and performance insights
          </p>
        </div>
      </div>

      {/* Big Orange Box with Metrics */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-primary via-primary to-primary/80 animate-fade-in">
        <CardContent className="p-6">
          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary-foreground drop-shadow-sm">
              {selectedStore === "all" ? "All Stores" : selectedStore} • This Week's Performance
            </h2>
          </div>

          {/* Period and Store Selectors */}
          {viewMode === "hq" ? (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Select store" />
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
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal bg-background">
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[300px] justify-start text-left font-normal bg-background">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {compareRange?.from ? (
                      compareRange.to ? (
                        <>
                          Compare: {format(compareRange.from, "MMM dd")} - {format(compareRange.to, "MMM dd")}
                        </>
                      ) : (
                        `Compare: ${format(compareRange.from, "MMM dd")}`
                      )
                    ) : (
                      <span>Compare to previous period</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={compareRange?.from}
                    selected={compareRange ? { from: compareRange.from, to: compareRange.to } : undefined}
                    onSelect={(range: any) => setCompareRange(range || null)}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal bg-background">
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[300px] justify-start text-left font-normal bg-background">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {compareRange?.from ? (
                      compareRange.to ? (
                        <>
                          Compare: {format(compareRange.from, "MMM dd")} - {format(compareRange.to, "MMM dd")}
                        </>
                      ) : (
                        `Compare: ${format(compareRange.from, "MMM dd")}`
                      )
                    ) : (
                      <span>Compare to previous period</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={compareRange?.from}
                    selected={compareRange ? { from: compareRange.from, to: compareRange.to } : undefined}
                    onSelect={(range: any) => setCompareRange(range || null)}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Three Main Metrics: Sold, Wasted, Delivered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Sold Qty */}
            <Card className="bg-background/95 shadow-xl border-2 border-success/20 hover:shadow-2xl transition-all duration-300 hover-scale">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <CardTitle className="text-lg font-semibold">Sold Qty</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
                    {currentData.soldQty.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-sm text-muted-foreground">94.2% of total</div>
                    <Badge className="text-xs bg-success/10 text-success border-success/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5.3% vs last week
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">Full Price</div>
                      <div className="text-xl font-semibold">{Math.round(currentData.soldQty * 0.818).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">81.8%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">Reduced Price</div>
                      <div className="text-xl font-semibold">{Math.round(currentData.soldQty * 0.182).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">18.2%</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Wasted Qty */}
            <Card className="bg-background/95 shadow-xl border-2 border-destructive/20 hover:shadow-2xl transition-all duration-300 hover-scale">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg font-semibold">Wasted Qty</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
                    {currentData.wastedQty}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-sm text-muted-foreground">4.4% of total</div>
                    <Badge className="text-xs bg-success/10 text-success border-success/30">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -2.1% vs last week
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">Product Waste</div>
                      <div className="text-xl font-semibold">{currentData.wastedQty}</div>
                      <div className="text-xs text-muted-foreground">100%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">Value</div>
                      <div className="text-xl font-semibold">£{currentData.waste.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{((currentData.waste / currentData.revenue) * 100).toFixed(1)}%</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Delivered Qty */}
            <Card className="bg-background/95 shadow-xl border-2 border-primary/20 hover:shadow-2xl transition-all duration-300 hover-scale">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-semibold">Delivered Qty</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {currentData.deliveredQty.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-sm text-muted-foreground">Target delivery</div>
                    <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +1.2% vs target
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">Expected</div>
                      <div className="text-xl font-semibold">{Math.round(currentData.deliveredQty * 1.016).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">100%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">Received</div>
                      <div className="text-xl font-semibold">{currentData.deliveredQty.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">98.4%</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Week Overview Graph */}
      <Card className="shadow-lg border-2 border-primary/20 animate-fade-in">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  📊
                </div>
                Week Overview
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Track delivered, sold, and wasted quantities across the week
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="deliveredGradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--brand-peach))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--brand-peach))" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--foreground))"
                fontSize={13}
                fontWeight={500}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                fontSize={13}
                fontWeight={500}
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "2px solid hsl(var(--border))",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{
                  color: "hsl(var(--foreground))",
                  fontWeight: "bold",
                  marginBottom: "8px"
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString() + " units",
                  name
                ]}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: "20px"
                }}
                iconType="circle"
              />
              <Bar 
                dataKey="delivered" 
                fill="url(#deliveredGradientAnalytics)" 
                name="Delivered"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              <Line 
                type="monotone" 
                dataKey="sold" 
                stroke="hsl(var(--success-green))" 
                strokeWidth={4}
                name="Sold"
                dot={{ 
                  fill: "hsl(var(--success-green))", 
                  r: 6,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))"
                }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="wasted" 
                stroke="hsl(var(--warning-orange))" 
                strokeWidth={4}
                name="Wasted"
                dot={{ 
                  fill: "hsl(var(--warning-orange))", 
                  r: 6,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))"
                }}
                activeDot={{ r: 8 }}
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
          
          {/* Summary Statistics */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border hover-scale" style={{ backgroundColor: 'hsl(var(--brand-peach) / 0.1)', borderColor: 'hsl(var(--brand-peach) / 0.3)' }}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--brand-peach) / 0.2)' }}>
                  <Package className="h-6 w-6" style={{ color: 'hsl(var(--brand-peach))' }} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Total Delivered</div>
                  <div className="text-2xl font-bold text-foreground">
                    {(viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((sum, d) => sum + d.delivered, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">units this week</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover-scale">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: 'hsl(var(--success-green) / 0.2)' }}>
                  <div className="h-full w-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" style={{ color: 'hsl(var(--success-green))' }} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Total Sold</div>
                  <div className="text-2xl font-bold" style={{ color: 'hsl(var(--success-green))' }}>
                    {(viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((sum, d) => sum + d.sold, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(((viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((sum, d) => sum + d.sold, 0) / 
                      (viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 hover-scale">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: 'hsl(var(--warning-orange) / 0.2)' }}>
                  <div className="h-full w-full flex items-center justify-center">
                    <Trash2 className="h-6 w-6" style={{ color: 'hsl(var(--warning-orange))' }} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Total Wasted</div>
                  <div className="text-2xl font-bold" style={{ color: 'hsl(var(--warning-orange))' }}>
                    {(viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((sum, d) => sum + d.wasted, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(((viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((sum, d) => sum + d.wasted, 0) / 
                      (viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Day Badge */}
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm text-foreground">
              <strong>Best performing day:</strong> {
                (viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((prev, current) => 
                  current.sold > prev.sold ? current : prev
                ).day
              } with {
                (viewMode === "hq" ? weeklyTrendData : weeklyTrendDataStore).reduce((prev, current) => 
                  current.sold > prev.sold ? current : prev
                ).sold.toLocaleString()
              } units sold
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Predicted vs Actual Sales Chart */}
      <Card className="shadow-xl border-2 border-border/50 animate-fade-in hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent" />
            Predicted vs Actual Sales
          </CardTitle>
          <CardDescription className="text-base">
            AI revenue predictions compared to actual performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={currentData.revenueComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [`£${value.toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar 
                dataKey="predicted" 
                fill="hsl(var(--primary))" 
                name="Predicted Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3}
                name="Actual Revenue"
                dot={{ fill: "hsl(var(--accent))", r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average Variance</div>
                  <div className="text-xl font-bold" style={{ color: avgVariance >= 0 ? 'hsl(var(--success-green))' : 'hsl(var(--destructive))' }}>
                    {avgVariance >= 0 ? '+' : ''}{avgVariance.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Best Day</div>
                  <div className="text-xl font-bold text-foreground">
                    {currentData.revenueComparisonData.reduce((prev, curr) => 
                      curr.variance > prev.variance ? curr : prev
                    ).date} (+{currentData.revenueComparisonData.reduce((prev, curr) => 
                      curr.variance > prev.variance ? curr : prev
                    ).variance.toFixed(1)}%)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Worst Day</div>
                  <div className="text-xl font-bold text-foreground">
                    {currentData.revenueComparisonData.reduce((prev, curr) => 
                      curr.variance < prev.variance ? curr : prev
                    ).date} ({currentData.revenueComparisonData.reduce((prev, curr) => 
                      curr.variance < prev.variance ? curr : prev
                    ).variance.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics Section */}
      <div className="space-y-6 mt-12 pt-12 border-t border-border/50">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Performance Analytics
          </h2>
          <p className="text-muted-foreground text-lg mt-1">
            Track store and product performance
            {viewMode === "hq" && selectedStore !== "all" && ` - ${selectedStore}`}
          </p>
        </div>

        {/* Performance Tabs */}
        <Tabs defaultValue="store" className="space-y-6 animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger value="store" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Store Performance
            </TabsTrigger>
            <TabsTrigger value="product" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Product Performance
            </TabsTrigger>
            <TabsTrigger value="cluster" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Cluster Performance
            </TabsTrigger>
          </TabsList>

          {/* Store Performance Tab */}
          <TabsContent value="store" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale border-2 border-success/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4 text-success" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
                    £{filteredStorePerformance.reduce((acc, s) => acc + s.revenue, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    {viewMode === "store_manager" ? "+5.2%" : "+8.1%"} from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale border-2 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Gross Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    £{filteredStorePerformance.reduce((acc, s) => acc + s.grossProfit, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((filteredStorePerformance.reduce((acc, s) => acc + s.grossProfit, 0) / 
                      filteredStorePerformance.reduce((acc, s) => acc + s.revenue, 0)) * 100).toFixed(1)}% margin
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale border-2 border-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Avg Variance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                    +{(filteredStorePerformance.reduce((acc, s) => acc + s.variance, 0) / filteredStorePerformance.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Above target
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 hover-scale border-2 border-destructive/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Total Waste
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
                    £{filteredStorePerformance.reduce((acc, s) => acc + s.waste, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((filteredStorePerformance.reduce((acc, s) => acc + s.waste, 0) / 
                      filteredStorePerformance.reduce((acc, s) => acc + s.revenue, 0)) * 100).toFixed(1)}% of revenue
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Stores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {filteredStorePerformance.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Locations tracked
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Store Performance Table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Store Performance Breakdown</CardTitle>
                <CardDescription>
                  Detailed metrics for each store location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Gross Profit</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Waste</TableHead>
                      <TableHead>Waste %</TableHead>
                      <TableHead>Top Product</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStorePerformance.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{store.name}</div>
                            <div className="text-sm text-muted-foreground">{store.id}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-success">
                          £{store.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-mono font-semibold text-primary">
                              £{store.grossProfit.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {store.grossProfitMargin}% margin
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          £{store.target.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getVarianceBadge(store.variance)}
                        </TableCell>
                        <TableCell className="font-mono text-destructive">
                          £{store.waste.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {store.wastePercentage > 3 && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                            <span className={store.wastePercentage > 3 ? "text-warning font-medium" : ""}>
                              {store.wastePercentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{store.topProduct}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Performance Tab */}
          <TabsContent value="product" className="space-y-4">
            {/* Product Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Units Sold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {mockProductPerformance.reduce((acc, p) => acc + p.soldUnits, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {mockProductPerformance.length} products
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Product Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    £{mockProductPerformance.reduce((acc, p) => acc + p.revenue, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-success" />
                    +12.4% from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {(mockProductPerformance.reduce((acc, p) => acc + p.margin, 0) / mockProductPerformance.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Top: {Math.max(...mockProductPerformance.map(p => p.margin)).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Product Waste
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {mockProductPerformance.reduce((acc, p) => acc + p.waste, 0)} units
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((mockProductPerformance.reduce((acc, p) => acc + p.waste, 0) / 
                      mockProductPerformance.reduce((acc, p) => acc + p.soldUnits, 0)) * 100).toFixed(1)}% waste rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Product Performance Table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Product Performance Breakdown</CardTitle>
                <CardDescription>
                  Detailed metrics for each product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Margin %</TableHead>
                      <TableHead>Waste</TableHead>
                      <TableHead>Waste %</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProductPerformance.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.id}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {product.soldUnits.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-success">
                          £{product.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {product.margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-destructive">
                          {product.waste}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.wastePercentage > 5 && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                            <span className={product.wastePercentage > 5 ? "text-warning font-medium" : ""}>
                              {product.wastePercentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(product.trend)}
                            <span className="text-sm font-medium">
                              {product.trend === 'up' ? 'Growing' : 'Declining'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cluster Performance Tab */}
          <TabsContent value="cluster" className="space-y-4">
            {/* Cluster Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Clusters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {clusterPerformanceData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {clusterPerformanceData.reduce((acc, c) => acc + c.storeCount, 0)} stores total
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    £{clusterPerformanceData.reduce((acc, c) => acc + c.revenue, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-success" />
                    +7.3% from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Gross Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    £{clusterPerformanceData.reduce((acc, c) => acc + c.grossProfit, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((clusterPerformanceData.reduce((acc, c) => acc + c.grossProfit, 0) / 
                      clusterPerformanceData.reduce((acc, c) => acc + c.revenue, 0)) * 100).toFixed(1)}% margin
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Waste
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    £{clusterPerformanceData.reduce((acc, c) => acc + c.waste, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((clusterPerformanceData.reduce((acc, c) => acc + c.waste, 0) / 
                      clusterPerformanceData.reduce((acc, c) => acc + c.revenue, 0)) * 100).toFixed(1)}% of revenue
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top Cluster
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-warning" />
                    <div className="text-lg font-bold text-foreground">
                      {clusterPerformanceData.reduce((prev, current) => 
                        prev.revenue > current.revenue ? prev : current
                      ).name}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    £{clusterPerformanceData.reduce((prev, current) => 
                      prev.revenue > current.revenue ? prev : current
                    ).revenue.toLocaleString()} revenue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cluster Performance Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Cluster Revenue Comparison</CardTitle>
                <CardDescription>Revenue performance across different clusters</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clusterPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `£${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (£)" />
                    <Bar dataKey="target" fill="hsl(var(--accent))" name="Target (£)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cluster Performance Table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Cluster Performance Breakdown</CardTitle>
                <CardDescription>
                  Detailed metrics for each cluster
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Stores</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg/Store</TableHead>
                      <TableHead>Gross Profit</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Waste</TableHead>
                      <TableHead>Top Product</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clusterPerformanceData.map((cluster) => {
                      const variance = cluster.revenue - cluster.target;
                      const variancePercent = ((variance / cluster.target) * 100);
                      const wastePercent = ((cluster.waste / cluster.revenue) * 100);
                      
                      return (
                        <TableRow key={cluster.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{cluster.name}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {cluster.id.replace('_', ' ')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            {cluster.storeCount}
                          </TableCell>
                          <TableCell className="font-mono text-success">
                            £{cluster.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono">
                            £{cluster.avgRevenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-primary">
                            £{cluster.grossProfit.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            £{cluster.target.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {variance > 0 ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                              <span className={variance > 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                                {variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {wastePercent > 5 && (
                                <AlertTriangle className="h-4 w-4 text-warning" />
                              )}
                              <div>
                                <div className="font-mono text-destructive">
                                  £{cluster.waste.toLocaleString()}
                                </div>
                                <div className={cn(
                                  "text-xs",
                                  wastePercent > 5 ? "text-warning font-medium" : "text-muted-foreground"
                                )}>
                                  {wastePercent.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {cluster.topProduct}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
