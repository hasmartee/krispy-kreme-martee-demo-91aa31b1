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
import bltSandwich from "@/assets/products/blt-sandwich.jpg";
import chickenCaesarWrap from "@/assets/products/chicken-caesar-wrap.jpg";
import avocadoHummusWrap from "@/assets/products/avocado-hummus-wrap.jpg";
import tunaMeltPanini from "@/assets/products/tuna-melt-panini.jpg";
import mediterraneanSalad from "@/assets/products/mediterranean-salad.jpg";
import salmonBagel from "@/assets/products/salmon-bagel.jpg";
import chickenBaconSandwich from "@/assets/products/chicken-bacon-sandwich.jpg";
import veganWrap from "@/assets/products/vegan-wrap.jpg";
import greekFetaSalad from "@/assets/products/greek-feta-salad.jpg";
import hamCheeseCroissant from "@/assets/products/ham-cheese-croissant.jpg";
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

// Brand-specific product catalogs
const brandProducts = {
  "Ole and Steen": [
    // Pastries & Viennoiserie
    { skuId: "OS-001", name: "Kanelstang (Cinnamon Swirl)", category: "Pastries", price: 3.95, costPrice: 1.65, inStock: true, image: coffeePastryCombo, allergens: ["Gluten", "Dairy", "Egg"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-002", name: "Tebirkes (Poppy Seed Pastry)", category: "Pastries", price: 3.75, costPrice: 1.55, inStock: true, image: coffeePastryCombo, allergens: ["Gluten", "Dairy", "Sesame"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-003", name: "Wienerbrød (Danish Pastry)", category: "Pastries", price: 4.25, costPrice: 1.75, inStock: true, image: coffeePastryCombo, allergens: ["Gluten", "Dairy", "Egg"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-004", name: "Croissant", category: "Pastries", price: 3.50, costPrice: 1.45, inStock: true, image: hamCheeseCroissant, allergens: ["Gluten", "Dairy"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-005", name: "Pain au Chocolat", category: "Pastries", price: 3.95, costPrice: 1.65, inStock: true, image: coffeePastryCombo, allergens: ["Gluten", "Dairy"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-006", name: "Almond Croissant", category: "Pastries", price: 4.50, costPrice: 1.85, inStock: true, image: coffeePastryCombo, allergens: ["Gluten", "Dairy", "Nuts"], shelfLife: 1, ingredients: [] },
    
    // Breads & Baked Goods
    { skuId: "OS-010", name: "Rugbrød (Rye Bread) Whole", category: "Breads", price: 5.95, costPrice: 2.50, inStock: true, image: scrambledEggsSourdough, allergens: ["Gluten"], shelfLife: 5, ingredients: [] },
    { skuId: "OS-011", name: "Sourdough Loaf", category: "Breads", price: 6.50, costPrice: 2.75, inStock: true, image: scrambledEggsSourdough, allergens: ["Gluten"], shelfLife: 3, ingredients: [] },
    { skuId: "OS-012", name: "Whole Grain Roll", category: "Breads", price: 2.25, costPrice: 0.95, inStock: true, image: baconEggRoll, allergens: ["Gluten"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-013", name: "Sesame Roll", category: "Breads", price: 2.25, costPrice: 0.95, inStock: true, image: baconEggRoll, allergens: ["Gluten", "Sesame"], shelfLife: 2, ingredients: [] },
    
    // Hot Breakfast Items
    { skuId: "OS-020", name: "Scrambled Eggs on Sourdough", category: "Hot Breakfast", price: 6.95, costPrice: 2.95, inStock: true, image: scrambledEggsSourdough, allergens: ["Gluten", "Egg", "Dairy"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-021", name: "Bacon & Egg Roll", category: "Hot Breakfast", price: 5.95, costPrice: 2.50, inStock: true, image: baconEggRoll, allergens: ["Gluten", "Egg"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-022", name: "Ham & Cheese Croissant", category: "Hot Breakfast", price: 5.50, costPrice: 2.30, inStock: true, image: hamCheeseCroissant, allergens: ["Gluten", "Dairy"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-023", name: "Avocado Toast with Egg", category: "Hot Breakfast", price: 7.95, costPrice: 3.35, inStock: true, image: avocadoToastEgg, allergens: ["Gluten", "Egg"], shelfLife: 1, ingredients: [] },
    { skuId: "OS-024", name: "Porridge with Honey & Nuts", category: "Hot Breakfast", price: 4.95, costPrice: 2.05, inStock: true, image: porridgeHoneyNuts, allergens: ["Gluten", "Dairy", "Nuts"], shelfLife: 1, ingredients: [] },
    
    // Cold Breakfast
    { skuId: "OS-030", name: "Granola Bowl with Yogurt", category: "Cold Breakfast", price: 5.50, costPrice: 2.30, inStock: true, image: granolaBowl, allergens: ["Dairy", "Nuts"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-031", name: "Fruit & Yogurt Parfait", category: "Cold Breakfast", price: 4.95, costPrice: 2.05, inStock: true, image: fruitYogurtPar, allergens: ["Dairy"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-032", name: "Almond Butter & Banana Toast", category: "Cold Breakfast", price: 5.95, costPrice: 2.50, inStock: true, image: almondButterBananaToast, allergens: ["Gluten", "Nuts"], shelfLife: 1, ingredients: [] },
    
    // Sandwiches & Smørrebrød
    { skuId: "OS-040", name: "Classic BLT Sandwich", category: "Sandwiches", price: 6.95, costPrice: 2.95, inStock: true, image: bltSandwich, allergens: ["Gluten"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-041", name: "Chicken Bacon Sandwich", category: "Sandwiches", price: 7.50, costPrice: 3.15, inStock: true, image: chickenBaconSandwich, allergens: ["Gluten"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-042", name: "Salmon & Cream Cheese Bagel", category: "Sandwiches", price: 7.95, costPrice: 3.35, inStock: true, image: salmonBagel, allergens: ["Gluten", "Fish", "Dairy"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-043", name: "Tuna Melt Panini", category: "Sandwiches", price: 6.95, costPrice: 2.95, inStock: true, image: tunaMeltPanini, allergens: ["Gluten", "Fish", "Dairy"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-044", name: "Ham & Cheese Toastie", category: "Sandwiches", price: 5.95, costPrice: 2.50, inStock: true, image: hamCheeseCroissant, allergens: ["Gluten", "Dairy"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-045", name: "Egg & Cheese Muffin", category: "Sandwiches", price: 4.95, costPrice: 2.05, inStock: true, image: eggCheeseMuffin, allergens: ["Gluten", "Egg", "Dairy"], shelfLife: 1, ingredients: [] },
    
    // Wraps
    { skuId: "OS-050", name: "Chicken Caesar Wrap", category: "Wraps", price: 7.50, costPrice: 3.15, inStock: true, image: chickenCaesarWrap, allergens: ["Gluten", "Dairy", "Fish"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-051", name: "Avocado & Hummus Wrap", category: "Wraps", price: 6.95, costPrice: 2.95, inStock: true, image: avocadoHummusWrap, allergens: ["Gluten", "Sesame"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-052", name: "Vegan Mediterranean Wrap", category: "Wraps", price: 6.95, costPrice: 2.95, inStock: true, image: veganWrap, allergens: ["Gluten"], shelfLife: 2, ingredients: [] },
    { skuId: "OS-053", name: "Breakfast Burrito", category: "Wraps", price: 6.50, costPrice: 2.75, inStock: true, image: breakfastBurrito, allergens: ["Gluten", "Egg", "Dairy"], shelfLife: 1, ingredients: [] },
    
    // Salads
    { skuId: "OS-060", name: "Mediterranean Salad", category: "Salads", price: 7.95, costPrice: 3.35, inStock: true, image: mediterraneanSalad, allergens: ["Dairy"], shelfLife: 3, ingredients: [] },
    { skuId: "OS-061", name: "Greek Feta Salad", category: "Salads", price: 7.50, costPrice: 3.15, inStock: true, image: greekFetaSalad, allergens: ["Dairy"], shelfLife: 3, ingredients: [] },
    
    // Combo Meals
    { skuId: "OS-070", name: "Coffee & Pastry Combo", category: "Combos", price: 6.95, costPrice: 2.95, inStock: true, image: coffeePastryCombo, allergens: ["Gluten", "Dairy"], shelfLife: 1, ingredients: [] },
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
            image: bltSandwich, // Default image
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
