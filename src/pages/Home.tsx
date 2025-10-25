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
    {
      id: "3",
      title: "Log Stock Adjustments",
      description: "Record any stock discrepancies or adjustments",
      time: "As Needed",
      icon: Package,
      path: "/stock-adjustments",
      completed: false,
    },
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        
        if (newCompleted) {
          // Create celebration effect
          const celebrationElement = document.createElement('div');
          celebrationElement.className = 'celebration-burst';
          celebrationElement.innerHTML = '⭐✨🎉✨⭐';
          celebrationElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            z-index: 9999;
            pointer-events: none;
            animation: celebrate 1s ease-out forwards;
          `;
          document.body.appendChild(celebrationElement);
          
          setTimeout(() => celebrationElement.remove(), 1000);
          
          toast({
            title: "✓ Task Completed!",
            description: "Great work! Keep it up! 🌟",
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

  // 14-day production forecast data for manufacturing view
  const productionForecastData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    
    const glazed = Math.floor(2500 + Math.random() * 500);
    const iced = Math.floor(1800 + Math.random() * 400);
    const filled = Math.floor(1500 + Math.random() * 300);
    const cake = Math.floor(1200 + Math.random() * 300);
    const specialty = Math.floor(1000 + Math.random() * 200);
    
    return {
      day: `${dayName} ${dateStr}`,
      Glazed: glazed,
      Iced: iced,
      Filled: filled,
      Cake: cake,
      Specialty: specialty,
      total: glazed + iced + filled + cake + specialty,
    };
  });

  // Last 7 days production data for manufacturing view
  const last7DaysData = {
    planned: 58500,
    produced: 54200,
  };
  const variance = last7DaysData.produced - last7DaysData.planned;
  const variancePercent = ((variance / last7DaysData.planned) * 100).toFixed(1);
  const fidelityLevel = Math.abs(parseFloat(variancePercent)) < 3 ? 'high' : Math.abs(parseFloat(variancePercent)) < 7 ? 'medium' : 'low';

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {viewMode === "store_manager" ? "Welcome Back Camden Town" : viewMode === "manufacturing" ? "Manufacturing Dashboard" : "Welcome Back"}
        </h1>
        <p className="text-muted-foreground">
          {viewMode === "manufacturing" ? "Production planning and overview" : "Here's what's happening this week"}
        </p>
      </div>

      {/* Manufacturing View */}
      {viewMode === "manufacturing" && (
        <>
          {/* My Actions Section */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">My Actions</h2>
            <div className="grid gap-3">
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
                        Log Today's Production
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Record daily production quantities
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-orange-700 shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 hover:shadow-lg shadow-md transition-all duration-200 border-orange-200 cursor-pointer"
                onClick={() => {
                  const forecastElement = document.getElementById('production-forecast');
                  if (forecastElement) {
                    forecastElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                      <BrainCircuit className="h-5 w-5 text-orange-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        Review Production Plans
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        View 14-day production forecast
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-orange-700 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Last 7 Days Performance */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Last 7 Days</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-md border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground font-medium">Planned Volume</div>
                    <div className="text-3xl font-bold text-foreground">
                      {last7DaysData.planned.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">units scheduled</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground font-medium">Produced Volume</div>
                    <div className="text-3xl font-bold text-foreground">
                      {last7DaysData.produced.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">units produced</div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`shadow-md border-2 ${
                fidelityLevel === 'high' ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' :
                fidelityLevel === 'medium' ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20' :
                'border-red-200 bg-red-50/50 dark:bg-red-950/20'
              }`}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground font-medium">Variance</div>
                      <Badge variant={
                        fidelityLevel === 'high' ? 'default' :
                        fidelityLevel === 'medium' ? 'secondary' : 'destructive'
                      } className="text-xs">
                        {fidelityLevel === 'high' ? 'High Fidelity' :
                         fidelityLevel === 'medium' ? 'Medium Fidelity' : 'Low Fidelity'}
                      </Badge>
                    </div>
                    <div className={`text-3xl font-bold ${
                      fidelityLevel === 'high' ? 'text-green-600' :
                      fidelityLevel === 'medium' ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {variance >= 0 ? '+' : ''}{variance.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {variancePercent}% {variance >= 0 ? 'over' : 'under'} plan
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 14-Day Production Forecast Chart */}
          <Card id="production-forecast" className="shadow-lg border-2 border-primary/20 animate-fade-in scroll-mt-6">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      📊
                    </div>
                    14-Day Production Forecast
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Expected production volumes by product category
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={productionForecastData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                  <defs>
                    <linearGradient id="glazedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f8b29c" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#f8b29c" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="icedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7ea058" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#7ea058" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="filledGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3e5c39" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3e5c39" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="cakeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffd580" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#ffd580" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="specialtyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff914d" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#ff914d" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--foreground))"
                    fontSize={11}
                    fontWeight={500}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                    formatter={(value: number, name: string, props: any) => {
                      if (name === 'Total') {
                        return [value.toLocaleString() + " units", "Total Volume"];
                      }
                      return [value.toLocaleString() + " units", name];
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
                        return (
                          <div style={{
                            backgroundColor: "hsl(var(--card))",
                            border: "2px solid hsl(var(--border))",
                            borderRadius: "12px",
                            padding: "12px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                          }}>
                            <p style={{ color: "hsl(var(--foreground))", fontWeight: "bold", marginBottom: "8px" }}>{label}</p>
                            {payload.map((entry: any, index: number) => (
                              <p key={index} style={{ color: entry.color, margin: "4px 0" }}>
                                {entry.name}: {entry.value.toLocaleString()} units
                              </p>
                            ))}
                            <div style={{ borderTop: "1px solid hsl(var(--border))", marginTop: "8px", paddingTop: "8px" }}>
                              <p style={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}>
                                Total: {total.toLocaleString()} units
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: "20px"
                    }}
                    iconType="square"
                  />
                  <Bar dataKey="Glazed" stackId="a" fill="url(#glazedGradient)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Iced" stackId="a" fill="url(#icedGradient)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Filled" stackId="a" fill="url(#filledGradient)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Cake" stackId="a" fill="url(#cakeGradient)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Specialty" stackId="a" fill="url(#specialtyGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Summary Statistics */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Glazed", color: "#f8b29c", total: productionForecastData.reduce((sum, d) => sum + d.Glazed, 0) },
                  { label: "Iced", color: "#7ea058", total: productionForecastData.reduce((sum, d) => sum + d.Iced, 0) },
                  { label: "Filled", color: "#3e5c39", total: productionForecastData.reduce((sum, d) => sum + d.Filled, 0) },
                  { label: "Cake", color: "#ffd580", total: productionForecastData.reduce((sum, d) => sum + d.Cake, 0) },
                  { label: "Specialty", color: "#ff914d", total: productionForecastData.reduce((sum, d) => sum + d.Specialty, 0) },
                ].map((category) => (
                  <div key={category.label} className="p-4 rounded-lg border hover-scale" style={{ 
                    backgroundColor: `${category.color}15`,
                    borderColor: `${category.color}30`
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded" style={{ backgroundColor: category.color }} />
                      <div className="text-xs text-muted-foreground font-medium">{category.label}</div>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {category.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total 14 days</div>
                  </div>
                ))}
              </div>

              {/* Overall Total */}
              <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Total Production Forecast (14 days)</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {productionForecastData.reduce((sum, d) => sum + d.Glazed + d.Iced + d.Filled + d.Cake + d.Specialty, 0).toLocaleString()} units
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Store Manager View */}
      {viewMode === "store_manager" && (
        <>
          {/* My Tasks Section - Store Manager Only */}
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

          {/* This Week's Performance - Store Manager */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">This Week's Performance</h2>
            </div>
          </div>

          {/* Store KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-md border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground font-medium">Revenue</div>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">£8,945</div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+12.3% vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground font-medium">Gross Profit</div>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-foreground">£5,425</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-muted-foreground">60.6% margin</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-2 border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground font-medium">Waste</div>
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-600">£385</div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">4.3% of total</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground font-medium">Unaccounted Items</div>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-amber-600">42</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-muted-foreground">0.5% variance</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Leaderboard Ranking */}
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Camden Town Store Ranking
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Your position in the network this week
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-200">
                  <div className="text-sm text-muted-foreground font-medium mb-2">Revenue Rank</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-foreground">#12</div>
                    <div className="text-sm text-muted-foreground">of 25 stores</div>
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">↑ 2 positions</div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-200">
                  <div className="text-sm text-muted-foreground font-medium mb-2">Waste Rank</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-foreground">#8</div>
                    <div className="text-sm text-muted-foreground">of 25 stores</div>
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">↑ 3 positions (Lower is better)</div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200">
                  <div className="text-sm text-muted-foreground font-medium mb-2">Efficiency Rank</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-foreground">#15</div>
                    <div className="text-sm text-muted-foreground">of 25 stores</div>
                  </div>
                  <div className="mt-2 text-xs text-amber-600 font-medium">→ No change</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Volumes Chart */}
          <Card className="shadow-lg border-2 border-primary/20 animate-fade-in">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      📊
                    </div>
                    Weekly Volumes
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Delivered, sold, and wasted quantities this week
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={[
                  { day: "Mon", delivered: 850, sold: 790, wasted: 45 },
                  { day: "Tue", delivered: 820, sold: 765, wasted: 38 },
                  { day: "Wed", delivered: 890, sold: 835, wasted: 42 },
                  { day: "Thu", delivered: 870, sold: 810, wasted: 48 },
                  { day: "Fri", delivered: 920, sold: 880, wasted: 35 },
                  { day: "Sat", delivered: 980, sold: 945, wasted: 32 },
                  { day: "Sun", delivered: 900, sold: 845, wasted: 40 },
                ]} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="storeDeliveredGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--brand-peach))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--brand-peach))" stopOpacity={0.3}/>
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
                    fill="url(#storeDeliveredGradient)" 
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
            </CardContent>
          </Card>

          {/* Top 5 Products Leaderboard */}
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Top 5 Products This Week
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Best selling products at Camden Town
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  { rank: 1, name: "Original Glazed", sold: 1245, revenue: "£1,869", change: "+8%" },
                  { rank: 2, name: "Chocolate Iced Glazed", sold: 1128, revenue: "£1,692", change: "+12%" },
                  { rank: 3, name: "Strawberry Iced with Sprinkles", sold: 985, revenue: "£1,478", change: "+5%" },
                  { rank: 4, name: "Boston Kreme", sold: 892, revenue: "£1,338", change: "+15%" },
                  { rank: 5, name: "Raspberry Filled", sold: 845, revenue: "£1,268", change: "+3%" },
                ].map((product) => (
                  <div 
                    key={product.rank} 
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover-scale ${
                      product.rank === 1 
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300' 
                        : product.rank === 2
                        ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300'
                        : product.rank === 3
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      product.rank === 1 
                        ? 'bg-amber-500 text-white' 
                        : product.rank === 2
                        ? 'bg-gray-400 text-white'
                        : product.rank === 3
                        ? 'bg-orange-500 text-white'
                        : 'bg-muted text-foreground'
                    }`}>
                      {product.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-foreground">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.sold.toLocaleString()} units sold</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">{product.revenue}</div>
                      <div className="text-sm text-green-600 font-medium">{product.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Share with HQ */}
          <ShareWithHQCard />
        </>
      )}

      {/* HQ View */}
      {viewMode === "hq" && (
        <>
          {/* My Actions Section - HQ Only */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">My Actions</h2>
            <div className="grid gap-3">
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
                onClick={() => navigate("/live-data")}
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

              <Card 
                className="bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 hover:shadow-lg shadow-md transition-all duration-200 border-orange-200 cursor-pointer"
                onClick={() => navigate("/store-products")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-orange-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        Review Range Insights
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Check AI product range recommendations
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-orange-700 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

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
                <ComposedChart data={[
                  { day: "Mon", delivered: 8750, sold: 8100, wasted: 420 },
                  { day: "Tue", delivered: 8950, sold: 8300, wasted: 385 },
                  { day: "Wed", delivered: 9200, sold: 8650, wasted: 360 },
                  { day: "Thu", delivered: 8880, sold: 8250, wasted: 410 },
                  { day: "Fri", delivered: 9500, sold: 9100, wasted: 380 },
                  { day: "Sat", delivered: 9800, sold: 9450, wasted: 340 },
                  { day: "Sun", delivered: 9100, sold: 8520, wasted: 395 },
                ]} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--brand-peach))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--brand-peach))" stopOpacity={0.3}/>
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
                <div className="p-4 rounded-lg border hover-scale" style={{ backgroundColor: 'hsl(var(--brand-peach) / 0.1)', borderColor: 'hsl(var(--brand-peach) / 0.3)' }}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--brand-peach) / 0.2)' }}>
                      <Package className="h-6 w-6" style={{ color: 'hsl(var(--brand-peach))' }} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Total Delivered</div>
                      <div className="text-2xl font-bold text-foreground">
                        {[
                          { day: "Mon", delivered: 8750 },
                          { day: "Tue", delivered: 8950 },
                          { day: "Wed", delivered: 9200 },
                          { day: "Thu", delivered: 8880 },
                          { day: "Fri", delivered: 9500 },
                          { day: "Sat", delivered: 9800 },
                          { day: "Sun", delivered: 9100 },
                        ].reduce((sum, d) => sum + d.delivered, 0).toLocaleString()}
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
                        {[
                          { day: "Mon", sold: 8100 },
                          { day: "Tue", sold: 8300 },
                          { day: "Wed", sold: 8650 },
                          { day: "Thu", sold: 8250 },
                          { day: "Fri", sold: 9100 },
                          { day: "Sat", sold: 9450 },
                          { day: "Sun", sold: 8520 },
                        ].reduce((sum, d) => sum + d.sold, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(([
                          { day: "Mon", sold: 8100, delivered: 8750 },
                          { day: "Tue", sold: 8300, delivered: 8950 },
                          { day: "Wed", sold: 8650, delivered: 9200 },
                          { day: "Thu", sold: 8250, delivered: 8880 },
                          { day: "Fri", sold: 9100, delivered: 9500 },
                          { day: "Sat", sold: 9450, delivered: 9800 },
                          { day: "Sun", sold: 8520, delivered: 9100 },
                        ].reduce((sum, d) => sum + d.sold, 0) / 
                          [
                            { day: "Mon", sold: 8100, delivered: 8750 },
                            { day: "Tue", sold: 8300, delivered: 8950 },
                            { day: "Wed", sold: 8650, delivered: 9200 },
                            { day: "Thu", sold: 8250, delivered: 8880 },
                            { day: "Fri", sold: 9100, delivered: 9500 },
                            { day: "Sat", sold: 9450, delivered: 9800 },
                            { day: "Sun", sold: 8520, delivered: 9100 },
                          ].reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
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
                        {[
                          { day: "Mon", wasted: 420 },
                          { day: "Tue", wasted: 385 },
                          { day: "Wed", wasted: 360 },
                          { day: "Thu", wasted: 410 },
                          { day: "Fri", wasted: 380 },
                          { day: "Sat", wasted: 340 },
                          { day: "Sun", wasted: 395 },
                        ].reduce((sum, d) => sum + d.wasted, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(([
                          { day: "Mon", wasted: 420, delivered: 8750 },
                          { day: "Tue", wasted: 385, delivered: 8950 },
                          { day: "Wed", wasted: 360, delivered: 9200 },
                          { day: "Thu", wasted: 410, delivered: 8880 },
                          { day: "Fri", wasted: 380, delivered: 9500 },
                          { day: "Sat", wasted: 340, delivered: 9800 },
                          { day: "Sun", wasted: 395, delivered: 9100 },
                        ].reduce((sum, d) => sum + d.wasted, 0) / 
                          [
                            { day: "Mon", wasted: 420, delivered: 8750 },
                            { day: "Tue", wasted: 385, delivered: 8950 },
                            { day: "Wed", wasted: 360, delivered: 9200 },
                            { day: "Thu", wasted: 410, delivered: 8880 },
                            { day: "Fri", wasted: 380, delivered: 9500 },
                            { day: "Sat", wasted: 340, delivered: 9800 },
                            { day: "Sun", wasted: 395, delivered: 9100 },
                          ].reduce((sum, d) => sum + d.delivered, 0)) * 100).toFixed(1)}% of delivered
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
                    [
                      { day: "Mon", sold: 8100 },
                      { day: "Tue", sold: 8300 },
                      { day: "Wed", sold: 8650 },
                      { day: "Thu", sold: 8250 },
                      { day: "Fri", sold: 9100 },
                      { day: "Sat", sold: 9450 },
                      { day: "Sun", sold: 8520 },
                    ].reduce((prev, current) => 
                      current.sold > prev.sold ? current : prev
                    ).day
                  } with {
                    [
                      { day: "Mon", sold: 8100 },
                      { day: "Tue", sold: 8300 },
                      { day: "Wed", sold: 8650 },
                      { day: "Thu", sold: 8250 },
                      { day: "Fri", sold: 9100 },
                      { day: "Sat", sold: 9450 },
                      { day: "Sun", sold: 8520 },
                    ].reduce((prev, current) => 
                      current.sold > prev.sold ? current : prev
                    ).sold.toLocaleString()
                  } units sold
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
