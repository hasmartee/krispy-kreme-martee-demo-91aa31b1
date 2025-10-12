import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle, Sparkles, BrainCircuit, Users, CalendarIcon, Award, AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock data for charts
const salesWasteData = [
  { date: "Mon", sales: 4200, waste: 180 },
  { date: "Tue", sales: 3800, waste: 160 },
  { date: "Wed", sales: 4500, waste: 140 },
  { date: "Thu", sales: 4100, waste: 190 },
  { date: "Fri", sales: 5200, waste: 210 },
  { date: "Sat", sales: 5800, waste: 220 },
  { date: "Sun", sales: 4600, waste: 170 },
];

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

const volumeComparisonData = [
  { product: "BLT Sand", recommended: 45, actual: 42, missed: 3 },
  { product: "Caesar Wrap", recommended: 38, actual: 40, waste: 2 },
  { product: "Avo Wrap", recommended: 32, actual: 28, missed: 4 },
  { product: "Tuna Panini", recommended: 28, actual: 30, waste: 2 },
  { product: "Med Salad", recommended: 35, actual: 35, optimal: 0 },
  { product: "Salmon Bagel", recommended: 25, actual: 22, missed: 3 },
];

// Revenue forecast data (next 7 days)
const revenueForecastStore = [
  { day: "Mon", forecast: 172, confidence: 95, lower: 164, upper: 180 },
  { day: "Tue", forecast: 158, confidence: 94, lower: 150, upper: 166 },
  { day: "Wed", forecast: 185, confidence: 96, lower: 177, upper: 193 },
  { day: "Thu", forecast: 168, confidence: 93, lower: 159, upper: 177 },
  { day: "Fri", forecast: 198, confidence: 97, lower: 191, upper: 205 },
  { day: "Sat", forecast: 225, confidence: 96, lower: 216, upper: 234 },
  { day: "Sun", forecast: 180, confidence: 95, lower: 171, upper: 189 },
];

const revenueForecastHQ = [
  { day: "Mon", forecast: 4350, confidence: 95, lower: 4140, upper: 4560 },
  { day: "Tue", forecast: 4050, confidence: 94, lower: 3850, upper: 4250 },
  { day: "Wed", forecast: 4680, confidence: 96, lower: 4470, upper: 4890 },
  { day: "Thu", forecast: 4280, confidence: 93, lower: 4050, upper: 4510 },
  { day: "Fri", forecast: 5100, confidence: 97, lower: 4900, upper: 5300 },
  { day: "Sat", forecast: 5950, confidence: 96, lower: 5700, upper: 6200 },
  { day: "Sun", forecast: 4750, confidence: 95, lower: 4510, upper: 4990 },
];

// Volume forecast data (top products for next week)
const volumeForecastStore = [
  { day: "Mon", blt: 18, caesar: 15, avocado: 13, tuna: 12, salad: 14 },
  { day: "Tue", blt: 16, caesar: 14, avocado: 12, tuna: 11, salad: 13 },
  { day: "Wed", blt: 19, caesar: 16, avocado: 14, tuna: 13, salad: 15 },
  { day: "Thu", blt: 17, caesar: 15, avocado: 12, tuna: 12, salad: 14 },
  { day: "Fri", blt: 21, caesar: 18, avocado: 15, tuna: 14, salad: 16 },
  { day: "Sat", blt: 24, caesar: 20, avocado: 17, tuna: 16, salad: 18 },
  { day: "Sun", blt: 19, caesar: 16, avocado: 14, tuna: 13, salad: 15 },
];

const volumeForecastHQ = [
  { day: "Mon", blt: 46, caesar: 39, avocado: 33, tuna: 29, salad: 36 },
  { day: "Tue", blt: 42, caesar: 36, avocado: 30, tuna: 27, salad: 33 },
  { day: "Wed", blt: 48, caesar: 41, avocado: 35, tuna: 31, salad: 38 },
  { day: "Thu", blt: 44, caesar: 38, avocado: 32, tuna: 29, salad: 35 },
  { day: "Fri", blt: 52, caesar: 45, avocado: 38, tuna: 34, salad: 41 },
  { day: "Sat", blt: 58, caesar: 50, avocado: 42, tuna: 38, salad: 46 },
  { day: "Sun", blt: 47, caesar: 41, avocado: 34, tuna: 31, salad: 37 },
];

