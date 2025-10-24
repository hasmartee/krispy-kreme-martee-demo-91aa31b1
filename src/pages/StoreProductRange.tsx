import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Store, Package, Filter, TrendingUp, AlertCircle, CheckCircle, Sparkles, Settings, ChevronDown, ChevronUp, Edit, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase-helper";
import { useToast } from "@/hooks/use-toast";
import { useView } from "@/contexts/ViewContext";

// Store clusters matching database schema
const storeClusters = [
  {
    id: "high_street",
    name: "High Street",
    description: "Central locations with popular items focus",
    color: "bg-brand-green text-white",
  },
  {
    id: "transport_hub",
    name: "Transport Hub",
    description: "Quick grab-and-go focused locations",
    color: "bg-brand-green-medium text-white",
  },
  {
    id: "business_district",
    name: "Business District",
    description: "Business lunch and meeting focused",
    color: "bg-success text-white",
  },
  {
    id: "residential",
    name: "Residential",
    description: "Neighborhood locations with local favorites",
    color: "bg-primary text-primary-foreground",
  },
];

// Krispy Kreme product images
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

const rangingInsights = [
  {
    store: "King's Cross",
    insight: "High demand for vegan options (32% above forecast). Consider expanding plant-based range.",
    type: "opportunity",
    impact: "High",
  },
  {
    store: "Canary Wharf",
    insight: "Salads underperforming vs similar Business District stores. Review pricing and positioning.",
    type: "warning",
    impact: "Medium",
  },
  {
    store: "Greenwich",
    insight: "Pastry sales 45% below cluster average. Consider reducing range or improving merchandising.",
    type: "action",
    impact: "Medium",
  },
  {
    store: "Shoreditch",
    insight: "Strong performance across all categories. Use as reference for High Street cluster optimisation.",
    type: "success",
    impact: "Low",
  },
  {
    store: "St Pancras",
    insight: "Breakfast items performing exceptionally well. Consider extended morning range.",
    type: "opportunity",
    impact: "High",
  },
  {
    store: "Bond Street",
    insight: "Premium product sales 28% above flagship average. Opportunity for luxury range expansion.",
    type: "opportunity",
    impact: "High",
  },
];

interface StoreInfo {
  id: string;
  storeId: string;
  storeName: string;
  postcode: string;
  cluster: string;
}

// All stores use Krispy Kreme products
const storeBrands: Record<string, string> = {};

// Krispy Kreme product templates
const brandProductTemplates = {
  "Krispy Kreme": [
    // Classic Glazed
    { id: "KK-G001", name: "Original Glazed", category: "Glazed", active: true, image: originalGlazed },
    { id: "KK-G002", name: "Chocolate Iced Glazed", category: "Glazed", active: true, image: chocolateIcedGlazed },
    { id: "KK-G003", name: "Maple Iced", category: "Glazed", active: true, image: mapleIced },
    { id: "KK-G004", name: "Glazed Blueberry", category: "Glazed", active: true, image: glazedBlueberry },
    { id: "KK-G005", name: "Caramel Iced", category: "Glazed", active: true, image: caramelIced },
    { id: "KK-G006", name: "Coffee Glazed", category: "Glazed", active: true, image: coffeeGlazed },
    { id: "KK-G007", name: "Dulce de Leche", category: "Glazed", active: true, image: dulceLeche },
    
    // Iced & Sprinkles
    { id: "KK-I001", name: "Strawberry Iced with Sprinkles", category: "Iced", active: true, image: strawberryIced },
    { id: "KK-I002", name: "Chocolate Iced with Sprinkles", category: "Iced", active: true, image: chocolateSprinkles },
    { id: "KK-I003", name: "Vanilla Iced with Sprinkles", category: "Iced", active: true, image: vanillaSprinkles },
    
    // Filled Donuts
    { id: "KK-F001", name: "Raspberry Filled", category: "Filled", active: true, image: raspberryFilled },
    { id: "KK-F002", name: "Lemon Filled", category: "Filled", active: true, image: lemonFilled },
    { id: "KK-F003", name: "Boston Kreme", category: "Filled", active: true, image: bostonKreme },
    { id: "KK-F004", name: "Chocolate Kreme Filled", category: "Filled", active: true, image: chocolateKremeFilled },
    
    // Cake Donuts
    { id: "KK-C001", name: "Powdered Sugar", category: "Cake", active: true, image: powderedSugar },
    { id: "KK-C002", name: "Cinnamon Sugar", category: "Cake", active: true, image: cinnamonSugar },
    { id: "KK-C003", name: "Double Chocolate", category: "Cake", active: true, image: doubleChocolate },
    
    // Specialty
    { id: "KK-S001", name: "Cookies and Kreme", category: "Specialty", active: true, image: cookiesKreme },
    { id: "KK-S002", name: "Apple Fritter", category: "Specialty", active: true, image: appleFritter },
    { id: "KK-S003", name: "Glazed Cruller", category: "Specialty", active: true, image: glazedCruller },
  ]
};

