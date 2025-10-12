import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { useView } from "@/contexts/ViewContext";

interface Task {
  id: string;
  type: "production";
  title: string;
  time: string;
  completed: boolean;
  details?: string;
}

export default function StoreTeamHome() {
  const { selectedStore } = useView();
  const navigate = useNavigate();
  
  const [tasks] = useState<Task[]>([
    {
      id: "1",
      type: "production",
      title: "Complete Morning Production",
      time: "06:30",
      completed: false,
      details: "Complete all breakfast items production"
    },
    {
      id: "2",
      type: "production",
      title: "Complete Lunchtime Production",
      time: "11:00",
      completed: false,
      details: "Complete sandwiches, wraps, and salads for lunch service"
    },
    {
      id: "3",
      type: "production",
      title: "Complete Afternoon Production",
      time: "14:00",
      completed: false,
      details: "Complete afternoon snacks and light meals"
    }
  ]);

  // Find the next task based on current time
  const getNextTask = () => {
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    
    for (const task of tasks) {
      const [hours, minutes] = task.time.split(':').map(Number);
      const taskTime = hours * 60 + minutes;
      
      if (!task.completed && taskTime >= now) {
        return task;
      }
    }
    
    // If all tasks are in the past or completed, return the first incomplete task
    return tasks.find(t => !t.completed) || tasks[0];
  };

  const nextTask = getNextTask();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{getGreeting()}!</h1>
        <p className="text-muted-foreground mt-1">
          {selectedStore} - Store Team Dashboard
        </p>
      </div>

      {/* Next Task Card */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">My Next Task</h2>
          <Button onClick={() => navigate("/tasks")} variant="outline" className="gap-2">
            View All Tasks
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/production")}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{nextTask.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scheduled for {nextTask.time}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    {completedCount === totalCount ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    <span>
                      Today's Progress: {completedCount}/{totalCount} tasks completed
                    </span>
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/production")}
            >
              <ChefHat className="h-6 w-6" />
              <span>View Production</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/inventory")}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Live Availability</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/recipes")}
            >
              <ChefHat className="h-6 w-6" />
              <span>Recipes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
