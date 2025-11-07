import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, User, Building2, Target } from "lucide-react";
import { useView } from "@/contexts/ViewContext";

export default function StoreDetails() {
  const { selectedStore } = useView();

  // Store details component
  // Mock store details data
  const storeDetails = {
    name: selectedStore,
    storeId: "ST001",
    cluster: "Transport Hub",
    status: "Active",
    address: "45 King William Street",
    postcode: "EC4N 7BW",
    phone: "020 8234 5678",
    manager: "Mark Johnson",
    openingHours: "Mon-Fri: 6:30am-8pm, Sat-Sun: Closed",
    dailyTarget: 2800,
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Store Details</h1>
        <p className="text-muted-foreground">
          View information for {selectedStore}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Store Name & Postcode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Store Name</p>
                <p className="text-base font-semibold">{storeDetails.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Postcode</p>
                <p className="text-base font-semibold">{storeDetails.postcode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">{storeDetails.address}</p>
          </CardContent>
        </Card>

        {/* Phone & Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                <p className="text-base font-semibold">{storeDetails.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Manager</p>
                <p className="text-base font-semibold">{storeDetails.manager}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Cluster & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Store Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Store Cluster</p>
                <Badge variant="secondary" className="text-base">{storeDetails.cluster}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                <Badge className="bg-success text-white text-base">{storeDetails.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Opening Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">{storeDetails.openingHours}</p>
          </CardContent>
        </Card>

        {/* Daily Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">£{storeDetails.dailyTarget.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
