import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, CheckCircle, Upload, FileText, X, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useView } from "@/contexts/ViewContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DeliveryItem {
  ingredient: string;
  quantityOrdered: number;
  quantityReceived: number;
  unit: string;
}

interface DeliveryLog {
  id: string;
  supplier: string;
  deliveryDate: string;
  receivedBy: string;
  store: string;
  items: DeliveryItem[];
  status: "completed" | "partial" | "pending";
  notes?: string;
  receiptFile?: File;
  receiptUrl?: string;
}

const SUPPLIERS = [
  "Fresh Farms Ltd",
  "Premium Proteins Co",
  "Dairy Direct",
  "Artisan Bakery Supply",
  "Mediterranean Foods Import",
  "Gourmet Condiments Ltd",
];

const INGREDIENTS = [
  { name: "Chicken Breast", unit: "kg" },
  { name: "Romaine Lettuce", unit: "kg" },
  { name: "Parmesan Cheese", unit: "kg" },
  { name: "Caesar Dressing", unit: "L" },
  { name: "Bacon", unit: "kg" },
  { name: "Tomato", unit: "kg" },
  { name: "Whole Wheat Bread", unit: "loaves" },
  { name: "Feta Cheese", unit: "kg" },
  { name: "Cucumber", unit: "kg" },
  { name: "Kalamata Olives", unit: "kg" },
  { name: "Smoked Salmon", unit: "kg" },
  { name: "Cream Cheese", unit: "kg" },
  { name: "Bagel", unit: "units" },
  { name: "Avocado", unit: "units" },
  { name: "Hummus", unit: "kg" },
  { name: "Tortilla Wrap", unit: "units" },
];

