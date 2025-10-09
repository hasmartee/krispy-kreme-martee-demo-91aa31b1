import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Calendar, Package, Plus } from "lucide-react";

interface DeliverySchedule {
  supplierId: string;
  supplierName: string;
  storeId: string;
  storeName: string;
  deliveryDays: string[];
  ingredientCategories: string[];
  leadTimeDays: number;
}

const MyLogistics = () => {
  const stores = [
    { id: "1", name: "London Bridge" },
    { id: "2", name: "Canary Wharf" },
    { id: "3", name: "King's Cross" },
  ];

  const suppliers = [
    { id: "1", name: "Fresh Farms Ltd", categories: ["Vegetables"], leadTime: 2 },
    { id: "2", name: "Premium Proteins Co", categories: ["Protein"], leadTime: 3 },
    { id: "3", name: "Dairy Direct", categories: ["Dairy"], leadTime: 1 },
    { id: "4", name: "Mediterranean Foods Import", categories: ["Vegetables", "Condiments"], leadTime: 5 },
    { id: "5", name: "Artisan Bakery Supply", categories: ["Bakery"], leadTime: 1 },
    { id: "6", name: "Gourmet Condiments Ltd", categories: ["Condiments"], leadTime: 4 },
  ];

  const [deliverySchedules] = useState<DeliverySchedule[]>([
    // Fresh Farms Ltd
    { supplierId: "1", supplierName: "Fresh Farms Ltd", storeId: "1", storeName: "London Bridge", deliveryDays: ["Monday", "Thursday"], ingredientCategories: ["Vegetables"], leadTimeDays: 2 },
    { supplierId: "1", supplierName: "Fresh Farms Ltd", storeId: "2", storeName: "Canary Wharf", deliveryDays: ["Tuesday", "Friday"], ingredientCategories: ["Vegetables"], leadTimeDays: 2 },
    { supplierId: "1", supplierName: "Fresh Farms Ltd", storeId: "3", storeName: "King's Cross", deliveryDays: ["Monday", "Wednesday"], ingredientCategories: ["Vegetables"], leadTimeDays: 2 },
    
    // Premium Proteins Co
    { supplierId: "2", supplierName: "Premium Proteins Co", storeId: "1", storeName: "London Bridge", deliveryDays: ["Tuesday", "Friday"], ingredientCategories: ["Protein"], leadTimeDays: 3 },
    { supplierId: "2", supplierName: "Premium Proteins Co", storeId: "2", storeName: "Canary Wharf", deliveryDays: ["Wednesday", "Saturday"], ingredientCategories: ["Protein"], leadTimeDays: 3 },
    { supplierId: "2", supplierName: "Premium Proteins Co", storeId: "3", storeName: "King's Cross", deliveryDays: ["Tuesday", "Thursday"], ingredientCategories: ["Protein"], leadTimeDays: 3 },
    
    // Dairy Direct
    { supplierId: "3", supplierName: "Dairy Direct", storeId: "1", storeName: "London Bridge", deliveryDays: ["Monday", "Wednesday", "Friday"], ingredientCategories: ["Dairy"], leadTimeDays: 1 },
    { supplierId: "3", supplierName: "Dairy Direct", storeId: "2", storeName: "Canary Wharf", deliveryDays: ["Tuesday", "Thursday", "Saturday"], ingredientCategories: ["Dairy"], leadTimeDays: 1 },
    { supplierId: "3", supplierName: "Dairy Direct", storeId: "3", storeName: "King's Cross", deliveryDays: ["Monday", "Wednesday", "Friday"], ingredientCategories: ["Dairy"], leadTimeDays: 1 },
    
    // Mediterranean Foods Import
    { supplierId: "4", supplierName: "Mediterranean Foods Import", storeId: "1", storeName: "London Bridge", deliveryDays: ["Wednesday"], ingredientCategories: ["Vegetables", "Condiments"], leadTimeDays: 5 },
    { supplierId: "4", supplierName: "Mediterranean Foods Import", storeId: "2", storeName: "Canary Wharf", deliveryDays: ["Thursday"], ingredientCategories: ["Vegetables", "Condiments"], leadTimeDays: 5 },
    { supplierId: "4", supplierName: "Mediterranean Foods Import", storeId: "3", storeName: "King's Cross", deliveryDays: ["Friday"], ingredientCategories: ["Vegetables", "Condiments"], leadTimeDays: 5 },
    
    // Artisan Bakery Supply
    { supplierId: "5", supplierName: "Artisan Bakery Supply", storeId: "1", storeName: "London Bridge", deliveryDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], ingredientCategories: ["Bakery"], leadTimeDays: 1 },
    { supplierId: "5", supplierName: "Artisan Bakery Supply", storeId: "2", storeName: "Canary Wharf", deliveryDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], ingredientCategories: ["Bakery"], leadTimeDays: 1 },
    { supplierId: "5", supplierName: "Artisan Bakery Supply", storeId: "3", storeName: "King's Cross", deliveryDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], ingredientCategories: ["Bakery"], leadTimeDays: 1 },
    
    // Gourmet Condiments Ltd
    { supplierId: "6", supplierName: "Gourmet Condiments Ltd", storeId: "1", storeName: "London Bridge", deliveryDays: ["Monday"], ingredientCategories: ["Condiments"], leadTimeDays: 4 },
    { supplierId: "6", supplierName: "Gourmet Condiments Ltd", storeId: "2", storeName: "Canary Wharf", deliveryDays: ["Tuesday"], ingredientCategories: ["Condiments"], leadTimeDays: 4 },
    { supplierId: "6", supplierName: "Gourmet Condiments Ltd", storeId: "3", storeName: "King's Cross", deliveryDays: ["Wednesday"], ingredientCategories: ["Condiments"], leadTimeDays: 4 },
  ]);

  const [selectedView, setSelectedView] = useState<"by-store" | "by-supplier">("by-store");

  const getSchedulesForStore = (storeId: string) => {
    return deliverySchedules.filter(schedule => schedule.storeId === storeId);
  };

  const getSchedulesForSupplier = (supplierId: string) => {
    return deliverySchedules.filter(schedule => schedule.supplierId === supplierId);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Vegetables": "bg-green-500/10 text-green-700 border-green-500/20",
      "Protein": "bg-red-500/10 text-red-700 border-red-500/20",
      "Dairy": "bg-blue-500/10 text-blue-700 border-blue-500/20",
      "Bakery": "bg-amber-500/10 text-amber-700 border-amber-500/20",
      "Condiments": "bg-purple-500/10 text-purple-700 border-purple-500/20",
    };
    return colors[category] || "bg-gray-500/10 text-gray-700 border-gray-500/20";
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Logistics</h1>
            <p className="text-muted-foreground">
              Manage delivery schedules and supplier routes
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground shadow-brand hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Delivery Schedule
          </Button>
        </div>

        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as "by-store" | "by-supplier")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="by-store">By Store</TabsTrigger>
            <TabsTrigger value="by-supplier">By Supplier</TabsTrigger>
          </TabsList>

          <TabsContent value="by-store" className="space-y-4 mt-6">
            {stores.map((store) => {
              const schedules = getSchedulesForStore(store.id);
              return (
                <Card key={store.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <CardTitle>{store.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {schedules.length} supplier{schedules.length !== 1 ? "s" : ""} delivering to this location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {schedules.map((schedule, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-semibold">{schedule.supplierName}</h4>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Lead time: {schedule.leadTimeDays} days</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium mb-2">Delivery Days:</p>
                              <div className="flex flex-wrap gap-2">
                                {schedule.deliveryDays.map((day) => (
                                  <Badge key={day} variant="outline">
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-2">Ingredient Categories:</p>
                              <div className="flex flex-wrap gap-2">
                                {schedule.ingredientCategories.map((category) => (
                                  <Badge 
                                    key={category} 
                                    className={getCategoryColor(category)}
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="by-supplier" className="space-y-4 mt-6">
            {suppliers.map((supplier) => {
              const schedules = getSchedulesForSupplier(supplier.id);
              return (
                <Card key={supplier.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <CardTitle>{supplier.name}</CardTitle>
                    </div>
                    <CardDescription>
                      Delivering to {schedules.length} location{schedules.length !== 1 ? "s" : ""} • Lead time: {supplier.leadTime} days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Supplies:</p>
                      <div className="flex flex-wrap gap-2">
                        {supplier.categories.map((category) => (
                          <Badge 
                            key={category} 
                            className={getCategoryColor(category)}
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {schedules.map((schedule, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-semibold">{schedule.storeName}</h4>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium mb-2">Delivery Days:</p>
                                <div className="flex flex-wrap gap-2">
                                  {schedule.deliveryDays.map((day) => (
                                    <Badge key={day} variant="outline">
                                      {day}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyLogistics;
