import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, CheckCircle } from "lucide-react";
import { useView } from "@/contexts/ViewContext";

interface Sale {
  id: string;
  timestamp: Date;
  product: string;
  store: string;
  brand: string;
  quantity: number;
  price: number;
  total: number;
}

// Brand to store mapping
const brandStoreMap = {
  "All Brands": ["London Bridge", "Kings Cross", "Victoria Station", "Oxford Street", "Canary Wharf", "Liverpool Street", "Paddington", "Waterloo", "Bond Street", "Leicester Square", "Covent Garden", "Bank", "Monument", "Tower Hill", "Holborn"],
  "Pret a Manger": ["London Bridge", "Kings Cross", "Victoria Station", "Liverpool Street", "Paddington", "Waterloo", "Bank", "Monument"],
  "Brioche Dorée": ["Oxford Street", "Canary Wharf", "Bond Street", "Leicester Square", "Covent Garden"],
  "Starbucks": ["London Bridge", "Oxford Street", "Tower Hill", "Holborn", "Canary Wharf"]
};

// Store to brand mapping
const storeToBrand: Record<string, string> = {};
Object.entries(brandStoreMap).forEach(([brand, stores]) => {
  if (brand !== "All Brands") {
    stores.forEach(store => {
      storeToBrand[store] = brand;
    });
  }
});

// Generate mock sales data with current timestamps
const generateMockSale = (forStore?: string, forBrand?: string): Sale => {
  const products = [
    { name: "Classic BLT Sandwich", price: 5.50 },
    { name: "Chicken Caesar Wrap", price: 6.00 },
    { name: "Avocado & Hummus Wrap", price: 6.00 },
    { name: "Tuna Melt Panini", price: 6.00 },
    { name: "Mediterranean Salad Bowl", price: 6.50 },
    { name: "Smoked Salmon Bagel", price: 7.50 },
    { name: "Ham & Cheese Croissant", price: 4.50 },
    { name: "Vegan Buddha Bowl", price: 7.00 },
  ];

  let stores = brandStoreMap["All Brands"];
  if (forBrand && forBrand !== "All Brands") {
    stores = brandStoreMap[forBrand as keyof typeof brandStoreMap] || stores;
  }

  const product = products[Math.floor(Math.random() * products.length)];
  const quantity = Math.floor(Math.random() * 3) + 1;
  const selectedStore = forStore || stores[Math.floor(Math.random() * stores.length)];
  const brand = storeToBrand[selectedStore] || "Pret a Manger";

  return {
    id: `SAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    product: product.name,
    store: selectedStore,
    brand,
    quantity,
    price: product.price,
    total: product.price * quantity
  };
};

export default function LiveSales() {
  const { viewMode, selectedStore } = useView();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>("All");

  // Available stores based on selected brand
  const availableStores = selectedBrand === "All Brands" 
    ? ["All", ...brandStoreMap["All Brands"]]
    : ["All", ...brandStoreMap[selectedBrand as keyof typeof brandStoreMap]];

  // Initialize with some sales
  useEffect(() => {
    const initialSales = Array.from({ length: 20 }, () => {
      const sale = generateMockSale();
      // Randomize timestamps for initial data (last 30 minutes)
      sale.timestamp = new Date(Date.now() - Math.random() * 30 * 60 * 1000);
      return sale;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setSales(initialSales);
  }, []);

  // Simulate live sales updates
  useEffect(() => {
    if (!isLive) return;

    const addNewSale = () => {
      const newSale = generateMockSale(
        viewMode === "store_manager" ? selectedStore : undefined,
        viewMode === "hq" ? selectedBrand : undefined
      );
      setSales(prevSales => [newSale, ...prevSales].slice(0, 50)); // Keep only last 50 sales
    };

    // Add a sale immediately
    addNewSale();

    // Then continue adding at random intervals
    const interval = setInterval(() => {
      addNewSale();
    }, Math.random() * 4000 + 3000); // Random interval between 3-7 seconds

    return () => clearInterval(interval);
  }, [isLive, viewMode, selectedStore, selectedBrand]);

  // Filter sales by store if in store view
  let filteredSales = viewMode === "store_manager" 
    ? sales.filter(sale => sale.store === selectedStore)
    : sales;
  
  // Apply brand and store filters for HQ view
  if (viewMode === "hq") {
    if (selectedBrand !== "All Brands") {
      filteredSales = filteredSales.filter(sale => sale.brand === selectedBrand);
    }
    if (selectedStoreFilter !== "All") {
      filteredSales = filteredSales.filter(sale => sale.store === selectedStoreFilter);
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate live stats
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTransaction = totalSales / totalTransactions || 0;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Live Sales {viewMode === "store_manager" ? `- ${selectedStore}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Real-time sales data from POS system integration
        </p>
      </div>

      {/* Brand and Store Filters for HQ View */}
      {viewMode === "hq" && (
        <Card className="shadow-card border-l-4 border-l-[#7e9f57]">
          <CardContent className="py-4">
            <div className="space-y-4">
              {/* Brand Filter - Higher Level */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">My Brand:</label>
                <Select value={selectedBrand} onValueChange={(v) => {
                  setSelectedBrand(v);
                  setSelectedStoreFilter("All");
                }}>
                  <SelectTrigger className="w-[200px] h-9 border-[#7e9f57] focus:ring-[#7e9f57] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Brands">All Brands</SelectItem>
                    <SelectItem value="Pret a Manger">Pret a Manger</SelectItem>
                    <SelectItem value="Brioche Dorée">Brioche Dorée</SelectItem>
                    <SelectItem value="Starbucks">Starbucks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Store Filter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Filter by Store:</label>
                  <Select value={selectedStoreFilter} onValueChange={setSelectedStoreFilter}>
                    <SelectTrigger className="w-[180px] h-9 border-[#7e9f57] focus:ring-[#7e9f57]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStores.map(store => (
                        <SelectItem key={store} value={store}>{store}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Viewing:</span>
                  <Badge className="bg-[#7e9f57] text-white font-semibold">
                    {selectedBrand} • {selectedStoreFilter}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* POS Integration Status */}
      <Card className="shadow-card border-success/20 bg-gradient-to-r from-background to-success/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity className="h-6 w-6 text-success" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </span>
              </div>
              <div>
                <CardTitle className="text-lg">POS Integration Status</CardTitle>
                <CardDescription>Connected to all store terminals</CardDescription>
              </div>
            </div>
            <Badge className="bg-success text-white flex items-center gap-2 px-4 py-2">
              <CheckCircle className="h-4 w-4" />
              LIVE
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              £{totalSales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              £{averageTransaction.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Live Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredSales.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Recent transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Sales Feed */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Transaction Feed</CardTitle>
              <CardDescription>
                Real-time sales data from POS terminals - most recent first
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-success border-success">
              Auto-updating
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Product</TableHead>
                  {viewMode === "hq" && <TableHead>Store</TableHead>}
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={viewMode === "hq" ? 6 : 5} className="text-center text-muted-foreground">
                      No sales data available for this store
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale, index) => (
                    <TableRow 
                      key={sale.id}
                      className={index === 0 ? "bg-success/5 animate-in fade-in duration-300" : ""}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-medium">{formatTime(sale.timestamp)}</span>
                          <span className="font-mono text-xs text-muted-foreground">{formatDate(sale.timestamp)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{sale.product}</div>
                      </TableCell>
                      {viewMode === "hq" && (
                        <TableCell>
                          <Badge variant="outline">{sale.store}</Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-right font-mono">{sale.quantity}</TableCell>
                      <TableCell className="text-right font-mono">£{sale.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-success">
                        £{sale.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
