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
import originalGlazed from "@/assets/products/original-glazed.jpg";
import chocolateIcedGlazed from "@/assets/products/chocolate-iced-glazed.jpg";
import strawberryIced from "@/assets/products/strawberry-iced.jpg";
import chocolateSprinkles from "@/assets/products/chocolate-sprinkles.jpg";
import raspberryFilled from "@/assets/products/raspberry-filled.jpg";
import caramelIced from "@/assets/products/caramel-iced.jpg";
import bostonKreme from "@/assets/products/boston-kreme.jpg";
import cookiesKreme from "@/assets/products/cookies-kreme.jpg";
import lemonFilled from "@/assets/products/lemon-filled.jpg";
import mapleIced from "@/assets/products/maple-iced.jpg";
import glazedBlueberry from "@/assets/products/glazed-blueberry.jpg";
import powderedSugar from "@/assets/products/powdered-sugar.jpg";
import cinnamonSugar from "@/assets/products/cinnamon-sugar.jpg";
import doubleChocolate from "@/assets/products/double-chocolate.jpg";
import chocolateKremeFilled from "@/assets/products/chocolate-kreme-filled.jpg";
import vanillaSprinkles from "@/assets/products/vanilla-sprinkles.jpg";
import appleFritter from "@/assets/products/apple-fritter.jpg";
import glazedCruller from "@/assets/products/glazed-cruller.jpg";
import dulceLeche from "@/assets/products/dulce-leche.jpg";
import coffeeGlazed from "@/assets/products/coffee-glazed.jpg";

// Brand-specific product catalogs
const brandProducts = {
  "Krispy Kreme": [
    // Classic Glazed
    { skuId: "KK-G001", name: "Original Glazed", category: "Glazed", price: 1.49, costPrice: 0.45, inStock: true, image: originalGlazed, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-G002", name: "Chocolate Iced Glazed", category: "Glazed", price: 1.69, costPrice: 0.55, inStock: true, image: chocolateIcedGlazed, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-G003", name: "Maple Iced", category: "Glazed", price: 1.69, costPrice: 0.55, inStock: true, image: mapleIced, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-G004", name: "Glazed Blueberry", category: "Glazed", price: 1.79, costPrice: 0.60, inStock: true, image: glazedBlueberry, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-G005", name: "Caramel Iced", category: "Glazed", price: 1.79, costPrice: 0.60, inStock: true, image: caramelIced, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-G006", name: "Coffee Glazed", category: "Glazed", price: 1.69, costPrice: 0.55, inStock: true, image: coffeeGlazed, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-G007", name: "Dulce de Leche", category: "Glazed", price: 1.79, costPrice: 0.60, inStock: true, image: dulceLeche, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    
    // Iced & Sprinkles
    { skuId: "KK-I001", name: "Strawberry Iced with Sprinkles", category: "Iced", price: 1.79, costPrice: 0.60, inStock: true, image: strawberryIced, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-I002", name: "Chocolate Iced with Sprinkles", category: "Iced", price: 1.79, costPrice: 0.60, inStock: true, image: chocolateSprinkles, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-I003", name: "Vanilla Iced with Sprinkles", category: "Iced", price: 1.79, costPrice: 0.60, inStock: true, image: vanillaSprinkles, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    
    // Filled Donuts
    { skuId: "KK-F001", name: "Raspberry Filled", category: "Filled", price: 1.89, costPrice: 0.65, inStock: true, image: raspberryFilled, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-F002", name: "Lemon Filled", category: "Filled", price: 1.89, costPrice: 0.65, inStock: true, image: lemonFilled, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-F003", name: "Boston Kreme", category: "Filled", price: 1.99, costPrice: 0.70, inStock: true, image: bostonKreme, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-F004", name: "Chocolate Kreme Filled", category: "Filled", price: 1.99, costPrice: 0.70, inStock: true, image: chocolateKremeFilled, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    
    // Cake Donuts
    { skuId: "KK-C001", name: "Powdered Sugar", category: "Cake", price: 1.59, costPrice: 0.50, inStock: true, image: powderedSugar, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 2, ingredients: [] },
    { skuId: "KK-C002", name: "Cinnamon Sugar", category: "Cake", price: 1.59, costPrice: 0.50, inStock: true, image: cinnamonSugar, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 2, ingredients: [] },
    { skuId: "KK-C003", name: "Double Chocolate", category: "Cake", price: 1.69, costPrice: 0.55, inStock: true, image: doubleChocolate, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 2, ingredients: [] },
    
    // Specialty
    { skuId: "KK-S001", name: "Cookies and Kreme", category: "Specialty", price: 1.99, costPrice: 0.70, inStock: true, image: cookiesKreme, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-S002", name: "Apple Fritter", category: "Specialty", price: 2.29, costPrice: 0.80, inStock: true, image: appleFritter, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
    { skuId: "KK-S003", name: "Glazed Cruller", category: "Specialty", price: 1.89, costPrice: 0.65, inStock: true, image: glazedCruller, allergens: ["Gluten", "Dairy", "Egg", "Soy"], shelfLife: 1, ingredients: [] },
  ]
};

// Get initial products based on brand
const getInitialProducts = (brand: string) => brandProducts[brand as keyof typeof brandProducts] || brandProducts["Krispy Kreme"];

export default function ProductRange() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [products, setProducts] = useState(getInitialProducts("Krispy Kreme"));
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
            image: originalGlazed, // Default image
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
