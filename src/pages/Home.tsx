import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Trash2, CheckCircle, ArrowRight, ClipboardCheck } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { viewMode, selectedStore } = useView();
  const navigate = useNavigate();

  // Mock data for this week's metrics
  const weeklyMetrics = {
    revenue: viewMode === "store" ? 1286 : 32150,
    grossProfit: viewMode === "store" ? 772 : 19290,
    waste: viewMode === "store" ? 45 : 1125,
    availability: viewMode === "store" ? 96.5 : 94.8,
  };

  // Mock next task data
  const nextTask = {
    title: "Morning Production - BLT Sandwiches",
    time: "08:00 AM",
    priority: "high" as const,
    type: "production" as const,
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome Back {viewMode === "store" ? `- ${selectedStore}` : ""}
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
                    <Badge variant="destructive" className="text-xs">
                      {nextTask.priority}
                    </Badge>
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
    </div>
  );
}
