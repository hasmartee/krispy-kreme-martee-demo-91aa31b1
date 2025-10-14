import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, TrendingUp, Trash2, CheckCircle, ArrowRight, ClipboardCheck, BrainCircuit, Sparkles, Users, CloudRain, AlertTriangle, Bell, TrendingDown, MessageSquare, Package } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart } from "recharts";

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

// Store alerts data
const storeAlerts = [
  {
    id: "1",
    type: "waste_variance",
    store: "Liverpool Street Station",
    metric: "Waste variance: 112% higher than reported",
    severity: "high",
  },
  {
    id: "2",
    type: "delivery_variance",
    store: "Bond Street",
    metric: "Delivery shortfall: 8.4% under expected",
    severity: "medium",
  },
  {
    id: "3",
    type: "reduced_sales",
    store: "Camden Town",
    metric: "Reduced price sales: 34% of total",
    severity: "high",
  },
];

// Top/Bottom store performance data
const storePerformance = {
  sales: {
    top: [
      { store: "St Pancras International", value: "892", change: "+12%" },
      { store: "Liverpool Street Station", value: "845", change: "+8%" },
      { store: "Kings Cross Station", value: "780", change: "+5%" },
    ],
    bottom: [
      { store: "Wimbledon Village", value: "342", change: "-3%" },
      { store: "Greenwich Village", value: "368", change: "-1%" },
      { store: "Notting Hill Gate", value: "395", change: "+2%" },
    ],
  },
  waste: {
    top: [
      { store: "Canary Wharf Plaza", value: "18", change: "2.1%" },
      { store: "The City - Leadenhall", value: "22", change: "2.5%" },
      { store: "Bank Station", value: "25", change: "2.8%" },
    ],
    bottom: [
      { store: "Liverpool Street Station", value: "78", change: "8.2%" },
      { store: "Camden Town", value: "65", change: "7.1%" },
      { store: "Bond Street", value: "58", change: "6.4%" },
    ],
  },
  deliveries: {
    top: [
      { store: "St Pancras International", value: "99.8%", change: "+0.2%" },
      { store: "Kings Cross Station", value: "99.2%", change: "0%" },
      { store: "Shoreditch High Street", value: "98.9%", change: "+0.1%" },
    ],
    bottom: [
      { store: "Bond Street", value: "91.6%", change: "-8.4%" },
      { store: "Camden Town", value: "94.2%", change: "-5.8%" },
      { store: "Notting Hill Gate", value: "95.5%", change: "-4.5%" },
    ],
  },
};

