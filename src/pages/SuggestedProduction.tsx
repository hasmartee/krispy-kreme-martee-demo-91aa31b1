import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Calendar as CalendarIcon, RefreshCw, Plus, Minus, CloudRain, AlertTriangle, Sparkles, Download, Send, Settings as SettingsIcon, BookOpen, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-food.jpg";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/integrations/supabase/client";
import bltSandwich from "@/assets/products/blt-sandwich.jpg";
import chickenCaesarWrap from "@/assets/products/chicken-caesar-wrap.jpg";
import avocadoHummusWrap from "@/assets/products/avocado-hummus-wrap.jpg";
import salmonBagel from "@/assets/products/salmon-bagel.jpg";
import greekFetaSalad from "@/assets/products/greek-feta-salad.jpg";

// Recipe data
const recipes = {
  "SK001": {
    productName: "Classic BLT Sandwich",
    image: bltSandwich,
    prepTime: "5 minutes",
    ingredients: [
      { item: "Bacon", quantity: "3 rashers (60g)" },
      { item: "Romaine Lettuce", quantity: "2 leaves (30g)" },
      { item: "Tomato", quantity: "3 slices (50g)" },
      { item: "Whole Wheat Bread", quantity: "2 slices (80g)" },
      { item: "Mayonnaise", quantity: "1 tbsp (15ml)" },
      { item: "Black Pepper", quantity: "Pinch" },
    ],
    instructions: [
      "Cook bacon rashers in a pan over medium heat until crispy (approximately 4-5 minutes per side).",
      "While bacon is cooking, wash and dry the romaine lettuce leaves thoroughly.",
      "Slice the tomato into 3 even slices, approximately 5mm thick.",
      "Toast the whole wheat bread slices until golden brown.",
      "Spread mayonnaise evenly on one side of each toasted bread slice.",
      "On the first slice, layer the lettuce leaves, followed by the tomato slices.",
      "Place the crispy bacon rashers on top of the tomatoes.",
      "Season with a pinch of black pepper.",
      "Top with the second slice of bread, mayo side down.",
      "Cut diagonally and wrap immediately in food-safe packaging.",
    ],
  },
  "SK002": {
    productName: "Chicken Caesar Wrap",
    image: chickenCaesarWrap,
    prepTime: "8 minutes",
    ingredients: [
      { item: "Chicken Breast", quantity: "120g (cooked, sliced)" },
      { item: "Romaine Lettuce", quantity: "40g (shredded)" },
      { item: "Parmesan Cheese", quantity: "20g (grated)" },
      { item: "Caesar Dressing", quantity: "30ml" },
      { item: "Tortilla Wrap", quantity: "1 large (60g)" },
      { item: "Cherry Tomatoes", quantity: "3 halved (30g)" },
    ],
    instructions: [
      "Preheat grill to medium-high heat if chicken needs cooking.",
      "Season chicken breast with salt and pepper, grill for 6-7 minutes each side until internal temperature reaches 75°C.",
      "Allow chicken to rest for 2 minutes, then slice into thin strips.",
      "Wash and shred romaine lettuce into bite-sized pieces.",
      "Halve cherry tomatoes and set aside.",
      "Warm the tortilla wrap for 10 seconds in microwave or on a dry pan.",
      "Lay the wrap flat and spread Caesar dressing evenly across the surface.",
      "Arrange shredded lettuce in the center third of the wrap.",
      "Layer sliced chicken on top of the lettuce.",
      "Add cherry tomato halves and sprinkle grated Parmesan cheese.",
      "Fold the bottom of the wrap up, then fold in the sides and roll tightly.",
      "Cut in half diagonally and wrap in foil or food-safe packaging.",
    ],
  },
  "SK003": {
    productName: "Avocado & Hummus Wrap",
    image: avocadoHummusWrap,
    prepTime: "4 minutes",
    ingredients: [
      { item: "Avocado", quantity: "1 medium (150g)" },
      { item: "Hummus", quantity: "50g" },
      { item: "Tortilla Wrap", quantity: "1 large (60g)" },
      { item: "Cucumber", quantity: "50g (sliced)" },
      { item: "Cherry Tomatoes", quantity: "4 halved (40g)" },
      { item: "Red Onion", quantity: "15g (thinly sliced)" },
      { item: "Lemon Juice", quantity: "1 tsp" },
      { item: "Salt & Pepper", quantity: "To taste" },
    ],
    instructions: [
      "Cut avocado in half, remove pit, and scoop flesh into a bowl.",
      "Mash avocado with a fork, add lemon juice, salt, and pepper to taste.",
      "Slice cucumber into thin rounds.",
      "Halve cherry tomatoes.",
      "Thinly slice red onion.",
      "Warm tortilla wrap for 10 seconds.",
      "Spread hummus evenly across the entire surface of the wrap.",
      "Add mashed avocado mixture in a line down the center.",
      "Layer cucumber slices, cherry tomatoes, and red onion on top.",
      "Fold bottom of wrap up, fold in sides, and roll tightly.",
      "Cut in half diagonally and package immediately.",
    ],
  },
  "SK006": {
    productName: "Smoked Salmon Bagel",
    image: salmonBagel,
    prepTime: "3 minutes",
    ingredients: [
      { item: "Smoked Salmon", quantity: "60g (sliced)" },
      { item: "Cream Cheese", quantity: "40g" },
      { item: "Bagel", quantity: "1 whole (90g)" },
      { item: "Red Onion", quantity: "10g (thinly sliced)" },
      { item: "Capers", quantity: "5g" },
      { item: "Fresh Dill", quantity: "Small sprig" },
      { item: "Lemon", quantity: "1 wedge" },
    ],
    instructions: [
      "Slice bagel in half horizontally using a bread knife.",
      "Toast bagel halves until lightly golden (optional, based on preference).",
      "Spread cream cheese evenly on both cut sides of the bagel.",
      "Layer smoked salmon slices on the bottom half of the bagel.",
      "Add thinly sliced red onion on top of the salmon.",
      "Sprinkle capers evenly across the surface.",
      "Add a small sprig of fresh dill for garnish.",
      "Squeeze a small amount of lemon juice over the salmon.",
      "Place the top half of the bagel on and press gently.",
      "Wrap in paper or box for serving.",
    ],
  },
  "SK009": {
    productName: "Greek Feta Salad",
    image: greekFetaSalad,
    prepTime: "6 minutes",
    ingredients: [
      { item: "Feta Cheese", quantity: "80g (cubed)" },
      { item: "Tomato", quantity: "150g (diced)" },
      { item: "Cucumber", quantity: "100g (diced)" },
      { item: "Kalamata Olives", quantity: "40g (pitted)" },
      { item: "Red Onion", quantity: "30g (sliced)" },
      { item: "Extra Virgin Olive Oil", quantity: "2 tbsp (30ml)" },
      { item: "Red Wine Vinegar", quantity: "1 tbsp (15ml)" },
      { item: "Dried Oregano", quantity: "1 tsp" },
      { item: "Salt & Pepper", quantity: "To taste" },
    ],
    instructions: [
      "Wash all vegetables thoroughly under cold running water.",
      "Dice tomatoes into 2cm cubes, removing excess seeds if desired.",
      "Dice cucumber into 2cm cubes.",
      "Thinly slice red onion into half-moons.",
      "Cube feta cheese into 2cm pieces.",
      "In a large mixing bowl, combine tomatoes, cucumber, and red onion.",
      "Add Kalamata olives to the bowl.",
      "Gently fold in feta cheese cubes.",
      "In a small bowl, whisk together olive oil, red wine vinegar, and dried oregano.",
      "Pour dressing over the salad and toss gently to combine.",
      "Season with salt and pepper to taste.",
      "Transfer to serving container and refrigerate until service.",
    ],
  },
};

