import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { useView } from "@/contexts/ViewContext";

interface Task {
  id: string;
  type: "production";
  title: string;
  time: string;
  completed: boolean;
  details?: string;
  priority?: "high" | "medium" | "low";
}

export default function StoreTeamHome() {
  const { selectedStore } = useView();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [tasks] = useState<Task[]>([
    {
      id: "1",
      type: "production",
      title: "Morning Production",
      time: "06:30",
      completed: false,
      details: "Complete all breakfast items production",
      priority: "high"
    },
    {
      id: "2",
      type: "production",
      title: "Lunchtime Production",
      time: "11:00",
      completed: false,
      details: "Complete sandwiches, wraps, and salads for lunch service",
      priority: "high"
    },
    {
      id: "3",
      type: "production",
      title: "Afternoon Production",
      time: "14:00",
      completed: false,
      details: "Complete afternoon snacks and light meals",
      priority: "medium"
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Find the next task based on current time
  const getNextTask = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-white";
      case "medium": return "bg-warning text-white";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
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
      <Card className="shadow-lg border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            My Next Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-2 border-primary/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-foreground">{nextTask.title}</h3>
                  {nextTask.priority && (
                    <Badge className={getPriorityColor(nextTask.priority)}>
                      {nextTask.priority}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{nextTask.details}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span className="text-lg font-semibold">Scheduled: {nextTask.time}</span>
              </div>
              
              <Button 
                size="lg"
                onClick={() => navigate("/production")}
                className="shadow-brand"
              >
                Start Task
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {completedCount === totalCount ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              <span className="font-medium">
                Today's Progress: {completedCount}/{totalCount} tasks completed
              </span>
            </div>
            <Button variant="outline" onClick={() => navigate("/tasks")}>
              View All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

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
