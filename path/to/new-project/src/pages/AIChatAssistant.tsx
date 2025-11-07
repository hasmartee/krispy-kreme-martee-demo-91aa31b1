import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, TrendingUp, Package, Store, Sparkles, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock sales database with actual data
const salesDatabase = {
  dailySales: [
    { date: "2025-01-20", day: "Monday", products: { "BLT Sandwich": 45, "Chicken Caesar Wrap": 38, "Mediterranean Salad": 32, "Tuna Melt Panini": 28, "Avocado Wrap": 35 }, total: 178 },
    { date: "2025-01-21", day: "Tuesday", products: { "BLT Sandwich": 42, "Chicken Caesar Wrap": 40, "Mediterranean Salad": 28, "Tuna Melt Panini": 30, "Avocado Wrap": 32 }, total: 172 },
    { date: "2025-01-22", day: "Wednesday", products: { "BLT Sandwich": 48, "Chicken Caesar Wrap": 42, "Mediterranean Salad": 35, "Tuna Melt Panini": 32, "Avocado Wrap": 38 }, total: 195 },
    { date: "2025-01-23", day: "Thursday", products: { "BLT Sandwich": 52, "Chicken Caesar Wrap": 45, "Mediterranean Salad": 38, "Tuna Melt Panini": 35, "Avocado Wrap": 40 }, total: 210 },
    { date: "2025-01-24", day: "Friday", products: { "BLT Sandwich": 58, "Chicken Caesar Wrap": 48, "Mediterranean Salad": 42, "Tuna Melt Panini": 38, "Avocado Wrap": 45 }, total: 231 },
    { date: "2025-01-25", day: "Saturday", products: { "BLT Sandwich": 55, "Chicken Caesar Wrap": 52, "Mediterranean Salad": 45, "Tuna Melt Panini": 40, "Avocado Wrap": 48 }, total: 240 },
    { date: "2025-01-26", day: "Sunday", products: { "BLT Sandwich": 48, "Chicken Caesar Wrap": 45, "Mediterranean Salad": 38, "Tuna Melt Panini": 35, "Avocado Wrap": 42 }, total: 208 },
  ],
  categories: [
    { name: "Sandwiches", sales: 450, waste: 8 },
    { name: "Wraps", sales: 380, waste: 6 },
    { name: "Salads", sales: 290, waste: 12 },
    { name: "Hot Food", sales: 220, waste: 10 },
  ],
  stores: [
    { name: "London Bridge", cluster: "Flagship", sales: 285, availability: 96 },
    { name: "Canary Wharf", cluster: "Business District", sales: 268, availability: 94 },
    { name: "King's Cross", cluster: "Transport Hub", sales: 242, availability: 92 },
    { name: "Shoreditch", cluster: "High Street", sales: 225, availability: 95 },
  ]
};

interface Message {
  role: "user" | "assistant";
  content: string;
  charts?: Array<{
    type: "line" | "bar";
    data: any[];
    title: string;
  }>;
}

const AIChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm the Martee AI Brain. Ask me anything about your products, stores, sales, or recommendations. I can provide insights with visualisations to help you make better decisions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateDataDrivenResponse = (question: string): Message => {
    const lowerQuestion = question.toLowerCase();
    
    // Check for specific day queries
    if (lowerQuestion.includes("thursday") || lowerQuestion.includes("last week")) {
      const thursdayData = salesDatabase.dailySales.find(d => d.day === "Thursday");
      if (thursdayData) {
        const bestSelling = Object.entries(thursdayData.products).sort((a, b) => b[1] - a[1])[0];
        
        return {
          role: "assistant",
          content: `On Thursday (${thursdayData.date}), your best-selling product was **${bestSelling[0]}** with ${bestSelling[1]} units sold. Total sales for the day were ${thursdayData.total} units. Here's the breakdown of all products:`,
          charts: [
            {
              type: "bar",
              title: "Thursday Sales by Product",
              data: Object.entries(thursdayData.products).map(([product, sales]) => ({
                product: product.split(' ').slice(0, 2).join(' '),
                sales
              }))
            }
          ]
        };
      }
    }
    
    if (lowerQuestion.includes("best") && lowerQuestion.includes("sell")) {
      const allProducts = salesDatabase.dailySales.reduce((acc, day) => {
        Object.entries(day.products).forEach(([product, sales]) => {
          acc[product] = (acc[product] || 0) + sales;
        });
        return acc;
      }, {} as Record<string, number>);
      
      const topProduct = Object.entries(allProducts).sort((a, b) => b[1] - a[1])[0];
      
      return {
        role: "assistant",
        content: `Your best-selling product overall is **${topProduct[0]}** with ${topProduct[1]} total units sold across the week. Here's how all products compare:`,
        charts: [
          {
            type: "bar",
            title: "Weekly Sales by Product",
            data: Object.entries(allProducts).map(([product, sales]) => ({
              product: product.split(' ').slice(0, 2).join(' '),
              sales
            })).sort((a, b) => b.sales - a.sales)
          }
        ]
      };
    }
    
    if (lowerQuestion.includes("sales") || lowerQuestion.includes("trend") || lowerQuestion.includes("week")) {
      return {
        role: "assistant",
        content: "Based on your recent sales data, I can see a positive trend throughout the week, peaking on Saturday. Total weekly sales were 1,434 units. Here's the breakdown:",
        charts: [
          {
            type: "line",
            title: "Sales Trend - Past Week",
            data: salesDatabase.dailySales.map(d => ({
              day: d.day.slice(0, 3),
              sales: d.total
            })),
          },
        ],
      };
    } else if (lowerQuestion.includes("product") || lowerQuestion.includes("category")) {
      return {
        role: "assistant",
        content: "Your product mix shows strong performance across categories. Sandwiches are your top sellers with 450 units, followed by wraps (380) and salads (290). Note that salads have a higher waste rate at 12%. Here's the breakdown:",
        charts: [
          {
            type: "bar",
            title: "Sales by Category",
            data: salesDatabase.categories.map(c => ({
              category: c.name,
              sales: c.sales,
              waste: c.waste
            })),
          },
        ],
      };
    } else if (lowerQuestion.includes("store") || lowerQuestion.includes("location")) {
      return {
        role: "assistant",
        content: `Your Flagship store (London Bridge) leads with 285 units sold and 96% availability. Business District (Canary Wharf) follows with 268 units. Here's the detailed performance:`,
        charts: [
          {
            type: "bar",
            title: "Sales by Store Location",
            data: salesDatabase.stores.map(s => ({
              store: s.name,
              sales: s.sales
            })),
          },
        ],
      };
    } else if (lowerQuestion.includes("waste") || lowerQuestion.includes("reduce")) {
      return {
        role: "assistant",
        content: "Your waste levels are within acceptable range at 8.2%, but there's room for improvement. Salads show higher waste rates (12%) compared to sandwiches (6%). Consider reducing salad orders by 10-15% in low-performing locations.",
      };
    } else if (lowerQuestion.includes("recommend") || lowerQuestion.includes("suggest")) {
      return {
        role: "assistant",
        content: "Based on current trends, I recommend: 1) Increase BLT sandwich stock by 15% for Flagship stores, 2) Introduce seasonal salads in Business District locations, 3) Optimise wrap varieties in Transport Hubs during morning hours.",
      };
    } else {
      return {
        role: "assistant",
        content: "I can help you with questions about sales trends, product performance, store comparisons, waste reduction, and order recommendations. Try asking about any of these topics!",
      };
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse = generateDataDrivenResponse(input);
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 800);
  };

  const renderChart = (chart: { type: "line" | "bar"; data: any[]; title: string }) => {
    if (chart.type === "line") {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">{chart.title}</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    } else {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">{chart.title}</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(chart.data[0])[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={Object.keys(chart.data[0])[1]} fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff914d]/5 via-background to-[#7ea058]/5 animate-gradient" />
      
      {/* Floating orbs animation */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#ff914d]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#7ea058]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Dramatic header with glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff914d]/20 to-[#7ea058]/20 blur-2xl" />
          <div className="relative flex items-center gap-4 p-6 rounded-2xl border border-[#ff914d]/30 bg-card/80 backdrop-blur-sm shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff914d] to-[#7ea058] rounded-xl blur-md animate-pulse" />
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#ff914d] to-[#7ea058] flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8 text-white animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff914d] via-purple-500 to-[#7ea058] bg-clip-text text-transparent animate-gradient">
                Ask the Martee AI Brain
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#ff914d]" />
                Powered by advanced AI • Get instant insights
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced capability cards with hover effects */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:border-[#ff914d]/50 border-2 border-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                Sales Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-xs text-muted-foreground">Ask about sales trends and performance metrics</p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:border-[#ff914d]/50 border-2 border-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff914d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#ff914d]/10 group-hover:bg-[#ff914d]/20 transition-colors">
                  <Package className="h-4 w-4 text-[#ff914d]" />
                </div>
                Product Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-xs text-muted-foreground">Deep dive into product category insights</p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:border-[#7ea058]/50 border-2 border-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7ea058]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#7ea058]/10 group-hover:bg-[#7ea058]/20 transition-colors">
                  <Store className="h-4 w-4 text-[#7ea058]" />
                </div>
                Store Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-xs text-muted-foreground">Compare store clusters and locations</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced chat card with glowing border */}
        <Card className="shadow-2xl border-2 border-[#ff914d]/30 bg-card/90 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff914d]/5 via-transparent to-[#7ea058]/5" />
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ff914d] animate-pulse" />
              <CardTitle className="text-xl bg-gradient-to-r from-[#ff914d] to-[#7ea058] bg-clip-text text-transparent">
                Chat with Martee AI
              </CardTitle>
            </div>
            <CardDescription>Ask questions and get data-driven insights with visualizations</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              <div className="h-[500px] overflow-y-auto space-y-3 p-4 bg-gradient-to-b from-muted/20 to-muted/10 rounded-lg border border-border/50 backdrop-blur-sm">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 shadow-lg transition-all hover:scale-[1.02] ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-[#ff914d] to-[#ff914d]/80 text-white"
                          : "bg-card border-2 border-[#7ea058]/20 hover:border-[#7ea058]/40"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2 text-[#ff914d]">
                          <Brain className="h-4 w-4" />
                          <span className="text-xs font-semibold">Martee AI</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.charts?.map((chart, chartIndex) => (
                        <div key={chartIndex}>{renderChart(chart)}</div>
                      ))}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-card border-2 border-[#7ea058]/30 rounded-xl p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="h-4 w-4 text-[#ff914d] animate-pulse" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#ff914d] animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-[#ff914d] animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 rounded-full bg-[#ff914d] animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask me anything about your sales, products, or stores..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="min-h-[80px] border-2 border-border focus:border-[#ff914d]/50 transition-colors"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-br from-[#ff914d] to-[#ff914d]/80 hover:from-[#ff914d]/90 hover:to-[#ff914d]/70 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChatAssistant;
