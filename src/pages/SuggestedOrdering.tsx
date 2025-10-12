import { useState, useEffect } from "react";
import { useView } from "@/contexts/ViewContext";
import { ViewSelector } from "@/components/ViewSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Calendar, Truck, Package, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SupplierOrder {
  supplierId: string;
  supplierName: string;
  storeName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  leadTimeDays: number;
  items: {
    ingredientName: string;
    currentStock: number;
    minStockLevel: number;
    shortfall: number;
    orderQuantity: number;
    unit: string;
    category: string;
  }[];
  totalItems: number;
  urgency: "high" | "medium" | "low";
}

export default function SuggestedOrdering() {
  const { viewMode, selectedStore } = useView();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSuggestedOrders();
  }, [viewMode, selectedStore]);

  const getNextDeliveryDate = (supplierName: string, storeName: string): string => {
    // Mock delivery schedule logic based on My Logistics data
    const schedules: Record<string, Record<string, string[]>> = {
      "Fresh Farms Ltd": {
        "London Bridge": ["Monday", "Thursday"],
        "Canary Wharf": ["Tuesday", "Friday"],
        "King's Cross": ["Monday", "Wednesday"],
      },
      "Premium Proteins Co": {
        "London Bridge": ["Tuesday", "Friday"],
        "Canary Wharf": ["Wednesday", "Saturday"],
        "King's Cross": ["Tuesday", "Thursday"],
      },
      "Dairy Direct": {
        "London Bridge": ["Monday", "Wednesday", "Friday"],
        "Canary Wharf": ["Tuesday", "Thursday", "Saturday"],
        "King's Cross": ["Monday", "Wednesday", "Friday"],
      },
      "Mediterranean Foods Import": {
        "London Bridge": ["Wednesday"],
        "Canary Wharf": ["Thursday"],
        "King's Cross": ["Friday"],
      },
      "Artisan Bakery Supply": {
        "London Bridge": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "Canary Wharf": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "King's Cross": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      "Gourmet Condiments Ltd": {
        "London Bridge": ["Monday"],
        "Canary Wharf": ["Tuesday"],
        "King's Cross": ["Wednesday"],
      },
    };

    const deliveryDays = schedules[supplierName]?.[storeName] || ["Monday"];
    const today = new Date();
    const currentDay = today.getDay();
    
    const dayMap: Record<string, number> = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, 
      Thursday: 4, Friday: 5, Saturday: 6
    };

    let nextDeliveryDay = 7;
    for (const day of deliveryDays) {
      const deliveryDayNum = dayMap[day];
      let daysUntil = (deliveryDayNum - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7;
      if (daysUntil < nextDeliveryDay) {
        nextDeliveryDay = daysUntil;
      }
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + nextDeliveryDay);
    return nextDate.toISOString().split("T")[0];
  };

  const calculateOrderDate = (deliveryDate: string, leadTimeDays: number): string => {
    const delivery = new Date(deliveryDate);
    const order = new Date(delivery);
    order.setDate(delivery.getDate() - leadTimeDays);
    return order.toISOString().split("T")[0];
  };

  const generateSuggestedOrders = async () => {
    setLoading(true);
    try {
      // Mock low stock ingredients data (from Inventory page logic)
      const lowStockIngredients = [
        { name: "Romaine Lettuce", currentStock: 12, minStock: 20, category: "Vegetables", supplier: "Fresh Farms Ltd", leadTime: 2, unit: "kg" },
        { name: "Parmesan Cheese", currentStock: 8, minStock: 15, category: "Dairy", supplier: "Dairy Direct", leadTime: 1, unit: "kg" },
        { name: "Caesar Dressing", currentStock: 0, minStock: 10, category: "Condiments", supplier: "Gourmet Condiments Ltd", leadTime: 4, unit: "L" },
        { name: "Whole Wheat Bread", currentStock: 18, minStock: 30, category: "Bakery", supplier: "Artisan Bakery Supply", leadTime: 1, unit: "loaves" },
        { name: "Smoked Salmon", currentStock: 8, minStock: 15, category: "Protein", supplier: "Premium Proteins Co", leadTime: 3, unit: "kg" },
        { name: "Cherry Tomatoes", currentStock: 0, minStock: 25, category: "Vegetables", supplier: "Fresh Farms Ltd", leadTime: 2, unit: "kg" },
        { name: "Feta Cheese", currentStock: 0, minStock: 12, category: "Dairy", supplier: "Mediterranean Foods Import", leadTime: 5, unit: "kg" },
        { name: "Olive Oil", currentStock: 3, minStock: 15, category: "Condiments", supplier: "Mediterranean Foods Import", leadTime: 5, unit: "L" },
        { name: "Ciabatta Bread", currentStock: 0, minStock: 40, category: "Bakery", supplier: "Artisan Bakery Supply", leadTime: 1, unit: "loaves" },
        { name: "Chicken Breast", currentStock: 5, minStock: 20, category: "Protein", supplier: "Premium Proteins Co", leadTime: 3, unit: "kg" },
        { name: "Bacon", currentStock: 0, minStock: 18, category: "Protein", supplier: "Premium Proteins Co", leadTime: 3, unit: "kg" },
        { name: "Cream Cheese", currentStock: 6, minStock: 20, category: "Dairy", supplier: "Dairy Direct", leadTime: 1, unit: "kg" },
      ];

      const stores = viewMode === "store_manager" 
        ? [selectedStore]
        : ["London Bridge", "Canary Wharf", "King's Cross"];

      const suggestedOrders: SupplierOrder[] = [];

      for (const store of stores) {
        // Group ingredients by supplier
        const supplierGroups: Record<string, typeof lowStockIngredients> = {};
        
        lowStockIngredients.forEach(ingredient => {
          if (!supplierGroups[ingredient.supplier]) {
            supplierGroups[ingredient.supplier] = [];
          }
          supplierGroups[ingredient.supplier].push(ingredient);
        });

        // Create orders for each supplier
        Object.entries(supplierGroups).forEach(([supplier, ingredients]) => {
          const nextDelivery = getNextDeliveryDate(supplier, store);
          const leadTime = ingredients[0].leadTime;
          const orderDate = calculateOrderDate(nextDelivery, leadTime);

          const items = ingredients.map(ing => {
            const shortfall = ing.minStock - ing.currentStock;
            const orderQuantity = Math.ceil(shortfall * 1.2); // Order 20% extra for buffer

            return {
              ingredientName: ing.name,
              currentStock: ing.currentStock,
              minStockLevel: ing.minStock,
              shortfall,
              orderQuantity,
              unit: ing.unit,
              category: ing.category,
            };
          });

          // Determine urgency based on current stock levels
          const criticalItems = items.filter(item => item.currentStock === 0).length;
          const lowItems = items.filter(item => item.currentStock > 0 && item.currentStock < item.minStockLevel * 0.5).length;
          
          let urgency: "high" | "medium" | "low" = "low";
          if (criticalItems > 0) urgency = "high";
          else if (lowItems > 0) urgency = "medium";

          suggestedOrders.push({
            supplierId: supplier,
            supplierName: supplier,
            storeName: store,
            orderDate,
            expectedDeliveryDate: nextDelivery,
            leadTimeDays: leadTime,
            items,
            totalItems: items.length,
            urgency,
          });
        });
      }

      // Sort by urgency and order date
      suggestedOrders.sort((a, b) => {
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      });

      setOrders(suggestedOrders);
    } catch (error) {
      console.error("Error generating suggested orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Urgent
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="gap-1">
            Low Priority
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Suggested Ordering</h1>
                <p className="text-sm text-muted-foreground">
                  {viewMode === "store_manager"
                    ? `Ingredient re-order recommendations for ${selectedStore}`
                    : "Ingredient re-order recommendations across all stores"}
                </p>
              </div>
            </div>
            <ViewSelector />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {loading ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              Generating order suggestions...
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No orders needed at this time - all ingredient levels are sufficient
            </CardContent>
          </Card>
        ) : (
          orders.map((order, index) => (
            <Card key={index} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{order.supplierName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{order.storeName}</p>
                    </div>
                  </div>
                  {getUrgencyBadge(order.urgency)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Order By</p>
                      <p className="text-sm font-semibold">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Delivery</p>
                      <p className="text-sm font-semibold">{formatDate(order.expectedDeliveryDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Lead Time</p>
                      <p className="text-sm font-semibold">{order.leadTimeDays} days</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Level</TableHead>
                      <TableHead>Shortfall</TableHead>
                      <TableHead className="text-right">Order Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, itemIndex) => (
                      <TableRow key={itemIndex}>
                        <TableCell className="font-medium">{item.ingredientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={item.currentStock === 0 ? "text-destructive font-semibold" : ""}>
                            {item.currentStock} {item.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.minStockLevel} {item.unit}
                        </TableCell>
                        <TableCell className="text-warning font-medium">
                          {item.shortfall} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-primary">
                            {item.orderQuantity} {item.unit}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline">
                    Download Order
                  </Button>
                  <Button className="bg-primary text-primary-foreground">
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
