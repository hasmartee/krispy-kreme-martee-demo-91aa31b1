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

// Day parts
const dayParts = [
  { id: "breakfast", name: "Breakfast", timeRange: "Open-11am" },
  { id: "lunch", name: "Lunch", timeRange: "11am-2pm" },
  { id: "afternoon", name: "Afternoon", timeRange: "2pm-Close" },
];

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

// Brand to store name mapping (using actual database store names)
const storeBrands: Record<string, string> = {
  // Pret a Manger stores (transport hubs & high street)
  "Kings Cross Station": "Pret a Manger",
  "Liverpool Street Station": "Pret a Manger",
  "St Pancras International": "Pret a Manger",
  "Shoreditch High Street": "Pret a Manger",
  
  // Brioche Dorée stores (upscale & residential areas)
  "Bond Street": "Brioche Dorée",
  "Notting Hill Gate": "Brioche Dorée",
  "Greenwich Village": "Brioche Dorée",
  "Wimbledon Village": "Brioche Dorée",
  
  // Starbucks stores (business district & mixed)
  "Bank Station": "Starbucks",
  "Canary Wharf Plaza": "Starbucks",
  "The City - Leadenhall": "Starbucks",
  "Camden Town": "Starbucks"
};

// Brand-specific product templates
const brandProductTemplates = {
  "Pret a Manger": {
    breakfast: [
      { id: "PRET-B001", name: "Bacon & Egg Baguette", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "PRET-B002", name: "Ham & Cheese Croissant", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "PRET-B003", name: "Avocado Toast with Egg", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "PRET-B004", name: "Granola Bowl", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "PRET-B005", name: "Breakfast Burrito", category: "Breakfast", active: true, dayParts: ["breakfast"] },
    ],
    lunch: [
      { id: "PRET-L001", name: "Classic BLT", category: "Sandwich", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "PRET-L002", name: "Chicken Caesar Wrap", category: "Wrap", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "PRET-L003", name: "Tuna Melt Panini", category: "Hot Food", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "PRET-L004", name: "Mediterranean Salad", category: "Salad", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "PRET-L005", name: "Chicken Bacon Sandwich", category: "Sandwich", active: true, dayParts: ["lunch", "afternoon"] },
    ]
  },
  "Brioche Dorée": {
    breakfast: [
      { id: "BD-B001", name: "Croissant au Beurre", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "BD-B002", name: "Pain au Chocolat", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "BD-B003", name: "Croque Monsieur", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "BD-B004", name: "Brioche with Jam", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "BD-B005", name: "French Toast", category: "Breakfast", active: true, dayParts: ["breakfast"] },
    ],
    lunch: [
      { id: "BD-L001", name: "Jambon-Beurre Sandwich", category: "Sandwich", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "BD-L002", name: "Quiche Lorraine", category: "Hot Food", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "BD-L003", name: "Croque Madame", category: "Hot Food", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "BD-L004", name: "Salade Niçoise", category: "Salad", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "BD-L005", name: "Baguette Poulet", category: "Sandwich", active: true, dayParts: ["lunch", "afternoon"] },
    ]
  },
  "Starbucks": {
    breakfast: [
      { id: "SB-B001", name: "Bacon Egg Bites", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "SB-B002", name: "Breakfast Sandwich", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "SB-B003", name: "Oatmeal with Toppings", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "SB-B004", name: "Blueberry Muffin", category: "Breakfast", active: true, dayParts: ["breakfast"] },
      { id: "SB-B005", name: "Avocado Spread", category: "Breakfast", active: true, dayParts: ["breakfast"] },
    ],
    lunch: [
      { id: "SB-L001", name: "Turkey Pesto Panini", category: "Sandwich", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "SB-L002", name: "Chicken Caprese Sandwich", category: "Sandwich", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "SB-L003", name: "Protein Box", category: "Salad", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "SB-L004", name: "Grilled Cheese", category: "Hot Food", active: true, dayParts: ["lunch", "afternoon"] },
      { id: "SB-L005", name: "Chicken Wrap", category: "Wrap", active: true, dayParts: ["lunch", "afternoon"] },
    ]
  }
};

// Generate products for a brand and cluster
const generateBrandProducts = (brand: string, cluster: string) => {
  const brandTemplate = brandProductTemplates[brand as keyof typeof brandProductTemplates];
  if (!brandTemplate) return [];
  
  const allProducts = [...brandTemplate.breakfast, ...brandTemplate.lunch];
  
  // Customize based on cluster
  switch (cluster) {
    case "transport_hub":
      return allProducts.slice(0, 8); // Fewer SKUs for quick service
    case "business_district":
      return allProducts.slice(0, 10);
    case "residential":
      return allProducts;
    case "high_street":
      return allProducts;
    default:
      return allProducts.slice(0, 7);
  }
};

