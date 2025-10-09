import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useView } from "@/contexts/ViewContext";

interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  seniority: string;
  hourlyRate: number;
  availableDays: string[];
  startDate: string;
  isActive: boolean;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MyTeam() {
  const { toast } = useToast();
  const { viewMode, selectedStore } = useView();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      fullName: "John Smith",
      role: "Food Preparation",
      seniority: "Senior",
      hourlyRate: 15.50,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startDate: "2022-03-15",
      isActive: true,
    },
    {
      id: "2",
      fullName: "Sarah Johnson",
      role: "Front of House",
      seniority: "Mid-Level",
      hourlyRate: 13.00,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Saturday", "Sunday"],
      startDate: "2023-01-10",
      isActive: true,
    },
    {
      id: "3",
      fullName: "Mike Davis",
      role: "Food Preparation",
      seniority: "Junior",
      hourlyRate: 11.50,
      availableDays: ["Thursday", "Friday", "Saturday", "Sunday"],
      startDate: "2023-09-01",
      isActive: true,
    },
    {
      id: "4",
      fullName: "Emma Wilson",
      role: "Front of House",
      seniority: "Senior",
      hourlyRate: 14.50,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startDate: "2021-06-20",
      isActive: true,
    },
    {
      id: "5",
      fullName: "Tom Brown",
      role: "Kitchen Manager",
      seniority: "Senior",
      hourlyRate: 18.00,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      startDate: "2020-11-05",
      isActive: true,
    },
  ]);

  const [newMember, setNewMember] = useState({
    fullName: "",
    role: "",
    seniority: "",
    hourlyRate: "",
    availableDays: [] as string[],
    startDate: "",
  });

  const handleAddMember = () => {
    if (!newMember.fullName || !newMember.role || !newMember.seniority || !newMember.hourlyRate || !newMember.startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      fullName: newMember.fullName,
      role: newMember.role,
      seniority: newMember.seniority,
      hourlyRate: parseFloat(newMember.hourlyRate),
      availableDays: newMember.availableDays,
      startDate: newMember.startDate,
      isActive: true,
    };

    setTeamMembers([...teamMembers, member]);
    setIsDialogOpen(false);
    setNewMember({
      fullName: "",
      role: "",
      seniority: "",
      hourlyRate: "",
      availableDays: [],
      startDate: "",
    });

    toast({
      title: "Team Member Added",
      description: `${member.fullName} has been added to the team`,
    });
  };

  const toggleDay = (day: string) => {
    if (newMember.availableDays.includes(day)) {
      setNewMember({
        ...newMember,
        availableDays: newMember.availableDays.filter((d) => d !== day),
      });
    } else {
      setNewMember({
        ...newMember,
        availableDays: [...newMember.availableDays, day],
      });
    }
  };

  const getSeniorityBadge = (seniority: string) => {
    const variants = {
      Senior: "default",
      "Mid-Level": "secondary",
      Junior: "outline",
    } as const;
    return <Badge variant={variants[seniority as keyof typeof variants] || "outline"}>{seniority}</Badge>;
  };

  const filteredMembers = viewMode === "store"
    ? teamMembers.filter((m) => m.isActive)
    : teamMembers;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Team</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and their schedules
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Available Days</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{getSeniorityBadge(member.seniority)}</TableCell>
                  <TableCell>£{member.hourlyRate.toFixed(2)}/hr</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {member.availableDays.join(", ")}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(member.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your store
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  placeholder="Enter full name"
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food Preparation">Food Preparation</SelectItem>
                    <SelectItem value="Front of House">Front of House</SelectItem>
                    <SelectItem value="Kitchen Manager">Kitchen Manager</SelectItem>
                    <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Seniority *</Label>
                <Select value={newMember.seniority} onValueChange={(v) => setNewMember({ ...newMember, seniority: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seniority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hourly Rate (£) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newMember.hourlyRate}
                  onChange={(e) => setNewMember({ ...newMember, hourlyRate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={newMember.startDate}
                onChange={(e) => setNewMember({ ...newMember, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Available Days</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={newMember.availableDays.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <label htmlFor={day} className="text-sm cursor-pointer">
                      {day.substring(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