// Footfall forecast data (next 7 days)
const footfallForecastStore = [
  { day: "Mon", footfall: 285, morning: 95, afternoon: 120, evening: 70 },
  { day: "Tue", footfall: 265, morning: 88, afternoon: 112, evening: 65 },
  { day: "Wed", footfall: 310, morning: 105, afternoon: 130, evening: 75 },
  { day: "Thu", footfall: 278, morning: 92, afternoon: 118, evening: 68 },
  { day: "Fri", footfall: 340, morning: 110, afternoon: 145, evening: 85 },
  { day: "Sat", footfall: 425, morning: 140, afternoon: 180, evening: 105 },
  { day: "Sun", footfall: 305, morning: 100, afternoon: 128, evening: 77 },
];

const footfallForecastHQ = [
  { day: "Mon", footfall: 1425, morning: 475, afternoon: 600, evening: 350 },
  { day: "Tue", footfall: 1325, morning: 440, afternoon: 560, evening: 325 },
  { day: "Wed", footfall: 1550, morning: 525, afternoon: 650, evening: 375 },
  { day: "Thu", footfall: 1390, morning: 460, afternoon: 590, evening: 340 },
  { day: "Fri", footfall: 1700, morning: 550, afternoon: 725, evening: 425 },
  { day: "Sat", footfall: 2125, morning: 700, afternoon: 900, evening: 525 },
  { day: "Sun", footfall: 1525, morning: 500, afternoon: 640, evening: 385 },
];

// Mock store performance data (from Performance page)
const mockStorePerformance = [
  { id: "ST001", name: "London Bridge", revenue: 28500, target: 26000, variance: 9.6, grossProfit: 11400, grossProfitMargin: 40.0, waste: 520, wastePercentage: 1.8, topProduct: "BLT Sandwich" },
  { id: "ST002", name: "Canary Wharf", revenue: 32100, target: 31000, variance: 3.5, grossProfit: 13482, grossProfitMargin: 42.0, waste: 680, wastePercentage: 2.1, topProduct: "Caesar Wrap" },
  { id: "ST003", name: "King's Cross", revenue: 41200, target: 40000, variance: 3.0, grossProfit: 16480, grossProfitMargin: 40.0, waste: 890, wastePercentage: 2.2, topProduct: "Salmon Bagel" },
  { id: "ST004", name: "Oxford Circus", revenue: 24800, target: 28000, variance: -11.4, grossProfit: 9672, grossProfitMargin: 39.0, waste: 950, wastePercentage: 3.8, topProduct: "Med Salad" },
  { id: "ST005", name: "Covent Garden", revenue: 29600, target: 28000, variance: 5.7, grossProfit: 12136, grossProfitMargin: 41.0, waste: 610, wastePercentage: 2.1, topProduct: "Chicken Wrap" },
  { id: "ST006", name: "Victoria Station", revenue: 38200, target: 36000, variance: 6.1, grossProfit: 15698, grossProfitMargin: 41.1, waste: 720, wastePercentage: 1.9, topProduct: "Tuna Panini" },
];

// Mock product performance data (from Performance page)
const mockProductPerformance = [
  { id: "SK001", name: "Classic BLT Sandwich", soldUnits: 1240, revenue: 6820, margin: 58.2, waste: 45, wastePercentage: 3.5, trend: "up" },
  { id: "SK002", name: "Chicken Caesar Wrap", soldUnits: 980, revenue: 5880, margin: 62.1, waste: 32, wastePercentage: 3.2, trend: "up" },
  { id: "SK003", name: "Avocado & Hummus Wrap", soldUnits: 760, revenue: 4560, margin: 61.8, waste: 28, wastePercentage: 3.6, trend: "down" },
  { id: "SK004", name: "Tuna Melt Panini", soldUnits: 890, revenue: 5340, margin: 59.5, waste: 38, wastePercentage: 4.1, trend: "up" },
  { id: "SK005", name: "Mediterranean Salad Bowl", soldUnits: 720, revenue: 4680, margin: 64.2, waste: 42, wastePercentage: 5.5, trend: "down" },
  { id: "SK006", name: "Smoked Salmon Bagel", soldUnits: 650, revenue: 4875, margin: 68.5, waste: 25, wastePercentage: 3.7, trend: "up" },
  { id: "SK007", name: "Ham & Cheese Croissant", soldUnits: 1120, revenue: 5040, margin: 55.3, waste: 52, wastePercentage: 4.4, trend: "up" },
  { id: "SK008", name: "Vegan Buddha Bowl", soldUnits: 580, revenue: 4060, margin: 66.8, waste: 35, wastePercentage: 5.7, trend: "down" },
];