export default function StoreProductRange() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Pret a Manger");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [selectedDayPart, setSelectedDayPart] = useState<string>("all");
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
  const { toast } = useToast();
  const { viewMode, selectedStore } = useView();

  // Load all stores from database
  useEffect(() => {
    loadStores();
  }, []);

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
        const storeBrand = storeBrands[store.storeName] || "Pret a Manger";
        return {
          storeId: store.storeId,
          storeName: store.storeName,
          postcode: store.postcode,
          cluster: store.cluster,
          activeProducts: generateBrandProducts(storeBrand, store.cluster)
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
    const matchesViewMode = viewMode === "hq" || viewMode === "store_manager" || viewMode === "store_team" ? (store.storeName === selectedStore || viewMode === "hq") : false;
    
    // Filter by brand
    const storeBrand = storeBrands[store.storeName] || "Pret a Manger";
    const matchesBrand = selectedBrand === storeBrand;
    
    return matchesSearch && matchesCluster && matchesViewMode && (viewMode !== "hq" || matchesBrand);
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
    setTemplateProducts(generateBrandProducts(selectedBrand, clusterId));
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

      {/* Brand and Day Part Filter - Prominent */}
      {viewMode === "hq" && (
        <>
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

          <Card className="shadow-card border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Day Part Filter
                  </CardTitle>
                  <CardDescription>
                    {selectedDayPart === "all" 
                      ? "Showing products for all day parts" 
                      : `Showing ${dayParts.find(d => d.id === selectedDayPart)?.name} products (${dayParts.find(d => d.id === selectedDayPart)?.timeRange})`
                    }
                  </CardDescription>
                </div>
                {selectedDayPart !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDayPart("all")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedDayPart === "all" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedDayPart("all")}
                  className="flex-1 min-w-[160px] h-16 text-base font-semibold"
                >
                  <Package className="mr-2 h-5 w-5" />
                  All Day Parts
                </Button>
                {dayParts.map((dayPart) => (
                  <Button
                    key={dayPart.id}
                    variant={selectedDayPart === dayPart.id ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedDayPart(dayPart.id)}
                    className="flex-1 min-w-[160px] h-16 text-base font-semibold"
                  >
                    <div className="flex flex-col items-start">
                      <span>{dayPart.name}</span>
                      <span className="text-xs font-normal opacity-80">{dayPart.timeRange}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
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
                        {clusterProducts.filter(p => selectedDayPart === "all" || p.dayParts?.includes(selectedDayPart)).length} products
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                      {clusterProducts
                        .filter(product => selectedDayPart === "all" || product.dayParts?.includes(selectedDayPart))
                        .map((product) => (
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
                                  <TableHead>Status</TableHead>
                                  <TableHead>Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {store.activeProducts
                                  .filter(product => selectedDayPart === "all" || product.dayParts?.includes(selectedDayPart))
                                  .map((product) => (
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
                                ))}
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
        
        {/* Store View: Show ranges split by day parts */}
        {viewMode === "store_manager" && filteredStores.map((store) => {
        const breakfastProducts = store.activeProducts.filter(p => p.dayParts?.includes('breakfast'));
        const lunchProducts = store.activeProducts.filter(p => p.dayParts?.includes('lunch'));
        const afternoonProducts = store.activeProducts.filter(p => p.dayParts?.includes('afternoon'));
        
        return (
          <div key={store.storeId} className="space-y-6">
            {/* Breakfast Range */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  Breakfast Range
                  <Badge variant="secondary">{breakfastProducts.length} products</Badge>
                </CardTitle>
                <CardDescription>Open-11am</CardDescription>
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
                    {breakfastProducts.map((product) => (
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

            {/* Lunch Range */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  Lunch Range
                  <Badge variant="secondary">{lunchProducts.length} products</Badge>
                </CardTitle>
                <CardDescription>11am-2pm</CardDescription>
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
                    {lunchProducts.map((product) => (
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

            {/* Afternoon Range */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  Afternoon Range
                  <Badge variant="secondary">{afternoonProducts.length} products</Badge>
                </CardTitle>
                <CardDescription>2pm-Close</CardDescription>
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
                    {afternoonProducts.map((product) => (
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
          </div>
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