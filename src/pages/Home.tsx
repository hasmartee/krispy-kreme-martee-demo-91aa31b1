import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Trash2, CheckCircle, ArrowRight, ClipboardCheck, BrainCircuit, Sparkles, Users, CloudRain, AlertTriangle, Bell, TrendingDown, MessageSquare, Package, Truck, Clock } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  path: string;
  completed: boolean;
}

function ShareWithHQCard() {
  const [messageType, setMessageType] = useState<string>('comment');
  const [priority, setPriority] = useState<string>('medium');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

      const { error } = await (supabase as any)
        .from('team_messages')
        .insert({
          user_id: user.id,
          store_id: profile?.store_id || null,
          message_type: messageType,
          subject: subject.trim(),
          message: message.trim(),
          priority,
          status: 'new',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your message has been sent to HQ",
      });

      // Reset form
      setSubject('');
      setMessage('');
      setMessageType('comment');
      setPriority('medium');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-2 border-primary shadow-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Share with HQ</CardTitle>
            <CardDescription className="text-base">
              Have insights, concerns, or feedback? Let headquarters know what's happening.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Message Type</label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="observation">Observation</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="equipment">Equipment Problem</SelectItem>
                <SelectItem value="delivery">Delivery Issue</SelectItem>
                <SelectItem value="contamination">Contamination</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Subject</label>
          <Input 
            placeholder="Brief summary of your message..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-background/50 border-primary/20 focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Message</label>
          <Textarea 
            placeholder="Share your comments, observations, or suggestions for HQ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] resize-none bg-background/50 border-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex justify-end">
          <Button 
            size="lg" 
            className="gap-2 shadow-md"
            onClick={handleSendMessage}
            disabled={isSending}
          >
            <MessageSquare className="h-5 w-5" />
            {isSending ? 'Sending...' : 'Send to HQ'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { viewMode, selectedStore } = useView();
  const navigate = useNavigate();
  const { toast } = useToast();

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
          toast({
            title: "✓ Task Completed!",
            description: "Great work!",
          });
        }
        
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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

// Weekly trend data for HQ view
const weeklyTrendData = [
  { day: "Mon", delivered: 8750, sold: 8100, wasted: 420 },
  { day: "Tue", delivered: 8950, sold: 8300, wasted: 385 },
  { day: "Wed", delivered: 9200, sold: 8650, wasted: 360 },
  { day: "Thu", delivered: 8880, sold: 8250, wasted: 410 },
  { day: "Fri", delivered: 9500, sold: 9100, wasted: 380 },
  { day: "Sat", delivered: 9800, sold: 9450, wasted: 340 },
  { day: "Sun", delivered: 9100, sold: 8520, wasted: 395 },
];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  // Weekly trend data for single store (Camden Town) 
  const weeklyTrendDataStore = [
    { day: "Mon", delivered: 320, sold: 298, wasted: 18 },
    { day: "Tue", delivered: 305, sold: 282, wasted: 16 },
    { day: "Wed", delivered: 335, sold: 315, wasted: 14 },
    { day: "Thu", delivered: 310, sold: 289, wasted: 15 },
    { day: "Fri", delivered: 360, sold: 345, wasted: 12 },
    { day: "Sat", delivered: 385, sold: 370, wasted: 13 },
    { day: "Sun", delivered: 340, sold: 318, wasted: 16 },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Blank page for manufacturing view */}
      {viewMode === "manufacturing" ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Manufacturing Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome to the manufacturing view
            </p>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome Back{viewMode === "store_manager" ? ` - ${selectedStore}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening this week
        </p>
      </div>

      {/* My Tasks Section - Store Manager Only */}
      {viewMode === "store_manager" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">My Tasks</h2>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {completedCount}/{totalCount}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="shadow-md bg-gradient-to-r from-background to-primary/5 border-orange-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily Progress</span>
                  <span className="text-sm font-medium text-primary">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Task Cards */}
          <div className="grid gap-3">
            {tasks.map((task) => (
              <Card 
                key={task.id}
                className={`transition-all duration-200 border-orange-200 ${
                  task.completed 
                    ? "opacity-60 bg-gradient-to-r from-green-50 to-emerald-50" 
                    : "bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 hover:shadow-lg shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                      <task.icon className="h-5 w-5 text-orange-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-semibold text-foreground mb-1 ${task.completed ? "line-through" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{task.time}</span>
                      </div>
                      {task.path && !task.completed && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(task.path)}
                          className="border-orange-300 hover:bg-orange-300"
                        >
                          Go
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Actions Section - HQ Only */}
      {viewMode === "hq" && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">My Actions</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Card 
              className="bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 hover:shadow-lg shadow-md transition-all duration-200 border-orange-200 cursor-pointer"
              onClick={() => navigate("/suggested-production")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-orange-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      Confirm Production Volumes
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Review and approve tomorrow's production
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-orange-700 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 hover:shadow-lg shadow-md transition-all duration-200 border-orange-200 cursor-pointer"
              onClick={() => navigate("/inventory")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <BrainCircuit className="h-5 w-5 text-orange-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      Review Stock Insights
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Check AI-powered inventory recommendations
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-orange-700 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* My Actions Section - Manufacturing Only */}
      {viewMode === "manufacturing" && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">My Actions</h2>
          <div className="grid gap-3 md:grid-cols-1 max-w-md">
            <Card 
              className="bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 hover:shadow-lg shadow-md transition-all duration-200 border-orange-200 cursor-pointer"
              onClick={() => navigate("/production")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-orange-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      View Production Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Track and update manufacturing quantities
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-orange-700 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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

          {/* Weekly Trend Graph */}
          <Card className="shadow-lg border-2 border-primary/20 animate-fade-in">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      📊
                    </div>
                    Week Overview
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Track delivered, sold, and wasted quantities across the week
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={weeklyTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--foreground))"
                    fontSize={13}
                    fontWeight={500}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    fontSize={13}
                    fontWeight={500}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "2px solid hsl(var(--border))",
                      borderRadius: "12px",
                      padding: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                    }}
                    labelStyle={{
                      color: "hsl(var(--foreground))",
                      fontWeight: "bold",
                      marginBottom: "8px"
                    }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString() + " units",
                      name
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: "20px"
                    }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="delivered" 
                    fill="url(#deliveredGradient)" 
                    name="Delivered"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sold" 
                    stroke="hsl(var(--success-green))" 
                    strokeWidth={4}
                    name="Sold"
                    dot={{ 
                      fill: "hsl(var(--success-green))", 
                      r: 6,
                      strokeWidth: 2,
                      stroke: "hsl(var(--background))"
                    }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wasted" 
                    stroke="hsl(var(--warning-orange))" 
                    strokeWidth={4}
                    name="Wasted"
                    dot={{ 
                      fill: "hsl(var(--warning-orange))", 
                      r: 6,
                      strokeWidth: 2,
                      stroke: "hsl(var(--background))"
                    }}
                    activeDot={{ r: 8 }}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* Summary Statistics */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 hover-scale">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Package className="h-6 w-6" style={{ color: 'hsl(var(--accent))' }} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Total Delivered</div>
                      <div className="text-2xl font-bold text-foreground">
                        {weeklyTrendData.reduce((sum, d) => sum + d.delivered, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">units this week</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover-scale">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: 'hsl(var(--success-green) / 0.2)' }}>
                      <div className="h-full w-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6" style={{ color: 'hsl(var(--success-green))' }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Total Sold</div>
                      <div className="text-2xl font-bold" style={{ color: 'hsl(var(--success-green))' }}>
                        {weeklyTrendData.reduce((sum, d) => sum + d.sold, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((weeklyTrendData.reduce((sum, d) => sum + d.sold, 0) / 
                          weeklyTrendData.reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 hover-scale">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: 'hsl(var(--warning-orange) / 0.2)' }}>
                      <div className="h-full w-full flex items-center justify-center">
                        <Trash2 className="h-6 w-6" style={{ color: 'hsl(var(--warning-orange))' }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Total Wasted</div>
                      <div className="text-2xl font-bold" style={{ color: 'hsl(var(--warning-orange))' }}>
                        {weeklyTrendData.reduce((sum, d) => sum + d.wasted, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((weeklyTrendData.reduce((sum, d) => sum + d.wasted, 0) / 
                          weeklyTrendData.reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Day Badge */}
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">
                  <strong>Best performing day:</strong> {
                    weeklyTrendData.reduce((prev, current) => 
                      current.sold > prev.sold ? current : prev
                    ).day
                  } with {
                    weeklyTrendData.reduce((prev, current) => 
                      current.sold > prev.sold ? current : prev
                    ).sold.toLocaleString()
                  } units sold
                </span>
              </div>
            </CardContent>
          </Card>

        </>
      ) : (
        /* Store Manager View - Keep existing content */
        <>
          {/* Attention Required - Compact Alert */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-foreground">Attention Required</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-amber-600" />
                  <span className="text-muted-foreground">Waste variance:</span>
                  <span className="font-medium text-amber-600">+133%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-600" />
                  <span className="text-muted-foreground">Delivery shortfall:</span>
                  <span className="font-medium text-amber-600">-4.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Weekly Trend - Store View */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Weekly Performance</CardTitle>
                  <p className="text-muted-foreground mt-1">Delivered, sold and wasted this week</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={weeklyTrendDataStore} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--foreground))"
                    fontSize={13}
                    fontWeight={500}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    fontSize={13}
                    fontWeight={500}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "2px solid hsl(var(--border))",
                      borderRadius: "12px",
                      padding: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                    }}
                    labelStyle={{
                      color: "hsl(var(--foreground))",
                      fontWeight: "bold",
                      marginBottom: "8px"
                    }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString() + " units",
                      name
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: "20px"
                    }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="delivered" 
                    fill="url(#deliveredGradient)" 
                    name="Delivered"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sold" 
                    stroke="hsl(var(--success-green))" 
                    strokeWidth={4}
                    name="Sold"
                    dot={{ 
                      fill: "hsl(var(--success-green))", 
                      r: 6,
                      strokeWidth: 2,
                      stroke: "hsl(var(--background))"
                    }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wasted" 
                    stroke="hsl(var(--warning-orange))" 
                    strokeWidth={4}
                    name="Wasted"
                    dot={{ 
                      fill: "hsl(var(--warning-orange))", 
                      r: 6,
                      strokeWidth: 2,
                      stroke: "hsl(var(--background))"
                    }}
                    activeDot={{ r: 8 }}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* Summary Statistics */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 hover-scale">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Package className="h-6 w-6" style={{ color: 'hsl(var(--accent))' }} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Total Delivered</div>
                      <div className="text-2xl font-bold text-foreground">
                        {weeklyTrendDataStore.reduce((sum, d) => sum + d.delivered, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">units this week</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 hover-scale">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: 'hsl(var(--success-green) / 0.2)' }}>
                      <div className="h-full w-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6" style={{ color: 'hsl(var(--success-green))' }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Total Sold</div>
                      <div className="text-2xl font-bold" style={{ color: 'hsl(var(--success-green))' }}>
                        {weeklyTrendDataStore.reduce((sum, d) => sum + d.sold, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((weeklyTrendDataStore.reduce((sum, d) => sum + d.sold, 0) / 
                          weeklyTrendDataStore.reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 hover-scale">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: 'hsl(var(--warning-orange) / 0.2)' }}>
                      <div className="h-full w-full flex items-center justify-center">
                        <Trash2 className="h-6 w-6" style={{ color: 'hsl(var(--warning-orange))' }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Total Wasted</div>
                      <div className="text-2xl font-bold" style={{ color: 'hsl(var(--warning-orange))' }}>
                        {weeklyTrendDataStore.reduce((sum, d) => sum + d.wasted, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((weeklyTrendDataStore.reduce((sum, d) => sum + d.wasted, 0) / 
                          weeklyTrendDataStore.reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Day Badge */}
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">
                  <strong>Best performing day:</strong> {
                    weeklyTrendDataStore.reduce((prev, current) => 
                      current.sold > prev.sold ? current : prev
                    ).day
                  } with {
                    weeklyTrendDataStore.reduce((prev, current) => 
                      current.sold > prev.sold ? current : prev
                    ).sold.toLocaleString()
                  } units sold
                </span>
              </div>
            </CardContent>
          </Card>

        </>
      )}

      {/* Today's Context - Store Manager Only - Compact */}
      {viewMode === "store_manager" && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <CloudRain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Weather</p>
                <p className="text-sm font-semibold">Rainy, 12°C</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Alert</p>
                <p className="text-sm font-semibold">Train strike - Lower footfall</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </>
      )}
    </div>
  );
}
