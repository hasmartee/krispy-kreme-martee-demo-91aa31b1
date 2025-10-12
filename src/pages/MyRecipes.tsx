import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, Plus, Upload } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useView } from "@/contexts/ViewContext";
import bltSandwich from "@/assets/products/blt-sandwich.jpg";
import chickenCaesarWrap from "@/assets/products/chicken-caesar-wrap.jpg";
import avocadoHummusWrap from "@/assets/products/avocado-hummus-wrap.jpg";
import tunaMeltPanini from "@/assets/products/tuna-melt-panini.jpg";
import mediterraneanSalad from "@/assets/products/mediterranean-salad.jpg";
import chickenBaconSandwich from "@/assets/products/chicken-bacon-sandwich.jpg";
import veganWrap from "@/assets/products/vegan-wrap.jpg";
import greekFetaSalad from "@/assets/products/greek-feta-salad.jpg";
import baconEggRoll from "@/assets/products/bacon-egg-roll.jpg";
import avocadoToastEgg from "@/assets/products/avocado-toast-egg.jpg";
import fruitYogurtPar from "@/assets/products/fruit-yogurt-parfait.jpg";
import breakfastBurrito from "@/assets/products/breakfast-burrito.jpg";
import granolaBowl from "@/assets/products/granola-bowl.jpg";
import eggCheeseMuffin from "@/assets/products/egg-cheese-muffin.jpg";
import almondButterBananaToast from "@/assets/products/almond-butter-banana-toast.jpg";
import coffeePastryCombo from "@/assets/products/coffee-pastry-combo.jpg";
import scrambledEggsSourdough from "@/assets/products/scrambled-eggs-sourdough.jpg";
import porridgeHoneyNuts from "@/assets/products/porridge-honey-nuts.jpg";
import hamCheeseCroissant from "@/assets/products/ham-cheese-croissant.jpg";
import salmonBagel from "@/assets/products/salmon-bagel.jpg";

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
    allergens?: string[];
  }[];
  instructions: string[];
}

