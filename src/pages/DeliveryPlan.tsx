import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Store, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock stores data
const stores = [
  "St Pancras International",
  "Liverpool Street Station",
  "Kings Cross Station",
  "Canary Wharf Plaza",
  "The City - Leadenhall",
  "Bank Station",
  "Bond Street",
  "Camden Town",
  "Wimbledon Village",
  "Greenwich Village",
  "Notting Hill Gate",
  "Shoreditch High Street"
];

// Mock products with production quantities
const products = [
  { id: 1, name: "Classic BLT", sku: "BLT-001", produced: 520, dayPart: "Morning" },
  { id: 2, name: "Chicken Caesar Wrap", sku: "CCW-001", produced: 450, dayPart: "Lunch" },
  { id: 3, name: "Avocado & Egg Toast", sku: "AET-001", produced: 380, dayPart: "Morning" },
  { id: 4, name: "Tuna Melt Panini", sku: "TMP-001", produced: 320, dayPart: "Lunch" },
  { id: 5, name: "Mediterranean Salad Bowl", sku: "MSB-001", produced: 280, dayPart: "Afternoon" },
  { id: 6, name: "Almond Croissant", sku: "ACR-001", produced: 600, dayPart: "Morning" },
  { id: 7, name: "Ham & Cheese Croissant", sku: "HCC-001", produced: 480, dayPart: "Morning" },
  { id: 8, name: "Salmon & Cream Bagel", sku: "SCB-001", produced: 360, dayPart: "Morning" },
  { id: 9, name: "Greek Salad Bowl", sku: "GSB-001", produced: 240, dayPart: "Lunch" },
  { id: 10, name: "Porridge with Honey", sku: "PWH-001", produced: 200, dayPart: "Morning" },
];

interface StoreAllocation {
  storeName: string;
  allocated: number;
}

interface ProductAllocation {
  productId: number;
  productName: string;
  sku: string;
  produced: number;
  dayPart: string;
  stores: StoreAllocation[];
  totalAllocated: number;
  remaining: number;
}

const getDayPartBadge = (dayPart: string) => {
  switch (dayPart) {
    case "Morning":
      return <Badge variant="default" className="bg-amber-500">{dayPart}</Badge>;
    case "Lunch":
      return <Badge variant="default" className="bg-green-500">{dayPart}</Badge>;
    case "Afternoon":
      return <Badge variant="default" className="bg-blue-500">{dayPart}</Badge>;
    default:
      return <Badge variant="secondary">{dayPart}</Badge>;
  }
};

export default function DeliveryPlan() {
  const { toast } = useToast();
  const [selectedDayPart, setSelectedDayPart] = useState<string>("all");
  
  // Initialize allocations with equal distribution
  const [allocations, setAllocations] = useState<ProductAllocation[]>(() => {
    return products.map(product => {
      const perStore = Math.floor(product.produced / stores.length);
      const storeAllocations = stores.map(store => ({
        storeName: store,
        allocated: perStore,
      }));
      const totalAllocated = perStore * stores.length;
      
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        produced: product.produced,
        dayPart: product.dayPart,
        stores: storeAllocations,
        totalAllocated,
        remaining: product.produced - totalAllocated,
      };
    });
  });

  const updateAllocation = (productId: number, storeName: string, newValue: string) => {
    const value = parseInt(newValue) || 0;
    
    setAllocations(prev => prev.map(product => {
      if (product.productId === productId) {
        const updatedStores = product.stores.map(store => 
          store.storeName === storeName 
            ? { ...store, allocated: value }
            : store
        );
        const totalAllocated = updatedStores.reduce((sum, s) => sum + s.allocated, 0);
        
        return {
          ...product,
          stores: updatedStores,
          totalAllocated,
          remaining: product.produced - totalAllocated,
        };
      }
      return product;
    }));
  };

  const autoAllocate = (productId: number) => {
    setAllocations(prev => prev.map(product => {
      if (product.productId === productId) {
        const perStore = Math.floor(product.produced / stores.length);
        const remainder = product.produced % stores.length;
        
        const storeAllocations = stores.map((store, idx) => ({
          storeName: store,
          allocated: perStore + (idx < remainder ? 1 : 0),
        }));
        
        return {
          ...product,
          stores: storeAllocations,
          totalAllocated: product.produced,
          remaining: 0,
        };
      }
      return product;
    }));

    toast({
      title: "Auto-allocated",
      description: "Product quantities distributed evenly across stores",
    });
  };

  const saveDeliveryPlan = () => {
    // Check for over-allocations
    const overAllocated = allocations.filter(p => p.remaining < 0);
    
    if (overAllocated.length > 0) {
      toast({
        title: "Cannot save",
        description: `${overAllocated.length} product(s) are over-allocated`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Delivery plan saved",
      description: "All store allocations have been updated",
    });
  };

  const filteredAllocations = allocations.filter(allocation => 
    selectedDayPart === "all" || allocation.dayPart === selectedDayPart
  );

  const totalProduced = filteredAllocations.reduce((sum, p) => sum + p.produced, 0);
  const totalAllocated = filteredAllocations.reduce((sum, p) => sum + p.totalAllocated, 0);
  const totalRemaining = filteredAllocations.reduce((sum, p) => sum + p.remaining, 0);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Delivery Plan</h1>
        <p className="text-muted-foreground">
          Allocate produced quantities to stores
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Produced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProduced}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredAllocations.length} products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalAllocated / totalProduced) * 100).toFixed(1)}% of production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${totalRemaining < 0 ? 'text-destructive' : ''}`} />
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-destructive' : ''}`}>
              {totalRemaining}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalRemaining < 0 ? 'Over-allocated!' : 'Unallocated units'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Day Part:</label>
                <Select value={selectedDayPart} onValueChange={setSelectedDayPart}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Day Parts</SelectItem>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={saveDeliveryPlan} size="lg">
              Save Delivery Plan
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Products Allocation Table */}
      {filteredAllocations.map((allocation) => (
        <Card key={allocation.productId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-lg">{allocation.productName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{allocation.sku}</p>
                </div>
                {getDayPartBadge(allocation.dayPart)}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Produced</div>
                  <div className="text-2xl font-bold">{allocation.produced}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Allocated</div>
                  <div className="text-2xl font-bold">{allocation.totalAllocated}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className={`text-2xl font-bold ${allocation.remaining < 0 ? 'text-destructive' : ''}`}>
                    {allocation.remaining}
                  </div>
                </div>
                <Button onClick={() => autoAllocate(allocation.productId)} variant="outline">
                  Auto-Allocate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Store</TableHead>
                  <TableHead className="text-right">Allocated Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocation.stores.map((store) => (
                  <TableRow key={store.storeName}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {store.storeName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        value={store.allocated}
                        onChange={(e) => updateAllocation(allocation.productId, store.storeName, e.target.value)}
                        className="w-24 ml-auto text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
