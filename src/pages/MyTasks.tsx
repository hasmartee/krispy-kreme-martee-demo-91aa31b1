import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, ChefHat, Clock, ArrowRight, Trophy, Zap, Star, Sparkles } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  type: "production" | "stock_check";
  title: string;
  time: string;
  completed: boolean;
  details?: string;
  priority?: "high" | "medium" | "low";
}

export default function MyTasks() {
  const { viewMode, selectedStore } = useView();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    // Initialize tasks with preparation and stock check tasks
    const tasksList: Task[] = [
      {
        id: "1",
        type: "production",
        title: "Prepare Breakfast Items",
        time: "05:30",
        completed: false,
        details: "Prepare breakfast sandwiches, bagels, and parfaits",
        priority: "high"
      },
      {
        id: "2",
        type: "production",
        title: "Prepare Lunch Items",
        time: "09:00",
        completed: false,
        details: "Prepare sandwiches, wraps, and salads for lunch service",
        priority: "high"
      },
      {
        id: "3",
        type: "stock_check",
        title: "Stock Take - Morning",
        time: "08:00",
        completed: false,
        details: "Count all product inventory items",
        priority: "high"
      },
      {
        id: "4",
        type: "stock_check",
        title: "Stock Take - Midday",
        time: "12:00",
        completed: false,
        details: "Count all product inventory items",
        priority: "medium"
      },
      {
        id: "5",
        type: "stock_check",
        title: "Stock Take - Afternoon",
        time: "14:00",
        completed: false,
        details: "Count all product inventory items",
        priority: "medium"
      },
      {
        id: "6",
        type: "stock_check",
        title: "Stock Take - Evening",
        time: "16:00",
        completed: false,
        details: "Count all product inventory items",
        priority: "medium"
      },
    ];

    setTasks(tasksList);
  }, [selectedStore]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        
        // Show celebration when completing a task
        if (newCompleted) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          
          // Show confetti effect
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
          
          // Show motivational toast
          const messages = [
            { title: "🎉 Task Crushed!", description: "You're on fire!" },
            { title: "⚡ Boom! Done!", description: "Keep that momentum going!" },
            { title: "✨ Nailed it!", description: "Another one bites the dust!" },
            { title: "🚀 Unstoppable!", description: "You're killing it today!" },
            { title: "💪 Amazing work!", description: "Nothing can stop you!" },
          ];
          
          const message = messages[Math.floor(Math.random() * messages.length)];
          
          if (newStreak > 0 && newStreak % 3 === 0) {
            toast({
              title: `🔥 ${newStreak} Task Streak! 🔥`,
              description: "You're absolutely crushing it!",
            });
          } else {
            toast({
              title: message.title,
              description: message.description,
            });
          }
        } else {
          // Reset streak when unchecking
          if (streak > 0) setStreak(Math.max(0, streak - 1));
        }
        
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const handleTaskClick = (task: Task) => {
    switch (task.type) {
      case "production":
        navigate("/recipes");
        break;
      case "stock_check":
        navigate("/inventory");
        break;
    }
  };

  const getTaskIcon = (type: Task["type"]) => {
    switch (type) {
      case "production":
        return <ChefHat className="h-5 w-5" />;
      case "stock_check":
        return <ClipboardCheck className="h-5 w-5" />;
    }
  };

  const getTaskColor = (type: Task["type"]) => {
    switch (type) {
      case "production":
        return "text-green-600";
      case "stock_check":
        return "text-orange-600";
    }
  };

  const getPriorityBadge = (priority?: "high" | "medium" | "low") => {
    if (!priority) return null;
    
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    } as const;

    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  // Sort tasks by time
  const sortedTasks = [...tasks].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (viewMode === "hq") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Tasks view is only available for individual stores. Please select a store from the view selector.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animation: `confettiFall ${2 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              <Sparkles 
                className="h-6 w-6" 
                style={{ 
                  color: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))'][Math.floor(Math.random() * 3)],
                  transform: `rotate(${Math.random() * 360}deg)`
                }} 
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Daily checklist for store operations
          </p>
        </div>
        <div className="flex items-center gap-6">
          {/* Streak Counter */}
          {streak > 0 && (
            <Card className="shadow-card border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 animate-scale-in">
              <CardContent className="p-4 flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary animate-pulse" />
                <div>
                  <div className="text-2xl font-bold text-primary">{streak}</div>
                  <div className="text-xs text-muted-foreground">Streak 🔥</div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              {completedCount === totalCount && totalCount > 0 && (
                <Trophy className="h-6 w-6 text-success animate-pulse" />
              )}
              {completedCount}/{totalCount}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="shadow-card bg-gradient-to-r from-background to-primary/5">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-semibold">Daily Progress</span>
              </div>
              <span className="text-sm font-medium text-primary">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            {progressPercentage === 100 && (
              <div className="flex items-center gap-2 text-success animate-fade-in">
                <Trophy className="h-5 w-5" />
                <span className="font-medium">All tasks completed! Outstanding work! 🎉</span>
              </div>
            )}
            {progressPercentage >= 50 && progressPercentage < 100 && (
              <div className="flex items-center gap-2 text-primary animate-fade-in">
                <Zap className="h-5 w-5" />
                <span className="text-sm">You're over halfway there! Keep going! 💪</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {sortedTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`transition-all duration-300 ${
              task.completed 
                ? "opacity-60 scale-[0.98]" 
                : "hover:shadow-lg hover:scale-[1.01]"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={task.completed ? "animate-scale-in" : ""}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1 transition-all duration-300"
                  />
                </div>
                <div className={`${getTaskColor(task.type)} mt-1`}>
                  {getTaskIcon(task.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>
                      {task.title}
                    </h3>
                    {getPriorityBadge(task.priority)}
                  </div>
                  {task.details && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.details}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{task.time}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  >
                    Take me to task
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