// Generate products for a brand and cluster
const generateBrandProducts = (brand: string, cluster: string) => {
  const brandTemplate = brandProductTemplates[brand as keyof typeof brandProductTemplates];
  if (!brandTemplate) return [];
  
  const allProducts = Array.isArray(brandTemplate) ? brandTemplate : [];
  
  // Customize based on cluster
  switch (cluster) {
    case "transport_hub":
      return allProducts.slice(0, 20); // Grab-and-go focus
    case "business_district":
      return allProducts.slice(0, 25); // Business lunch focus
    case "residential":
      return allProducts; // Full range
    case "high_street":
      return allProducts; // Full range
    default:
      return allProducts.slice(0, 15);
  }
};

export default function StoreProductRange() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Krispy Kreme");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [storeData, setStoreData] = useState<any[]>([]);
  const [allStores, setAllStores] = useState<StoreInfo[]>([]);
  const [isClusterDialogOpen, setIsClusterDialogOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<string | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [expandedStores, setExpandedStores] = useState<string[]>([]);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [editingTemplateCluster, setEditingTemplateCluster] = useState<string | null>(null);
  const [templateProducts, setTemplateProducts] = useState<any[]>([]);
  const [changingStoreCluster, setChangingStoreCluster] = useState<string | null>(null);
  const [productCapacities, setProductCapacities] = useState<Record<string, { min: number; max: number }>>({});
  const { toast } = useToast();
  const { viewMode, selectedStore } = useView();

  // Load all stores from database
  useEffect(() => {
    loadStores();
    loadProductCapacities();
  }, []);

  const loadProductCapacities = async () => {
    console.log('📊 Loading product capacities...');
    const { data, error } = await supabase
      .from('product_capacities')
      .select('*');
    
    if (error) {
      console.error('❌ Error loading capacities:', error);
      return;
    }
    
    if (data) {
      const capacitiesMap: Record<string, { min: number; max: number }> = {};
      data.forEach((cap: any) => {
        const key = `${cap.product_sku}-${cap.store_id}`;
        capacitiesMap[key] = {
          min: cap.capacity_min || 0,
          max: cap.capacity_max || 0,
        };
      });
      setProductCapacities(capacitiesMap);
      console.log('✅ Loaded capacities:', Object.keys(capacitiesMap).length);
    }
  };

  const updateProductCapacity = async (productSku: string, storeId: string, field: 'min' | 'max', value: number) => {
    const key = `${productSku}-${storeId}`;
    const newCapacities = {
      ...productCapacities,
      [key]: {
        ...productCapacities[key],
        [field]: value,
      }
    };
    setProductCapacities(newCapacities);
    
    // Save to database
    try {
      // First check if it exists
      const { data: existing } = await supabase
        .from('product_capacities')
        .select('id')
        .eq('product_sku', productSku)
        .eq('store_id', storeId)
        .maybeSingle();
      
      if (existing) {
        // Update
        await supabase
          .from('product_capacities')
          .update({
            [`capacity_${field}`]: value,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert
        await supabase
          .from('product_capacities')
          .insert({
            product_sku: productSku,
            store_id: storeId,
            capacity_min: field === 'min' ? value : (newCapacities[key]?.min || 0),
            capacity_max: field === 'max' ? value : (newCapacities[key]?.max || 0),
          });
      }
    } catch (error) {
      console.error('Error saving capacity:', error);
      toast({
        title: "Error",
        description: "Failed to save capacity value",
        variant: "destructive",
      });
    }
  };

  const loadStores = async () => {
    console.log('📦 Loading all stores from database...');
    const { data, error } = await supabase
      .from('stores')
      .select('id, store_id, name, postcode, cluster')
      .order('name');

    if (error) {
      console.error('❌ Error loading stores:', error);
      toast({
        title: "Error loading stores",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    if (data) {
      console.log('✅ Loaded stores:', data.length);
      const storesInfo: StoreInfo[] = data.map(s => ({
        id: s.id,
        storeId: s.store_id,
        storeName: s.name,
        postcode: s.postcode,
        cluster: s.cluster || 'high_street'
      }));
      setAllStores(storesInfo);
      
      // Update store data with actual stores
        const updatedStoreData = storesInfo.map(store => {
          return {
            storeId: store.storeId,
            storeName: store.storeName,
            postcode: store.postcode,
            cluster: store.cluster,
            activeProducts: generateBrandProducts("Krispy Kreme", store.cluster)
          };
        });
      setStoreData(updatedStoreData);
    }
  };

  const filteredStores = storeData.filter(store => {
    const matchesSearch = store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.postcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.storeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster = selectedCluster === "all" || store.cluster === selectedCluster;
    const matchesViewMode = viewMode === "hq" || viewMode === "manufacturing" || (viewMode === "store_manager" && store.storeName === selectedStore);
    
    return matchesSearch && matchesCluster && matchesViewMode;
  });

  const handleClusterClick = (clusterId: string) => {
    console.log('🎯 Opening cluster manager for:', clusterId);
    setEditingCluster(clusterId);
    
    // Pre-select stores that are already in this cluster
    const storesInCluster = allStores
      .filter(store => store.cluster === clusterId)
      .map(store => store.id);
    setSelectedStores(storesInCluster);
    setIsClusterDialogOpen(true);
  };

  const handleSaveClusterAssignments = async () => {
    if (!editingCluster) return;

    console.log('💾 Saving cluster assignments:', {
      cluster: editingCluster,
      stores: selectedStores
    });

    // Update all stores: assign to cluster if selected, or keep existing cluster if deselected
    const storesToUpdate = allStores.filter(store => {
      const isSelectedNow = selectedStores.includes(store.id);
      const wasInCluster = store.cluster === editingCluster;
      // Only update if selection changed
      return (isSelectedNow && !wasInCluster) || (!isSelectedNow && wasInCluster);
    });

    // Update each store in the database
    for (const store of storesToUpdate) {
      const newCluster = selectedStores.includes(store.id) ? editingCluster : 'high_street';
      const { error } = await supabase
        .from('stores')
        .update({ cluster: newCluster })
        .eq('id', store.id);

      if (error) {
        console.error('❌ Error updating store cluster:', error);
        toast({
          title: "Error updating cluster",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    }

    console.log('✅ Cluster assignments saved successfully');
    toast({
      title: "Success",
      description: `Cluster assignments updated for ${editingCluster}`
    });

    setIsClusterDialogOpen(false);
    setEditingCluster(null);
    loadStores(); // Reload to get updated data
  };

  const toggleProductStatus = (storeId: string, productId: string) => {
    setStoreData(prev => prev.map(store => 
      store.storeId === storeId 
        ? {
            ...store,
            activeProducts: store.activeProducts.map(product =>
              product.id === productId
                ? { ...product, active: !product.active }
                : product
            )
          }
        : store
    ));
  };

  const toggleStoreExpanded = (storeId: string) => {
    setExpandedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleEditTemplate = (clusterId: string) => {
    setEditingTemplateCluster(clusterId);
    setTemplateProducts(generateBrandProducts("Krispy Kreme", clusterId));
    setIsEditTemplateOpen(true);
  };

  const handleSaveTemplate = () => {
    toast({
      title: "Template Updated",
      description: `Product template for ${storeClusters.find(c => c.id === editingTemplateCluster)?.name} has been updated.`
    });
    setIsEditTemplateOpen(false);
  };

  const toggleTemplateProduct = (productId: string) => {
    setTemplateProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, active: !p.active } : p)
    );
  };

  const removeTemplateProduct = (productId: string) => {
    setTemplateProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleChangeStoreCluster = async (storeId: string, newClusterId: string) => {
    console.log('🔄 Changing store cluster:', { storeId, newClusterId });
    
    // Find the store UUID from the store_id
    const store = allStores.find(s => s.storeId === storeId);
    if (!store) {
      toast({
        title: "Error",
        description: "Store not found",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('stores')
      .update({ cluster: newClusterId })
      .eq('id', store.id);

    if (error) {
      console.error('❌ Error updating store cluster:', error);
      toast({
        title: "Error updating cluster",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Store cluster updated successfully');
    toast({
      title: "Cluster Updated",
      description: `${store.storeName} has been moved to ${storeClusters.find(c => c.id === newClusterId)?.name}`
    });

    setChangingStoreCluster(null);
    loadStores(); // Reload to get updated data
  };

  const getClusterBadge = (clusterId: string) => {
    const cluster = storeClusters.find(c => c.id === clusterId);
    return cluster ? (
      <Badge className={cluster.color}>
        {cluster.name}
      </Badge>
    ) : null;
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      'Sandwich': 'bg-brand-peach text-white',
      'Wrap': 'bg-brand-green-medium text-white',
      'Hot Food': 'bg-primary text-primary-foreground',
      'Salad': 'bg-success text-white',
      'Breakfast': 'bg-warning text-white',
    };
    
    return (
      <Badge variant="outline" className={categoryColors[category as keyof typeof categoryColors] || 'bg-muted'}>
        {category}
      </Badge>
    );
  };


  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {viewMode === "store_manager" ? `My Store - ${selectedStore}` : "My Range Manager"}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === "store_manager"
              ? `Manage product availability for ${selectedStore}`
              : "Manage product availability across store clusters and individual locations"
            }
          </p>
        </div>
      </div>

      {/* AI Range Insights Section - Only for HQ/Demand Planners */}
      {viewMode === "hq" && (
        <Card className="relative overflow-hidden shadow-lg border-2 border-orange-300/50">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100 opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-200/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-200/40 via-transparent to-transparent" />
          
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white relative z-10" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">
                    AI Key Insights
                  </span>
                  <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
                </CardTitle>
                <CardDescription className="text-sm">Powered by advanced analytics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            <div className="relative overflow-hidden p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-orange-100/90 border-orange-300/50 shadow-sm">
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/20 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
              
              <div className="flex items-start gap-3 relative z-10">
                <div className="rounded-full p-1.5 bg-gradient-to-br from-orange-400 to-amber-500 shadow-md">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold text-orange-700">Capacity Utilization</span> — 3 high street stores show room to expand range complexity without production bottlenecks.
                </p>
              </div>
            </div>
            
            <div className="relative overflow-hidden p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br from-green-50/90 via-emerald-50/90 to-green-100/90 border-green-300/50 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/20 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
              
              <div className="flex items-start gap-3 relative z-10">
                <div className="rounded-full p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold text-green-700">Product Alignment</span> — 87% of current range aligns with customer preferences based on sales data.
                </p>
              </div>
            </div>
            
            <div className="relative overflow-hidden p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br from-red-50/90 via-orange-50/90 to-red-100/90 border-red-300/50 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/20 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
              
              <div className="flex items-start gap-3 relative z-10">
                <div className="rounded-full p-1.5 bg-gradient-to-br from-red-500 to-orange-600 shadow-md">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold text-red-700">Range Gap Detected</span> — Transport hub stores missing quick-grab breakfast options that are trending in similar locations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Cluster Filters - Only show in HQ view */}
      {viewMode === "hq" && (
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search stores by name, postcode, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by cluster" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Clusters</SelectItem>
                  {storeClusters.map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.id}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cluster Overview - Only show in HQ View */}
      {viewMode === "hq" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {storeClusters.map((cluster) => {
            const storesInCluster = filteredStores.filter(store => store.cluster === cluster.id).length;
            const clusterProducts = generateBrandProducts(selectedBrand, cluster.id);
            return (
              <Card 
                key={cluster.id} 
                className="shadow-brand hover:shadow-elegant transition-all group border-2 hover:border-primary/30 animate-fade-in relative overflow-hidden"
              >
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${cluster.color} text-base px-4 py-1.5 shadow-soft`}>
                        {cluster.name}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <span>{storesInCluster} stores</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTemplate(cluster.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Range
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClusterClick(cluster.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Stores
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{cluster.description}</p>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3 p-2 bg-gradient-to-r from-primary/10 to-transparent rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Range Template</h4>
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold bg-background">
                        {clusterProducts.length} products
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                      {clusterProducts.map((product) => (
                        <div 
                          key={product.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/40 to-transparent hover:from-muted/60 hover:to-muted/20 transition-all border border-transparent hover:border-primary/20"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.id}</div>
                          </div>
                          {getCategoryBadge(product.category)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Store Product Mappings - Grouped by Cluster */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-6 w-6" />
          Store Product Ranges by Cluster
        </h2>
        
        {viewMode === "hq" ? (
          // HQ View: Group stores by cluster
          storeClusters.map((cluster) => {
            const clusterStores = filteredStores.filter(store => store.cluster === cluster.id);
            
            if (clusterStores.length === 0 && selectedCluster !== "all" && selectedCluster !== cluster.id) {
              return null;
            }
            
            return (
              <div key={cluster.id} className="space-y-4">
                {/* Cluster Header */}
                <div className="flex items-center gap-3 pb-2 border-b-2 border-primary/20">
                  <Badge className={`${cluster.color} text-lg px-4 py-2`}>
                    {cluster.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {clusterStores.length} {clusterStores.length === 1 ? 'store' : 'stores'}
                  </span>
                </div>
                
                {/* Stores in this cluster */}
                {clusterStores.length === 0 ? (
                  <Card className="shadow-card">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Store className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No stores assigned to this cluster yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => handleClusterClick(cluster.id)}
                      >
                        Assign Stores
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  clusterStores.map((store) => {
                    const isExpanded = expandedStores.includes(store.storeId);
                    return (
                      <Card key={store.storeId} className="shadow-card hover:shadow-lg transition-all">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer hover:bg-muted/20 -m-6 p-6 rounded-lg transition-colors"
                              onClick={() => toggleStoreExpanded(store.storeId)}
                            >
                              <CardTitle className="flex items-center gap-3">
                                <Store className="h-5 w-5" />
                                {store.storeName}
                              </CardTitle>
                              <CardDescription>
                                {store.storeId} • {store.postcode} • 
                                {store.activeProducts.filter(p => p.active).length} of {store.activeProducts.length} products active
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                              <Select
                                value={store.cluster}
                                onValueChange={(value) => handleChangeStoreCluster(store.storeId, value)}
                              >
                                <SelectTrigger className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue placeholder="Select cluster" />
                                </SelectTrigger>
                                <SelectContent>
                                  {storeClusters.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${c.color}`} />
                                        {c.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleStoreExpanded(store.storeId)}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent className="animate-accordion-down">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Category</TableHead>
                                  {viewMode === "hq" && <TableHead className="text-center">Min Capacity</TableHead>}
                                  {viewMode === "hq" && <TableHead className="text-center">Max Capacity</TableHead>}
                                  <TableHead>Status</TableHead>
                                  <TableHead>Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {store.activeProducts
                                  .map((product) => {
                                    const capacityKey = `${product.id}-${allStores.find(s => s.storeId === store.storeId)?.id}`;
                                    const capacity = productCapacities[capacityKey] || { min: 0, max: 0 };
                                    
                                    return (
                                      <TableRow key={product.id}>
                                        <TableCell>
                                          <div>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-sm text-muted-foreground">{product.id}</div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          {getCategoryBadge(product.category)}
                                        </TableCell>
                                        {viewMode === "hq" && (
                                          <TableCell className="text-center">
                                            <Input
                                              type="number"
                                              min="0"
                                              value={capacity.min}
                                              onChange={(e) => {
                                                const storeDbId = allStores.find(s => s.storeId === store.storeId)?.id;
                                                if (storeDbId) {
                                                  updateProductCapacity(product.id, storeDbId, 'min', parseInt(e.target.value) || 0);
                                                }
                                              }}
                                              className="w-20 text-center"
                                            />
                                          </TableCell>
                                        )}
                                        {viewMode === "hq" && (
                                          <TableCell className="text-center">
                                            <Input
                                              type="number"
                                              min="0"
                                              value={capacity.max}
                                              onChange={(e) => {
                                                const storeDbId = allStores.find(s => s.storeId === store.storeId)?.id;
                                                if (storeDbId) {
                                                  updateProductCapacity(product.id, storeDbId, 'max', parseInt(e.target.value) || 0);
                                                }
                                              }}
                                              className="w-20 text-center"
                                            />
                                          </TableCell>
                                        )}
                                        <TableCell>
                                          <Badge variant={product.active ? "default" : "secondary"}>
                                            {product.active ? "Active" : "Inactive"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            size="sm"
                                            variant={product.active ? "outline" : "default"}
                                            onClick={() => toggleProductStatus(store.storeId, product.id)}
                                          >
                                            {product.active ? "Disable" : "Enable"}
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            );
          })
        ) : null}
        
        {/* Store View: Show all products in a simple table */}
        {viewMode === "store_manager" && filteredStores.map((store) => {
        return (
          <Card key={store.storeId} className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                My Product Range
                <Badge variant="secondary">{store.activeProducts.length} products</Badge>
              </CardTitle>
              <CardDescription>All products available at {store.storeName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.activeProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(product.category)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
      </div>

      {/* Template Edit Dialog */}
      <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit {editingTemplateCluster && storeClusters.find(c => c.id === editingTemplateCluster)?.name} Template
            </DialogTitle>
            <DialogDescription>
              Manage the product range for this cluster template. Changes will apply to all stores in this cluster.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Template Products</p>
                <p className="text-sm text-muted-foreground">
                  {templateProducts.filter(p => p.active).length} of {templateProducts.length} products active
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="space-y-2 border rounded-lg p-4">
              {templateProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg border-2 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      id={product.id}
                      checked={product.active}
                      onCheckedChange={() => toggleTemplateProduct(product.id)}
                    />
                    <label htmlFor={product.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.id}</div>
                    </label>
                    {getCategoryBadge(product.category)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTemplateProduct(product.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cluster Management Dialog */}
      <Dialog open={isClusterDialogOpen} onOpenChange={setIsClusterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage {editingCluster && storeClusters.find(c => c.id === editingCluster)?.name} Cluster
            </DialogTitle>
            <DialogDescription>
              Select which stores should belong to this cluster. Their product ranges will automatically adjust.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Selected Stores</p>
                <p className="text-sm text-muted-foreground">
                  {selectedStores.length} of {allStores.length} stores assigned to this cluster
                </p>
              </div>
              <Badge className={editingCluster ? storeClusters.find(c => c.id === editingCluster)?.color : ''}>
                {editingCluster && storeClusters.find(c => c.id === editingCluster)?.name}
              </Badge>
            </div>

            <div className="space-y-2 border rounded-lg p-4 max-h-[400px] overflow-y-auto">
              {allStores.map((store) => {
                const isSelected = selectedStores.includes(store.id);
                const currentCluster = storeClusters.find(c => c.id === store.cluster);
                
                return (
                  <div 
                    key={store.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={store.id}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStores([...selectedStores, store.id]);
                          } else {
                            setSelectedStores(selectedStores.filter(id => id !== store.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={store.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{store.storeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {store.storeId} • {store.postcode}
                        </div>
                      </label>
                    </div>
                    {!isSelected && store.cluster !== editingCluster && currentCluster && (
                      <Badge variant="outline" className="text-xs">
                        Currently: {currentCluster.name}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
              <p className="text-sm font-medium mb-1">💡 Product Range Changes</p>
              <p className="text-sm text-muted-foreground">
                When you change a store's cluster, its product range will automatically update to match the cluster's standard offerings.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClusterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClusterAssignments}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}