const MyRecipes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState("Pret a Manger");
  const { viewMode } = useView();

  // Brand-specific recipes
  const brandRecipes: Record<string, Recipe[]> = {
    "Pret a Manger": [
      {
        id: "1",
        productName: "Classic BLT Sandwich",
        productSku: "PRET-012",
        category: "Sandwiches",
        image: bltSandwich,
        prepTime: "5 minutes",
        servings: 1,
        ingredients: [
          { item: "Bacon", quantity: "3 rashers (60g)", allergens: [] },
          { item: "Romaine Lettuce", quantity: "2 leaves (30g)", allergens: [] },
          { item: "Tomato", quantity: "3 slices (50g)", allergens: [] },
          { item: "Whole Wheat Bread", quantity: "2 slices (80g)", allergens: ["Gluten", "Wheat"] },
          { item: "Mayonnaise", quantity: "1 tbsp (15ml)", allergens: ["Eggs", "Mustard"] },
        ],
        instructions: [
          "Cook bacon until crispy",
          "Toast bread slices",
          "Layer lettuce, tomato, and bacon",
          "Cut diagonally and wrap"
        ],
      },
      {
        id: "2",
        productName: "Chicken Caesar Wrap",
        productSku: "PRET-020",
        category: "Wraps",
        image: chickenCaesarWrap,
        prepTime: "8 minutes",
        servings: 1,
        ingredients: [
          { item: "Chicken Breast", quantity: "120g", allergens: [] },
          { item: "Romaine Lettuce", quantity: "40g", allergens: [] },
          { item: "Parmesan", quantity: "20g", allergens: ["Milk"] },
          { item: "Caesar Dressing", quantity: "30ml", allergens: ["Eggs", "Fish"] },
        ],
        instructions: [
          "Grill chicken breast",
          "Warm tortilla wrap",
          "Layer ingredients and roll",
          "Cut and wrap"
        ],
      },
    ],
    "Brioche Dorée": [
      {
        id: "BD-1",
        productName: "Croque Monsieur",
        productSku: "BD-010",
        category: "Hot Food",
        image: hamCheeseCroissant,
        prepTime: "6 minutes",
        servings: 1,
        ingredients: [
          { item: "White Bread", quantity: "2 slices", allergens: ["Gluten"] },
          { item: "Ham", quantity: "80g", allergens: [] },
          { item: "Gruyère Cheese", quantity: "60g", allergens: ["Milk"] },
          { item: "Béchamel Sauce", quantity: "50ml", allergens: ["Milk", "Gluten"] },
        ],
        instructions: [
          "Layer ham and cheese between bread",
          "Top with béchamel sauce",
          "Grill until golden and melted",
          "Serve hot"
        ],
      },
      {
        id: "BD-2",
        productName: "Quiche Lorraine",
        productSku: "BD-012",
        category: "Hot Food",
        image: eggCheeseMuffin,
        prepTime: "45 minutes",
        servings: 6,
        ingredients: [
          { item: "Shortcrust Pastry", quantity: "250g", allergens: ["Gluten"] },
          { item: "Bacon Lardons", quantity: "200g", allergens: [] },
          { item: "Eggs", quantity: "4 large", allergens: ["Eggs"] },
          { item: "Crème Fraîche", quantity: "200ml", allergens: ["Milk"] },
        ],
        instructions: [
          "Line tart tin with pastry",
          "Cook bacon lardons",
          "Mix eggs and crème fraîche",
          "Bake at 180°C for 35 minutes"
        ],
      },
    ],
    "Starbucks": [
      {
        id: "SB-1",
        productName: "Bacon & Gouda Sandwich",
        productSku: "SB-001",
        category: "Breakfast",
        image: baconEggRoll,
        prepTime: "4 minutes",
        servings: 1,
        ingredients: [
          { item: "Bacon", quantity: "2 strips", allergens: [] },
          { item: "Gouda Cheese", quantity: "30g", allergens: ["Milk"] },
          { item: "English Muffin", quantity: "1", allergens: ["Gluten"] },
          { item: "Egg", quantity: "1", allergens: ["Eggs"] },
        ],
        instructions: [
          "Toast English muffin",
          "Cook bacon and egg",
          "Layer with cheese",
          "Serve warm"
        ],
      },
      {
        id: "SB-2",
        productName: "Turkey Pesto Panini",
        productSku: "SB-010",
        category: "Sandwiches",
        image: tunaMeltPanini,
        prepTime: "5 minutes",
        servings: 1,
        ingredients: [
          { item: "Turkey Breast", quantity: "100g", allergens: [] },
          { item: "Pesto", quantity: "30g", allergens: ["Milk", "Nuts"] },
          { item: "Mozzarella", quantity: "40g", allergens: ["Milk"] },
          { item: "Panini Bread", quantity: "1", allergens: ["Gluten"] },
        ],
        instructions: [
          "Spread pesto on bread",
          "Layer turkey and mozzarella",
          "Press in panini grill",
          "Serve hot"
        ],
      },
    ],
  };

  const recipes = brandRecipes[selectedBrand] || brandRecipes["Pret a Manger"];

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

        {viewMode === "hq" && (
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">My Brand:</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-[200px] h-9 border-[#7e9f57] focus:ring-[#7e9f57] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pret a Manger">Pret a Manger</SelectItem>
                    <SelectItem value="Brioche Dorée">Brioche Dorée</SelectItem>
                    <SelectItem value="Starbucks">Starbucks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

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
                            <div className="flex-1">
                              <span className="font-medium">{ingredient.item}</span>
                              {ingredient.allergens && ingredient.allergens.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {ingredient.allergens.map((allergen, i) => (
                                    <Badge key={i} variant="destructive" className="text-xs">
                                      {allergen}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
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
