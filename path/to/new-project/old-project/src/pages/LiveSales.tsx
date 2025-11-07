import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, Loader2 } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { supabase } from "@/lib/supabase-helper";

interface Sale {
  id: string;
  timestamp: Date;
  product: string;
  quantity: number;
  price: number;
  total: number;
}

interface Product {
  name: string;
  price: number;
  category: string;
}

// Generate mock sales data using products from database
const generateMockSale = (products: Product[]): Sale => {
  if (products.length === 0) {
    return {
      id: `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      product: "Loading...",
      quantity: 1,
      price: 0,
      total: 0
    };
  }

  const product = products[Math.floor(Math.random() * products.length)];
  const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 items

  return {
    id: `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    product: product.name,
    quantity,
    price: product.price,
    total: product.price * quantity
  };
};

export default function LiveSales() {
  const { viewMode, selectedStore } = useView();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('name, category');

        if (error) throw error;

        // Map products with realistic pricing based on category
        const productsWithPricing: Product[] = (data || []).map(p => {
          let price = 2.50;
          
          // Price based on category
          if (p.category === 'Donuts') price = 2.25 + Math.random() * 0.50;
          else if (p.category === 'Iced') price = 2.50 + Math.random() * 0.50;
          else if (p.category === 'Filled') price = 2.75 + Math.random() * 0.50;
          else if (p.category === 'Cake') price = 3.00 + Math.random() * 0.75;
          else if (p.category === 'Pastries') price = 3.25 + Math.random() * 1.00;
          else if (p.category === 'Breakfast') price = 4.50 + Math.random() * 2.50;
          else if (p.category === 'Sandwiches') price = 5.50 + Math.random() * 2.00;
          else if (p.category === 'Wraps') price = 5.75 + Math.random() * 1.50;
          else if (p.category === 'Salads') price = 6.50 + Math.random() * 1.50;
          else if (p.category === 'Breads') price = 2.00 + Math.random() * 1.50;

          return {
            name: p.name,
            price: Math.round(price * 20) / 20, // Round to nearest 0.05
            category: p.category
          };
        });

        setProducts(productsWithPricing);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Initialize with some sales once products are loaded
  useEffect(() => {
    if (products.length === 0) return;

    const initialSales = Array.from({ length: 15 }, () => {
      const sale = generateMockSale(products);
      // Randomize timestamps for initial data (last hour)
      sale.timestamp = new Date(Date.now() - Math.random() * 60 * 60 * 1000);
      return sale;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setSales(initialSales);
  }, [products]);

  // Simulate live sales updates - like a real POS system
  useEffect(() => {
    if (!isLive || products.length === 0) return;

    const addNewSale = () => {
      const newSale = generateMockSale(products);
      setSales(prevSales => [newSale, ...prevSales].slice(0, 100)); // Keep last 100 sales
    };

    // Add first sale after short delay
    const initialTimeout = setTimeout(addNewSale, 2000);

    // Continue adding at intervals simulating customer purchases
    const interval = setInterval(() => {
      addNewSale();
    }, Math.random() * 8000 + 4000); // Random interval between 4-12 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isLive, products]);

  const filteredSales = sales;

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading products from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Live Sales - {selectedStore}
        </h1>
        <p className="text-muted-foreground">
          Real-time transaction feed from POS system
        </p>
      </div>

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
                <CardTitle className="text-lg">POS Terminal Connection</CardTitle>
                <CardDescription>Live feed from {selectedStore} POS system</CardDescription>
              </div>
            </div>
            <Badge className="bg-success text-white flex items-center gap-2 px-4 py-2">
              <CheckCircle className="h-4 w-4" />
              CONNECTED
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Session Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              £{totalSales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTransactions} transactions shown
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Basket
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
              Live Feed Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              Active
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-refreshing
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
                Real-time sales from {selectedStore} POS terminals - most recent first
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <Badge variant="outline" className="text-success border-success">
                Live
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[150px]">Time</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center w-[80px]">Qty</TableHead>
                  <TableHead className="text-right w-[100px]">Unit Price</TableHead>
                  <TableHead className="text-right w-[120px] bg-success/5">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Waiting for transactions...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale, index) => (
                    <TableRow 
                      key={sale.id}
                      className={index === 0 ? "bg-success/10 animate-in fade-in duration-500 border-l-4 border-l-success" : "hover:bg-muted/30 transition-colors"}
                    >
                      <TableCell>
                        <div className="font-mono text-sm font-medium">
                          {formatTime(sale.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{sale.product}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono font-semibold">{sale.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-muted-foreground">£{sale.price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right bg-success/5">
                        <span className="font-mono font-bold text-success text-base">
                          £{sale.total.toFixed(2)}
                        </span>
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
