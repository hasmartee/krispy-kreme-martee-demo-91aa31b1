import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export default function Analytics() {
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [stores, setStores] = useState<Array<{ name: string; id: string }>>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

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

  // Mock data for current period
  const currentPeriodData = {
    revenue: 45231,
    revenuePrevChange: 12.5,
    wasteValue: 1270,
    wastePercent: 2.8,
    wastePrevChange: -8.3,
    availability: 94.2,
    availabilityPrevChange: 3.1,
    fullPriceRevenue: 38446,
    fullPricePercent: 85,
    reducedPriceRevenue: 6785,
    reducedPricePercent: 15,
    endProductWaste: 889,
    endProductWastePercent: 70,
    ingredientWaste: 381,
    ingredientWastePercent: 30,
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Period and Store Selector */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Performance Overview</h2>
              <p className="text-sm text-muted-foreground">
                {selectedStore === "all" ? "All Stores" : selectedStore} • {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-[180px]">
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
                  <Button variant="outline" className="w-[240px] justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-foreground">
                £{currentPeriodData.revenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                {currentPeriodData.revenuePrevChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={currentPeriodData.revenuePrevChange >= 0 ? "text-success text-sm font-medium" : "text-destructive text-sm font-medium"}>
                  {currentPeriodData.revenuePrevChange >= 0 ? "+" : ""}{currentPeriodData.revenuePrevChange}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waste Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">
                  £{currentPeriodData.wasteValue.toLocaleString()}
                </div>
                <div className="text-2xl font-semibold text-muted-foreground">
                  {currentPeriodData.wastePercent}%
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentPeriodData.wastePrevChange <= 0 ? (
                  <TrendingDown className="h-4 w-4 text-success" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                )}
                <span className={currentPeriodData.wastePrevChange <= 0 ? "text-success text-sm font-medium" : "text-destructive text-sm font-medium"}>
                  {currentPeriodData.wastePrevChange >= 0 ? "+" : ""}{currentPeriodData.wastePrevChange}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-foreground">
                {currentPeriodData.availability}%
              </div>
              <div className="flex items-center gap-2">
                {currentPeriodData.availabilityPrevChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={currentPeriodData.availabilityPrevChange >= 0 ? "text-success text-sm font-medium" : "text-destructive text-sm font-medium"}>
                  {currentPeriodData.availabilityPrevChange >= 0 ? "+" : ""}{currentPeriodData.availabilityPrevChange}%
                </span>
                <span className="text-xs text-muted-foreground">vs previous period</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown - Two Small Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Full Price Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                £{currentPeriodData.fullPriceRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentPeriodData.fullPricePercent}% of total revenue
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reduced Price Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                £{currentPeriodData.reducedPriceRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentPeriodData.reducedPricePercent}% of total revenue
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waste Breakdown - Two Small Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">End Product Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                £{currentPeriodData.endProductWaste.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentPeriodData.endProductWastePercent}% of total waste
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingredients Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                £{currentPeriodData.ingredientWaste.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentPeriodData.ingredientWastePercent}% of total waste
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
