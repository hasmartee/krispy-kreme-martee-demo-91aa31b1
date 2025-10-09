import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarIcon, Users, TrendingUp } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { format, addDays } from "date-fns";

interface ShiftRecommendation {
  date: Date;
  dayOfWeek: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  predictedFootfall: number;
  totalStaffCost: number;
}

export default function SuggestedStaffing() {
  const { viewMode, selectedStore } = useView();
  
  // Generate 14 days of recommendations
  const generateRecommendations = (): ShiftRecommendation[] => {
    const recommendations: ShiftRecommendation[] = [];
    const teamMembers = {
      foodPrep: ["John Smith", "Mike Davis", "Tom Brown"],
      frontOfHouse: ["Sarah Johnson", "Emma Wilson"],
    };

    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i + 1);
      const dayOfWeek = format(date, "EEEE");
      const isWeekend = dayOfWeek === "Saturday" || dayOfWeek === "Sunday";
      
      let morning: string[] = [];
      let afternoon: string[] = [];
      let evening: string[] = [];
      let predictedFootfall = 0;

      if (isWeekend) {
        // Weekend - higher footfall
        morning = ["Tom Brown", "Emma Wilson"];
        afternoon = ["Tom Brown", "John Smith", "Sarah Johnson"];
        evening = ["Mike Davis", "Emma Wilson"];
        predictedFootfall = 450 + Math.floor(Math.random() * 100);
      } else {
        // Weekday - moderate footfall
        morning = ["John Smith", "Sarah Johnson"];
        afternoon = ["Tom Brown", "Emma Wilson"];
        evening = ["Mike Davis"];
        predictedFootfall = 250 + Math.floor(Math.random() * 100);
      }

      const totalStaffCost = calculateStaffCost(morning, afternoon, evening);

      recommendations.push({
        date,
        dayOfWeek,
        morning,
        afternoon,
        evening,
        predictedFootfall,
        totalStaffCost,
      });
    }

    return recommendations;
  };

  const calculateStaffCost = (morning: string[], afternoon: string[], evening: string[]): number => {
    const rates: { [key: string]: number } = {
      "John Smith": 15.50,
      "Sarah Johnson": 13.00,
      "Mike Davis": 11.50,
      "Emma Wilson": 14.50,
      "Tom Brown": 18.00,
    };

    const morningHours = 4;
    const afternoonHours = 6;
    const eveningHours = 4;

    let cost = 0;
    morning.forEach(name => cost += (rates[name] || 12) * morningHours);
    afternoon.forEach(name => cost += (rates[name] || 12) * afternoonHours);
    evening.forEach(name => cost += (rates[name] || 12) * eveningHours);

    return cost;
  };

  const [recommendations] = useState<ShiftRecommendation[]>(generateRecommendations());

  const getShiftDisplay = (staff: string[]) => {
    if (staff.length === 0) return <span className="text-muted-foreground">-</span>;
    return (
      <div className="space-y-1">
        {staff.map((name, idx) => (
          <div key={idx} className="text-sm">{name}</div>
        ))}
      </div>
    );
  };

  const getFootfallBadge = (footfall: number) => {
    if (footfall >= 400) return <Badge className="bg-red-600">High</Badge>;
    if (footfall >= 300) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  if (viewMode === "hq") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Staffing recommendations are only available for individual stores. Please select a store from the view selector.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suggested Staffing</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered 14-day rolling staff recommendations for {selectedStore}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{recommendations.reduce((sum, r) => sum + r.totalStaffCost, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Next 14 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily Footfall</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(recommendations.reduce((sum, r) => sum + r.predictedFootfall, 0) / recommendations.length)}
            </div>
            <p className="text-xs text-muted-foreground">Predicted customers/day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Days</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations.filter(r => r.predictedFootfall >= 400).length}
            </div>
            <p className="text-xs text-muted-foreground">High footfall days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Table */}
      <Card>
        <CardHeader>
          <CardTitle>14-Day Staffing Schedule</CardTitle>
          <CardDescription>
            Optimized staff allocation based on predicted footfall and historical data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Morning (6-10am)</TableHead>
                <TableHead>Afternoon (10am-4pm)</TableHead>
                <TableHead>Evening (4-8pm)</TableHead>
                <TableHead>Predicted Footfall</TableHead>
                <TableHead>Staff Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((rec, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {format(rec.date, "MMM dd")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {rec.dayOfWeek}
                      {(rec.dayOfWeek === "Saturday" || rec.dayOfWeek === "Sunday") && (
                        <Badge variant="outline" className="text-xs">Weekend</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getShiftDisplay(rec.morning)}</TableCell>
                  <TableCell>{getShiftDisplay(rec.afternoon)}</TableCell>
                  <TableCell>{getShiftDisplay(rec.evening)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {rec.predictedFootfall}
                      {getFootfallBadge(rec.predictedFootfall)}
                    </div>
                  </TableCell>
                  <TableCell>£{rec.totalStaffCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
