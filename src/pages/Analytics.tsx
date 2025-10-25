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
    revenue: 524000,
    grossProfit: 471600,
    target: 500000,
    waste: 157200,
    topProduct: "Original Glazed",
    avgRevenue: 43667,
  },
  {
    id: "transport_hub",
    name: "Transport Hub",
    storeCount: 8,
    revenue: 382000,
    grossProfit: 343800,
    target: 360000,
    waste: 114600,
    topProduct: "Chocolate Iced Glazed",
    avgRevenue: 47750,
  },
  {
    id: "business_district",
    name: "Business District",
    storeCount: 15,
    revenue: 685000,
    grossProfit: 616500,
    target: 650000,
    waste: 205500,
    topProduct: "Boston Kreme",
    avgRevenue: 45667,
  },
  {
    id: "residential",
    name: "Residential",
    storeCount: 15,
    revenue: 458000,
    grossProfit: 412200,
    target: 480000,
    waste: 137400,
    topProduct: "Cookies and Kreme",
    avgRevenue: 30533,
  },
];

// Mock store performance data
const mockStorePerformance = [
  { id: "OS001", name: "Kings Cross Station", revenue: 412000, target: 400000, variance: 3.0, grossProfit: 370800, grossProfitMargin: 90.0, waste: 123600, wastePercentage: 30.0, topProduct: "Original Glazed" },
  { id: "OS002", name: "Liverpool Street Station", revenue: 385000, target: 370000, variance: 4.1, grossProfit: 346500, grossProfitMargin: 90.0, waste: 115500, wastePercentage: 30.0, topProduct: "Chocolate Iced Glazed" },
  { id: "OS003", name: "St Pancras International", revenue: 428000, target: 410000, variance: 4.4, grossProfit: 385200, grossProfitMargin: 90.0, waste: 128400, wastePercentage: 30.0, topProduct: "Strawberry Iced with Sprinkles" },
  { id: "OS004", name: "Canary Wharf Plaza", revenue: 352000, target: 340000, variance: 3.5, grossProfit: 316800, grossProfitMargin: 90.0, waste: 105600, wastePercentage: 30.0, topProduct: "Boston Kreme" },
  { id: "OS005", name: "Bond Street", revenue: 326000, target: 310000, variance: 5.2, grossProfit: 293400, grossProfitMargin: 90.0, waste: 97800, wastePercentage: 30.0, topProduct: "Raspberry Filled" },
  { id: "OS006", name: "Bank Station", revenue: 368000, target: 355000, variance: 3.7, grossProfit: 331200, grossProfitMargin: 90.0, waste: 110400, wastePercentage: 30.0, topProduct: "Cookies and Kreme" },
];

// Mock product performance data
const mockProductPerformance = [
  { id: "KK-G001", name: "Original Glazed", soldUnits: 28500, revenue: 42465, margin: 89.5, waste: 12200, wastePercentage: 30.0, trend: "up" },
  { id: "KK-G002", name: "Chocolate Iced Glazed", soldUnits: 26200, revenue: 44278, margin: 91.2, waste: 11200, wastePercentage: 30.0, trend: "up" },
  { id: "KK-I001", name: "Strawberry Iced with Sprinkles", soldUnits: 19400, revenue: 34726, margin: 88.2, waste: 8300, wastePercentage: 30.0, trend: "up" },
  { id: "KK-I002", name: "Chocolate Iced with Sprinkles", soldUnits: 16800, revenue: 30072, margin: 90.8, waste: 7200, wastePercentage: 30.0, trend: "up" },
  { id: "KK-F003", name: "Boston Kreme", soldUnits: 14200, revenue: 28258, margin: 91.8, waste: 6100, wastePercentage: 30.0, trend: "down" },
  { id: "KK-S001", name: "Cookies and Kreme", soldUnits: 12800, revenue: 25472, margin: 92.2, waste: 5500, wastePercentage: 30.0, trend: "up" },
  { id: "KK-F001", name: "Raspberry Filled", soldUnits: 21800, revenue: 41202, margin: 88.8, waste: 9400, wastePercentage: 30.0, trend: "up" },
  { id: "KK-C001", name: "Powdered Sugar", soldUnits: 15200, revenue: 24168, margin: 90.5, waste: 6500, wastePercentage: 30.0, trend: "down" },
];

// Weekly trend data for Week Overview graph
const weeklyTrendData = [
  { day: "Mon", delivered: 87500, sold: 61250, wasted: 26250 },
  { day: "Tue", delivered: 89500, sold: 62650, wasted: 26850 },
  { day: "Wed", delivered: 92000, sold: 64400, wasted: 27600 },
  { day: "Thu", delivered: 88800, sold: 62160, wasted: 26640 },
  { day: "Fri", delivered: 95000, sold: 66500, wasted: 28500 },
  { day: "Sat", delivered: 98000, sold: 68600, wasted: 29400 },
  { day: "Sun", delivered: 91000, sold: 63700, wasted: 27300 },
];