// Base product data with day part specific products
const baseProducts = [
  // Morning Range items (SK011-SK022)
  { id: "SK011", productName: "Ham & Cheese Croissant", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 16, recommendedOrder: 21, finalOrder: 21, trend: "up", historicalSales: 18.2, predictedSales: 20.6, dayParts: ["Morning Range"] },
  { id: "SK012", productName: "Bacon & Egg Roll", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 14, recommendedOrder: 19, finalOrder: 19, trend: "up", historicalSales: 16.5, predictedSales: 18.8, dayParts: ["Morning Range"] },
  { id: "SK013", productName: "Avocado Toast with Poached Egg", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 12, recommendedOrder: 18, finalOrder: 18, trend: "up", historicalSales: 15.2, predictedSales: 17.6, dayParts: ["Morning Range"] },
  { id: "SK014", productName: "Fruit & Yogurt Parfait", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 10, recommendedOrder: 15, finalOrder: 15, trend: "up", historicalSales: 13.5, predictedSales: 14.9, dayParts: ["Morning Range"] },
  { id: "SK015", productName: "Breakfast Burrito", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 11, recommendedOrder: 16, finalOrder: 16, trend: "up", historicalSales: 14.1, predictedSales: 15.8, dayParts: ["Morning Range"] },
  { id: "SK016", productName: "Granola Bowl with Berries", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 9, recommendedOrder: 14, finalOrder: 14, trend: "up", historicalSales: 12.7, predictedSales: 13.9, dayParts: ["Morning Range"] },
  { id: "SK017", productName: "Egg & Cheese Muffin", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 15, recommendedOrder: 20, finalOrder: 20, trend: "up", historicalSales: 17.4, predictedSales: 19.5, dayParts: ["Morning Range"] },
  { id: "SK018", productName: "Smoked Salmon Bagel", category: "Sandwich", storeId: "ST001", storeName: "London Bridge", currentStock: 14, recommendedOrder: 19, finalOrder: 19, trend: "up", historicalSales: 16.3, predictedSales: 18.5, dayParts: ["Morning Range"] },
  { id: "SK019", productName: "Almond Butter & Banana Toast", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 10, recommendedOrder: 15, finalOrder: 15, trend: "up", historicalSales: 13.2, predictedSales: 14.6, dayParts: ["Morning Range"] },
  { id: "SK020", productName: "Coffee & Pastry Combo", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 13, recommendedOrder: 18, finalOrder: 18, trend: "up", historicalSales: 15.8, predictedSales: 17.4, dayParts: ["Morning Range"] },
  { id: "SK021", productName: "Scrambled Eggs on Sourdough", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 12, recommendedOrder: 17, finalOrder: 17, trend: "up", historicalSales: 14.9, predictedSales: 16.7, dayParts: ["Morning Range"] },
  { id: "SK022", productName: "Porridge with Honey & Nuts", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 11, recommendedOrder: 16, finalOrder: 16, trend: "up", historicalSales: 14.1, predictedSales: 15.8, dayParts: ["Morning Range"] },
  
  // Lunch items (SK001-SK005, some available in both Morning Range and Lunch)
  { id: "SK001", productName: "Classic BLT Sandwich", category: "Sandwich", storeId: "ST001", storeName: "London Bridge", currentStock: 12, recommendedOrder: 18, finalOrder: 18, trend: "up", historicalSales: 15.2, predictedSales: 17.8, dayParts: ["Morning Range", "Lunch"] },
  { id: "SK002", productName: "Chicken Caesar Wrap", category: "Wrap", storeId: "ST001", storeName: "London Bridge", currentStock: 8, recommendedOrder: 22, finalOrder: 22, trend: "up", historicalSales: 18.5, predictedSales: 21.3, dayParts: ["Morning Range", "Lunch"] },
  { id: "SK003", productName: "Avocado & Hummus Wrap", category: "Wrap", storeId: "ST001", storeName: "London Bridge", currentStock: 6, recommendedOrder: 14, finalOrder: 14, trend: "down", historicalSales: 16.8, predictedSales: 13.2, dayParts: ["Lunch"] },
  { id: "SK004", productName: "Tuna Melt Panini", category: "Hot Food", storeId: "ST001", storeName: "London Bridge", currentStock: 15, recommendedOrder: 20, finalOrder: 20, trend: "up", historicalSales: 17.1, predictedSales: 19.7, dayParts: ["Lunch"] },
  { id: "SK005", productName: "Mediterranean Salad Bowl", category: "Salad", storeId: "ST001", storeName: "London Bridge", currentStock: 10, recommendedOrder: 16, finalOrder: 16, trend: "up", historicalSales: 13.9, predictedSales: 15.4, dayParts: ["Lunch"] },
  { id: "SK006", productName: "Prosciutto & Mozzarella Ciabatta", category: "Sandwich", storeId: "ST001", storeName: "London Bridge", currentStock: 12, recommendedOrder: 17, finalOrder: 17, trend: "up", historicalSales: 14.9, predictedSales: 16.7, dayParts: ["Lunch"] },
  
  // Afternoon items
  { id: "SK023", productName: "Turkey & Cranberry Sandwich", category: "Sandwich", storeId: "ST001", storeName: "London Bridge", currentStock: 13, recommendedOrder: 18, finalOrder: 18, trend: "up", historicalSales: 15.7, predictedSales: 17.9, dayParts: ["Lunch", "Afternoon"] },
  { id: "SK024", productName: "Falafel Wrap", category: "Wrap", storeId: "ST001", storeName: "London Bridge", currentStock: 10, recommendedOrder: 16, finalOrder: 16, trend: "up", historicalSales: 13.5, predictedSales: 15.8, dayParts: ["Lunch", "Afternoon"] },
  { id: "SK025", productName: "Asian Chicken Salad", category: "Salad", storeId: "ST001", storeName: "London Bridge", currentStock: 8, recommendedOrder: 14, finalOrder: 14, trend: "down", historicalSales: 16.2, predictedSales: 13.9, dayParts: ["Afternoon"] },
  { id: "SK026", productName: "Club Sandwich", category: "Sandwich", storeId: "ST001", storeName: "London Bridge", currentStock: 11, recommendedOrder: 16, finalOrder: 16, trend: "up", historicalSales: 14.1, predictedSales: 15.9, dayParts: ["Afternoon"] },
  { id: "SK027", productName: "BBQ Chicken Wrap", category: "Wrap", storeId: "ST001", storeName: "London Bridge", currentStock: 9, recommendedOrder: 15, finalOrder: 15, trend: "up", historicalSales: 13.8, predictedSales: 14.9, dayParts: ["Afternoon"] },
  { id: "SK028", productName: "Quinoa Power Salad", category: "Salad", storeId: "ST001", storeName: "London Bridge", currentStock: 7, recommendedOrder: 12, finalOrder: 12, trend: "down", historicalSales: 14.5, predictedSales: 11.8, dayParts: ["Afternoon"] },
  { id: "SK010", productName: "Vegan Buddha Bowl", category: "Salad", storeId: "ST001", storeName: "London Bridge", currentStock: 9, recommendedOrder: 14, finalOrder: 14, trend: "up", historicalSales: 12.6, predictedSales: 13.7, dayParts: ["Afternoon"] },
];

