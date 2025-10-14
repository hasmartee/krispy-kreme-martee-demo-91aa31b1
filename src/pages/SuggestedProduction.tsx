import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, RefreshCw, Plus, Minus, CloudRain, AlertTriangle, Sparkles, Download, Send, BookOpen, Loader2, CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-food.jpg";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/lib/supabase-helper";
import classicBlt from "@/assets/products/classic-blt.jpg";
import chickenCaesar from "@/assets/products/chicken-caesar.jpg";
import avocadoHummus from "@/assets/products/avocado-hummus.jpg";
import salmonCreamBagel from "@/assets/products/salmon-cream-bagel.jpg";
import greekSaladBowl from "@/assets/products/greek-salad-bowl.jpg";

// Recipe data
const recipes = {
  "OS-S001": {
    productName: "Classic BLT Sandwich",
    image: classicBlt,
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
  "OS-W001": {
    productName: "Chicken Caesar Wrap",
    image: chickenCaesar,
    prepTime: "7 minutes",
    ingredients: [
      { item: "Grilled Chicken", quantity: "120g" },
      { item: "Romaine Lettuce", quantity: "3 leaves (45g)" },
      { item: "Caesar Dressing", quantity: "2 tbsp (30ml)" },
      { item: "Parmesan Cheese", quantity: "1 tbsp (5g)" },
      { item: "Whole Wheat Tortilla", quantity: "1 (60g)" },
      { item: "Black Pepper", quantity: "Pinch" },
    ],
    instructions: [
      "Grill chicken breast until fully cooked and slightly browned (approximately 6-8 minutes per side).",
      "Let the chicken cool slightly, then slice into thin strips.",
      "Wash and dry the romaine lettuce leaves thoroughly.",
      "Lay the whole wheat tortilla flat on a clean surface.",
      "Spread Caesar dressing evenly over the tortilla, leaving a 1-inch border.",
      "Layer the lettuce leaves, followed by the sliced chicken strips.",
      "Sprinkle with Parmesan cheese and season with a pinch of black pepper.",
      "Fold in the sides of the tortilla, then tightly roll up from the bottom.",
      "Cut in half diagonally and wrap immediately in food-safe packaging.",
    ],
  },
  "OS-W002": {
    productName: "Avocado & Hummus Wrap",
    image: avocadoHummus,
    prepTime: "5 minutes",
    ingredients: [
      { item: "Avocado", quantity: "1/2 (70g)" },
      { item: "Hummus", quantity: "2 tbsp (40g)" },
      { item: "Spinach", quantity: "2 handfuls (50g)" },
      { item: "Red Bell Pepper", quantity: "1/4 (40g)" },
      { item: "Whole Wheat Tortilla", quantity: "1 (60g)" },
      { item: "Lemon Juice", quantity: "1 tsp (5ml)" },
    ],
    instructions: [
      "Slice the avocado in half, remove the pit, and scoop out the flesh. Mash lightly with a fork.",
      "Add a squeeze of lemon juice to the mashed avocado to prevent browning.",
      "Wash and dry the spinach leaves thoroughly.",
      "Slice the red bell pepper into thin strips.",
      "Lay the whole wheat tortilla flat on a clean surface.",
      "Spread hummus evenly over the tortilla, leaving a 1-inch border.",
      "Layer the spinach leaves, followed by the mashed avocado and red bell pepper strips.",
      "Fold in the sides of the tortilla, then tightly roll up from the bottom.",
      "Cut in half diagonally and wrap immediately in food-safe packaging.",
    ],
  },
  "OS-S004": {
    productName: "Tuna Melt Panini",
    image: null,
    prepTime: "8 minutes",
    ingredients: [
      { item: "Canned Tuna", quantity: "120g" },
      { item: "Cheddar Cheese", quantity: "2 slices (40g)" },
      { item: "Red Onion", quantity: "2 tbsp (20g)" },
      { item: "Mayonnaise", quantity: "1 tbsp (15ml)" },
      { item: "Sourdough Bread", quantity: "2 slices (80g)" },
      { item: "Black Pepper", quantity: "Pinch" },
    ],
    instructions: [
      "Drain the canned tuna thoroughly and flake it into a bowl.",
      "Finely chop the red onion.",
      "Add mayonnaise to the tuna and mix well. Season with a pinch of black pepper.",
      "Butter one side of each slice of sourdough bread.",
      "Place one slice of bread, butter-side down, in a panini press or skillet.",
      "Layer the tuna mixture, followed by the cheddar cheese slices, and top with the red onion.",
      "Place the second slice of bread on top, butter-side up.",
      "Grill in the panini press or skillet until the bread is golden brown and the cheese is melted and bubbly (approximately 3-4 minutes).",
      "Cut in half diagonally and wrap immediately in food-safe packaging.",
    ],
  },
  "OS-L001": {
    productName: "Mediterranean Salad Bowl",
    image: greekSaladBowl,
    prepTime: "10 minutes",
    ingredients: [
      { item: "Cucumber", quantity: "1/2 (60g)" },
      { item: "Cherry Tomatoes", quantity: "10 (80g)" },
      { item: "Kalamata Olives", quantity: "10 (30g)" },
      { item: "Feta Cheese", quantity: "50g" },
      { item: "Red Onion", quantity: "1/4 (30g)" },
      { item: "Mixed Greens", quantity: "2 handfuls (60g)" },
      { item: "Olive Oil", quantity: "2 tbsp (30ml)" },
      { item: "Lemon Juice", quantity: "1 tbsp (15ml)" },
      { item: "Dried Oregano", quantity: "1/2 tsp" },
      { item: "Black Pepper", quantity: "Pinch" },
    ],
    instructions: [
      "Wash and dry the mixed greens thoroughly.",
      "Dice the cucumber and halve the cherry tomatoes.",
      "Slice the red onion thinly.",
      "In a large bowl, combine the mixed greens, cucumber, cherry tomatoes, Kalamata olives, red onion, and feta cheese.",
      "In a small bowl, whisk together olive oil, lemon juice, dried oregano, and black pepper to make the dressing.",
      "Pour the dressing over the salad and toss gently to combine.",
      "Serve immediately in a bowl or portion into food-safe containers for later.",
    ],
  },
  "OS-S003": {
    productName: "Smoked Salmon Bagel",
    image: salmonCreamBagel,
    prepTime: "5 minutes",
    ingredients: [
      { item: "Smoked Salmon", quantity: "80g" },
      { item: "Cream Cheese", quantity: "2 tbsp (40g)" },
      { item: "Red Onion", quantity: "1 tbsp (10g)" },
      { item: "Capers", quantity: "1 tsp (5g)" },
      { item: "Everything Bagel", quantity: "1 (85g)" },
      { item: "Black Pepper", quantity: "Pinch" },
    ],
    instructions: [
      "Slice the everything bagel in half horizontally.",
      "Spread cream cheese evenly on both halves of the bagel.",
      "Thinly slice the red onion.",
      "Layer smoked salmon on one half of the bagel.",
      "Sprinkle with red onion and capers.",
      "Season with a pinch of black pepper.",
      "Top with the other half of the bagel.",
      "Cut in half and wrap immediately in food-safe packaging.",
    ],
  },
};

interface Product {
  id: string;
  productName: string;
  category: string;
  store: string;
  storeId: string;
  currentStock: number;
  recommendedOrder: number;
  finalOrder: number;
  trend: "up" | "down" | "stable";
  historicalSales: number;
  predictedSales: number;
  dayPart?: string;
}

interface Store {
  id: string;
  name: string;
  cluster: string;
}

export default function SuggestedProduction() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { viewMode, selectedStore } = useView();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [confirmingProduction, setConfirmingProduction] = useState<string | null>(null);
  const [groupByProduct, setGroupByProduct] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  const formattedDate = selectedDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    loadData();
  }, [viewMode, selectedStore]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load stores
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name') as any;

      if (data) {
        setStores(data);
        
        // Generate mock production data for each store
        const mockProducts: Product[] = [];
        const productsList = [
          { id: "OS-P001", name: "Kanelstang (Cinnamon Swirl)", category: "Pastries", dayPart: "Morning" },
          { id: "OS-P002", name: "Tebirkes (Poppy Seed Pastry)", category: "Pastries", dayPart: "Morning" },
          { id: "OS-P003", name: "Wienerbrød (Danish Pastry)", category: "Pastries", dayPart: "Morning" },
          { id: "OS-P004", name: "Croissant", category: "Pastries", dayPart: "Morning" },
          { id: "OS-P005", name: "Pain au Chocolat", category: "Pastries", dayPart: "Morning" },
          { id: "OS-P006", name: "Almond Croissant", category: "Pastries", dayPart: "Morning" },
          { id: "OS-B001", name: "Rugbrød (Rye Bread) Whole", category: "Breads", dayPart: "Morning" },
          { id: "OS-B002", name: "Sourdough Loaf", category: "Breads", dayPart: "Morning" },
          { id: "OS-HB001", name: "Scrambled Eggs on Sourdough", category: "Hot Breakfast", dayPart: "Morning" },
          { id: "OS-HB002", name: "Bacon & Egg Roll", category: "Hot Breakfast", dayPart: "Morning" },
          { id: "OS-HB003", name: "Ham & Cheese Croissant", category: "Hot Breakfast", dayPart: "Morning" },
          { id: "OS-CB001", name: "Granola Bowl with Yogurt", category: "Cold Breakfast", dayPart: "Morning" },
          { id: "OS-S001", name: "Classic BLT Sandwich", category: "Sandwiches", dayPart: "Lunch" },
          { id: "OS-S002", name: "Chicken Bacon Sandwich", category: "Sandwiches", dayPart: "Lunch" },
          { id: "OS-S003", name: "Salmon & Cream Cheese Bagel", category: "Sandwiches", dayPart: "Lunch" },
          { id: "OS-S004", name: "Tuna Melt Panini", category: "Sandwiches", dayPart: "Lunch" },
          { id: "OS-W001", name: "Chicken Caesar Wrap", category: "Wraps", dayPart: "Lunch" },
          { id: "OS-W002", name: "Avocado & Hummus Wrap", category: "Wraps", dayPart: "Lunch" },
          { id: "OS-L001", name: "Mediterranean Salad", category: "Salads", dayPart: "Afternoon" },
          { id: "OS-L002", name: "Greek Feta Salad", category: "Salads", dayPart: "Afternoon" },
        ];

        const targetStores = viewMode === "store_manager" 
          ? data.filter((s: any) => s.name === selectedStore)
          : data;

        targetStores.forEach((store: any) => {
          productsList.forEach(product => {
            const baseQty = 15 + Math.floor(Math.random() * 15);
            mockProducts.push({
              id: product.id,
              productName: product.name,
              category: product.category,
              store: store.name,
              storeId: store.id,
              currentStock: baseQty, // Expected = same as delivered for store view
              recommendedOrder: baseQty,
              finalOrder: baseQty,
              trend: Math.random() > 0.3 ? "up" : "down",
              historicalSales: baseQty * 0.9,
              predictedSales: baseQty * 1.05,
              dayPart: product.dayPart,
            });
          });
        });

        setProducts(mockProducts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load production data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const updateFinalOrder = (productId: string, storeId: string, delta: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId && p.storeId === storeId
        ? { ...p, finalOrder: Math.max(0, p.finalOrder + delta) }
        : p
    ));
  };

  const handleConfirmProduction = async (product: Product) => {
    setConfirmingProduction(`${product.id}-${product.storeId}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: viewMode === "hq" ? "✓ Production Confirmed" : "✓ Delivery Logged",
      description: viewMode === "hq" 
        ? `${product.productName} added to production queue for ${product.store}`
        : `${product.productName} delivery logged - ${product.finalOrder} units received`,
    });
    
    setConfirmingProduction(null);
  };

  const handleExportCSV = () => {
    const headers = viewMode === "hq" 
      ? ["Product", "Category", "Store", "Current Stock", "Recommended Qty", "Final Qty"]
      : ["Product", "Category", "Current Stock", "Recommended Qty", "Final Qty"];
    
    const rows = products.map(p => 
      viewMode === "hq"
        ? [p.productName, p.category, p.store, p.currentStock, p.recommendedOrder, p.finalOrder]
        : [p.productName, p.category, p.currentStock, p.recommendedOrder, p.finalOrder]
    );
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "CSV Exported",
      description: "Production plan has been exported successfully",
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      "Sandwich": "bg-blue-100 text-blue-800",
      "Wrap": "bg-green-100 text-green-800",
      "Hot Food": "bg-orange-100 text-orange-800",
      "Salad": "bg-emerald-100 text-emerald-800",
      "Pastries": "bg-purple-100 text-purple-800",
      "Breads": "bg-amber-100 text-amber-800",
      "Hot Breakfast": "bg-red-100 text-red-800",
      "Cold Breakfast": "bg-cyan-100 text-cyan-800",
      "Sandwiches": "bg-blue-100 text-blue-800",
      "Wraps": "bg-green-100 text-green-800",
      "Salads": "bg-emerald-100 text-emerald-800",
    };
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>;
  };

  const getDayPartBadge = (dayPart: string | undefined) => {
    if (!dayPart) return null;
    const colors: Record<string, string> = {
      "Morning": "bg-amber-100 text-amber-800 border-amber-300",
      "Lunch": "bg-blue-100 text-blue-800 border-blue-300",
      "Afternoon": "bg-purple-100 text-purple-800 border-purple-300",
    };
    return <Badge variant="outline" className={colors[dayPart] || "bg-gray-100 text-gray-800"}>{dayPart}</Badge>;
  };

  // Aggregate products by product ID when groupByProduct is true
  const displayProducts = viewMode === "hq" && groupByProduct
    ? Object.values(
        products.reduce((acc, product) => {
          if (!acc[product.id]) {
            acc[product.id] = {
              ...product,
              storeId: 'aggregated', // Unique ID for aggregated view
              store: `${products.filter(p => p.id === product.id).length} stores`,
              currentStock: 0,
              recommendedOrder: 0,
              finalOrder: 0,
            };
          }
          acc[product.id].currentStock += product.currentStock;
          acc[product.id].recommendedOrder += product.recommendedOrder;
          acc[product.id].finalOrder += product.finalOrder;
          return acc;
        }, {} as Record<string, Product>)
      )
    : products;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Hero Section */}
      <div 
        className="relative h-48 rounded-2xl overflow-hidden bg-cover bg-center shadow-2xl"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="flex items-center gap-3 mb-3">
            {viewMode === "hq" && (
              <div className="flex items-center gap-2 bg-[#ff914d]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#ff914d]/30">
                <Sparkles className="h-5 w-5 text-[#ff914d] animate-pulse" />
                <span className="text-white font-semibold text-sm">AI-Powered Suggestions</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {viewMode === "hq" ? "Suggested Production Plan" : "Store Deliveries"}
          </h1>
          <p className="text-xl text-white/90">
            {viewMode === "hq" ? "All Stores" : selectedStore} - {formattedDate}
          </p>
        </div>
      </div>

      {/* Date Picker and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Production Date:</span>
          <Select
            value={selectedDate.toISOString()}
            onValueChange={(value) => setSelectedDate(new Date(value))}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return (
                  <SelectItem key={i} value={date.toISOString()}>
                    {format(date, "EEEE, MMM d, yyyy")}
                    {i === 0 && " (Today)"}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === "hq" && (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={!groupByProduct ? "default" : "ghost"}
                  onClick={() => setGroupByProduct(false)}
                  className="h-8"
                >
                  By Line
                </Button>
                <Button
                  size="sm"
                  variant={groupByProduct ? "default" : "ghost"}
                  onClick={() => setGroupByProduct(true)}
                  className="h-8"
                >
                  By Product
                </Button>
              </div>
            )}
            <Button 
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Production Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {viewMode === "hq" ? "Daily Production Plan" : "Expected Deliveries"}
              </CardTitle>
              <CardDescription>
                {viewMode === "hq" 
                  ? "AI-powered production quantities for tomorrow's service"
                  : "Log received deliveries and track any variations from expected quantities"
                }
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Day Part</TableHead>
                {viewMode === "hq" && !groupByProduct && <TableHead>Store</TableHead>}
                {viewMode === "hq" && (
                  <TableHead className="bg-gradient-to-r from-[#ff914d]/20 to-[#ff914d]/10 relative text-center">
                    <div className="flex items-center justify-center gap-2 relative">
                      <div className="absolute inset-0 bg-[#ff914d]/5 blur-sm" />
                      <Sparkles className="h-4 w-4 text-[#ff914d] relative z-10 animate-pulse" />
                      <span className="relative z-10 font-semibold bg-gradient-to-r from-[#ff914d] to-[#ff914d]/70 bg-clip-text text-transparent">
                        AI Recommended Qty
                      </span>
                    </div>
                  </TableHead>
                )}
                <TableHead className="bg-brand-green/10 text-center">
                  {viewMode === "hq" ? "Final Qty" : "Delivered"}
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.map((product) => (
                <TableRow key={`${product.id}-${product.storeId}`}>
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
                    {getDayPartBadge(product.dayPart)}
                  </TableCell>
                  {viewMode === "hq" && !groupByProduct && (
                    <TableCell>
                      <span className="font-medium">{product.store}</span>
                    </TableCell>
                  )}
                  {viewMode === "hq" && (
                    <TableCell className="bg-gradient-to-r from-[#ff914d]/10 to-transparent relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#ff914d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <span className="font-mono font-semibold text-foreground">
                          {product.recommendedOrder}
                        </span>
                        <Sparkles className="h-3 w-3 text-[#ff914d] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="bg-brand-green/5">
                    <div className="flex items-center gap-2 justify-center">
                      {viewMode === "hq" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFinalOrder(product.id, product.storeId, -1)}
                            className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-mono font-bold text-brand-green min-w-[2.5rem] text-center text-lg">
                            {product.finalOrder}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFinalOrder(product.id, product.storeId, 1)}
                            className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFinalOrder(product.id, product.storeId, -1)}
                            className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-mono font-bold text-brand-green min-w-[2.5rem] text-center text-lg">
                            {product.finalOrder}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFinalOrder(product.id, product.storeId, 1)}
                            className="h-8 w-8 p-0 rounded-full border-brand-green hover:bg-brand-green hover:text-white transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground"
                      disabled={!!confirmingProduction}
                      onClick={() => handleConfirmProduction(product)}
                    >
                      {confirmingProduction === `${product.id}-${product.storeId}` ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {viewMode === "hq" ? "Confirming..." : "Logging..."}
                        </>
                      ) : (
                        viewMode === "hq" ? "Confirm" : "Log Delivery"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recipe Dialog */}
      {selectedRecipe && recipes[selectedRecipe as keyof typeof recipes] && (
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {recipes[selectedRecipe as keyof typeof recipes].productName}
              </DialogTitle>
              <DialogDescription>
                Preparation time: {recipes[selectedRecipe as keyof typeof recipes].prepTime}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <img 
                src={recipes[selectedRecipe as keyof typeof recipes].image} 
                alt={recipes[selectedRecipe as keyof typeof recipes].productName}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-lg mb-3">Ingredients (per unit)</h3>
                <div className="grid gap-2">
                  {recipes[selectedRecipe as keyof typeof recipes].ingredients.map((ing, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-muted rounded">
                      <span>{ing.item}</span>
                      <span className="font-mono text-sm">{ing.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                <ol className="space-y-2">
                  {recipes[selectedRecipe as keyof typeof recipes].instructions.map((inst, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="font-semibold text-primary min-w-[24px]">{idx + 1}.</span>
                      <span className="text-sm">{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedRecipe(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
