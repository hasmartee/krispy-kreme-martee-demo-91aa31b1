import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, Plus, Upload } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import bltSandwich from "@/assets/products/blt-sandwich.jpg";
import chickenCaesarWrap from "@/assets/products/chicken-caesar-wrap.jpg";
import avocadoHummusWrap from "@/assets/products/avocado-hummus-wrap.jpg";
import salmonBagel from "@/assets/products/salmon-bagel.jpg";
import greekFetaSalad from "@/assets/products/greek-feta-salad.jpg";

interface Recipe {
  id: string;
  productName: string;
  productSku: string;
  category: string;
  image: string;
  prepTime: string;
  servings: number;
  ingredients: {
    item: string;
    quantity: string;
  }[];
  instructions: string[];
}

const MyRecipes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);

  const recipes: Recipe[] = [
    {
      id: "1",
      productName: "Classic BLT Sandwich",
      productSku: "SK001",
      category: "Sandwiches",
      image: bltSandwich,
      prepTime: "5 minutes",
      servings: 1,
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
    {
      id: "2",
      productName: "Chicken Caesar Wrap",
      productSku: "SK002",
      category: "Wraps",
      image: chickenCaesarWrap,
      prepTime: "8 minutes",
      servings: 1,
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
    {
      id: "3",
      productName: "Avocado & Hummus Wrap",
      productSku: "SK003",
      category: "Wraps",
      image: avocadoHummusWrap,
      prepTime: "4 minutes",
      servings: 1,
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
    {
      id: "4",
      productName: "Smoked Salmon Bagel",
      productSku: "SK006",
      category: "Bagels",
      image: salmonBagel,
      prepTime: "3 minutes",
      servings: 1,
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
    {
      id: "5",
      productName: "Greek Feta Salad",
      productSku: "SK009",
      category: "Salads",
      image: greekFetaSalad,
      prepTime: "6 minutes",
      servings: 1,
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
  ];

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-subtle">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Recipes</h1>
            <p className="text-muted-foreground">
              Production recipes with ingredients and instructions
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="shadow-brand"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button className="bg-primary text-primary-foreground shadow-brand hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recipe Search</CardTitle>
            <CardDescription>
              Find recipes by product name, SKU, or category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <Collapsible
              key={recipe.id}
              open={openRecipe === recipe.id}
              onOpenChange={(isOpen) => setOpenRecipe(isOpen ? recipe.id : null)}
            >
              <Card className="overflow-hidden shadow-card">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <img
                        src={recipe.image}
                        alt={recipe.productName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">{recipe.productName}</CardTitle>
                          <Badge variant="outline">{recipe.productSku}</Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span>{recipe.category}</span>
                          <span>•</span>
                          <span>Prep: {recipe.prepTime}</span>
                          <span>•</span>
                          <span>Serves: {recipe.servings}</span>
                        </CardDescription>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          openRecipe === recipe.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-foreground">Ingredients</h3>
                      <div className="grid gap-2">
                        {recipe.ingredients.map((ingredient, index) => (
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
                      <h3 className="text-lg font-semibold mb-3 text-foreground">Instructions</h3>
                      <ol className="space-y-3">
                        {recipe.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                              {index + 1}
                            </span>
                            <p className="flex-1 text-muted-foreground pt-1">{instruction}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
                <p>Try adjusting your search terms</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyRecipes;