export default function Home() {
  const { viewMode, selectedStore } = useView();
  const navigate = useNavigate();

  const isSingleStoreView = viewMode === "store_manager";
  const revenueForecast = isSingleStoreView ? revenueForecastStore : revenueForecastHQ;
  const volumeForecast = isSingleStoreView ? volumeForecastStore : volumeForecastHQ;
  const footfallForecast = isSingleStoreView ? footfallForecastStore : footfallForecastHQ;

  // Multi-brand data for HQ view
  const brandData = [
    { 
      name: "Pret a Manger", 
      stores: 156, 
      revenue: 4250000, 
      grossProfit: 1785000,
      waste: 3.2, 
      availability: 96.8 
    },
    { 
      name: "Brioche Dorée", 
      stores: 118, 
      revenue: 2890000, 
      grossProfit: 1215600,
      waste: 4.1, 
      availability: 94.5 
    },
    { 
      name: "Starbucks", 
      stores: 112, 
      revenue: 5120000, 
      grossProfit: 2150400,
      waste: 2.8, 
      availability: 97.2 
    },
  ];

  const totalStores = brandData.reduce((sum, brand) => sum + brand.stores, 0);
  const totalRevenue = brandData.reduce((sum, brand) => sum + brand.revenue, 0);
  const totalGrossProfit = brandData.reduce((sum, brand) => sum + brand.grossProfit, 0);
  const avgWaste = brandData.reduce((sum, brand) => sum + brand.waste, 0) / brandData.length;
  const avgAvailability = brandData.reduce((sum, brand) => sum + brand.availability, 0) / brandData.length;

  // Mock data for this week's metrics
  const weeklyMetrics = {
    revenue: viewMode === "store_manager" ? 1286 : totalRevenue,
    grossProfit: viewMode === "store_manager" ? 772 : totalGrossProfit,
    waste: viewMode === "store_manager" ? 45 : Math.round(avgWaste * totalRevenue / 100),
    availability: viewMode === "store_manager" ? 96.5 : avgAvailability,
  };

  // Mock next task data
  const nextTask = {
    title: "Complete Morning Production",
    time: "08:00 AM",
    type: "production" as const,
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome Back {viewMode === "store_manager" ? `- ${selectedStore}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening this week
        </p>
      </div>

      {viewMode === "hq" ? (
        <>
          {/* Three Main Metrics with Hover Details */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Sold Qty */}
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <Card className="shadow-lg cursor-pointer hover:shadow-xl transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Sold Qty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-4xl font-bold text-foreground">8,420</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-sm text-muted-foreground">94.2% of total</div>
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          +5.3% vs last week
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">Full Price Sales</div>
                          <div className="text-xl font-semibold">6,890</div>
                          <div className="text-xs text-muted-foreground">81.8%</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">Reduced Price Sales</div>
                          <div className="text-xl font-semibold">1,530</div>
                          <div className="text-xs text-muted-foreground">18.2%</div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" side="bottom">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Top Performing Stores
                    </h4>
                    <div className="space-y-2">
                      {storePerformance.sales.top.map((store, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{store.store}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{store.value}</span>
                            <span className="text-green-600 text-xs">{store.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                      Needs Attention
                    </h4>
                    <div className="space-y-2">
                      {storePerformance.sales.bottom.map((store, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{store.store}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{store.value}</span>
                            <span className="text-amber-600 text-xs">{store.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            {/* Wasted Qty */}
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <Card className="shadow-lg cursor-pointer hover:shadow-xl transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Wasted Qty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-4xl font-bold text-foreground">385</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-sm text-muted-foreground">4.3% of total</div>
                        <Badge variant="outline" className="text-xs text-destructive border-destructive">
                          +12% vs last week
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">Reported</div>
                          <div className="text-xl font-semibold">185</div>
                          <div className="text-xs text-muted-foreground">2.1%</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-destructive/10 border-destructive/20">
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">Calculated</div>
                          <div className="text-xl font-semibold text-destructive">385</div>
                          <div className="text-xs text-destructive">4.3%</div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" side="bottom">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Best Waste Management
                    </h4>
                    <div className="space-y-2">
                      {storePerformance.waste.top.map((store, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{store.store}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{store.value}</span>
                            <span className="text-green-600 text-xs">{store.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      High Waste Stores
                    </h4>
                    <div className="space-y-2">
                      {storePerformance.waste.bottom.map((store, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{store.store}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{store.value}</span>
                            <span className="text-destructive text-xs">{store.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            {/* Delivered Qty */}
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <Card className="shadow-lg cursor-pointer hover:shadow-xl transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Delivered Qty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-4xl font-bold text-foreground">8,950</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-sm text-muted-foreground">Total delivered</div>
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                          -1.6% vs last week
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">Expected</div>
                          <div className="text-xl font-semibold">9,100</div>
                          <div className="text-xs text-muted-foreground">100%</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground mb-1">Received</div>
                          <div className="text-xl font-semibold">8,950</div>
                          <div className="text-xs text-muted-foreground">98.4%</div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" side="bottom">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Best Delivery Accuracy
                    </h4>
                    <div className="space-y-2">
                      {storePerformance.deliveries.top.map((store, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{store.store}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{store.value}</span>
                            <span className="text-green-600 text-xs">{store.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                      Delivery Shortfalls
                    </h4>
                    <div className="space-y-2">
                      {storePerformance.deliveries.bottom.map((store, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{store.store}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{store.value}</span>
                            <span className="text-amber-600 text-xs">{store.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Store Alerts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Store Alerts</h2>
              <Badge variant="destructive">{storeAlerts.length}</Badge>
            </div>
            <div className="grid gap-3">
              {storeAlerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`border-l-4 ${
                    alert.severity === "high" 
                      ? "border-l-destructive bg-destructive/5" 
                      : "border-l-amber-500 bg-amber-500/5"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle 
                          className={`h-5 w-5 ${
                            alert.severity === "high" ? "text-destructive" : "text-amber-500"
                          }`} 
                        />
                        <div>
                          <div className="font-semibold">{alert.store}</div>
                          <div className="text-sm text-muted-foreground">{alert.metric}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* New Launches This Week */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">New Launches This Week</h2>
            </div>
            <Card className="border-l-4 border-l-blue-500 bg-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground mb-1">
                      2 New Products Launching Next Monday
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Get ready to introduce these exciting new items:
                    </div>
                    <ul className="text-sm space-y-1 ml-4">
                      <li className="text-foreground">• Spicy Chicken & Avocado Wrap</li>
                      <li className="text-foreground">• Mediterranean Quinoa Bowl</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* Store Manager View - Keep existing content */
        <>
          {/* Disparity Alerts - Store View */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold text-foreground">Attention Required</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground mb-1">Waste Discrepancy</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Recorded: <span className="font-medium text-foreground">12 items</span> | 
                        Expected: <span className="font-medium text-foreground">28 items</span>
                      </div>
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                        +133% variance
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground mb-1">Delivery Shortfall</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Expected: <span className="font-medium text-foreground">450 items</span> | 
                        Received: <span className="font-medium text-foreground">428 items</span>
                      </div>
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                        -4.9% shortage
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* This Week's Metrics */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">This Week's Performance</h2>
              <Button onClick={() => navigate("/analytics")} variant="outline" className="gap-2">
                View Full Performance
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{weeklyMetrics.revenue.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Week to date
                    </p>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      +8.2%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-500/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{weeklyMetrics.grossProfit.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {((weeklyMetrics.grossProfit / weeklyMetrics.revenue) * 100).toFixed(1)}% margin
                    </p>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      +6.5%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-destructive bg-gradient-to-br from-destructive/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Waste</CardTitle>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{weeklyMetrics.waste.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {((weeklyMetrics.waste / weeklyMetrics.revenue) * 100).toFixed(1)}% of revenue
                    </p>
                    <Badge variant="outline" className="text-xs text-destructive border-destructive">
                      +2.1%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Availability</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeklyMetrics.availability.toFixed(1)}%</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Products in stock
                    </p>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      +1.2%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Notable Events - Only in Store View */}
      {viewMode === "store_manager" && (
        <>
          <div className="pt-2">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Notable events on Monday 13 October 2025
            </h2>
          </div>

          <Card className="shadow-card border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-500/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CloudRain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Predicted Weather</p>
                    <p className="text-base font-semibold text-foreground">Rainy, 12°C - Lower footfall expected</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-border hidden md:block" />
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Key Events</p>
                    <p className="text-base font-semibold text-foreground">Train strike in Central London - Reduced commuter traffic</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Next Task - Store Manager Only */}
      {viewMode === "store_manager" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Next Task</h2>
            <Button onClick={() => navigate("/tasks")} variant="outline" className="gap-2">
              View All Tasks
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent" onClick={() => navigate("/tasks")}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{nextTask.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scheduled for {nextTask.time}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Comments with HQ - Store Manager Only */}
      {viewMode === "store_manager" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Share with HQ</h2>
          </div>
          
          <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Have insights, concerns, or feedback to share with headquarters? Let us know what's happening at your store.
                </p>
                <Textarea 
                  placeholder="Share your comments, observations, or suggestions for HQ..."
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send to HQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