export default function Deliveries() {
  const { toast } = useToast();
  const { viewMode, selectedStore } = useView();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [deliveries, setDeliveries] = useState<DeliveryLog[]>([
    {
      id: "1",
      supplier: "Fresh Farms Ltd",
      deliveryDate: "2025-01-08 09:30",
      receivedBy: "John Smith",
      store: "London Bridge",
      items: [
        { ingredient: "Romaine Lettuce", quantityOrdered: 20, quantityReceived: 20, unit: "kg" },
        { ingredient: "Tomato", quantityOrdered: 25, quantityReceived: 25, unit: "kg" },
        { ingredient: "Cucumber", quantityOrdered: 15, quantityReceived: 15, unit: "kg" },
      ],
      status: "completed",
      receiptUrl: undefined,
    },
    {
      id: "2",
      supplier: "Premium Proteins Co",
      deliveryDate: "2025-01-08 11:00",
      receivedBy: "Sarah Johnson",
      store: "London Bridge",
      items: [
        { ingredient: "Chicken Breast", quantityOrdered: 30, quantityReceived: 28, unit: "kg" },
        { ingredient: "Bacon", quantityOrdered: 20, quantityReceived: 18, unit: "kg" },
      ],
      status: "partial",
      notes: "2kg chicken and 2kg bacon short - supplier to credit",
      receiptUrl: undefined,
    },
    {
      id: "3",
      supplier: "Dairy Direct",
      deliveryDate: "2025-01-07 14:00",
      receivedBy: "Mike Davis",
      store: "London Bridge",
      items: [
        { ingredient: "Parmesan Cheese", quantityOrdered: 10, quantityReceived: 10, unit: "kg" },
        { ingredient: "Cream Cheese", quantityOrdered: 15, quantityReceived: 15, unit: "kg" },
        { ingredient: "Feta Cheese", quantityOrdered: 8, quantityReceived: 8, unit: "kg" },
      ],
      status: "completed",
      receiptUrl: undefined,
    },
  ]);

  const [newDelivery, setNewDelivery] = useState({
    supplier: "",
    receivedBy: "",
    notes: "",
    items: [] as DeliveryItem[],
  });

  const [currentItem, setCurrentItem] = useState({
    ingredient: "",
    quantityOrdered: "",
    quantityReceived: "",
  });

  const handleAddItem = () => {
    if (!currentItem.ingredient || !currentItem.quantityOrdered || !currentItem.quantityReceived) {
      toast({
        title: "Error",
        description: "Please fill in all item fields",
        variant: "destructive",
      });
      return;
    }

    const ingredientData = INGREDIENTS.find((i) => i.name === currentItem.ingredient);
    const item: DeliveryItem = {
      ingredient: currentItem.ingredient,
      quantityOrdered: parseFloat(currentItem.quantityOrdered),
      quantityReceived: parseFloat(currentItem.quantityReceived),
      unit: ingredientData?.unit || "kg",
    };

    setNewDelivery({
      ...newDelivery,
      items: [...newDelivery.items, item],
    });

    setCurrentItem({
      ingredient: "",
      quantityOrdered: "",
      quantityReceived: "",
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewDelivery({
      ...newDelivery,
      items: newDelivery.items.filter((_, i) => i !== index),
    });
  };

  const handleRecordDelivery = () => {
    if (!newDelivery.supplier || !newDelivery.receivedBy || newDelivery.items.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one item",
        variant: "destructive",
      });
      return;
    }

    const allReceived = newDelivery.items.every((item) => item.quantityReceived === item.quantityOrdered);
    const anyReceived = newDelivery.items.some((item) => item.quantityReceived > 0);

    const delivery: DeliveryLog = {
      id: Date.now().toString(),
      supplier: newDelivery.supplier,
      deliveryDate: new Date().toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(",", ""),
      receivedBy: newDelivery.receivedBy,
      store: viewMode === "store_manager" ? selectedStore : "All Stores",
      items: newDelivery.items,
      status: allReceived ? "completed" : anyReceived ? "partial" : "pending",
      notes: newDelivery.notes,
    };

    setDeliveries([delivery, ...deliveries]);
    setIsDialogOpen(false);
    setNewDelivery({
      supplier: "",
      receivedBy: "",
      notes: "",
      items: [],
    });

    toast({
      title: "Delivery Recorded",
      description: "Ingredients inventory has been updated with received quantities",
    });
  };

  const handleUploadReceipt = (deliveryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update the delivery with the receipt file
    setDeliveries(
      deliveries.map((d) =>
        d.id === deliveryId
          ? { ...d, receiptFile: file, receiptUrl: URL.createObjectURL(file) }
          : d
      )
    );

    toast({
      title: "Receipt Uploaded",
      description: `${file.name} has been attached to this delivery`,
    });

    setUploadingReceipt(null);
  };

  const getStatusBadge = (status: DeliveryLog["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "partial":
        return <Badge variant="secondary">Partial</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const filteredDeliveries = viewMode === "store_manager"
    ? deliveries.filter((d) => d.store === selectedStore)
    : deliveries;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deliveries</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage supplier deliveries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "EEEE, MMM d, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Delivery
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredDeliveries.map((delivery) => (
          <Card key={delivery.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{delivery.supplier}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {delivery.deliveryDate} • {delivery.store}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(delivery.status)}
                  {delivery.receiptUrl ? (
                    <Badge variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      Receipt
                    </Badge>
                  ) : (
                    <>
                      <input
                        ref={receiptInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleUploadReceipt(delivery.id, e)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUploadingReceipt(delivery.id);
                          receiptInputRef.current?.click();
                        }}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload Receipt
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Ordered</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delivery.items.map((item, idx) => {
                    const isShort = item.quantityReceived < item.quantityOrdered;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.ingredient}</TableCell>
                        <TableCell>{item.quantityOrdered}</TableCell>
                        <TableCell>
                          <span className={isShort ? "text-orange-600 font-medium" : ""}>
                            {item.quantityReceived}
                          </span>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          {isShort ? (
                            <Badge variant="secondary">
                              -{(item.quantityOrdered - item.quantityReceived).toFixed(1)} {item.unit}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Complete
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Received by: <span className="font-medium text-foreground">{delivery.receivedBy}</span>
                  </p>
                  {delivery.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Notes: <span className="text-foreground">{delivery.notes}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDeliveries.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No deliveries recorded</h3>
              <p className="text-muted-foreground">Record your first delivery to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Delivery</DialogTitle>
            <DialogDescription>
              Log a new delivery from a supplier
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier *</Label>
                <Select value={newDelivery.supplier} onValueChange={(v) => setNewDelivery({ ...newDelivery, supplier: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLIERS.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Received By *</Label>
                <Input
                  placeholder="Your name"
                  value={newDelivery.receivedBy}
                  onChange={(e) => setNewDelivery({ ...newDelivery, receivedBy: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Input
                placeholder="Any discrepancies or notes"
                value={newDelivery.notes}
                onChange={(e) => setNewDelivery({ ...newDelivery, notes: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Delivery Items</h3>
              
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-5">
                  <Label className="text-xs">Ingredient</Label>
                  <Select value={currentItem.ingredient} onValueChange={(v) => setCurrentItem({ ...currentItem, ingredient: v })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {INGREDIENTS.map((ing) => (
                        <SelectItem key={ing.name} value={ing.name}>
                          {ing.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Ordered</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="h-9"
                    value={currentItem.quantityOrdered}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantityOrdered: e.target.value })}
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Received</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="h-9"
                    value={currentItem.quantityReceived}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantityReceived: e.target.value })}
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <Button size="sm" onClick={handleAddItem} className="h-9 w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {newDelivery.items.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Ordered</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newDelivery.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.ingredient}</TableCell>
                          <TableCell>{item.quantityOrdered}</TableCell>
                          <TableCell>{item.quantityReceived}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordDelivery}>
              Record Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
