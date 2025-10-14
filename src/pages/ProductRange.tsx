import { useState, useRef, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, LayoutGrid, List, Upload } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useView } from "@/contexts/ViewContext";
import ProductCard from "@/components/ProductCard";
import ProductListItem from "@/components/ProductListItem";
import cinnamonSwirl from "@/assets/products/cinnamon-swirl.jpg";
import poppySeedPastry from "@/assets/products/poppy-seed-pastry.jpg";
import danishPastry from "@/assets/products/danish-pastry.jpg";
import butterCroissant from "@/assets/products/butter-croissant.jpg";
import painAuChocolat from "@/assets/products/pain-au-chocolat.jpg";
import almondCroissant from "@/assets/products/almond-croissant.jpg";
import ryeBreadWhole from "@/assets/products/rye-bread-whole.jpg";
import sourdoughLoaf from "@/assets/products/sourdough-loaf.jpg";
import wholeGrainRoll from "@/assets/products/whole-grain-roll.jpg";
import sesameRoll from "@/assets/products/sesame-roll.jpg";
import scrambledEggsToast from "@/assets/products/scrambled-eggs-toast.jpg";
import baconEggRoll from "@/assets/products/bacon-egg-roll.jpg";
import hamCheeseCroissantHot from "@/assets/products/ham-cheese-croissant-hot.jpg";
import avocadoEggToast from "@/assets/products/avocado-egg-toast.jpg";
import porridgeHoney from "@/assets/products/porridge-honey.jpg";
import granolaYogurtBowl from "@/assets/products/granola-yogurt-bowl.jpg";
import fruitParfait from "@/assets/products/fruit-parfait.jpg";
import almondBananaToast from "@/assets/products/almond-banana-toast.jpg";
import classicBlt from "@/assets/products/classic-blt.jpg";
import chickenBacon from "@/assets/products/chicken-bacon.jpg";
import salmonCreamBagel from "@/assets/products/salmon-cream-bagel.jpg";
import tunaMelt from "@/assets/products/tuna-melt.jpg";
import hamCheeseToastie from "@/assets/products/ham-cheese-toastie.jpg";
import eggCheeseEnglishMuffin from "@/assets/products/egg-cheese-english-muffin.jpg";
import chickenCaesar from "@/assets/products/chicken-caesar.jpg";
import avocadoHummus from "@/assets/products/avocado-hummus.jpg";
import veganMediterraneanWrap from "@/assets/products/vegan-mediterranean-wrap.jpg";
import breakfastBurritoWrap from "@/assets/products/breakfast-burrito-wrap.jpg";
import mediterraneanSaladBowl from "@/assets/products/mediterranean-salad-bowl.jpg";
import greekSaladBowl from "@/assets/products/greek-salad-bowl.jpg";
import coffeePastry from "@/assets/products/coffee-pastry.jpg";

