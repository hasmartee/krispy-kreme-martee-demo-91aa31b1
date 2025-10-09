import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, Plus, Upload, LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  allergens: string[];
  usedInProducts: string[];
  suppliers: string[];
}

const MyIngredients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: "1",
      name: "Chicken Breast",
      category: "Protein",
      allergens: [],
      usedInProducts: ["Chicken Caesar Wrap"],
      suppliers: ["Premium Proteins Co"],
    },
    {
      id: "2",
      name: "Romaine Lettuce",
      category: "Vegetables",
      allergens: [],
      usedInProducts: ["Chicken Caesar Wrap", "BLT Sandwich"],
      suppliers: ["Fresh Farms Ltd"],
    },
    {
      id: "3",
      name: "Parmesan Cheese",
      category: "Dairy",
      allergens: ["Milk"],
      usedInProducts: ["Chicken Caesar Wrap"],
      suppliers: ["Dairy Direct"],
    },
    {
      id: "4",
      name: "Caesar Dressing",
      category: "Condiments",
      allergens: ["Egg", "Fish"],
      usedInProducts: ["Chicken Caesar Wrap"],
      suppliers: ["Gourmet Condiments Ltd"],
    },
    {
      id: "5",
      name: "Bacon",
      category: "Protein",
      allergens: [],
      usedInProducts: ["BLT Sandwich"],
      suppliers: ["Premium Proteins Co"],
    },
    {
      id: "6",
      name: "Tomato",
      category: "Vegetables",
      allergens: [],
      usedInProducts: ["BLT Sandwich", "Greek Feta Salad"],
      suppliers: ["Fresh Farms Ltd"],
    },
    {
      id: "7",
      name: "Whole Wheat Bread",
      category: "Bakery",
      allergens: ["Gluten", "Wheat"],
      usedInProducts: ["BLT Sandwich"],
      suppliers: ["Artisan Bakery Supply"],
    },
    {
      id: "8",
      name: "Feta Cheese",
      category: "Dairy",
      allergens: ["Milk"],
      usedInProducts: ["Greek Feta Salad"],
      suppliers: ["Dairy Direct"],
    },
    {
      id: "9",
      name: "Cucumber",
      category: "Vegetables",
      allergens: [],
      usedInProducts: ["Greek Feta Salad"],
      suppliers: ["Fresh Farms Ltd"],
    },
    {
      id: "10",
      name: "Kalamata Olives",
      category: "Vegetables",
      allergens: [],
      usedInProducts: ["Greek Feta Salad"],
      suppliers: ["Mediterranean Foods Import"],
    },
    {
      id: "11",
      name: "Smoked Salmon",
      category: "Protein",
      allergens: ["Fish"],
      usedInProducts: ["Salmon Bagel"],
      suppliers: ["Premium Proteins Co"],
    },
    {
      id: "12",
      name: "Cream Cheese",
      category: "Dairy",
      allergens: ["Milk"],
      usedInProducts: ["Salmon Bagel"],
      suppliers: ["Dairy Direct"],
    },
    {
      id: "13",
      name: "Bagel",
      category: "Bakery",
      allergens: ["Gluten", "Wheat"],
      usedInProducts: ["Salmon Bagel"],
      suppliers: ["Artisan Bakery Supply"],
    },
    {
      id: "14",
      name: "Avocado",
      category: "Vegetables",
      allergens: [],
      usedInProducts: ["Avocado Hummus Wrap"],
      suppliers: ["Fresh Farms Ltd"],
    },
    {
      id: "15",
      name: "Hummus",
      category: "Condiments",
      allergens: ["Sesame"],
      usedInProducts: ["Avocado Hummus Wrap"],
      suppliers: ["Mediterranean Foods Import"],
    },
    {
      id: "16",
      name: "Tortilla Wrap",
      category: "Bakery",
      allergens: ["Gluten", "Wheat"],
      usedInProducts: ["Chicken Caesar Wrap", "Avocado Hummus Wrap"],
      suppliers: ["Artisan Bakery Supply"],
    },
  ]);

  const filteredIngredients = ingredients.filter(
    (ingredient) =>
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ingredient.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ingredient.allergens.some((allergen) =>
        allergen.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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
            description: "CSV file must contain header and at least one ingredient",
            variant: "destructive"
          });
          return;
        }

        const newIngredients = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          
          return {
            id: String(ingredients.length + index + 1),
            name: values[0] || 'Unnamed Ingredient',
            category: values[1] || 'Miscellaneous',
            allergens: values[2] ? values[2].split(';') : [],
            usedInProducts: values[3] ? values[3].split(';') : [],
            suppliers: values[4] ? values[4].split(';') : [],
          };
        });

        setIngredients([...ingredients, ...newIngredients]);
        toast({
          title: "Success",
          description: `${newIngredients.length} ingredients uploaded successfully`
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = 'Name,Category,Allergens,Used In Products,Suppliers\nSample Ingredient,Protein,Milk,Product 1;Product 2,Supplier A;Supplier B';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ingredient-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Ingredients</h1>
            <p className="text-muted-foreground">
              Manage ingredients and track allergens
            </p>
          </div>
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
              Add Ingredient
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingredient Search</CardTitle>
            <CardDescription>
              Find ingredients by name, category, or allergen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredIngredients.length} of {ingredients.length} ingredients
          </p>
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
        </div>

        {viewMode === "card" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIngredients.map((ingredient) => (
              <Card key={ingredient.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                      <CardDescription>{ingredient.category}</CardDescription>
                    </div>
                    {ingredient.allergens.length > 0 && (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ingredient.allergens.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Allergens:</p>
                      <div className="flex flex-wrap gap-2">
                        {ingredient.allergens.map((allergen) => (
                          <Badge key={allergen} variant="destructive">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-2">Suppliers:</p>
                    <div className="flex flex-wrap gap-2">
                      {ingredient.suppliers.map((supplier) => (
                        <Badge key={supplier} variant="outline">
                          {supplier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Used in:</p>
                    <div className="flex flex-wrap gap-2">
                      {ingredient.usedInProducts.map((product) => (
                        <Badge key={product} variant="secondary">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Allergens</th>
                      <th className="text-left p-4 font-medium">Suppliers</th>
                      <th className="text-left p-4 font-medium">Used In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIngredients.map((ingredient) => (
                      <tr key={ingredient.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium">{ingredient.name}</td>
                        <td className="p-4 text-muted-foreground">{ingredient.category}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {ingredient.allergens.length > 0 ? (
                              ingredient.allergens.map((allergen) => (
                                <Badge key={allergen} variant="destructive" className="text-xs">
                                  {allergen}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {ingredient.suppliers.map((supplier) => (
                              <Badge key={supplier} variant="outline" className="text-xs">
                                {supplier}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {ingredient.usedInProducts.map((product) => (
                              <Badge key={product} variant="secondary" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Ingredients</DialogTitle>
              <DialogDescription>
                Upload a CSV file to add multiple ingredients at once. Download the template to see the required format.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Click to select a CSV file or drag and drop
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleBulkUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Select CSV File
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">CSV Format:</p>
                <p className="font-mono text-xs bg-muted p-2 rounded">
                  Name,Category,Allergens,Used In Products,Suppliers
                </p>
                <p className="mt-2">Use semicolons (;) to separate multiple values</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={downloadTemplate}>
                Download Template
              </Button>
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyIngredients;
