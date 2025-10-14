import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, RefreshCw, Save, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import heroImage from "@/assets/hero-food.jpg";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/lib/supabase-helper";

interface WasteProduct {
  id: string;
  productName: string;
  category: string;
  delivered: number;
  sold: number;
  expectedWaste: number;
  recordedWaste: number;
  explanation?: string;
  tag?: string;
}

const suggestedTags = [
  "End of day markdown not applied",
  "Product damaged during prep",
  "Customer return/complaint",
  "Temperature control issue",
  "Overproduction due to event",
  "Staff error in recording",
  "Best before date passed",
  "Other (see notes)",
];

export default function DailyWaste() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<WasteProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<WasteProduct | null>(null);
  const [showDisparityDialog, setShowDisparityDialog] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [saving, setSaving] = useState(false);
  const { selectedStore } = useView();
  const { toast } = useToast();
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    loadData();
  }, [selectedStore]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Generate mock waste data
      const productsList = [
        { id: "OS-P001", name: "Kanelstang (Cinnamon Swirl)", category: "Pastries" },
        { id: "OS-P002", name: "Tebirkes (Poppy Seed Pastry)", category: "Pastries" },
        { id: "OS-P003", name: "Wienerbrød (Danish Pastry)", category: "Pastries" },
        { id: "OS-P004", name: "Croissant", category: "Pastries" },
        { id: "OS-P005", name: "Pain au Chocolat", category: "Pastries" },
        { id: "OS-P006", name: "Almond Croissant", category: "Pastries" },
        { id: "OS-B001", name: "Rugbrød (Rye Bread) Whole", category: "Breads" },
        { id: "OS-B002", name: "Sourdough Loaf", category: "Breads" },
        { id: "OS-HB001", name: "Scrambled Eggs on Sourdough", category: "Hot Breakfast" },
        { id: "OS-HB002", name: "Bacon & Egg Roll", category: "Hot Breakfast" },
        { id: "OS-HB003", name: "Ham & Cheese Croissant", category: "Hot Breakfast" },
        { id: "OS-CB001", name: "Granola Bowl with Yogurt", category: "Cold Breakfast" },
        { id: "OS-S001", name: "Classic BLT Sandwich", category: "Sandwiches" },
        { id: "OS-S002", name: "Chicken Bacon Sandwich", category: "Sandwiches" },
        { id: "OS-S003", name: "Salmon & Cream Cheese Bagel", category: "Sandwiches" },
        { id: "OS-S004", name: "Tuna Melt Panini", category: "Sandwiches" },
        { id: "OS-W001", name: "Chicken Caesar Wrap", category: "Wraps" },
        { id: "OS-W002", name: "Avocado & Hummus Wrap", category: "Wraps" },
        { id: "OS-L001", name: "Mediterranean Salad", category: "Salads" },
        { id: "OS-L002", name: "Greek Feta Salad", category: "Salads" },
      ];

      const mockProducts: WasteProduct[] = productsList.map(product => {
        const delivered = 15 + Math.floor(Math.random() * 15);
        const sold = Math.floor(delivered * (0.75 + Math.random() * 0.2)); // 75-95% sold
        const expectedWaste = delivered - sold;
        const recordedWaste = Math.random() > 0.7 
          ? expectedWaste // 70% match expected
          : Math.floor(expectedWaste * (0.5 + Math.random() * 1.5)); // 30% have variance
        
        return {
          id: product.id,
          productName: product.name,
          category: product.category,
          delivered,
          sold,
          expectedWaste,
          recordedWaste,
        };
      });

      setProducts(mockProducts);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load waste data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const updateRecordedWaste = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setProducts(prev => prev.map(p => 
      p.id === productId
        ? { ...p, recordedWaste: Math.max(0, numValue) }
        : p
    ));
  };

  const handleSaveWaste = (product: WasteProduct) => {
    const disparity = Math.abs(product.recordedWaste - product.expectedWaste);
    const hasSignificantDisparity = disparity > 2 || (product.expectedWaste > 0 && disparity / product.expectedWaste > 0.3);
    
    if (hasSignificantDisparity && !product.explanation) {
      setSelectedProduct(product);
      setExplanation(product.explanation || "");
      setSelectedTag(product.tag || "");
      setShowDisparityDialog(true);
    } else {
      saveWasteRecord(product);
    }
  };

  const saveWasteRecord = async (product: WasteProduct) => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "✓ Waste Recorded",
      description: `${product.productName} waste logged successfully`,
    });
    
    setSaving(false);
  };

  const handleConfirmWithExplanation = () => {
    if (selectedProduct && (selectedTag || explanation.trim())) {
      const updatedProduct = {
        ...selectedProduct,
        explanation: explanation.trim(),
        tag: selectedTag,
      };
      
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id ? updatedProduct : p
      ));
      
      saveWasteRecord(updatedProduct);
      setShowDisparityDialog(false);
      setSelectedProduct(null);
      setExplanation("");
      setSelectedTag("");
    } else {
      toast({
        title: "Explanation Required",
        description: "Please select a tag or provide an explanation for the waste variance",
        variant: "destructive",
      });
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      "Sandwich": "bg-blue-100 text-blue-800",
      "Wrap": "bg-green-100 text-green-800",
      "Hot Food": "bg-orange-100 text-orange-800",
      "Salad": "bg-emerald-100 text-emerald-800",
      "Pastries": "bg-purple-100 text-purple-800",
      "Breads": "bg-amber-100 text-amber-800",
      "Hot Breakfast": "bg-red-100 text-red-800",
      "Cold Breakfast": "bg-cyan-100 text-cyan-800",
      "Sandwiches": "bg-blue-100 text-blue-800",
      "Wraps": "bg-green-100 text-green-800",
      "Salads": "bg-emerald-100 text-emerald-800",
    };
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>;
  };

  const getDisparityIndicator = (product: WasteProduct) => {
    const disparity = Math.abs(product.recordedWaste - product.expectedWaste);
    const hasSignificantDisparity = disparity > 2 || (product.expectedWaste > 0 && disparity / product.expectedWaste > 0.3);
    
    if (!hasSignificantDisparity) return null;
    
    return (
      <div className="flex items-center gap-1 text-amber-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs font-medium">Variance</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Hero Section */}
      <div 
        className="relative h-48 rounded-2xl overflow-hidden bg-cover bg-center shadow-2xl"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-destructive/20 backdrop-blur-sm px-4 py-2 rounded-full border border-destructive/30">
              <Trash2 className="h-5 w-5 text-destructive" />
              <span className="text-white font-semibold text-sm">Daily Waste Tracking</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Daily Waste Log
          </h1>
          <p className="text-xl text-white/90">
            {selectedStore} - {formattedDate}
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated: {format(new Date(), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
        </div>
        <Button 
          onClick={handleRefresh}
          size="sm"
          variant="outline"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Waste Tracking Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div>
            <CardTitle className="text-xl">End of Day Waste Recording</CardTitle>
            <CardDescription>
              Record actual waste for each product. A warning will appear if there's a significant variance from expected waste.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Delivered</TableHead>
                <TableHead className="text-center">Sold</TableHead>
                <TableHead className="text-center bg-muted/50">Expected Waste</TableHead>
                <TableHead className="text-center bg-destructive/10">Recorded Waste</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-muted-foreground">{product.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(product.category)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono">{product.delivered}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono">{product.sold}</span>
                  </TableCell>
                  <TableCell className="text-center bg-muted/30">
                    <span className="font-mono font-semibold">{product.expectedWaste}</span>
                  </TableCell>
                  <TableCell className="bg-destructive/5">
                    <div className="flex items-center justify-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={product.recordedWaste}
                        onChange={(e) => updateRecordedWaste(product.id, e.target.value)}
                        className="w-20 text-center font-mono"
                      />
                      {getDisparityIndicator(product)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveWaste(product)}
                        disabled={saving}
                        className="gap-1"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Disparity Explanation Dialog */}
      <Dialog open={showDisparityDialog} onOpenChange={setShowDisparityDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Waste Variance Detected
            </DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>
                  <span className="font-semibold">{selectedProduct.productName}</span> has a significant 
                  difference between expected waste ({selectedProduct.expectedWaste}) and recorded 
                  waste ({selectedProduct.recordedWaste}). Please provide an explanation.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-select" className="mb-2 block">Select a reason (optional)</Label>
              <div className="grid grid-cols-1 gap-2">
                {suggestedTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    className="justify-start text-left h-auto py-2 px-3"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="explanation" className="mb-2 block">
                Additional notes {!selectedTag && "(required)"}
              </Label>
              <Textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Provide additional context for the waste variance..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDisparityDialog(false);
                setSelectedProduct(null);
                setExplanation("");
                setSelectedTag("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmWithExplanation}>
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