// Day parts matching range plan
const dayParts = [
  { name: "Morning Range", time: "Open-11am", percentage: 0.35 },
  { name: "Lunch", time: "11am-2pm", percentage: 0.45 },
  { name: "Afternoon", time: "2pm-Close", percentage: 0.20 }
];

// Generate 7-day forecast with day parts
const generate7DayForecast = () => {
  const forecast = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(Date.now() + (dayOffset + 1) * 86400000); // Starting from tomorrow
    baseProducts.forEach(product => {
      // Filter products by their available day parts
      const availableDayParts = dayParts.filter(dp => 
        product.dayParts.includes(dp.name)
      );
      
      // Add some variation for each day
      const dailyVariation = 0.9 + Math.random() * 0.2; // 90% to 110%
      const totalDaily = Math.round(product.recommendedOrder * dailyVariation);
      
      // Split into day parts
      availableDayParts.forEach(dayPart => {
        // Add slight variation per day part
        const dayPartVariation = 0.95 + Math.random() * 0.1; // 95% to 105%
        const recommendedTopUp = Math.round(totalDaily * dayPart.percentage * dayPartVariation);
        
        forecast.push({
          ...product,
          date,
          dayPart: dayPart.name,
          dayPartTime: dayPart.time,
          recommendedOrder: recommendedTopUp,
          finalOrder: recommendedTopUp,
          predictedSales: product.predictedSales * dailyVariation * dayPart.percentage,
        });
      });
    });
  }
  return forecast;
};

