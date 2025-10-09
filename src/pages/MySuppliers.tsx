import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Package, Plus, Upload, LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  location: string;
  contact: string;
  leadTimeDays: number;
  ingredients: string[];
  reliability: "Excellent" | "Good" | "Fair";
}

const MySuppliers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "Fresh Farms Ltd",
      location: "Kent, UK",
      contact: "orders@freshfarms.co.uk",
      leadTimeDays: 2,
      ingredients: ["Romaine Lettuce", "Tomato", "Cucumber", "Avocado"],
      reliability: "Excellent",
    },
    {
      id: "2",
      name: "Premium Proteins Co",
      location: "Birmingham, UK",
      contact: "sales@premiumproteins.co.uk",
      leadTimeDays: 3,
      ingredients: ["Chicken Breast", "Bacon", "Smoked Salmon"],
      reliability: "Excellent",
    },
    {
      id: "3",
      name: "Dairy Direct",
      location: "Somerset, UK",
      contact: "info@dairydirect.co.uk",
      leadTimeDays: 1,
      ingredients: ["Parmesan Cheese", "Feta Cheese", "Cream Cheese"],
      reliability: "Good",
    },
    {
      id: "4",
      name: "Mediterranean Foods Import",
      location: "London, UK",
      contact: "orders@medfoods.co.uk",
      leadTimeDays: 5,
      ingredients: ["Kalamata Olives", "Hummus"],
      reliability: "Good",
    },
    {
      id: "5",
      name: "Artisan Bakery Supply",
      location: "Manchester, UK",
      contact: "wholesale@artisanbakery.co.uk",
      leadTimeDays: 1,
      ingredients: ["Whole Wheat Bread", "Bagel", "Tortilla Wrap"],
      reliability: "Excellent",
    },
    {
      id: "6",
      name: "Gourmet Condiments Ltd",
      location: "Bristol, UK",
      contact: "b2b@gourmetcondiments.co.uk",
      leadTimeDays: 4,
      ingredients: ["Caesar Dressing"],
      reliability: "Fair",
    },
  ]);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.ingredients.some((ingredient) =>
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const getReliabilityColor = (reliability: Supplier["reliability"]) => {
    switch (reliability) {
      case "Excellent":
        return "bg-success/10 text-success border-success/20";
      case "Good":
        return "bg-primary/10 text-primary border-primary/20";
      case "Fair":
        return "bg-warning/10 text-warning border-warning/20";
    }
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
            description: "CSV file must contain header and at least one supplier",
            variant: "destructive"
          });
          return;
        }

        const newSuppliers = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          
          return {
            id: String(suppliers.length + index + 1),
            name: values[0] || 'Unnamed Supplier',
            location: values[1] || 'Unknown',
            contact: values[2] || '',
            leadTimeDays: parseInt(values[3]) || 0,
            ingredients: values[4] ? values[4].split(';') : [],
            reliability: (values[5] as Supplier["reliability"]) || "Good",
          };
        });

        setSuppliers([...suppliers, ...newSuppliers]);
        toast({
          title: "Success",
          description: `${newSuppliers.length} suppliers uploaded successfully`
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
    const template = 'Name,Location,Contact,Lead Time (Days),Ingredients,Reliability\nSample Supplier,London UK,contact@example.com,3,Ingredient1;Ingredient2,Excellent';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supplier-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Suppliers</h1>
            <p className="text-muted-foreground">
              Manage supplier relationships and lead times
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
              Add Supplier
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Search</CardTitle>
            <CardDescription>
              Find suppliers by name, location, or ingredient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredSuppliers.length} of {suppliers.length} suppliers
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
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <CardDescription>{supplier.location}</CardDescription>
                    </div>
                    <Badge className={getReliabilityColor(supplier.reliability)}>
                      {supplier.reliability}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Lead Time: {supplier.leadTimeDays} days</span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Contact:</p>
                    <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4" />
                      <p className="text-sm font-medium">Supplies ({supplier.ingredients.length}):</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {supplier.ingredients.map((ingredient) => (
                        <Badge key={ingredient} variant="outline">
                          {ingredient}
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
                      <th className="text-left p-4 font-medium">Location</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Lead Time</th>
                      <th className="text-left p-4 font-medium">Reliability</th>
                      <th className="text-left p-4 font-medium">Ingredients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium">{supplier.name}</td>
                        <td className="p-4 text-muted-foreground">{supplier.location}</td>
                        <td className="p-4 text-muted-foreground text-sm">{supplier.contact}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.leadTimeDays} days</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getReliabilityColor(supplier.reliability)}>
                            {supplier.reliability}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {supplier.ingredients.map((ingredient) => (
                              <Badge key={ingredient} variant="outline" className="text-xs">
                                {ingredient}
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
              <DialogTitle>Bulk Upload Suppliers</DialogTitle>
              <DialogDescription>
                Upload a CSV file to add multiple suppliers at once. Download the template to see the required format.
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
                  Name,Location,Contact,Lead Time (Days),Ingredients,Reliability
                </p>
                <p className="mt-2">Reliability must be: Excellent, Good, or Fair</p>
                <p className="mt-1">Use semicolons (;) to separate multiple ingredients</p>
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

export default MySuppliers;