// Brand-specific product catalogs
const brandProducts = {
  "Ole and Steen": [
    // Pastries & Viennoiserie
    { skuId: "OS-P001", name: "Kanelstang (Cinnamon Swirl)", category: "Pastries", price: 3.95, costPrice: 1.65, inStock: true, image: cinnamonSwirl, allergens: ["Gluten", "Dairy", "Egg"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-P002", name: "Tebirkes (Poppy Seed Pastry)", category: "Pastries", price: 3.75, costPrice: 1.55, inStock: true, image: poppySeedPastry, allergens: ["Gluten", "Dairy", "Sesame"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-P003", name: "Wienerbrød (Danish Pastry)", category: "Pastries", price: 4.25, costPrice: 1.75, inStock: true, image: danishPastry, allergens: ["Gluten", "Dairy", "Egg"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-P004", name: "Croissant", category: "Pastries", price: 3.50, costPrice: 1.45, inStock: true, image: butterCroissant, allergens: ["Gluten", "Dairy"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-P005", name: "Pain au Chocolat", category: "Pastries", price: 3.95, costPrice: 1.65, inStock: true, image: painAuChocolat, allergens: ["Gluten", "Dairy"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-P006", name: "Almond Croissant", category: "Pastries", price: 4.50, costPrice: 1.85, inStock: true, image: almondCroissant, allergens: ["Gluten", "Dairy", "Nuts"], shelfLife: 1, ingredients: [] },
    
    // Breads & Baked Goods
    { skuId: "OS-B001", name: "Rugbrød (Rye Bread) Whole", category: "Breads", price: 5.95, costPrice: 2.50, inStock: true, image: ryeBreadWhole, allergens: ["Gluten"], shelfLife: 5, ingredients: [] },
    { skuId: "OS-B002", name: "Sourdough Loaf", category: "Breads", price: 6.50, costPrice: 2.75, inStock: true, image: sourdoughLoaf, allergens: ["Gluten"], shelfLife: 3, ingredients: [] },
    { skuId: "OS-B003", name: "Whole Grain Roll", category: "Breads", price: 2.25, costPrice: 0.95, inStock: true, image: wholeGrainRoll, allergens: ["Gluten"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-B004", name: "Sesame Roll", category: "Breads", price: 2.25, costPrice: 0.95, inStock: true, image: sesameRoll, allergens: ["Gluten", "Sesame"], shelfLife: 2, ingredients: [] },
    
    // Hot Breakfast Items
    { skuId: "OS-HB001", name: "Scrambled Eggs on Sourdough", category: "Hot Breakfast", price: 6.95, costPrice: 2.95, inStock: true, image: scrambledEggsToast, allergens: ["Gluten", "Egg", "Dairy"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-HB002", name: "Bacon & Egg Roll", category: "Hot Breakfast", price: 5.95, costPrice: 2.50, inStock: true, image: baconEggRoll, allergens: ["Gluten", "Egg"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-HB003", name: "Ham & Cheese Croissant", category: "Hot Breakfast", price: 5.50, costPrice: 2.30, inStock: true, image: hamCheeseCroissantHot, allergens: ["Gluten", "Dairy"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-HB004", name: "Avocado Toast with Egg", category: "Hot Breakfast", price: 7.95, costPrice: 3.35, inStock: true, image: avocadoEggToast, allergens: ["Gluten", "Egg"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-HB005", name: "Porridge with Honey & Nuts", category: "Hot Breakfast", price: 4.95, costPrice: 2.05, inStock: true, image: porridgeHoney, allergens: ["Gluten", "Dairy", "Nuts"], shelfLife: 1, ingredients: [] },
    
    // Cold Breakfast
    { skuId: "OS-CB001", name: "Granola Bowl with Yogurt", category: "Cold Breakfast", price: 5.50, costPrice: 2.30, inStock: true, image: granolaYogurtBowl, allergens: ["Dairy", "Nuts"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-CB002", name: "Fruit & Yogurt Parfait", category: "Cold Breakfast", price: 4.95, costPrice: 2.05, inStock: true, image: fruitParfait, allergens: ["Dairy"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-CB003", name: "Almond Butter & Banana Toast", category: "Cold Breakfast", price: 5.95, costPrice: 2.50, inStock: true, image: almondBananaToast, allergens: ["Gluten", "Nuts"], shelfLife: 1, ingredients: [] },
    
    // Sandwiches & Smørrebrød
    { skuId: "OS-S001", name: "Classic BLT Sandwich", category: "Sandwiches", price: 6.95, costPrice: 2.95, inStock: true, image: classicBlt, allergens: ["Gluten"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-S002", name: "Chicken Bacon Sandwich", category: "Sandwiches", price: 7.50, costPrice: 3.15, inStock: true, image: chickenBacon, allergens: ["Gluten"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-S003", name: "Salmon & Cream Cheese Bagel", category: "Sandwiches", price: 7.95, costPrice: 3.35, inStock: true, image: salmonCreamBagel, allergens: ["Gluten", "Fish", "Dairy"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-S004", name: "Tuna Melt Panini", category: "Sandwiches", price: 6.95, costPrice: 2.95, inStock: true, image: tunaMelt, allergens: ["Gluten", "Fish", "Dairy"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-S005", name: "Ham & Cheese Toastie", category: "Sandwiches", price: 5.95, costPrice: 2.50, inStock: true, image: hamCheeseToastie, allergens: ["Gluten", "Dairy"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-S006", name: "Egg & Cheese Muffin", category: "Sandwiches", price: 4.95, costPrice: 2.05, inStock: true, image: eggCheeseEnglishMuffin, allergens: ["Gluten", "Egg", "Dairy"], shelfLife: 1, ingredients: [] },
    
    // Wraps
    { skuId: "OS-W001", name: "Chicken Caesar Wrap", category: "Wraps", price: 7.50, costPrice: 3.15, inStock: true, image: chickenCaesar, allergens: ["Gluten", "Dairy", "Fish"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-W002", name: "Avocado & Hummus Wrap", category: "Wraps", price: 6.95, costPrice: 2.95, inStock: true, image: avocadoHummus, allergens: ["Gluten", "Sesame"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-W003", name: "Vegan Mediterranean Wrap", category: "Wraps", price: 6.95, costPrice: 2.95, inStock: true, image: veganMediterraneanWrap, allergens: ["Gluten"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-W004", name: "Breakfast Burrito", category: "Wraps", price: 6.50, costPrice: 2.75, inStock: true, image: breakfastBurritoWrap, allergens: ["Gluten", "Egg", "Dairy"], shelfLife: 1, ingredients: [] },
    
    // Salads
    { skuId: "OS-L001", name: "Mediterranean Salad", category: "Salads", price: 7.95, costPrice: 3.35, inStock: true, image: mediterraneanSaladBowl, allergens: ["Dairy"], shelfLife: 3, ingredients: [] },
    { skuId: "OS-L002", name: "Greek Feta Salad", category: "Salads", price: 7.50, costPrice: 3.15, inStock: true, image: greekSaladBowl, allergens: ["Dairy"], shelfLife: 3, ingredients: [] },
    
    // Combo Meals
    { skuId: "OS-C001", name: "Coffee & Pastry Combo", category: "Combos", price: 6.95, costPrice: 2.95, inStock: true, image: coffeePastry, allergens: ["Gluten", "Dairy"], shelfLife: 1, ingredients: [] },
  ]
};

// Get initial products based on brand
const getInitialProducts = (brand: string) => brandProducts[brand as keyof typeof brandProducts] || brandProducts["Ole and Steen"];

export default function ProductRange() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [products, setProducts] = useState(getInitialProducts("Ole and Steen"));
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { viewMode: appViewMode, selectedStore } = useView();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.skuId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const handleProductUpdate = (skuId: string, updates: Partial<typeof products[0]>) => {
    setProducts(products.map(p => p.skuId === skuId ? { ...p, ...updates } : p));
  };

  const handleEdit = (skuId: string) => {
    console.log("Edit product:", skuId);
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Invalid file",
            description: "CSV file must contain header and at least one product",
            variant: "destructive"
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const newProducts = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const skuId = values[0] || `SK${String(products.length + index + 1).padStart(3, '0')}`;
          
          return {
            skuId,
            name: values[1] || 'Unnamed Product',
            category: values[2] || 'Sandwiches',
            price: parseFloat(values[3]) || 0,
            costPrice: parseFloat(values[4]) || 0,
            inStock: values[5]?.toLowerCase() === 'true',
            image: classicBlt, // Default image
            allergens: values[6] ? values[6].split(';') : [],
            shelfLife: parseInt(values[7]) || 2,
            ingredients: [],
            dayParts: ["lunch", "afternoon"], // Default day parts
          };
        });

        setProducts([...products, ...newProducts]);
        toast({
          title: "Success",
          description: `${newProducts.length} products uploaded successfully`
        });
        setIsBulkUploadOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = 'SKU ID,Name,Category,Price,Cost Price,In Stock,Allergens,Shelf Life\nSK999,Sample Product,Sandwiches,5.95,2.50,true,Gluten;Dairy,2';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {appViewMode === "store_manager" ? `My Store - ${selectedStore}` : "My Products"}
          </h1>
          <p className="text-muted-foreground">
            {appViewMode === "store_manager"
              ? `Product catalog for ${selectedStore}`
              : "Manage your complete SKU catalog with photos and details"
            }
          </p>
        </div>
        {appViewMode === "hq" && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsBulkUploadOpen(true)}
              className="shadow-brand"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button className="bg-primary text-primary-foreground shadow-brand hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      {appViewMode === "hq" ? (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary and View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "card" | "list")}>
            <ToggleGroupItem value="card" aria-label="Card view">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Card
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4 mr-2" />
              List
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Product Display */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.skuId} product={product} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <ProductListItem key={product.skuId} product={product} onUpdate={handleProductUpdate} />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Upload Products</DialogTitle>
            <DialogDescription>
              Upload a CSV file to add multiple products at once. Make sure your file follows the template format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                CSV files only
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">CSV Format</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Your CSV should include these columns:
              </p>
              <code className="text-xs block bg-background p-2 rounded">
                SKU ID, Name, Category, Price, Cost Price, In Stock, Allergens, Shelf Life
              </code>
              <Button
                variant="link"
                size="sm"
                onClick={downloadTemplate}
                className="mt-2 p-0 h-auto"
              >
                Download Template
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
