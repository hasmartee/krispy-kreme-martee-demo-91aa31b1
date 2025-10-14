import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Trash2, ArrowRight } from "lucide-react";
import { useView } from "@/contexts/ViewContext";

interface Task {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Confirm Deliveries",
    description: "Log and confirm today's product deliveries",
    icon: Truck,
    path: "/suggested-production",
  },
  {
    id: "2",
    title: "Confirm Waste",
    description: "Record end of day waste for all products",
    icon: Trash2,
    path: "/daily-waste",
  },
];

export default function MyTasks() {
  const { viewMode } = useView();
  const navigate = useNavigate();

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Daily checklist for store operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
            onClick={() => navigate(task.path)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <task.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate(task.path)}>
                Go to Task
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
