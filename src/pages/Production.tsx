import { useState } from "react";
import { useView } from "@/contexts/ViewContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, AlertCircle, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductionItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  status: "confirmed" | "in-progress" | "completed";
  confirmedAt: string;
  instructions: string[];
  ingredients: { name: string; amount: string }[];
  isAdHoc?: boolean;
  storeName?: string;
}

const getStatusIcon = (status: ProductionItem["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "in-progress":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "confirmed":
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
  }
};

const getStatusBadge = (status: ProductionItem["status"]) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-500">Completed</Badge>;
    case "in-progress":
      return <Badge className="bg-blue-500">In Progress</Badge>;
    case "confirmed":
      return <Badge className="bg-amber-500">Ready to Start</Badge>;
  }
};

export default function Production() {
  const { selectedStore, viewMode } = useView();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduction, setNewProduction] = useState({
    productName: "",
    quantity: "",
    instructions: "",
  });

  // Mock data - in HQ view, includes store names
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([
    {
      id: "1",
      productName: "Bacon & Egg Roll",
      sku: "BRK-001",
      quantity: 24,
      status: "completed",
      confirmedAt: "05:30",
      storeName: viewMode === "hq" ? "London Bridge" : undefined,
      instructions: [
        "Cook bacon strips until crispy",
        "Fry eggs to customer preference",
        "Toast rolls until golden",
        "Assemble and wrap individually"
      ],
      ingredients: [
        { name: "Bacon strips", amount: "48 strips" },
        { name: "Eggs", amount: "24 eggs" },
        { name: "Bread rolls", amount: "24 rolls" },
        { name: "Butter", amount: "200g" }
      ]
    },
    {
      id: "2",
      productName: "Breakfast Burrito",
      sku: "BRK-002",
      quantity: 18,
      status: "in-progress",
      confirmedAt: "05:30",
      storeName: viewMode === "hq" ? "London Bridge" : undefined,
      instructions: [
        "Scramble eggs with seasoning",
        "Cook sausage and chop into pieces",
        "Warm tortillas",
        "Fill with eggs, sausage, cheese and salsa",
        "Roll and wrap for service"
      ],
      ingredients: [
        { name: "Tortilla wraps", amount: "18 wraps" },
        { name: "Eggs", amount: "36 eggs" },
        { name: "Sausages", amount: "18 sausages" },
        { name: "Cheddar cheese", amount: "300g" },
        { name: "Salsa", amount: "250ml" }
      ]
    },
    {
      id: "3",
      productName: "BLT Sandwich",
      sku: "LUN-001",
      quantity: 32,
      status: "confirmed",
      confirmedAt: "10:30",
      storeName: viewMode === "hq" ? "Kings Cross" : undefined,
      instructions: [
        "Toast bread slices",
        "Cook bacon until crispy",
        "Wash and dry lettuce",
        "Slice tomatoes",
        "Layer ingredients and cut diagonally"
      ],
      ingredients: [
        { name: "Bread slices", amount: "64 slices" },
        { name: "Bacon", amount: "48 strips" },
        { name: "Lettuce", amount: "1 head" },
        { name: "Tomatoes", amount: "8 tomatoes" },
        { name: "Mayonnaise", amount: "200ml" }
      ]
    },
  ]);

  const handleCompleteItem = (itemId: string) => {
    setProductionItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: "completed" as const } : item
    ));

    toast({
      title: "✓ Production completed",
      description: "Stock levels have been updated on Live Availability page",
    });
  };

  const handleCompleteAll = () => {
    setProductionItems(prev => prev.map(item => ({ ...item, status: "completed" as const })));

    toast({
      title: "✓ All production completed",
      description: "All stock levels have been updated on Live Availability page",
    });
  };

  const handleAddProduction = () => {
    if (!newProduction.productName || !newProduction.quantity) {
      toast({
        title: "Missing information",
        description: "Please fill in product name and quantity",
        variant: "destructive"
      });
      return;
    }

    const newItem: ProductionItem = {
      id: `adhoc-${Date.now()}`,
      productName: newProduction.productName,
      sku: `ADH-${Date.now().toString().slice(-3)}`,
      quantity: parseInt(newProduction.quantity),
      status: "confirmed",
      confirmedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      instructions: newProduction.instructions.split("\n").filter(i => i.trim()),
      ingredients: [],
      isAdHoc: true
    };

    setProductionItems(prev => [...prev, newItem]);

    setNewProduction({
      productName: "",
      quantity: "",
      instructions: ""
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Ad-hoc production added",
      description: `${newItem.productName} has been added to production queue`,
    });
  };

  const allCompleted = productionItems.every(item => item.status === "completed");
  const someCompleted = productionItems.some(item => item.status === "completed");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production Plans</h1>
          <p className="text-muted-foreground">
            {viewMode === "hq" ? "All Stores - Today's production schedule" : `${selectedStore} - Today's production schedule`}
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Ad-hoc Production
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Ad-hoc Production</DialogTitle>
              <DialogDescription>
                Add an additional production item that wasn't in the planned schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Extra BLT Sandwiches"
                  value={newProduction.productName}
                  onChange={(e) => setNewProduction({ ...newProduction, productName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 12"
                  value={newProduction.quantity}
                  onChange={(e) => setNewProduction({ ...newProduction, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions (optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="One instruction per line"
                  rows={4}
                  value={newProduction.instructions}
                  onChange={(e) => setNewProduction({ ...newProduction, instructions: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduction}>
                Add Production
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Completing production items automatically updates stock levels on the Live Availability page.</strong> 
            Mark items as complete when production is finished and ready for service.
          </p>
        </CardContent>
      </Card>

      {/* Production List */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Today's Production
                {allCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {productionItems.filter(i => i.status === "completed").length}/{productionItems.length} completed
              </Badge>
              {!allCompleted && someCompleted && (
                <Button
                  size="sm"
                  onClick={handleCompleteAll}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Complete All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-0">
          {productionItems.map((item) => (
            <Card key={item.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.productName}
                        <span className="text-sm text-muted-foreground font-normal">
                          (SKU: {item.sku})
                        </span>
                        {item.isAdHoc && (
                          <Badge variant="outline" className="text-xs">
                            Ad-hoc
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground mt-1">
                        Quantity: {item.quantity} units
                        {viewMode === "hq" && item.storeName && ` • Store: ${item.storeName}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    {item.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteItem(item.id)}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {item.ingredients.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                        Ingredients Required
                      </h3>
                      <ul className="space-y-2">
                        {item.ingredients.map((ingredient, idx) => (
                          <li key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{ingredient.name}</span>
                            <span className="font-medium text-foreground">{ingredient.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.instructions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                        Production Steps
                      </h3>
                      <ol className="space-y-2">
                        {item.instructions.map((instruction, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary min-w-[20px]">{idx + 1}.</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Confirmed at {item.confirmedAt}
                  </span>
                  {item.status === "confirmed" && (
                    <span className="text-amber-600 font-medium">
                      ⚠️ Ready to begin production
                    </span>
                  )}
                  {item.status === "in-progress" && (
                    <span className="text-blue-600 font-medium">
                      🔄 Production in progress
                    </span>
                  )}
                  {item.status === "completed" && (
                    <span className="text-green-600 font-medium">
                      ✓ Production complete - Stock updated
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {productionItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No production plans confirmed yet. Check the Suggested Production page to confirm today's production.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}