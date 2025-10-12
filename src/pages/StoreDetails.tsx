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
    address: "2 London Bridge Street, London",
    postcode: "SE1 9RT",
    phone: "020 7403 8456",
    manager: "Sarah Williams",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2400,
    weeklyAverage: 2180,
    bankDetails: {
      accountName: "Moto Hospitality - London Bridge",
      sortCode: "20-00-00",
      accountNumber: "12345678",
      bankName: "Barclays Bank PLC",
    }
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
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Store Name</span>
                <span className="text-sm font-semibold">{storeDetails.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Store ID</span>
                <span className="text-sm font-semibold">{storeDetails.storeId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Cluster</span>
                <Badge variant="secondary">{storeDetails.cluster}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge className="bg-success text-white">{storeDetails.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{storeDetails.address}</p>
                  <p className="text-sm text-muted-foreground">{storeDetails.postcode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{storeDetails.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Store Manager</p>
                  <p className="text-sm text-muted-foreground">{storeDetails.manager}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Opening Hours</span>
                <span className="text-sm font-semibold">{storeDetails.openingHours}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Performance Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Daily Target</span>
                <span className="text-sm font-semibold">£{storeDetails.dailyTarget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Weekly Average</span>
                <span className="text-sm font-semibold">£{storeDetails.weeklyAverage.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Account Name</span>
                  <span className="text-sm font-semibold">{storeDetails.bankDetails.accountName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Bank Name</span>
                  <span className="text-sm font-semibold">{storeDetails.bankDetails.bankName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Sort Code</span>
                  <span className="text-sm font-semibold font-mono">{storeDetails.bankDetails.sortCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Account Number</span>
                  <span className="text-sm font-semibold font-mono">{storeDetails.bankDetails.accountNumber}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
