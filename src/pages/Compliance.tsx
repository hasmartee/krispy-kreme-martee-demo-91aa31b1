import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Thermometer, Plus, CheckCircle, XCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemperatureLog {
  id: string;
  checkType: string;
  temperature: number;
  targetRange: string;
  status: "pass" | "fail";
  completedBy: string;
  completedAt: string;
  notes?: string;
}

interface StockAdjustment {
  id: string;
  itemName: string;
  itemType: "Prepared Good" | "Ingredient";
  previousStock: number;
  newStock: number;
  adjustment: number;
  adjustedBy: string;
  adjustedAt: string;
  unit: string;
}

export default function Compliance() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<TemperatureLog[]>([
    {
      id: "1",
      checkType: "Refrigerator - Unit 1",
      temperature: 3.2,
      targetRange: "<5°C",
      status: "pass",
      completedBy: "John Smith",
      completedAt: "2025-01-08 08:00",
      notes: "All units operating normally"
    },
    {
      id: "2",
      checkType: "Hot Food Display",
      temperature: 65.5,
      targetRange: ">63°C",
      status: "pass",
      completedBy: "Sarah Johnson",
      completedAt: "2025-01-08 11:00",
    },
    {
      id: "3",
      checkType: "Refrigerator - Unit 2",
      temperature: 4.1,
      targetRange: "<5°C",
      status: "pass",
      completedBy: "John Smith",
      completedAt: "2025-01-08 12:00",
    },
    {
      id: "4",
      checkType: "Hot Food Display",
      temperature: 61.2,
      targetRange: ">63°C",
      status: "fail",
      completedBy: "Mike Davis",
      completedAt: "2025-01-07 15:00",
      notes: "Temperature too low - adjusted heating element"
    },
    {
      id: "5",
      checkType: "Refrigerator - Unit 1",
      temperature: 2.8,
      targetRange: "<5°C",
      status: "pass",
      completedBy: "Emma Wilson",
      completedAt: "2025-01-07 16:00",
    },
  ]);

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([
    {
      id: "1",
      itemName: "BLT Sandwich",
      itemType: "Prepared Good",
      previousStock: 18,
      newStock: 15,
      adjustment: -3,
      adjustedBy: "John Smith",
      adjustedAt: "2025-01-08 14:30",
      unit: "unit"
    },
    {
      id: "2",
      itemName: "Chicken Breast",
      itemType: "Ingredient",
      previousStock: 5,
      newStock: 8,
      adjustment: 3,
      adjustedBy: "Sarah Johnson",
      adjustedAt: "2025-01-08 13:15",
      unit: "kg"
    },
    {
      id: "3",
      itemName: "Caesar Wrap",
      itemType: "Prepared Good",
      previousStock: 20,
      newStock: 17,
      adjustment: -3,
      adjustedBy: "Mike Davis",
      adjustedAt: "2025-01-08 12:45",
      unit: "unit"
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    checkType: "",
    temperature: "",
    targetRange: "",
    completedBy: "",
    notes: ""
  });

  const handleAddLog = () => {
    const temp = parseFloat(newLog.temperature);
    let status: "pass" | "fail" = "pass";
    
    // Simple validation logic
    if (newLog.targetRange.includes("<") && temp >= 5) {
      status = "fail";
    } else if (newLog.targetRange.includes(">") && temp <= 63) {
      status = "fail";
    }

    const log: TemperatureLog = {
      id: Date.now().toString(),
      checkType: newLog.checkType,
      temperature: temp,
      targetRange: newLog.targetRange,
      status,
      completedBy: newLog.completedBy,
      completedAt: new Date().toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", ""),
      notes: newLog.notes
    };

    setLogs([log, ...logs]);
    setIsDialogOpen(false);
    setNewLog({
      checkType: "",
      temperature: "",
      targetRange: "",
      completedBy: "",
      notes: ""
    });

    toast({
      title: "Temperature check logged",
      description: status === "pass" ? "Temperature within acceptable range" : "Temperature out of range - action required",
    });
  };

  const passCount = logs.filter(l => l.status === "pass").length;
  const failCount = logs.filter(l => l.status === "fail").length;
  const complianceRate = ((passCount / logs.length) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Temperature checks, stock adjustments, and compliance tracking
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Temperature Check
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Temperature Check</DialogTitle>
              <DialogDescription>
                Record a new temperature check for compliance tracking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Check Type</Label>
                <Input
                  placeholder="e.g., Refrigerator - Unit 1"
                  value={newLog.checkType}
                  onChange={(e) => setNewLog({ ...newLog, checkType: e.target.value })}
                />
              </div>
              <div>
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 3.5"
                  value={newLog.temperature}
                  onChange={(e) => setNewLog({ ...newLog, temperature: e.target.value })}
                />
              </div>
              <div>
                <Label>Target Range</Label>
                <Input
                  placeholder="e.g., <5°C or >63°C"
                  value={newLog.targetRange}
                  onChange={(e) => setNewLog({ ...newLog, targetRange: e.target.value })}
                />
              </div>
              <div>
                <Label>Completed By</Label>
                <Input
                  placeholder="Your name"
                  value={newLog.completedBy}
                  onChange={(e) => setNewLog({ ...newLog, completedBy: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Additional notes"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleAddLog} 
                className="w-full"
                disabled={!newLog.checkType || !newLog.temperature || !newLog.targetRange || !newLog.completedBy}
              >
                Save Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="temperature" className="space-y-6">
        <TabsList>
          <TabsTrigger value="temperature">Temperature Checks</TabsTrigger>
          <TabsTrigger value="stock">Stock Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">
              All temperature checks logged
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed Checks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passCount}</div>
            <p className="text-xs text-muted-foreground">
              Within acceptable range
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {failCount} failed checks
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Temperature Check History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Check Type</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Target Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed By</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.checkType}</TableCell>
                  <TableCell>{log.temperature}°C</TableCell>
                  <TableCell>{log.targetRange}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.status === "pass" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">Pass</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">Fail</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{log.completedBy}</TableCell>
                  <TableCell>{log.completedAt}</TableCell>
                  <TableCell className="text-muted-foreground">{log.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="stock" className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockAdjustments.length}</div>
            <p className="text-xs text-muted-foreground">
              All stock changes logged
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Increases</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockAdjustments.filter(a => a.adjustment > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items restocked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Decreases</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockAdjustments.filter(a => a.adjustment < 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Stock reductions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Previous Stock</TableHead>
                <TableHead>New Stock</TableHead>
                <TableHead>Adjustment</TableHead>
                <TableHead>Adjusted By</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockAdjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell className="font-medium">{adjustment.itemName}</TableCell>
                  <TableCell>{adjustment.itemType}</TableCell>
                  <TableCell>{adjustment.previousStock} {adjustment.unit}</TableCell>
                  <TableCell className="font-bold">{adjustment.newStock} {adjustment.unit}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${adjustment.adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adjustment.adjustment > 0 ? '+' : ''}{adjustment.adjustment} {adjustment.unit}
                    </div>
                  </TableCell>
                  <TableCell>{adjustment.adjustedBy}</TableCell>
                  <TableCell>{adjustment.adjustedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
    </div>
  );
}
