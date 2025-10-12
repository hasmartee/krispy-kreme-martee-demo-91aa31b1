import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Trash2, CheckCircle, ArrowRight, ClipboardCheck, BrainCircuit, Sparkles, Users, CloudRain, AlertTriangle } from "lucide-react";
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

export default function Home() {
  const { viewMode, selectedStore } = useView();
  const navigate = useNavigate();

  const isSingleStoreView = viewMode === "store_manager";
  const revenueForecast = isSingleStoreView ? revenueForecastStore : revenueForecastHQ;
  const volumeForecast = isSingleStoreView ? volumeForecastStore : volumeForecastHQ;
  const footfallForecast = isSingleStoreView ? footfallForecastStore : footfallForecastHQ;

  // Mock data for this week's metrics
  const weeklyMetrics = {
    revenue: viewMode === "store_manager" ? 1286 : 32150,
    grossProfit: viewMode === "store_manager" ? 772 : 19290,
    waste: viewMode === "store_manager" ? 45 : 1125,
    availability: viewMode === "store_manager" ? 96.5 : 94.8,
  };

  // Mock next task data
  const nextTask = {
    title: "Morning Production - BLT Sandwiches",
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{weeklyMetrics.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Week to date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{weeklyMetrics.grossProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((weeklyMetrics.grossProfit / weeklyMetrics.revenue) * 100).toFixed(1)}% margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{weeklyMetrics.waste.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((weeklyMetrics.waste / weeklyMetrics.revenue) * 100).toFixed(1)}% of revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Availability</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyMetrics.availability}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Products in stock
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next Task */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Your Next Task</h2>
          <Button onClick={() => navigate("/tasks")} variant="outline" className="gap-2">
            View All Tasks
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/tasks")}>
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

      {/* AI Forecasts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">AI-Powered Forecasts</h2>
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Forecast */}
          <Card className="shadow-card border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Revenue Forecast
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  AI Prediction
                </div>
              </div>
              <CardDescription>Next 7 days revenue predictions with confidence bands</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueForecast}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stackId="1"
                    stroke="none"
                    fill="url(#colorConfidence)"
                    name="Upper Bound"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stackId="2"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#colorForecast)"
                    name="Forecast (£)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="hsl(var(--accent))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Lower Bound"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-medium">
                    Weekly forecast: £{revenueForecast.reduce((sum, day) => sum + day.forecast, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>
                    Average confidence: {Math.round(revenueForecast.reduce((sum, day) => sum + day.confidence, 0) / revenueForecast.length)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>
                    Peak day: Saturday (£{revenueForecast.find(d => d.day === "Sat")?.forecast.toLocaleString()})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volume Forecast */}
          <Card className="shadow-card border-accent/20 bg-gradient-to-br from-background via-background to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <CardTitle className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    Volume Forecast
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-accent">
                  <BrainCircuit className="h-3 w-3" />
                  ML Model
                </div>
              </div>
              <CardDescription>Top 5 products volume predictions for next week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={volumeForecast}>
                  <defs>
                    <linearGradient id="colorBlt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCaesar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAvocado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="blt" 
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorBlt)"
                    name="BLT Sandwich"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="caesar" 
                    stackId="1"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    fill="url(#colorCaesar)"
                    name="Caesar Wrap"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avocado" 
                    stackId="1"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    fill="url(#colorAvocado)"
                    name="Avocado Wrap"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-medium">
                    Total week volume: {volumeForecast.reduce((sum, day) => sum + day.blt + day.caesar + day.avocado + day.tuna + day.salad, 0)} units
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>
                    Top seller: BLT Sandwich ({volumeForecast.reduce((sum, day) => sum + day.blt, 0)} units/week)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BrainCircuit className="h-4 w-4 text-accent" />
                  <span>
                    Model accuracy: 97.3% based on historical patterns
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footfall Forecast */}
          <Card className="shadow-card border-success/20 bg-gradient-to-br from-background via-background to-success/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-success" />
                  <CardTitle className="bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                    Footfall Forecast
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-success">
                  <Sparkles className="h-3 w-3" />
                  AI Prediction
                </div>
              </div>
              <CardDescription>Expected customer traffic for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={footfallForecast}>
                  <defs>
                    <linearGradient id="colorFootfall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="footfall" 
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    fill="url(#colorFootfall)"
                    name="Total Footfall"
                  />
                  <Bar 
                    dataKey="morning" 
                    stackId="breakdown"
                    fill="hsl(var(--primary))"
                    name="Morning"
                    opacity={0.6}
                  />
                  <Bar 
                    dataKey="afternoon" 
                    stackId="breakdown"
                    fill="hsl(var(--accent))"
                    name="Afternoon"
                    opacity={0.6}
                  />
                  <Bar 
                    dataKey="evening" 
                    stackId="breakdown"
                    fill="hsl(var(--warning))"
                    name="Evening"
                    opacity={0.6}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-success" />
                  <span className="font-medium">
                    Weekly forecast: {footfallForecast.reduce((sum, day) => sum + day.footfall, 0).toLocaleString()} customers
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span>
                    Peak day: Saturday ({footfallForecast.find(d => d.day === "Sat")?.footfall.toLocaleString()} customers)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BrainCircuit className="h-4 w-4 text-success" />
                  <span>
                    Busiest time: Afternoon ({Math.round(footfallForecast.reduce((sum, day) => sum + day.afternoon, 0) / footfallForecast.length)}avg/day)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notable Events - Only in Store View */}
      {viewMode === "store_manager" && (
        <>
          <div className="pt-2">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Notable events on Monday 13 October 2025
            </h2>
          </div>

          <Card className="shadow-card border-l-4 border-l-warning bg-warning/5">
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
    </div>
  );
}
