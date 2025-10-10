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
      productName: "Tuna Melt Panini",
      productSku: "SK004",
      category: "Hot Food",
      image: tunaMeltPanini,
      prepTime: "7 minutes",
      servings: 1,
      ingredients: [
        { item: "Tuna", quantity: "100g (canned, drained)" },
        { item: "Mayonnaise", quantity: "2 tbsp (30ml)" },
        { item: "Cheddar Cheese", quantity: "50g (sliced)" },
        { item: "Ciabatta Bread", quantity: "1 roll (100g)" },
        { item: "Red Onion", quantity: "15g (diced)" },
        { item: "Black Pepper", quantity: "To taste" },
      ],
      instructions: [
        "Drain canned tuna thoroughly and place in a mixing bowl.",
        "Add mayonnaise, diced red onion, and black pepper to the tuna.",
        "Mix ingredients together until well combined.",
        "Slice ciabatta roll in half horizontally.",
        "Spread tuna mixture evenly on the bottom half of the bread.",
        "Layer cheddar cheese slices on top of the tuna.",
        "Place the top half of the bread on and press gently.",
        "Preheat panini press or grill pan to medium-high heat.",
        "Grill panini for 3-4 minutes until cheese melts and bread is golden.",
        "Cut in half diagonally and serve immediately.",
      ],
    },
    {
      id: "5",
      productName: "Mediterranean Salad Bowl",
      productSku: "SK005",
      category: "Salads",
      image: mediterraneanSalad,
      prepTime: "6 minutes",
      servings: 1,
      ingredients: [
        { item: "Mixed Greens", quantity: "80g" },
        { item: "Cherry Tomatoes", quantity: "60g (halved)" },
        { item: "Cucumber", quantity: "80g (diced)" },
        { item: "Red Onion", quantity: "20g (sliced)" },
        { item: "Feta Cheese", quantity: "40g (crumbled)" },
        { item: "Kalamata Olives", quantity: "30g" },
        { item: "Olive Oil", quantity: "2 tbsp (30ml)" },
        { item: "Lemon Juice", quantity: "1 tbsp (15ml)" },
      ],
      instructions: [
        "Wash and drain mixed greens thoroughly.",
        "Halve cherry tomatoes and dice cucumber into bite-sized pieces.",
        "Thinly slice red onion.",
        "In a large bowl, combine mixed greens, tomatoes, cucumber, and onion.",
        "Add Kalamata olives to the salad.",
        "Crumble feta cheese over the top.",
        "In a small bowl, whisk together olive oil and lemon juice.",
        "Drizzle dressing over the salad just before serving.",
        "Toss gently to combine all ingredients.",
        "Transfer to serving container.",
      ],
    },
    {
      id: "6",
      productName: "Chicken & Bacon Sandwich",
      productSku: "SK006",
      category: "Sandwiches",
      image: chickenBaconSandwich,
      prepTime: "8 minutes",
      servings: 1,
      ingredients: [
        { item: "Chicken Breast", quantity: "120g (cooked, sliced)" },
        { item: "Bacon", quantity: "2 rashers (40g)" },
        { item: "Lettuce", quantity: "2 leaves" },
        { item: "Tomato", quantity: "2 slices (40g)" },
        { item: "Malted Bread", quantity: "2 slices (80g)" },
        { item: "Mayonnaise", quantity: "1 tbsp (15ml)" },
      ],
      instructions: [
        "Cook bacon in a pan until crispy.",
        "Grill or pan-fry chicken breast until cooked through.",
        "Slice chicken into thin strips.",
        "Toast bread slices until golden.",
        "Spread mayonnaise on both slices of bread.",
        "Layer lettuce, tomato, chicken, and bacon on one slice.",
        "Top with the second slice of bread.",
        "Cut diagonally and wrap for serving.",
      ],
    },
    {
      id: "7",
      productName: "Vegan No-Chicken Wrap",
      productSku: "SK007",
      category: "Wraps",
      image: veganWrap,
      prepTime: "6 minutes",
      servings: 1,
      ingredients: [
        { item: "Vegan Chicken Strips", quantity: "100g" },
        { item: "Tortilla Wrap", quantity: "1 large (60g)" },
        { item: "Lettuce", quantity: "40g (shredded)" },
        { item: "Tomato", quantity: "50g (diced)" },
        { item: "Vegan Mayo", quantity: "2 tbsp (30ml)" },
        { item: "Cucumber", quantity: "40g (sliced)" },
      ],
      instructions: [
        "Heat vegan chicken strips in a pan until warmed through.",
        "Warm tortilla wrap for 10 seconds.",
        "Spread vegan mayo across the wrap.",
        "Layer shredded lettuce, diced tomato, and cucumber.",
        "Add warmed vegan chicken strips.",
        "Fold bottom up, sides in, and roll tightly.",
        "Cut in half diagonally and package.",
      ],
    },
    {
      id: "8",
      productName: "Greek Feta Salad",
      productSku: "SK008",
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
    // Breakfast items
    {
      id: "51",
      productName: "Bacon & Egg Roll",
      productSku: "SK051",
      category: "Breakfast",
      image: baconEggRoll,
      prepTime: "6 minutes",
      servings: 1,
      ingredients: [
        { item: "Bacon", quantity: "3 rashers (60g)" },
        { item: "Eggs", quantity: "2 large" },
        { item: "Bread Roll", quantity: "1 (90g)" },
        { item: "Butter", quantity: "10g" },
        { item: "Salt & Pepper", quantity: "To taste" },
      ],
      instructions: [
        "Cook bacon in a pan until crispy.",
        "Fry eggs to desired doneness.",
        "Slice bread roll in half and lightly toast.",
        "Spread butter on both halves of the roll.",
        "Layer bacon and eggs on the bottom half.",
        "Season with salt and pepper.",
        "Top with the other half of the roll.",
        "Wrap immediately for serving.",
      ],
    },
    {
      id: "52",
      productName: "Avocado Toast with Poached Egg",
      productSku: "SK052",
      category: "Breakfast",
      image: avocadoToastEgg,
      prepTime: "8 minutes",
      servings: 1,
      ingredients: [
        { item: "Avocado", quantity: "1 medium (150g)" },
        { item: "Eggs", quantity: "2 large" },
        { item: "Sourdough Bread", quantity: "2 slices (100g)" },
        { item: "Lemon Juice", quantity: "1 tsp" },
        { item: "Salt & Pepper", quantity: "To taste" },
        { item: "Chili Flakes", quantity: "Pinch (optional)" },
      ],
      instructions: [
        "Bring a pot of water to a gentle simmer for poaching eggs.",
        "Mash avocado with lemon juice, salt, and pepper.",
        "Toast sourdough bread until golden.",
        "Poach eggs in simmering water for 3-4 minutes.",
        "Spread mashed avocado on toasted bread.",
        "Top each slice with a poached egg.",
        "Season with salt, pepper, and chili flakes if desired.",
        "Serve immediately.",
      ],
    },
    {
      id: "53",
      productName: "Fruit & Yogurt Parfait",
      productSku: "SK053",
      category: "Breakfast",
      image: fruitYogurtPar,
      prepTime: "4 minutes",
      servings: 1,
      ingredients: [
        { item: "Greek Yogurt", quantity: "200g" },
        { item: "Strawberries", quantity: "60g (sliced)" },
        { item: "Blueberries", quantity: "40g" },
        { item: "Granola", quantity: "40g" },
        { item: "Honey", quantity: "1 tbsp (20ml)" },
      ],
      instructions: [
        "Wash and slice strawberries.",
        "In a serving glass or bowl, layer half the yogurt.",
        "Add half the berries and granola.",
        "Repeat layering with remaining ingredients.",
        "Drizzle honey on top.",
        "Serve immediately or refrigerate until ready to eat.",
      ],
    },
    {
      id: "54",
      productName: "Breakfast Burrito",
      productSku: "SK054",
      category: "Breakfast",
      image: breakfastBurrito,
      prepTime: "10 minutes",
      servings: 1,
      ingredients: [
        { item: "Eggs", quantity: "3 large" },
        { item: "Cheddar Cheese", quantity: "40g (grated)" },
        { item: "Bacon", quantity: "2 rashers (40g)" },
        { item: "Tortilla Wrap", quantity: "1 large (60g)" },
        { item: "Bell Pepper", quantity: "40g (diced)" },
        { item: "Onion", quantity: "30g (diced)" },
        { item: "Salt & Pepper", quantity: "To taste" },
      ],
      instructions: [
        "Cook bacon until crispy, then chop into pieces.",
        "Sauté diced onion and bell pepper until soft.",
        "Scramble eggs and season with salt and pepper.",
        "Warm tortilla wrap.",
        "Layer scrambled eggs, bacon, vegetables, and cheese in the center of the wrap.",
        "Fold bottom up, sides in, and roll tightly.",
        "Toast in a pan if desired for a crispy exterior.",
        "Cut in half and serve.",
      ],
    },
    {
      id: "55",
      productName: "Granola Bowl with Berries",
      productSku: "SK055",
      category: "Breakfast",
      image: granolaBowl,
      prepTime: "3 minutes",
      servings: 1,
      ingredients: [
        { item: "Granola", quantity: "80g" },
        { item: "Greek Yogurt", quantity: "150g" },
        { item: "Mixed Berries", quantity: "100g" },
        { item: "Honey", quantity: "1 tbsp (20ml)" },
        { item: "Almonds", quantity: "20g (sliced)" },
      ],
      instructions: [
        "Add granola to a serving bowl.",
        "Top with Greek yogurt.",
        "Arrange fresh mixed berries on top.",
        "Sprinkle sliced almonds.",
        "Drizzle with honey.",
        "Serve immediately.",
      ],
    },
    {
      id: "56",
      productName: "Egg & Cheese Muffin",
      productSku: "SK056",
      category: "Breakfast",
      image: eggCheeseMuffin,
      prepTime: "5 minutes",
      servings: 1,
      ingredients: [
        { item: "Eggs", quantity: "1 large" },
        { item: "Cheddar Cheese", quantity: "30g (sliced)" },
        { item: "English Muffin", quantity: "1 (70g)" },
        { item: "Butter", quantity: "10g" },
        { item: "Salt & Pepper", quantity: "To taste" },
      ],
      instructions: [
        "Fry egg to desired doneness.",
        "Toast English muffin halves.",
        "Spread butter on muffin halves.",
        "Place fried egg on bottom half.",
        "Add cheese slice on top of egg.",
        "Season with salt and pepper.",
        "Top with other muffin half.",
        "Wrap and serve.",
      ],
    },
    {
      id: "57",
      productName: "Almond Butter & Banana Toast",
      productSku: "SK057",
      category: "Breakfast",
      image: almondButterBananaToast,
      prepTime: "4 minutes",
      servings: 1,
      ingredients: [
        { item: "Almond Butter", quantity: "40g" },
        { item: "Banana", quantity: "1 medium (120g)" },
        { item: "Whole Grain Bread", quantity: "2 slices (80g)" },
        { item: "Honey", quantity: "1 tsp (optional)" },
        { item: "Cinnamon", quantity: "Pinch (optional)" },
      ],
      instructions: [
        "Toast bread slices until golden.",
        "Spread almond butter evenly on both slices.",
        "Slice banana into rounds.",
        "Arrange banana slices on top of almond butter.",
        "Drizzle with honey if desired.",
        "Sprinkle with cinnamon if desired.",
        "Serve immediately.",
      ],
    },
    {
      id: "58",
      productName: "Coffee & Pastry Combo",
      productSku: "SK058",
      category: "Breakfast",
      image: coffeePastryCombo,
      prepTime: "5 minutes",
      servings: 1,
      ingredients: [
        { item: "Espresso", quantity: "30ml (double shot)" },
        { item: "Milk", quantity: "150ml (steamed)" },
        { item: "Fresh Croissant", quantity: "1 (70g)" },
      ],
      instructions: [
        "Prepare double shot of espresso.",
        "Steam milk to 65-70°C.",
        "Pour espresso into cup.",
        "Add steamed milk, creating foam on top.",
        "Warm croissant in oven if desired.",
        "Serve coffee and croissant together.",
      ],
    },
    {
      id: "59",
      productName: "Scrambled Eggs on Sourdough",
      productSku: "SK059",
      category: "Breakfast",
      image: scrambledEggsSourdough,
      prepTime: "6 minutes",
      servings: 1,
      ingredients: [
        { item: "Eggs", quantity: "3 large" },
        { item: "Butter", quantity: "20g" },
        { item: "Sourdough Bread", quantity: "2 slices (100g)" },
        { item: "Milk", quantity: "2 tbsp (30ml)" },
        { item: "Salt & Pepper", quantity: "To taste" },
        { item: "Chives", quantity: "Small bunch (optional)" },
      ],
      instructions: [
        "Whisk eggs with milk, salt, and pepper.",
        "Melt butter in a non-stick pan over low heat.",
        "Pour in egg mixture and cook slowly, stirring gently.",
        "Toast sourdough bread until golden.",
        "When eggs are softly scrambled, remove from heat.",
        "Pile scrambled eggs on toasted sourdough.",
        "Garnish with chopped chives if desired.",
        "Serve immediately.",
      ],
    },
    {
      id: "60",
      productName: "Porridge with Honey & Nuts",
      productSku: "SK060",
      category: "Breakfast",
      image: porridgeHoneyNuts,
      prepTime: "10 minutes",
      servings: 1,
      ingredients: [
        { item: "Rolled Oats", quantity: "60g" },
        { item: "Milk or Water", quantity: "250ml" },
        { item: "Honey", quantity: "2 tbsp (40ml)" },
        { item: "Almonds", quantity: "20g (chopped)" },
        { item: "Walnuts", quantity: "20g (chopped)" },
        { item: "Salt", quantity: "Pinch" },
      ],
      instructions: [
        "Combine oats and milk/water in a pot with a pinch of salt.",
        "Bring to a gentle boil, then reduce heat.",
        "Simmer for 8-10 minutes, stirring occasionally.",
        "Once oats are creamy, transfer to serving bowl.",
        "Drizzle honey over the porridge.",
        "Top with chopped almonds and walnuts.",
        "Serve immediately while hot.",
      ],
    },
    {
      id: "61",
      productName: "Ham & Cheese Croissant",
      productSku: "SK061",
      category: "Breakfast",
      image: hamCheeseCroissant,
      prepTime: "4 minutes",
      servings: 1,
      ingredients: [
        { item: "Croissant", quantity: "1 (70g)" },
        { item: "Ham", quantity: "50g (sliced)" },
        { item: "Swiss Cheese", quantity: "40g (sliced)" },
        { item: "Butter", quantity: "10g (optional)" },
      ],
      instructions: [
        "Slice croissant in half horizontally.",
        "Warm in oven at 180°C for 2-3 minutes if desired.",
        "Layer ham slices on bottom half.",
        "Add cheese slices on top of ham.",
        "Optionally add a pat of butter.",
        "Place top half of croissant on.",
        "Wrap and serve.",
      ],
    },
    {
      id: "62",
      productName: "Smoked Salmon Bagel",
      productSku: "SK062",
      category: "Breakfast",
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
