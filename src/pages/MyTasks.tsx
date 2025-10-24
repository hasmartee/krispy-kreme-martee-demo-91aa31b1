import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Truck, Trash2, ArrowRight, Clock, Trophy, Zap, Star, Sparkles, CheckSquare } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  path: string;
  completed: boolean;
}

export default function MyTasks() {
  const { viewMode, selectedStore } = useView();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Confirm Deliveries",
      description: "Log and confirm today's product deliveries",
      time: "Morning",
      icon: Truck,
      path: "/suggested-production",
      completed: false,
    },
    {
      id: "2",
      title: "Log Waste",
      description: "Record end of day waste for all products",
      time: "End of Day",
      icon: Trash2,
      path: "/daily-waste",
      completed: false,
    },
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        
        if (newCompleted) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
          
          const messages = [
            { title: "🎉 Task Crushed!", description: "You're on fire!" },
            { title: "⚡ Boom! Done!", description: "Keep that momentum going!" },
            { title: "✨ Nailed it!", description: "Another one bites the dust!" },
            { title: "🚀 Unstoppable!", description: "You're killing it today!" },
            { title: "💪 Amazing work!", description: "Nothing can stop you!" },
          ];
          
          const message = messages[Math.floor(Math.random() * messages.length)];
          
          if (newStreak > 0 && newStreak % 2 === 0) {
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
          if (streak > 0) setStreak(Math.max(0, streak - 1));
        }
        
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const handleTaskClick = (task: Task) => {
    if (task.path) {
      navigate(task.path);
    }
  };

  if (viewMode === "hq") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Tasks view is only available for store managers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
                  color: ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981'][Math.floor(Math.random() * 3)],
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
            {selectedStore} - {formattedDate}
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
                <Trophy className="h-6 w-6 text-[#10b981] animate-pulse" />
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
              <div className="flex items-center gap-2 text-[#10b981] animate-fade-in">
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
        {tasks.map((task) => (
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
                <div className="text-primary mt-1">
                  <task.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>
                      {task.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{task.time}</span>
                  </div>
                  {task.path && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                    >
                      Go to Task
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