// Mock daily trend data
const mockDailyTrend = [
  { date: "Mon", revenue: 28500, target: 26000 },
  { date: "Tue", revenue: 26800, target: 26000 },
  { date: "Wed", revenue: 29200, target: 26000 },
  { date: "Thu", revenue: 27600, target: 26000 },
  { date: "Fri", revenue: 31400, target: 26000 },
  { date: "Sat", revenue: 33800, target: 26000 },
  { date: "Sun", revenue: 30200, target: 26000 },
];

// Meal period revenue breakdown (Store view)
const mealPeriodRevenueStore = [
  { name: "Breakfast", value: 580, percentage: 31.4 },
  { name: "Lunch", value: 890, percentage: 48.1 },
  { name: "Afternoon", value: 380, percentage: 20.5 },
];

// Meal period revenue breakdown (HQ view)
const mealPeriodRevenueHQ = [
  { name: "Breakfast", value: 14200, percentage: 31.4 },
  { name: "Lunch", value: 21750, percentage: 48.1 },
  { name: "Afternoon", value: 9281, percentage: 20.5 },
];

// Product category revenue by day (Store view)
const categoryRevenueStore = [
  { day: "Mon", sandwiches: 68, wraps: 52, salads: 28, breakfast: 17 },
  { day: "Tue", sandwiches: 61, wraps: 48, salads: 24, breakfast: 15 },
  { day: "Wed", sandwiches: 72, wraps: 55, salads: 32, breakfast: 19 },
  { day: "Thu", sandwiches: 65, wraps: 51, salads: 29, breakfast: 17 },
  { day: "Fri", sandwiches: 78, wraps: 62, salads: 35, breakfast: 20 },
  { day: "Sat", sandwiches: 88, wraps: 68, salads: 40, breakfast: 22 },
  { day: "Sun", sandwiches: 70, wraps: 54, salads: 31, breakfast: 19 },
];

// Product category revenue by day (HQ view)
const categoryRevenueHQ = [
  { day: "Mon", sandwiches: 1680, wraps: 1280, salads: 690, breakfast: 420 },
  { day: "Tue", sandwiches: 1510, wraps: 1180, salads: 590, breakfast: 370 },
  { day: "Wed", sandwiches: 1800, wraps: 1360, salads: 790, breakfast: 470 },
  { day: "Thu", sandwiches: 1620, wraps: 1260, salads: 720, breakfast: 420 },
  { day: "Fri", sandwiches: 1940, wraps: 1530, salads: 860, breakfast: 490 },
  { day: "Sat", sandwiches: 2180, wraps: 1680, salads: 990, breakfast: 550 },
  { day: "Sun", sandwiches: 1740, wraps: 1330, salads: 760, breakfast: 470 },
];

const CHART_COLORS = {
  breakfast: "hsl(18 85% 78%)", // primary/peach
  lunch: "hsl(88 32% 62%)", // accent/green
  afternoon: "hsl(23 100% 65%)", // warning/orange
  sandwiches: "hsl(18 85% 78%)",
  wraps: "hsl(88 32% 62%)",
  salads: "hsl(140 24% 24%)",
  breakfastItems: "hsl(23 100% 65%)",
};

// Brand to store mapping - expanded with more stores
const brandStoreMap = {
  "All Brands": [
    "London Bridge", "Kings Cross", "Victoria Station", "Oxford Street", "Canary Wharf", 
    "Liverpool Street", "Paddington", "Waterloo", "Bond Street", "Leicester Square", 
    "Covent Garden", "Bank", "Monument", "Tower Hill", "Holborn", "Shoreditch",
    "Camden", "Brixton", "Clapham", "Wimbledon", "Richmond", "Greenwich",
    "Hampstead", "Notting Hill", "Chelsea"
  ],
  "Pret a Manger": [
    "London Bridge", "Kings Cross", "Victoria Station", "Liverpool Street", 
    "Paddington", "Waterloo", "Bank", "Monument", "Shoreditch", "Camden",
    "Clapham", "Wimbledon", "Greenwich"
  ],
  "Brioche Dorée": [
    "Oxford Street", "Canary Wharf", "Bond Street", "Leicester Square", 
    "Covent Garden", "Notting Hill", "Chelsea", "Hampstead"
  ],
  "Starbucks": [
    "London Bridge", "Oxford Street", "Tower Hill", "Holborn", "Canary Wharf",
    "Richmond", "Brixton", "Camden"
  ]
};

