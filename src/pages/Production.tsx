import { useState } from "react";
import { useView } from "@/contexts/ViewContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductionItem {
  id: string;
  productName: string;
  quantity: number;
  status: "confirmed" | "in-progress" | "completed";
  confirmedAt: string;
  dueTime: string;
  instructions: string[];
  ingredients: { name: string; amount: string }[];
  isAdHoc?: boolean;
}

interface DayPart {
  id: string;
  name: string;
  time: string;
  items: ProductionItem[];
  isEstimate: boolean;
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
  const { selectedStore } = useView();
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<string[]>(["morning"]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduction, setNewProduction] = useState({
    productName: "",
    quantity: "",
    dayPart: "morning",
    instructions: "",
  });

  // Mock data for day parts
  const [dayParts, setDayParts] = useState<DayPart[]>([
    {
      id: "morning",
      name: "Morning Production",
      time: "06:00 - 11:00",
      isEstimate: false,
      items: [
        {
          id: "1",
          productName: "Bacon & Egg Roll",
          quantity: 24,
          status: "completed",
          confirmedAt: "05:30",
          dueTime: "06:30",
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
          quantity: 18,
          status: "in-progress",
          confirmedAt: "05:30",
          dueTime: "07:00",
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
        }
      ]
    },
    {
      id: "lunchtime",
      name: "Lunchtime Production",
      time: "11:00 - 15:00",
      isEstimate: true,
      items: [
        {
          id: "3",
          productName: "BLT Sandwich",
          quantity: 32,
          status: "confirmed",
          confirmedAt: "Est. 10:30",
          dueTime: "11:30",
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
        {
          id: "4",
          productName: "Chicken Caesar Wrap",
          quantity: 28,
          status: "confirmed",
          confirmedAt: "Est. 10:30",
          dueTime: "12:00",
          instructions: [
            "Grill chicken breast",
            "Chop romaine lettuce",
            "Prepare Caesar dressing",
            "Warm tortilla wraps",
            "Assemble and roll tightly"
          ],
          ingredients: [
            { name: "Chicken breast", amount: "2kg" },
            { name: "Tortilla wraps", amount: "28 wraps" },
            { name: "Romaine lettuce", amount: "2 heads" },
            { name: "Parmesan", amount: "200g" },
            { name: "Caesar dressing", amount: "300ml" }
          ]
        }
      ]
    },
    {
      id: "afternoon",
      name: "Afternoon Production",
      time: "15:00 - 18:00",
      isEstimate: true,
      items: [
        {
          id: "5",
          productName: "Fruit & Yogurt Parfait",
          quantity: 20,
          status: "confirmed",
          confirmedAt: "Est. 14:30",
          dueTime: "15:30",
          instructions: [
            "Layer yogurt in cups",
            "Add granola layer",
            "Top with mixed berries",
            "Drizzle with honey",
            "Seal and refrigerate"
          ],
          ingredients: [
            { name: "Greek yogurt", amount: "2L" },
            { name: "Granola", amount: "800g" },
            { name: "Mixed berries", amount: "1.5kg" },
            { name: "Honey", amount: "200ml" }
          ]
        }
      ]
    }
  ]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
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
      quantity: parseInt(newProduction.quantity),
      status: "confirmed",
      confirmedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      dueTime: "ASAP",
      instructions: newProduction.instructions.split("\n").filter(i => i.trim()),
      ingredients: [],
      isAdHoc: true
    };

    setDayParts(prev => prev.map(dayPart => 
      dayPart.id === newProduction.dayPart
        ? { ...dayPart, items: [...dayPart.items, newItem] }
        : dayPart
    ));

    setNewProduction({
      productName: "",
      quantity: "",
      dayPart: "morning",
      instructions: ""
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Ad-hoc production added",
      description: `${newItem.productName} has been added to production queue`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production Plans</h1>
          <p className="text-muted-foreground">
            {selectedStore} - Today's production schedule
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
                <Label htmlFor="dayPart">Day Part</Label>
                <select
                  id="dayPart"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newProduction.dayPart}
                  onChange={(e) => setNewProduction({ ...newProduction, dayPart: e.target.value })}
                >
                  <option value="morning">Morning</option>
                  <option value="lunchtime">Lunchtime</option>
                  <option value="afternoon">Afternoon</option>
                </select>
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

      <div className="space-y-4">
        {dayParts.map((dayPart) => (
          <Collapsible
            key={dayPart.id}
            open={openSections.includes(dayPart.id)}
            onOpenChange={() => toggleSection(dayPart.id)}
          >
            <Card className="border-l-4 border-l-primary">
              <CollapsibleTrigger className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <ChevronDown 
                        className={`h-5 w-5 transition-transform ${
                          openSections.includes(dayPart.id) ? "" : "-rotate-90"
                        }`}
                      />
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {dayPart.name}
                          {dayPart.isEstimate && (
                            <Badge variant="outline" className="text-xs">
                              Estimate - Updates with live data
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{dayPart.time}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {dayPart.items.length} items
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-0">
                  {dayPart.items.map((item) => (
                    <Card key={item.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(item.status)}
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {item.productName}
                                {item.isAdHoc && (
                                  <Badge variant="outline" className="text-xs">
                                    Ad-hoc
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                Quantity: {item.quantity} units | Due: {item.dueTime}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(item.status)}
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
                              ✓ Production complete
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {dayParts.every(dp => dp.items.length === 0) && (
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