const weeklyTrendDataStore = [
  { day: "Mon", delivered: 3200, sold: 2240, wasted: 960 },
  { day: "Tue", delivered: 3050, sold: 2135, wasted: 915 },
  { day: "Wed", delivered: 3350, sold: 2345, wasted: 1005 },
  { day: "Thu", delivered: 3100, sold: 2170, wasted: 930 },
  { day: "Fri", delivered: 3600, sold: 2520, wasted: 1080 },
  { day: "Sat", delivered: 3850, sold: 2695, wasted: 1155 },
  { day: "Sun", delivered: 3400, sold: 2380, wasted: 1020 },
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
  
  // Compute weekly trend data based on selected store
  const currentWeeklyTrendData = isSingleStoreView ? weeklyTrendDataStore : weeklyTrendData;
  
  // Store-specific data
  const storeData = {
    revenue: 12860,
    grossProfit: 11574,
    waste: 3858,
    soldQty: 3420,
    wastedQty: 1470,
    deliveredQty: 4890,
    revenueComparisonData: [
      { date: "Mon", predicted: 1700, actual: 1650, variance: -2.9 },
      { date: "Tue", predicted: 1550, actual: 1480, variance: -4.5 },
      { date: "Wed", predicted: 1750, actual: 1780, variance: 1.7 },
      { date: "Thu", predicted: 1680, actual: 1620, variance: -3.6 },
      { date: "Fri", predicted: 1900, actual: 1950, variance: 2.6 },
      { date: "Sat", predicted: 2100, actual: 2180, variance: 3.8 },
      { date: "Sun", predicted: 1800, actual: 1740, variance: -3.3 },
    ],
  };
  
  // HQ data
  const hqData = {
    revenue: 2100000,
    grossProfit: 1890000,
    waste: 630000,
    soldQty: 426300,
    wastedQty: 182700,
    deliveredQty: 609000,
    revenueComparisonData: [
      { date: "Mon", predicted: 290000, actual: 288000, variance: -0.8 },
      { date: "Tue", predicted: 285000, actual: 283000, variance: -0.8 },
      { date: "Wed", predicted: 295000, actual: 297000, variance: 0.7 },
      { date: "Thu", predicted: 288000, actual: 286000, variance: -0.8 },
      { date: "Fri", predicted: 310000, actual: 314000, variance: 1.4 },
      { date: "Sat", predicted: 330000, actual: 335000, variance: 1.6 },
      { date: "Sun", predicted: 295000, actual: 298000, variance: 1.1 },
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
  
  // Calculate comparison metrics based on compareRange
  const getComparisonValue = (metric: 'sold' | 'wasted' | 'delivered' | 'revenue') => {
    if (!compareRange?.from || !compareRange?.to) return null;
    
    // Simulate comparison - in real scenario, this would fetch data for compareRange
    // For demo purposes, we'll generate realistic comparison values
    const baseValues = {
      sold: Math.random() * 10 - 2, // -2% to +8%
      wasted: Math.random() * -5, // 0% to -5% (negative is good for waste)
      delivered: Math.random() * 4 - 1, // -1% to +3%
      revenue: Math.random() * 12 - 2 // -2% to +10%
    };
    
    return baseValues[metric];
  };
  
  const soldComparison = getComparisonValue('sold');
  const wastedComparison = getComparisonValue('wasted');
  const deliveredComparison = getComparisonValue('delivered');
  const revenueComparison = getComparisonValue('revenue');
  
  const getComparisonBadge = (value: number | null, metric: 'sold' | 'wasted' | 'delivered' | 'revenue') => {
    if (value === null) return null;
    
    const isPositive = value > 0;
    const isWaste = metric === 'wasted';
    const isGood = isWaste ? value < 0 : value > 0;
    
    const badgeClass = isGood 
      ? "text-xs bg-success/10 text-success border-success/30"
      : "text-xs bg-destructive/10 text-destructive border-destructive/30";
    
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    const periodText = compareRange?.from && compareRange?.to 
      ? `vs ${format(compareRange.from, "MMM dd")}-${format(compareRange.to, "dd")}`
      : "vs comparison";
    
    return (
      <Badge className={badgeClass}>
        <Icon className="h-3 w-3 mr-1" />
        {isPositive ? '+' : ''}{value.toFixed(1)}% {periodText}
      </Badge>
    );
  };
  
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
              {selectedStore === "all" ? "All Stores" : selectedStore}
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
                    <div className="text-sm text-muted-foreground">70.0% of total</div>
                    {getComparisonBadge(soldComparison, 'sold')}
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
                    {currentData.wastedQty.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-sm text-muted-foreground">30.0% of total</div>
                    {getComparisonBadge(wastedComparison, 'wasted')}
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
                    {getComparisonBadge(deliveredComparison, 'delivered')}
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
            <ComposedChart data={currentWeeklyTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                    {currentWeeklyTrendData.reduce((sum, d) => sum + d.delivered, 0).toLocaleString()}
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
                    {currentWeeklyTrendData.reduce((sum, d) => sum + d.sold, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((currentWeeklyTrendData.reduce((sum, d) => sum + d.sold, 0) / 
                      currentWeeklyTrendData.reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
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
                    {currentWeeklyTrendData.reduce((sum, d) => sum + d.wasted, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((currentWeeklyTrendData.reduce((sum, d) => sum + d.wasted, 0) / 
                      currentWeeklyTrendData.reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
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
                currentWeeklyTrendData.reduce((prev, current) => 
                  current.sold > prev.sold ? current : prev
                ).day
              } with {
                currentWeeklyTrendData.reduce((prev, current) => 
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {revenueComparison !== null ? (
                      <>
                        {revenueComparison > 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                        {revenueComparison > 0 ? '+' : ''}{revenueComparison.toFixed(1)}% vs {format(compareRange?.from || new Date(), "MMM dd")}-{format(compareRange?.to || new Date(), "dd")}
                      </>
                    ) : (
                      "Select comparison period"
                    )}
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