export default function Analytics() {
  const { viewMode, selectedStore: contextSelectedStore } = useView();
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [stores, setStores] = useState<Array<{ name: string; id: string }>>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Available stores based on selected brand
  const availableStores = selectedBrand === "All Brands" 
    ? stores
    : stores.filter(s => brandStoreMap[selectedBrand as keyof typeof brandStoreMap]?.includes(s.name));

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

  const fetchAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const ingredientData = [
        { name: "Chicken Breast", category: "Protein", expected: isSingleStoreView ? 45.2 : 1108, actual: isSingleStoreView ? 43.8 : 1072, variance: -3.1 },
        { name: "Lettuce", category: "Vegetables", expected: isSingleStoreView ? 28.5 : 698, actual: isSingleStoreView ? 29.2 : 715, variance: 2.5 },
        { name: "Avocado", category: "Vegetables", expected: isSingleStoreView ? 32.0 : 784, actual: isSingleStoreView ? 31.8 : 779, variance: -0.6 },
        { name: "Tomatoes", category: "Vegetables", expected: isSingleStoreView ? 24.8 : 608, actual: isSingleStoreView ? 26.4 : 647, variance: 6.5 },
        { name: "Bread", category: "Bakery", expected: isSingleStoreView ? 52.0 : 1274, actual: isSingleStoreView ? 51.2 : 1254, variance: -1.5 }
      ];

      const { data, error } = await supabase.functions.invoke('ingredient-insights', {
        body: { ingredientData }
      });

      if (error) throw error;
      
      if (data?.insights) {
        setAiInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  // Filter data based on view mode and selected store
  const filteredStorePerformance = viewMode === "store_manager" 
    ? mockStorePerformance.slice(0, 1)
    : selectedStore === "all" 
      ? mockStorePerformance 
      : mockStorePerformance.filter(s => s.name === selectedStore);

  // Determine if we're showing a single store (either in store view or filtered in HQ view)
  const isSingleStoreView = viewMode === "store_manager" || (viewMode === "hq" && selectedStore !== "all");
  
  // Store-specific data (for Store View)
  const storeData = {
    revenue: 1286,
    revenueChange: 18.2,
    grossProfit: 772,
    grossProfitChange: 16.5,
    waste: 45,
    wasteChange: -22.1,
    salesWasteData: [
      { date: "Mon", sales: 165, waste: 6 },
      { date: "Tue", sales: 148, waste: 5 },
      { date: "Wed", sales: 178, waste: 5 },
      { date: "Thu", sales: 162, waste: 7 },
      { date: "Fri", sales: 195, waste: 8 },
      { date: "Sat", sales: 218, waste: 9 },
      { date: "Sun", sales: 174, waste: 5 },
    ],
    revenueComparisonData: [
      { date: "Mon", predicted: 170, actual: 165 },
      { date: "Tue", predicted: 155, actual: 148 },
      { date: "Wed", predicted: 175, actual: 178 },
      { date: "Thu", predicted: 168, actual: 162 },
      { date: "Fri", predicted: 190, actual: 195 },
      { date: "Sat", predicted: 210, actual: 218 },
      { date: "Sun", predicted: 180, actual: 174 },
    ],
    volumeComparisonData: [
      { product: "BLT Sand", recommended: 18, actual: 17, missed: 1 },
      { product: "Caesar Wrap", recommended: 15, actual: 16, waste: 1 },
      { product: "Avo Wrap", recommended: 13, actual: 11, missed: 2 },
      { product: "Tuna Panini", recommended: 11, actual: 12, waste: 1 },
      { product: "Med Salad", recommended: 14, actual: 14, optimal: 0 },
      { product: "Salmon Bagel", recommended: 10, actual: 9, missed: 1 },
    ]
  };
  
  // HQ data (all stores combined)
  const hqData = {
    revenue: 12260000,
    revenueChange: 20.1,
    grossProfit: 5151000,
    grossProfitChange: 15.3,
    waste: 413062,
    wasteChange: -18,
    salesWasteData: [
      { date: "Mon", sales: 4200, waste: 180 },
      { date: "Tue", sales: 3800, waste: 160 },
      { date: "Wed", sales: 4500, waste: 140 },
      { date: "Thu", sales: 4100, waste: 190 },
      { date: "Fri", sales: 5200, waste: 210 },
      { date: "Sat", sales: 5800, waste: 220 },
      { date: "Sun", sales: 4600, waste: 170 },
    ],
    revenueComparisonData: [
      { date: "Mon", predicted: 4500, actual: 4200 },
      { date: "Tue", predicted: 4100, actual: 3800 },
      { date: "Wed", predicted: 4400, actual: 4500 },
      { date: "Thu", predicted: 4300, actual: 4100 },
      { date: "Fri", predicted: 5000, actual: 5200 },
      { date: "Sat", predicted: 5500, actual: 5800 },
      { date: "Sun", predicted: 4700, actual: 4600 },
    ],
    volumeComparisonData: [
      { product: "BLT Sand", recommended: 45, actual: 42, missed: 3 },
      { product: "Caesar Wrap", recommended: 38, actual: 40, waste: 2 },
      { product: "Avo Wrap", recommended: 32, actual: 28, missed: 4 },
      { product: "Tuna Panini", recommended: 28, actual: 30, waste: 2 },
      { product: "Med Salad", recommended: 35, actual: 35, optimal: 0 },
      { product: "Salmon Bagel", recommended: 25, actual: 22, missed: 3 },
    ]
  };
  
  // Calculate aggregated data for filtered stores
  const getAggregatedData = () => {
    if (viewMode === "store_manager") {
      return storeData;
    }
    
    if (selectedStore === "all") {
      return hqData;
    }
    
    // Single store selected in HQ view - use store-like data scaled appropriately
    const storeInfo = filteredStorePerformance[0];
    if (!storeInfo) return hqData;
    
    return {
      revenue: Math.round(storeInfo.revenue / 100) * 10, // Scale to weekly
      revenueChange: 18.2,
      grossProfit: Math.round(storeInfo.grossProfit / 10),
      grossProfitChange: 16.5,
      waste: Math.round(storeInfo.waste / 10),
      wasteChange: -18,
      salesWasteData: storeData.salesWasteData.map(d => ({
        ...d,
        sales: Math.round(d.sales * (storeInfo.revenue / 1850)),
        waste: Math.round(d.waste * (storeInfo.waste / 52))
      })),
      revenueComparisonData: storeData.revenueComparisonData.map(d => ({
        ...d,
        predicted: Math.round(d.predicted * (storeInfo.revenue / 1850)),
        actual: Math.round(d.actual * (storeInfo.revenue / 1850))
      })),
      volumeComparisonData: storeData.volumeComparisonData
    };
  };
  
  const currentData = getAggregatedData();

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
  
  const revenueForecast = isSingleStoreView ? revenueForecastStore : revenueForecastHQ;
  const volumeForecast = isSingleStoreView ? volumeForecastStore : volumeForecastHQ;
  const footfallForecast = isSingleStoreView ? footfallForecastStore : footfallForecastHQ;
  
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Performance {viewMode === "store_manager" ? `- ${contextSelectedStore}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Key metrics and performance insights
          </p>
        </div>
      </div>

      {/* Big Peachy Pink Box with Period and Store Selectors + KPIs */}
      <Card className="shadow-card border-0" style={{ background: 'var(--gradient-brand)' }}>
        <CardContent className="p-6">
          {/* Heading */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-secondary">
              {viewMode === "hq" && selectedBrand !== "All Brands" ? `${selectedBrand} • ` : ""}
              {selectedStore === "all" ? "All Stores" : selectedStore} • This Week's Performance
            </h2>
          </div>

          {/* Period and Store Selectors */}
          {viewMode === "hq" ? (
            <div className="flex flex-col gap-4 mb-6">
              {/* Brand Filter - Higher Level */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-secondary">My Brand:</label>
                <Select value={selectedBrand} onValueChange={(v) => {
                  setSelectedBrand(v);
                  setSelectedStore("all");
                }}>
                  <SelectTrigger className="w-[200px] bg-white/90 border-white/20 font-semibold">
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

              {/* Store and Date Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-[200px] bg-white/90 border-white/20">
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {availableStores.map((store) => (
                      <SelectItem key={store.id} value={store.name}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal bg-white/90 border-white/20">
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
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-[200px] bg-white/90 border-white/20">
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
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal bg-white/90 border-white/20">
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
          )}

          {/* Four Main KPI Cards - Added Gross Profit */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Revenue Card with Sub-cards */}
            <div className="space-y-3">
              <Card className="bg-background shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: 'hsl(var(--success-green))' }}>£{currentData.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentData.revenueChange > 0 ? (
                      <><TrendingUp className="inline h-3 w-3 mr-1 text-success" />+{currentData.revenueChange}% from previous period</>
                    ) : (
                      <><TrendingDown className="inline h-3 w-3 mr-1 text-destructive" />{currentData.revenueChange}% from previous period</>
                    )}
                  </p>
                </CardContent>
              </Card>
              
              {/* Sub-cards: Full Price and Reduced Price */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-background shadow-md">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Full Price</div>
                    <div className="text-lg font-bold text-foreground">
                      £{isSingleStoreView ? "1,480" : "36,185"}
                    </div>
                    <div className="text-xs text-muted-foreground">80% of revenue</div>
                  </CardContent>
                </Card>
                <Card className="bg-background shadow-md">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Reduced Price</div>
                    <div className="text-lg font-bold text-foreground">
                      £{isSingleStoreView ? "370" : "9,046"}
                    </div>
                    <div className="text-xs text-muted-foreground">20% of revenue</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Gross Profit Card */}
            <div className="space-y-3">
              <Card className="bg-background shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    £{currentData.grossProfit.toLocaleString()}
                    <span className="text-lg text-muted-foreground ml-2">
                      ({((currentData.grossProfit / currentData.revenue) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentData.grossProfitChange > 0 ? (
                      <><TrendingUp className="inline h-3 w-3 mr-1 text-success" />+{currentData.grossProfitChange}% from previous period</>
                    ) : (
                      <><TrendingDown className="inline h-3 w-3 mr-1 text-destructive" />{currentData.grossProfitChange}% from previous period</>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Waste Card with Sub-cards */}
            <div className="space-y-3">
              <Card className="bg-background shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Waste</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: 'hsl(var(--warning-orange))' }}>
                    £{currentData.waste.toLocaleString()}
                    <span className="text-lg text-muted-foreground ml-2">
                      ({((currentData.waste / currentData.revenue) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentData.wasteChange < 0 ? (
                      <><TrendingDown className="inline h-3 w-3 mr-1 text-success" />{currentData.wasteChange}% from previous period</>
                    ) : (
                      <><TrendingUp className="inline h-3 w-3 mr-1 text-destructive" />+{currentData.wasteChange}% from previous period</>
                    )}
                  </p>
                </CardContent>
              </Card>
              
              {/* Sub-cards: End Product and Ingredients */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-background shadow-md">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">End Product</div>
                    <div className="text-lg font-bold text-foreground">
                      £{Math.round(currentData.waste * 0.65).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">65% of waste</div>
                  </CardContent>
                </Card>
                <Card className="bg-background shadow-md">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Ingredients</div>
                    <div className="text-lg font-bold text-foreground">
                      £{Math.round(currentData.waste * 0.35).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">35% of waste</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Availability Card */}
            <div className="space-y-3">
              <Card className="bg-background shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">94.5%</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-success" />
                    +2.3% from previous period
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Period Revenue Breakdown Pie Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Revenue by Meal Period</CardTitle>
            <CardDescription>Breakdown of revenue across Breakfast, Lunch, and Afternoon</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={isSingleStoreView ? mealPeriodRevenueStore : mealPeriodRevenueHQ}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={CHART_COLORS.breakfast} />
                  <Cell fill={CHART_COLORS.lunch} />
                  <Cell fill={CHART_COLORS.afternoon} />
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `£${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(isSingleStoreView ? mealPeriodRevenueStore : mealPeriodRevenueHQ).map((period, index) => (
                <div key={period.name} className="text-center p-3 rounded-lg border" style={{ borderColor: [CHART_COLORS.breakfast, CHART_COLORS.lunch, CHART_COLORS.afternoon][index] }}>
                  <div className="text-sm text-muted-foreground">{period.name}</div>
                  <div className="text-lg font-bold text-foreground">£{period.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{period.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Category Revenue Stacked Bar Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Revenue by Product Category</CardTitle>
            <CardDescription>Daily revenue contribution from each product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={isSingleStoreView ? categoryRevenueStore : categoryRevenueHQ}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  formatter={(value: number) => `£${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="sandwiches" stackId="a" fill={CHART_COLORS.sandwiches} name="Sandwiches" />
                <Bar dataKey="wraps" stackId="a" fill={CHART_COLORS.wraps} name="Wraps" />
                <Bar dataKey="salads" stackId="a" fill={CHART_COLORS.salads} name="Salads" />
                <Bar dataKey="breakfast" stackId="a" fill={CHART_COLORS.breakfastItems} name="Breakfast Items" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: CHART_COLORS.sandwiches }}></div>
                  <span className="text-muted-foreground">Sandwiches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: CHART_COLORS.wraps }}></div>
                  <span className="text-muted-foreground">Wraps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: CHART_COLORS.salads }}></div>
                  <span className="text-muted-foreground">Salads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: CHART_COLORS.breakfastItems }}></div>
                  <span className="text-muted-foreground">Breakfast Items</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Waste Over Time */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Sales & Waste Trends</CardTitle>
            <CardDescription>Daily performance over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData.salesWasteData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Sales (£)"
                />
                <Line 
                  type="monotone" 
                  dataKey="waste" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Waste (£)"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">
                  Sales peaked on Saturday with strong weekend performance
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">
                  Waste reduced by 22% on Wednesday through better forecasting
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Second Chart - Predicted vs Actual Revenue for both views */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Predicted vs Actual Revenue</CardTitle>
            <CardDescription>
              AI revenue predictions vs actual performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(currentData as typeof hqData).revenueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="predicted" fill="hsl(var(--primary))" name="Predicted Revenue (£)" />
                <Bar dataKey="actual" fill="hsl(var(--accent))" name="Actual Revenue (£)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">
                  <strong>Overall accuracy:</strong> {viewMode === "hq" ? "96.2%" : "97.1%"} predicted vs actual revenue
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">
                  Saturday exceeded predictions by £{viewMode === "hq" ? "300" : "8"} due to excellent weather
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Performance Analytics Section */}
      <div className="space-y-6 mt-12 pt-12 border-t">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>
          <p className="text-muted-foreground">
            Track store and product performance
            {viewMode === "hq" && selectedStore !== "all" && ` - ${selectedStore}`}
          </p>
        </div>

        {/* Performance Tabs */}
        <Tabs defaultValue="store" className="space-y-4">
          <TabsList>
            <TabsTrigger value="store">Store Performance</TabsTrigger>
            <TabsTrigger value="product">Product Performance</TabsTrigger>
            <TabsTrigger value="cluster">Cluster Performance</TabsTrigger>
          </TabsList>

          {/* Store Performance Tab */}
          <TabsContent value="store" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    £{filteredStorePerformance.reduce((acc, s) => acc + s.revenue, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-success" />
                    {viewMode === "store_manager" ? "+5.2%" : "+8.1%"} from last period
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
                    £{filteredStorePerformance.reduce((acc, s) => acc + s.grossProfit, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((filteredStorePerformance.reduce((acc, s) => acc + s.grossProfit, 0) / 
                      filteredStorePerformance.reduce((acc, s) => acc + s.revenue, 0)) * 100).toFixed(1)}% margin
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Target Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {((filteredStorePerformance.reduce((acc, s) => acc + s.revenue, 0) / 
                      filteredStorePerformance.reduce((acc, s) => acc + s.target, 0)) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target: £{filteredStorePerformance.reduce((acc, s) => acc + s.target, 0).toLocaleString()}
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
                    {viewMode === "store_manager" ? "Store Ranking" : "Top Performer"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-warning" />
                    <div className="text-lg font-bold text-foreground">
                      {viewMode === "store_manager" ? "#3 of 50" : "King's Cross"}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {viewMode === "store_manager" ? "Top quartile" : "£41.2k revenue"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Revenue vs Target</CardTitle>
                <CardDescription>Daily performance over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockDailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (£)" />
                    <Bar dataKey="target" fill="hsl(var(--accent))" name="Target (£)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Store Performance Table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>
                  {viewMode === "store_manager" ? "Store Metrics" : "Store Performance Breakdown"}
                </CardTitle>
                <CardDescription>
                  Detailed performance metrics by store
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
