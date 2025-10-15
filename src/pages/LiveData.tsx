import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductData {
  productName: string;
  planned: number;
  produced: number;
  delivered: number;
  sold: number;
  wasted: number;
  unaccountedFor: number;
}

interface StoreData {
  storeId: string;
  storeName: string;
  products: ProductData[];
}

// Mock data
const mockStores: StoreData[] = [
  {
    storeId: "OS-001",
    storeName: "Kings Cross Station",
    products: [
      {
        productName: "Butter Croissant",
        planned: 120,
        produced: 120,
        delivered: 120,
        sold: 105,
        wasted: 8,
        unaccountedFor: 7,
      },
      {
        productName: "Pain au Chocolat",
        planned: 100,
        produced: 100,
        delivered: 100,
        sold: 92,
        wasted: 5,
        unaccountedFor: 3,
      },
      {
        productName: "Almond Croissant",
        planned: 80,
        produced: 80,
        delivered: 80,
        sold: 74,
        wasted: 4,
        unaccountedFor: 2,
      },
    ],
  },
  {
    storeId: "OS-002",
    storeName: "Liverpool Street Station",
    products: [
      {
        productName: "Butter Croissant",
        planned: 150,
        produced: 150,
        delivered: 150,
        sold: 138,
        wasted: 7,
        unaccountedFor: 5,
      },
      {
        productName: "Pain au Chocolat",
        planned: 130,
        produced: 130,
        delivered: 130,
        sold: 119,
        wasted: 6,
        unaccountedFor: 5,
      },
      {
        productName: "Almond Croissant",
        planned: 100,
        produced: 100,
        delivered: 100,
        sold: 91,
        wasted: 5,
        unaccountedFor: 4,
      },
    ],
  },
  {
    storeId: "OS-003",
    storeName: "St Pancras International",
    products: [
      {
        productName: "Butter Croissant",
        planned: 180,
        produced: 180,
        delivered: 180,
        sold: 165,
        wasted: 9,
        unaccountedFor: 6,
      },
      {
        productName: "Pain au Chocolat",
        planned: 160,
        produced: 160,
        delivered: 160,
        sold: 147,
        wasted: 8,
        unaccountedFor: 5,
      },
      {
        productName: "Almond Croissant",
        planned: 120,
        produced: 120,
        delivered: 120,
        sold: 110,
        wasted: 6,
        unaccountedFor: 4,
      },
    ],
  },
];

const LiveData = () => {
  const [stores] = useState<StoreData[]>(mockStores);

  const calculateStoreTotals = (products: ProductData[]) => {
    return products.reduce(
      (totals, product) => ({
        planned: totals.planned + product.planned,
        produced: totals.produced + product.produced,
        delivered: totals.delivered + product.delivered,
        sold: totals.sold + product.sold,
        wasted: totals.wasted + product.wasted,
        unaccountedFor: totals.unaccountedFor + product.unaccountedFor,
      }),
      { planned: 0, produced: 0, delivered: 0, sold: 0, wasted: 0, unaccountedFor: 0 }
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Live Data</h1>
        <p className="text-muted-foreground">
          Real-time tracking of product quantities across all stores
        </p>
      </div>

      <div className="space-y-8">
        {stores.map((store) => {
          const totals = calculateStoreTotals(store.products);

          return (
            <Card key={store.storeId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{store.storeName}</CardTitle>
                    <CardDescription>Store ID: {store.storeId}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {store.products.length} Products
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Product</TableHead>
                      <TableHead className="text-right">Planned</TableHead>
                      <TableHead className="text-right">Produced</TableHead>
                      <TableHead className="text-right">Delivered</TableHead>
                      <TableHead className="text-right">Sold</TableHead>
                      <TableHead className="text-right">Wasted</TableHead>
                      <TableHead className="text-right">Unaccounted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {store.products.map((product) => (
                      <TableRow key={product.productName}>
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell className="text-right">{product.planned}</TableCell>
                        <TableCell className="text-right">{product.produced}</TableCell>
                        <TableCell className="text-right">{product.delivered}</TableCell>
                        <TableCell className="text-right">{product.sold}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-destructive">{product.wasted}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-warning">{product.unaccountedFor}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell>Store Total</TableCell>
                      <TableCell className="text-right">{totals.planned}</TableCell>
                      <TableCell className="text-right">{totals.produced}</TableCell>
                      <TableCell className="text-right">{totals.delivered}</TableCell>
                      <TableCell className="text-right">{totals.sold}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-destructive">{totals.wasted}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-warning">{totals.unaccountedFor}</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LiveData;
