import { useView } from "@/contexts/ViewContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface ProductionPlan {
  id: string;
  productName: string;
  quantity: number;
  status: "confirmed" | "in-progress" | "completed";
  confirmedAt: string;
  dueTime: string;
  instructions: string[];
  ingredients: { name: string; amount: string }[];
}

// Mock data - these would come from the confirmed productions
const mockProductionPlans: ProductionPlan[] = [
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
  },
  {
    id: "3",
    productName: "Avocado Toast with Egg",
    quantity: 15,
    status: "confirmed",
    confirmedAt: "06:00",
    dueTime: "08:00",
    instructions: [
      "Toast sourdough bread",
      "Mash avocados with lime and seasoning",
      "Poach eggs",
      "Assemble and garnish with chili flakes"
    ],
    ingredients: [
      { name: "Sourdough bread", amount: "15 slices" },
      { name: "Avocados", amount: "8 avocados" },
      { name: "Eggs", amount: "15 eggs" },
      { name: "Lime", amount: "2 limes" },
      { name: "Chili flakes", amount: "To garnish" }
    ]
  }
];

const getStatusIcon = (status: ProductionPlan["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "in-progress":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "confirmed":
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
  }
};

const getStatusBadge = (status: ProductionPlan["status"]) => {
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Production Plans</h1>
        <p className="text-muted-foreground">
          {selectedStore} - Today's confirmed production schedule
        </p>
      </div>

      <div className="grid gap-6">
        {mockProductionPlans.map((plan) => (
          <Card key={plan.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(plan.status)}
                  <div>
                    <CardTitle className="text-xl">{plan.productName}</CardTitle>
                    <CardDescription>
                      Quantity: {plan.quantity} units | Due: {plan.dueTime}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(plan.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                    Ingredients Required
                  </h3>
                  <ul className="space-y-2">
                    {plan.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{ingredient.name}</span>
                        <span className="font-medium text-foreground">{ingredient.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                    Production Steps
                  </h3>
                  <ol className="space-y-2">
                    {plan.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary min-w-[20px]">{idx + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Confirmed at {plan.confirmedAt}
                </span>
                {plan.status === "confirmed" && (
                  <span className="text-amber-600 font-medium">
                    ⚠️ Ready to begin production
                  </span>
                )}
                {plan.status === "in-progress" && (
                  <span className="text-blue-600 font-medium">
                    🔄 Production in progress
                  </span>
                )}
                {plan.status === "completed" && (
                  <span className="text-green-600 font-medium">
                    ✓ Production complete
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockProductionPlans.length === 0 && (
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