const initialAllocations = generate7DayForecast();

// Get initial day part based on current time
const getInitialDayPart = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 9) return "Morning Range";
  if (currentHour >= 9 && currentHour < 11) return "Lunch";
  return "Afternoon";
};

// Brand to store mapping
const brandStoreMap = {
  "All Brands": ["All", "London Bridge", "Kings Cross", "Victoria Station", "Oxford Street", "Canary Wharf", "Liverpool Street", "Paddington", "Waterloo", "Bond Street", "Leicester Square", "Covent Garden", "Bank", "Monument", "Tower Hill", "Holborn"],
  "Pret a Manger": ["All", "London Bridge", "Kings Cross", "Victoria Station", "Liverpool Street", "Paddington", "Waterloo", "Bank", "Monument"],
  "Brioche Dorée": ["All", "Oxford Street", "Canary Wharf", "Bond Street", "Leicester Square", "Covent Garden"],
  "Starbucks": ["All", "London Bridge", "Oxford Street", "Tower Hill", "Holborn", "Canary Wharf"]
};

export default function VolumeAllocation() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now() + 86400000)); // Tomorrow
  const { viewMode, selectedStore } = useView();
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [selectedStores, setSelectedStores] = useState<string[]>(["All"]);
  const [selectedDay, setSelectedDay] = useState<string>("All days");
  const [selectedDayPart, setSelectedDayPart] = useState<string>("Morning Range");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [confirmingProduction, setConfirmingProduction] = useState<string | null>(null);
  const { toast } = useToast();
  
  const tomorrow = new Date(Date.now() + 86400000);
  const formattedDate = tomorrow.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Filter stores based on selected brand
  const availableStores = brandStoreMap[selectedBrand as keyof typeof brandStoreMap] || brandStoreMap["All Brands"];
  
  // Get unique dates for the day filter
  const uniqueDates = Array.from(new Set(allocations.map(a => a.date.toDateString())));
  const dayOptions = ["All days", ...uniqueDates.map(dateStr => {
    const date = new Date(dateStr);
    return format(date, "EEE, MMM d");
  })];
  
  // Filter by store
  let filtered = viewMode === "store_manager" 
    ? allocations.slice(0, 36) // Show first 12 products x 3 day parts for store view
    : selectedStores.includes("All") 
      ? allocations.filter(a => selectedBrand === "All Brands" || availableStores.includes(a.storeName))
      : allocations.filter(a => selectedStores.includes(a.storeName));
  
  // Filter by day
  if (selectedDay !== "All days") {
    const selectedDateStr = uniqueDates[dayOptions.indexOf(selectedDay) - 1];
    filtered = filtered.filter(a => a.date.toDateString() === selectedDateStr);
  }
  
  const filteredAllocations = filtered;

  // Group products by ID - now for both views
  const groupedProducts = Array.from(new Set(filtered.map(a => a.id))).map(productId => {
    const productAllocations = filtered.filter(a => a.id === productId);
    const morningRange = productAllocations.find(a => a.dayPart === "Morning Range");
    const lunch = productAllocations.find(a => a.dayPart === "Lunch");
    const afternoon = productAllocations.find(a => a.dayPart === "Afternoon");
    
    return {
      id: productId,
      productName: productAllocations[0].productName,
      category: productAllocations[0].category,
      currentStock: productAllocations[0].currentStock,
      date: productAllocations[0].date,
      storeId: productAllocations[0].storeId,
      storeName: productAllocations[0].storeName,
      breakfast: morningRange,
      lunch,
      afternoon,
    };
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const updateFinalOrder = (id: string, storeId: string, date: Date, dayPart: string, delta: number) => {
    setAllocations(prev => prev.map(allocation => 
      allocation.id === id && 
      allocation.storeId === storeId && 
      allocation.date.toDateString() === date.toDateString() &&
      allocation.dayPart === dayPart
        ? { ...allocation, finalOrder: Math.max(0, allocation.finalOrder + delta) }
        : allocation
    ));
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Day Part', 'Time', 'Product ID', 'Product Name', 'Category', 'Store', 'Current Stock', 'Predicted Sales', 'AI Recommended Top-Up', 'Final Top-Up'];
    const rows = filteredAllocations.map(a => [
      format(a.date, "yyyy-MM-dd"),
      a.dayPart,
      a.dayPartTime,
      a.id,
      a.productName,
      a.category,
      a.storeName,
      a.currentStock,
      Math.round(a.predictedSales),
      a.recommendedOrder,
      a.finalOrder
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-recommendations-by-daypart.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePushToERP = async () => {
    if (!webhookUrl) {
      setIsWebhookDialogOpen(true);
      return;
    }

    setIsLoading(true);
    console.log("Pushing order data to ERP via Zapier webhook:", webhookUrl);

      try {
        const orderData = filteredAllocations.map(a => ({
          productId: a.id,
          productName: a.productName,
          category: a.category,
          store: a.storeName,
          storeId: a.storeId,
          currentStock: a.currentStock,
          predictedSales: Math.round(a.predictedSales),
          recommendedProduction: a.recommendedOrder,
          finalProduction: a.finalOrder,
          productionDate: format(a.date, "yyyy-MM-dd")
        }));

        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            forecastPeriod: "7 days",
            totalProduction: orderData.length,
            production: orderData,
            source: "Martee AI",
          }),
        });

        toast({
          title: "Production Data Sent",
          description: `Successfully pushed ${orderData.length} production recommendations to your ERP system. Check your Zap history to confirm.`,
        });
    } catch (error) {
      console.error("Error pushing to ERP:", error);
      toast({
        title: "Error",
        description: "Failed to push data to ERP. Please check the webhook URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhook = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }
    setIsWebhookDialogOpen(false);
    handlePushToERP();
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      'Sandwich': 'bg-brand-peach text-white',
      'Wrap': 'bg-brand-green-medium text-white',
      'Hot Food': 'bg-primary text-primary-foreground',
      'Salad': 'bg-success text-white',
      'Beverage': 'bg-secondary text-secondary-foreground',
    };
    
    return (
      <Badge className={categoryColors[category as keyof typeof categoryColors] || 'bg-muted'}>
        {category}
      </Badge>
    );
  };

  const handleConfirmProduction = async (allocation: typeof allocations[0]) => {
    setConfirmingProduction(`${allocation.id}-${allocation.storeId}-${allocation.date.toDateString()}-${allocation.dayPart}`);
    
    try {
      // For now, just show success since we're working with mock data
      // In production, this would update the database
      toast({
        title: "Production Confirmed",
        description: `${allocation.finalOrder} units of ${allocation.productName} confirmed for ${allocation.dayPart} (${allocation.dayPartTime}) on ${format(allocation.date, "EEE, MMM d")}. Prepared goods inventory updated.`,
      });
      
      // Note: When database is populated, the code below would:
      // 1. Deplete ingredient inventory based on recipe
      // 2. Add produced quantity to prepared goods inventory
      
    } catch (error) {
      console.error('Error confirming production:', error);
      toast({
        title: "Error",
        description: "Failed to confirm production. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfirmingProduction(null);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Hero Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-green shadow-soft">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-foreground mb-2">
                {viewMode === "store_manager" ? selectedStore : "AI Production Recommendations"}
              </h1>
              <p className="text-secondary-foreground/80 text-lg">
                Optimised production top-ups by day part (Morning Range, Lunch, Afternoon) powered by machine learning
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="secondary"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Updating...' : 'Refresh Data'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand and Store Filter for HQ View */}
      {viewMode === "hq" && (
        <Card className="shadow-card border-l-4 border-l-[#7e9f57]">
          <CardContent className="py-4">
            <div className="space-y-4">
              {/* Brand Filter - Higher Level */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">My Brand:</label>
                <Select value={selectedBrand} onValueChange={(v) => {
                  setSelectedBrand(v);
                  setSelectedStores(["All"]); // Reset store selection when brand changes
                }}>
                  <SelectTrigger className="w-[200px] h-9 border-[#7e9f57] focus:ring-[#7e9f57] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Brands">All Brands</SelectItem>
                    <SelectItem value="Pret a Manger">Pret a Manger</SelectItem>
                    <SelectItem value="Brioche Dorée">Brioche Dorée</SelectItem>
                    <SelectItem value="Starbucks">Starbucks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Store and Day Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Filter by Store:</label>
                  <Select value={selectedStores[0]} onValueChange={(v) => setSelectedStores([v])}>
                    <SelectTrigger className="w-[180px] h-9 border-[#7e9f57] focus:ring-[#7e9f57]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStores.map(store => (
                        <SelectItem key={store} value={store}>{store}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className="text-sm font-medium ml-4">Day:</label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-[180px] h-9 border-[#7e9f57] focus:ring-[#7e9f57]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOptions.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Viewing:</span>
                  <Badge className="bg-[#7e9f57] text-white font-semibold">
                    {selectedBrand} • {selectedDay === "All days" ? "7 days" : selectedDay}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notable Events - Only in Store View */}
      {viewMode === "store_manager" && (
        <>
          <div className="pt-2">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Notable events on {formattedDate}
            </h2>
          </div>

          <Card className="shadow-card border-l-4 border-l-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CloudRain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Predicted Weather</p>
                    <p className="text-base font-semibold text-foreground">Rainy, 12°C - Lower footfall expected</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-border hidden md:block" />
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Key Events</p>
                    <p className="text-base font-semibold text-foreground">Train strike in Central London - Reduced commuter traffic</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Last updated on: {format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
      </div>

      {/* Allocation Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Production Top-Ups by Day Part
              </CardTitle>
              <CardDescription>
                AI-powered production quantities split by morning, afternoon, and evening to optimize freshness and reduce waste
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleExportCSV}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                onClick={handlePushToERP}
                size="sm"
                disabled={isLoading}
                className="bg-primary text-primary-foreground"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? "Pushing..." : "Push to ERP"}
              </Button>
              {webhookUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWebhookDialogOpen(true)}
                  title="Configure ERP webhook"
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day Part Tabs - Store Manager View */}
          {viewMode === "store_manager" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-2 border-primary/20">
              <div className="flex gap-3">
                {dayParts.map((dayPart) => (
                  <Button
                    key={dayPart.name}
                    variant={selectedDayPart === dayPart.name ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedDayPart(dayPart.name)}
                    className="flex-1 h-14 text-base font-semibold"
                  >
                    <div className="flex flex-col items-center">
                      <span>{dayPart.name}</span>
                      <span className="text-xs font-normal opacity-80">{dayPart.time}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Day Part Selector - HQ View */}
          {viewMode !== "store_manager" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-2 border-primary/20">
              <div className="flex gap-3">
                {dayParts.map((dayPart) => (
                  <Button
                    key={dayPart.name}
                    variant={selectedDayPart === dayPart.name ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedDayPart(dayPart.name)}
                    className="flex-1 h-14 text-base font-semibold"
                  >
                    <div className="flex flex-col items-center">
                      <span>{dayPart.name}</span>
                      <span className="text-xs font-normal opacity-80">{dayPart.time}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {viewMode === "store_manager" ? (
            // Store Manager View - Products as rows with single day part showing
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  {selectedDayPart === "Lunch" && (
                    <TableHead className="bg-amber-50/50 text-center">
                      <div className="text-xs text-muted-foreground">Morning Prod</div>
                    </TableHead>
                  )}
                  {selectedDayPart === "Afternoon" && (
                    <>
                      <TableHead className="bg-amber-50/50 text-center">
                        <div className="text-xs text-muted-foreground">Morning Prod</div>
                      </TableHead>
                      <TableHead className="bg-indigo-50/50 text-center">
                        <div className="text-xs text-muted-foreground">Lunch Prod</div>
                      </TableHead>
                    </>
                  )}
                  <TableHead className="bg-gradient-to-r from-[#ff914d]/20 to-[#ff914d]/10 relative text-center">
                    <div className="flex items-center justify-center gap-2 relative">
                      <div className="absolute inset-0 bg-[#ff914d]/5 blur-sm" />
                      <Sparkles className="h-4 w-4 text-[#ff914d] relative z-10 animate-pulse" />
                      <span className="relative z-10 font-semibold bg-gradient-to-r from-[#ff914d] to-[#ff914d]/70 bg-clip-text text-transparent">
                        AI Recommended Qty
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="bg-brand-green/10 text-center">Final Qty</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedProducts.map((product) => {
                  // Get the allocation for the selected day part
                  const allocation = selectedDayPart === "Morning Range" 
                    ? product.breakfast 
                    : selectedDayPart === "Lunch" 
                    ? product.lunch 
                    : product.afternoon;

                  if (!allocation) return null;

                  // Get previous day part production numbers
                  const morningProduction = product.breakfast?.finalOrder || 0;
                  const lunchProduction = product.lunch?.finalOrder || 0;

                  return (
                    <TableRow key={`${product.id}-${selectedDayPart}`}>
                      <TableCell>
                        <div>
                          <div 
                            className={`font-medium ${recipes[product.id as keyof typeof recipes] ? 'cursor-pointer hover:text-primary hover:underline' : ''}`}
                            onClick={() => recipes[product.id as keyof typeof recipes] && setSelectedRecipe(product.id)}
                          >
                            {product.productName}
                          </div>
                          <div className="text-sm text-muted-foreground">{product.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(product.category)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{product.currentStock}</span>
                      </TableCell>
                      {selectedDayPart === "Lunch" && (
                        <TableCell className="bg-amber-50/30 text-center">
                          <span className="font-mono font-semibold">{morningProduction}</span>
                        </TableCell>
                      )}
                      {selectedDayPart === "Afternoon" && (
                        <>
                          <TableCell className="bg-amber-50/30 text-center">
                            <span className="font-mono font-semibold">{morningProduction}</span>
                          </TableCell>
                          <TableCell className="bg-indigo-50/30 text-center">
                            <span className="font-mono font-semibold">{lunchProduction}</span>
                          </TableCell>
                        </>
                      )}
                      <TableCell className="bg-gradient-to-r from-[#ff914d]/10 to-transparent relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff914d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-center gap-2 relative z-10">
                          <span className="font-mono font-semibold text-foreground">
                            {allocation.recommendedOrder}
                          </span>
                          <Sparkles className="h-3 w-3 text-[#ff914d] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                      <TableCell className="bg-brand-green/5">
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFinalOrder(product.id, product.storeId, product.date, selectedDayPart, -1)}
                            className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-mono font-bold text-brand-green min-w-[2.5rem] text-center text-lg">
                            {allocation.finalOrder}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFinalOrder(product.id, product.storeId, product.date, selectedDayPart, 1)}
                            className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground"
                          disabled={!!confirmingProduction}
                          onClick={() => handleConfirmProduction(allocation)}
                        >
                          {confirmingProduction === `${product.id}-${product.storeId}-${product.date.toDateString()}-${selectedDayPart}` ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            'Confirm'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            // HQ View - Same as Store Manager View with Store column
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Current Stock</TableHead>
                  {selectedDayPart === "Lunch" && (
                    <TableHead className="bg-amber-50/50 text-center">
                      <div className="text-xs text-muted-foreground">Morning Prod</div>
                    </TableHead>
                  )}
                  {selectedDayPart === "Afternoon" && (
                    <>
                      <TableHead className="bg-amber-50/50 text-center">
                        <div className="text-xs text-muted-foreground">Morning Prod</div>
                      </TableHead>
                      <TableHead className="bg-indigo-50/50 text-center">
                        <div className="text-xs text-muted-foreground">Lunch Prod</div>
                      </TableHead>
                    </>
                  )}
                  <TableHead className="bg-gradient-to-r from-[#ff914d]/20 to-[#ff914d]/10 relative text-center">
                    <div className="flex items-center justify-center gap-2 relative">
                      <div className="absolute inset-0 bg-[#ff914d]/5 blur-sm" />
                      <Sparkles className="h-4 w-4 text-[#ff914d] relative z-10 animate-pulse" />
                      <span className="relative z-10 font-semibold bg-gradient-to-r from-[#ff914d] to-[#ff914d]/70 bg-clip-text text-transparent">
                        AI Recommended Qty
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="bg-brand-green/10 text-center">Final Qty</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedProducts.map((product) => {
                  // Get the allocation for the selected day part
                  const allocation = selectedDayPart === "Morning Range" 
                    ? product.breakfast 
                    : selectedDayPart === "Lunch" 
                    ? product.lunch 
                    : product.afternoon;

                  if (!allocation) return null;

                  // Get previous day part production numbers
                  const morningProduction = product.breakfast?.finalOrder || 0;
                  const lunchProduction = product.lunch?.finalOrder || 0;

                  return (
                    <TableRow key={`${product.id}-${product.storeId}-${selectedDayPart}`}>
                      <TableCell>
                        <div>
                          <div 
                            className={`font-medium ${recipes[product.id as keyof typeof recipes] ? 'cursor-pointer hover:text-primary hover:underline' : ''}`}
                            onClick={() => recipes[product.id as keyof typeof recipes] && setSelectedRecipe(product.id)}
                          >
                            {product.productName}
                          </div>
                          <div className="text-sm text-muted-foreground">{product.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(product.category)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.storeName}</div>
                          <div className="text-sm text-muted-foreground">{product.storeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{product.currentStock}</span>
                      </TableCell>
                      {selectedDayPart === "Lunch" && (
                        <TableCell className="bg-amber-50/30 text-center">
                          <span className="font-mono font-semibold">{morningProduction}</span>
                        </TableCell>
                      )}
                      {selectedDayPart === "Afternoon" && (
                        <>
                          <TableCell className="bg-amber-50/30 text-center">
                            <span className="font-mono font-semibold">{morningProduction}</span>
                          </TableCell>
                          <TableCell className="bg-indigo-50/30 text-center">
                            <span className="font-mono font-semibold">{lunchProduction}</span>
                          </TableCell>
                        </>
                      )}
                      <TableCell className="bg-gradient-to-r from-[#ff914d]/10 to-transparent relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff914d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-center gap-2 relative z-10">
                          <span className="font-mono font-semibold text-foreground">
                            {allocation.recommendedOrder}
                          </span>
                          <Sparkles className="h-3 w-3 text-[#ff914d] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                      <TableCell className="bg-brand-green/5">
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFinalOrder(product.id, product.storeId, product.date, selectedDayPart, -1)}
                            className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-mono font-bold text-brand-green min-w-[2.5rem] text-center text-lg">
                            {allocation.finalOrder}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFinalOrder(product.id, product.storeId, product.date, selectedDayPart, 1)}
                            className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground"
                          disabled={!!confirmingProduction}
                          onClick={() => handleConfirmProduction(allocation)}
                        >
                          {confirmingProduction === `${product.id}-${product.storeId}-${product.date.toDateString()}-${selectedDayPart}` ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            'Confirm'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Webhook Configuration Dialog */}
      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure ERP Integration</DialogTitle>
            <DialogDescription>
              Enter your Zapier webhook URL to push order recommendations directly to your ERP system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Create a Zap with a "Catch Hook" trigger in Zapier and paste the webhook URL here.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWebhook}>
              Save & Push to ERP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Dialog */}
      {selectedRecipe && recipes[selectedRecipe as keyof typeof recipes] && (
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start gap-4">
                <img
                  src={recipes[selectedRecipe as keyof typeof recipes].image}
                  alt={recipes[selectedRecipe as keyof typeof recipes].productName}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <DialogTitle className="text-2xl">
                    {recipes[selectedRecipe as keyof typeof recipes].productName}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedRecipe}</Badge>
                    <span>•</span>
                    <span>Prep: {recipes[selectedRecipe as keyof typeof recipes].prepTime}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                <div className="grid gap-2">
                  {recipes[selectedRecipe as keyof typeof recipes].ingredients.map((ingredient, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-2 rounded-lg bg-muted/30"
                    >
                      <span className="font-medium">{ingredient.item}</span>
                      <Badge variant="secondary">{ingredient.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {recipes[selectedRecipe as keyof typeof recipes].instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                        {index + 1}
                      </span>
                      <p className="flex-1 text-muted-foreground pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}