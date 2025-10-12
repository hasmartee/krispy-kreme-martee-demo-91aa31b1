import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, MapPin, Plus, Edit, Phone, Clock, Truck, Calendar, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useView } from "@/contexts/ViewContext";

interface Store {
  id?: string;
  storeId: string;
  name: string;
  postcode: string;
  address: string;
  phone: string;
  manager: string;
  status: string;
  openingHours: string;
  dailyTarget: number;
  weeklyAverage: number;
  cluster?: string;
}

interface DeliverySchedule {
  id?: string;
  store_id?: string;
  day_of_week: string;
  delivery_time: string;
  supplier: string;
  delivery_type: string;
  notes?: string;
  is_active: boolean;
}

// Mock store data inspired by Pret a Manger locations
const initialMockStores: Store[] = [
  {
    storeId: "ST001",
    name: "London Bridge",
    postcode: "SE1 9RT",
    address: "2 London Bridge Street, London",
    phone: "020 7403 8456",
    manager: "Sarah Williams",
    status: "active",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2400,
    weeklyAverage: 2180,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST002", 
    name: "Canary Wharf",
    postcode: "E14 5AB",
    address: "1 Canada Square, Canary Wharf",
    phone: "020 7715 9876",
    manager: "James Chen",
    status: "active",
    openingHours: "06:00 - 20:00",
    dailyTarget: 3200,
    weeklyAverage: 2950,
    cluster: "Business District",
  },
  {
    storeId: "ST003",
    name: "King's Cross",
    postcode: "N1C 4AG",
    address: "King's Cross Station, London",
    phone: "020 7278 3456",
    manager: "Emma Thompson",
    status: "active",
    openingHours: "05:30 - 22:00",
    dailyTarget: 4100,
    weeklyAverage: 3890,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST004",
    name: "Oxford Circus",
    postcode: "W1B 5TL",
    address: "315 Oxford Street, London",
    phone: "020 7637 1234",
    manager: "Michael Brown",
    status: "maintenance",
    openingHours: "07:00 - 21:00",
    dailyTarget: 3800,
    weeklyAverage: 3650,
    cluster: "High Street",
  },
  {
    storeId: "ST005",
    name: "Covent Garden",
    postcode: "WC2E 8RF",
    address: "27 King Street, Covent Garden",
    phone: "020 7240 5678",
    manager: "Lisa Garcia",
    status: "active",
    openingHours: "07:00 - 20:00",
    dailyTarget: 2800,
    weeklyAverage: 2650,
    cluster: "Flagship",
  },
  {
    storeId: "ST006",
    name: "Victoria Station",
    postcode: "SW1E 5ND",
    address: "Victoria Railway Station, London",
    phone: "020 7834 9012",
    manager: "David Wilson",
    status: "active",
    openingHours: "05:45 - 21:30",
    dailyTarget: 3600,
    weeklyAverage: 3420,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST007",
    name: "Shoreditch",
    postcode: "E1 6QL",
    address: "87 Curtain Road, Shoreditch",
    phone: "020 7739 4567",
    manager: "Rachel Kumar",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 2200,
    weeklyAverage: 2080,
    cluster: "High Street",
  },
  {
    storeId: "ST008",
    name: "Greenwich",
    postcode: "SE10 9GB",
    address: "5 Greenwich Church Street",
    phone: "020 8858 2345",
    manager: "Tom Anderson",
    status: "closed",
    openingHours: "07:30 - 18:00",
    dailyTarget: 1800,
    weeklyAverage: 1650,
    cluster: "High Street",
  },
  {
    storeId: "ST009",
    name: "Waterloo Station",
    postcode: "SE1 8SW",
    address: "Waterloo Station, London",
    phone: "020 7928 4567",
    manager: "Sophie Anderson",
    status: "active",
    openingHours: "05:45 - 21:00",
    dailyTarget: 3900,
    weeklyAverage: 3720,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST010",
    name: "Camden Town",
    postcode: "NW1 8AB",
    address: "142 Camden High Street",
    phone: "020 7485 3456",
    manager: "Oliver Martinez",
    status: "active",
    openingHours: "07:30 - 20:00",
    dailyTarget: 2600,
    weeklyAverage: 2450,
    cluster: "High Street",
  },
  {
    storeId: "ST011",
    name: "Liverpool Street",
    postcode: "EC2M 7PY",
    address: "Liverpool Street Station",
    phone: "020 7247 8901",
    manager: "Hannah Davies",
    status: "active",
    openingHours: "06:00 - 20:30",
    dailyTarget: 3700,
    weeklyAverage: 3550,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST012",
    name: "Notting Hill",
    postcode: "W11 2DQ",
    address: "87 Portobello Road",
    phone: "020 7792 5678",
    manager: "William Taylor",
    status: "active",
    openingHours: "07:00 - 19:30",
    dailyTarget: 2300,
    weeklyAverage: 2150,
    cluster: "High Street",
  },
  {
    storeId: "ST013",
    name: "St Pancras",
    postcode: "N1C 4QL",
    address: "St Pancras International Station",
    phone: "020 7843 9012",
    manager: "Emily White",
    status: "active",
    openingHours: "05:30 - 22:30",
    dailyTarget: 4300,
    weeklyAverage: 4050,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST014",
    name: "Hammersmith",
    postcode: "W6 9DU",
    address: "45 King Street, Hammersmith",
    phone: "020 8748 2345",
    manager: "George Harris",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 2100,
    weeklyAverage: 1980,
    cluster: "High Street",
  },
  {
    storeId: "ST015",
    name: "Bond Street",
    postcode: "W1S 2YF",
    address: "28 Bond Street, Mayfair",
    phone: "020 7629 3456",
    manager: "Charlotte Moore",
    status: "active",
    openingHours: "07:00 - 20:00",
    dailyTarget: 3400,
    weeklyAverage: 3250,
    cluster: "Flagship",
  },
  {
    storeId: "ST016",
    name: "Euston Station",
    postcode: "NW1 2RT",
    address: "Euston Station, London",
    phone: "020 7388 7890",
    manager: "Jack Robinson",
    status: "active",
    openingHours: "05:45 - 21:00",
    dailyTarget: 3500,
    weeklyAverage: 3320,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST017",
    name: "Clapham Junction",
    postcode: "SW11 1TT",
    address: "Clapham Junction Station",
    phone: "020 7228 4567",
    manager: "Amelia Clark",
    status: "active",
    openingHours: "06:30 - 19:30",
    dailyTarget: 2700,
    weeklyAverage: 2520,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST018",
    name: "Wimbledon",
    postcode: "SW19 1BX",
    address: "The Broadway, Wimbledon",
    phone: "020 8542 6789",
    manager: "Thomas Lee",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 2200,
    weeklyAverage: 2050,
    cluster: "High Street",
  },
  {
    storeId: "ST019",
    name: "Richmond",
    postcode: "TW9 1ND",
    address: "12 George Street, Richmond",
    phone: "020 8940 3456",
    manager: "Isabella Wright",
    status: "active",
    openingHours: "07:30 - 19:00",
    dailyTarget: 2400,
    weeklyAverage: 2280,
    cluster: "High Street",
  },
  {
    storeId: "ST020",
    name: "Angel Islington",
    postcode: "N1 9LH",
    address: "156 Upper Street, Islington",
    phone: "020 7226 8901",
    manager: "Daniel Scott",
    status: "active",
    openingHours: "07:00 - 19:30",
    dailyTarget: 2500,
    weeklyAverage: 2350,
    cluster: "High Street",
  },
  {
    storeId: "ST021",
    name: "Stratford",
    postcode: "E15 1AZ",
    address: "Westfield Stratford City",
    phone: "020 8221 4567",
    manager: "Grace Phillips",
    status: "active",
    openingHours: "08:00 - 21:00",
    dailyTarget: 3300,
    weeklyAverage: 3150,
    cluster: "Business District",
  },
  {
    storeId: "ST022",
    name: "Paddington",
    postcode: "W2 1HB",
    address: "Paddington Station, London",
    phone: "020 7402 5678",
    manager: "Samuel Turner",
    status: "active",
    openingHours: "06:00 - 20:30",
    dailyTarget: 3400,
    weeklyAverage: 3210,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST023",
    name: "Brixton",
    postcode: "SW9 8JQ",
    address: "32 Brixton Station Road",
    phone: "020 7274 6789",
    manager: "Mia Parker",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 2100,
    weeklyAverage: 1950,
    cluster: "High Street",
  },
  {
    storeId: "ST024",
    name: "Holborn",
    postcode: "WC1V 6AZ",
    address: "87 High Holborn",
    phone: "020 7430 7890",
    manager: "Benjamin Hughes",
    status: "active",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2900,
    weeklyAverage: 2750,
    cluster: "Business District",
  },
  {
    storeId: "ST025",
    name: "Leicester Square",
    postcode: "WC2H 7NA",
    address: "Leicester Square, London",
    phone: "020 7494 8901",
    manager: "Lily Bennett",
    status: "active",
    openingHours: "07:00 - 22:00",
    dailyTarget: 3600,
    weeklyAverage: 3450,
    cluster: "Flagship",
  },
  {
    storeId: "ST026",
    name: "Charing Cross",
    postcode: "WC2N 5HS",
    address: "Charing Cross Station",
    phone: "020 7839 4567",
    manager: "Noah Green",
    status: "active",
    openingHours: "06:00 - 20:00",
    dailyTarget: 3300,
    weeklyAverage: 3150,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST027",
    name: "Marylebone",
    postcode: "NW1 5LA",
    address: "Marylebone Station, London",
    phone: "020 7486 5678",
    manager: "Ava Mitchell",
    status: "active",
    openingHours: "06:30 - 19:30",
    dailyTarget: 2600,
    weeklyAverage: 2450,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST028",
    name: "Soho",
    postcode: "W1D 6BJ",
    address: "45 Old Compton Street",
    phone: "020 7437 6789",
    manager: "Lucas Cooper",
    status: "maintenance",
    openingHours: "07:30 - 20:00",
    dailyTarget: 2800,
    weeklyAverage: 2650,
    cluster: "High Street",
  },
  {
    storeId: "ST029",
    name: "Kensington",
    postcode: "W8 5SE",
    address: "123 Kensington High Street",
    phone: "020 7937 7890",
    manager: "Ella Peterson",
    status: "active",
    openingHours: "07:00 - 19:30",
    dailyTarget: 2700,
    weeklyAverage: 2550,
    cluster: "High Street",
  },
  {
    storeId: "ST030",
    name: "Tower Hill",
    postcode: "EC3N 4AB",
    address: "Tower Hill, London",
    phone: "020 7481 8901",
    manager: "Mason Reed",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 2500,
    weeklyAverage: 2350,
    cluster: "Business District",
  },
  {
    storeId: "ST031",
    name: "Farringdon",
    postcode: "EC1M 6EH",
    address: "Farringdon Station, London",
    phone: "020 7251 4567",
    manager: "Harper Bailey",
    status: "active",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2800,
    weeklyAverage: 2650,
    cluster: "Business District",
  },
  {
    storeId: "ST032",
    name: "Southwark",
    postcode: "SE1 0SW",
    address: "32 Borough High Street",
    phone: "020 7403 5678",
    manager: "Logan Morgan",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 2300,
    weeklyAverage: 2150,
    cluster: "Business District",
  },
  {
    storeId: "ST033",
    name: "Putney",
    postcode: "SW15 1SL",
    address: "67 Putney High Street",
    phone: "020 8780 6789",
    manager: "Aria Collins",
    status: "active",
    openingHours: "07:30 - 19:00",
    dailyTarget: 2100,
    weeklyAverage: 1980,
    cluster: "High Street",
  },
  {
    storeId: "ST034",
    name: "Fulham Broadway",
    postcode: "SW6 1BW",
    address: "Fulham Broadway, London",
    phone: "020 7385 7890",
    manager: "Carter Stewart",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 2200,
    weeklyAverage: 2050,
    cluster: "High Street",
  },
  {
    storeId: "ST035",
    name: "Moorgate",
    postcode: "EC2M 6TX",
    address: "Moorgate Station, London",
    phone: "020 7628 8901",
    manager: "Scarlett Foster",
    status: "active",
    openingHours: "06:00 - 19:00",
    dailyTarget: 3100,
    weeklyAverage: 2950,
    cluster: "Business District",
  },
  {
    storeId: "ST036",
    name: "Bank",
    postcode: "EC3V 3LR",
    address: "Bank Station, London",
    phone: "020 7623 4567",
    manager: "Wyatt Powell",
    status: "active",
    openingHours: "06:00 - 19:00",
    dailyTarget: 3200,
    weeklyAverage: 3050,
    cluster: "Business District",
  },
  {
    storeId: "ST037",
    name: "Blackfriars",
    postcode: "EC4V 4DY",
    address: "Blackfriars Station, London",
    phone: "020 7236 5678",
    manager: "Luna Edwards",
    status: "active",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2700,
    weeklyAverage: 2550,
    cluster: "Business District",
  },
  {
    storeId: "ST038",
    name: "Highbury",
    postcode: "N5 1RD",
    address: "89 Highbury Park",
    phone: "020 7226 6789",
    manager: "Leo Russell",
    status: "active",
    openingHours: "07:30 - 19:00",
    dailyTarget: 1900,
    weeklyAverage: 1750,
    cluster: "High Street",
  },
  {
    storeId: "ST039",
    name: "Chelsea",
    postcode: "SW3 4SL",
    address: "156 King's Road, Chelsea",
    phone: "020 7351 7890",
    manager: "Aurora Griffin",
    status: "active",
    openingHours: "07:00 - 19:30",
    dailyTarget: 2600,
    weeklyAverage: 2450,
    cluster: "High Street",
  },
  {
    storeId: "ST040",
    name: "Vauxhall",
    postcode: "SE11 5HL",
    address: "Vauxhall Station, London",
    phone: "020 7735 8901",
    manager: "Grayson Hayes",
    status: "active",
    openingHours: "06:30 - 19:30",
    dailyTarget: 2400,
    weeklyAverage: 2250,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST041",
    name: "Monument",
    postcode: "EC3R 6DN",
    address: "Monument Station, London",
    phone: "020 7626 4567",
    manager: "Penelope Wood",
    status: "active",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2900,
    weeklyAverage: 2750,
    cluster: "Business District",
  },
  {
    storeId: "ST042",
    name: "Bethnal Green",
    postcode: "E2 6GH",
    address: "278 Cambridge Heath Road",
    phone: "020 7739 5678",
    manager: "Eli Brooks",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 1800,
    weeklyAverage: 1650,
    cluster: "High Street",
  },
  {
    storeId: "ST043",
    name: "St Paul's",
    postcode: "EC4M 8AD",
    address: "St Paul's Churchyard",
    phone: "020 7248 6789",
    manager: "Violet Murphy",
    status: "active",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2800,
    weeklyAverage: 2650,
    cluster: "Business District",
  },
  {
    storeId: "ST044",
    name: "Finsbury Park",
    postcode: "N4 2DH",
    address: "Finsbury Park Station",
    phone: "020 7263 7890",
    manager: "Hudson Ross",
    status: "active",
    openingHours: "06:30 - 19:30",
    dailyTarget: 2300,
    weeklyAverage: 2150,
    cluster: "Transport Hub",
  },
  {
    storeId: "ST045",
    name: "Canary Wharf Jubilee",
    postcode: "E14 5NY",
    address: "Jubilee Place, Canary Wharf",
    phone: "020 7418 8901",
    manager: "Hazel Coleman",
    status: "active",
    openingHours: "06:00 - 20:00",
    dailyTarget: 3100,
    weeklyAverage: 2950,
    cluster: "Business District",
  },
  {
    storeId: "ST046",
    name: "Aldgate",
    postcode: "EC3N 1AH",
    address: "Aldgate Station, London",
    phone: "020 7481 4567",
    manager: "Lincoln Rivera",
    status: "active",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2500,
    weeklyAverage: 2350,
    cluster: "Business District",
  },
  {
    storeId: "ST047",
    name: "Embankment",
    postcode: "WC2N 6NS",
    address: "Embankment Place, London",
    phone: "020 7930 5678",
    manager: "Nova Sanders",
    status: "active",
    openingHours: "06:30 - 19:30",
    dailyTarget: 2600,
    weeklyAverage: 2450,
    cluster: "Business District",
  },
  {
    storeId: "ST048",
    name: "Islington",
    postcode: "N1 2XE",
    address: "234 Upper Street, Islington",
    phone: "020 7354 6789",
    manager: "Jasper Price",
    status: "active",
    openingHours: "07:00 - 19:00",
    dailyTarget: 2200,
    weeklyAverage: 2050,
    cluster: "High Street",
  },
  {
    storeId: "ST049",
    name: "Old Street",
    postcode: "EC1V 9NR",
    address: "Old Street Station, London",
    phone: "020 7253 7890",
    manager: "Ivy Watson",
    status: "active",
    openingHours: "06:30 - 19:00",
    dailyTarget: 2700,
    weeklyAverage: 2550,
    cluster: "Business District",
  },
  {
    storeId: "ST050",
    name: "Tottenham Court Road",
    postcode: "W1T 1BH",
    address: "Tottenham Court Road Station",
    phone: "020 7580 8901",
    manager: "Theo Barnes",
    status: "active",
    openingHours: "07:00 - 20:00",
    dailyTarget: 3400,
    weeklyAverage: 3250,
    cluster: "High Street",
  }
];

export default function StoreManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [stores, setStores] = useState<Store[]>([]);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [deliverySchedules, setDeliverySchedules] = useState<DeliverySchedule[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DeliverySchedule | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { viewMode, selectedStore: contextSelectedStore } = useView();

  // Load stores from database
  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error loading stores",
        description: error.message,
        variant: "destructive"
      });
      // Fall back to mock data if database is empty
      setStores(initialMockStores);
    } else if (data && data.length > 0) {
      setStores(data.map(s => ({
        id: s.id,
        storeId: s.store_id,
        name: s.name,
        postcode: s.postcode,
        address: s.address,
        phone: s.phone,
        manager: s.manager,
        status: s.status,
        openingHours: s.opening_hours,
        dailyTarget: Number(s.daily_target),
        weeklyAverage: Number(s.weekly_average),
        cluster: s.cluster || undefined
      })));
    } else {
      // Initialize database with mock data
      await initializeStores();
    }
  };

  const initializeStores = async () => {
    const storesToInsert = initialMockStores.map(s => ({
      store_id: s.storeId,
      name: s.name,
      postcode: s.postcode,
      address: s.address,
      phone: s.phone,
      manager: s.manager,
      status: s.status,
      opening_hours: s.openingHours,
      daily_target: s.dailyTarget,
      weekly_average: s.weeklyAverage,
      cluster: s.cluster
    }));

    const { error } = await supabase
      .from('stores')
      .insert(storesToInsert);

    if (error) {
      console.error("Error initializing stores:", error);
      setStores(initialMockStores);
    } else {
      loadStores();
    }
  };

  const loadDeliverySchedules = async (storeId: string) => {
    console.log('📦 Loading delivery schedules for store:', storeId);
    
    const { data, error } = await supabase
      .from('delivery_schedules')
      .select('*')
      .eq('store_id', storeId)
      .order('day_of_week');

    if (error) {
      console.error('❌ Error loading delivery schedules:', error);
      toast({
        title: "Error loading delivery schedules",
        description: error.message,
        variant: "destructive"
      });
    } else {
      console.log('✅ Loaded delivery schedules:', data);
      setDeliverySchedules(data || []);
    }
  };

  const handleViewSchedules = (store: Store) => {
    console.log('👁️ Viewing delivery schedules for store:', store.name, '(ID:', store.id, ')');
    setSelectedStore(store);
    if (store.id) {
      loadDeliverySchedules(store.id);
    }
  };

  const handleAddSchedule = () => {
    console.log('➕ Adding new delivery schedule for store:', selectedStore?.name);
    setEditingSchedule({
      day_of_week: 'Monday',
      delivery_time: '08:00',
      supplier: '',
      delivery_type: 'Regular',
      is_active: true
    });
    setIsScheduleDialogOpen(true);
  };

  const handleEditSchedule = (schedule: DeliverySchedule) => {
    console.log('✏️ Editing delivery schedule:', schedule);
    setEditingSchedule({ ...schedule });
    setIsScheduleDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!editingSchedule || !selectedStore?.id) {
      console.warn('⚠️ Cannot save: Missing schedule data or store ID');
      return;
    }

    const scheduleData = {
      store_id: selectedStore.id,
      day_of_week: editingSchedule.day_of_week,
      delivery_time: editingSchedule.delivery_time,
      supplier: editingSchedule.supplier,
      delivery_type: editingSchedule.delivery_type,
      notes: editingSchedule.notes,
      is_active: editingSchedule.is_active
    };

    console.log('💾 Saving delivery schedule:', {
      action: editingSchedule.id ? 'UPDATE' : 'CREATE',
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      scheduleData
    });

    if (editingSchedule.id) {
      // Update existing schedule
      const { error } = await supabase
        .from('delivery_schedules')
        .update(scheduleData)
        .eq('id', editingSchedule.id);

      if (error) {
        console.error('❌ Error updating schedule:', error);
        toast({
          title: "Error updating schedule",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      console.log('✅ Schedule updated successfully');
    } else {
      // Insert new schedule
      const { error } = await supabase
        .from('delivery_schedules')
        .insert([scheduleData]);

      if (error) {
        console.error('❌ Error adding schedule:', error);
        toast({
          title: "Error adding schedule",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      console.log('✅ Schedule created successfully');
    }

    toast({
      title: "Success",
      description: "Delivery schedule saved successfully"
    });

    setIsScheduleDialogOpen(false);
    setEditingSchedule(null);
    if (selectedStore.id) {
      loadDeliverySchedules(selectedStore.id);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    console.log('🗑️ Deleting delivery schedule:', scheduleId);
    
    const { error } = await supabase
      .from('delivery_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      console.error('❌ Error deleting schedule:', error);
      toast({
        title: "Error deleting schedule",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Schedule deleted successfully');
    toast({
      title: "Success",
      description: "Delivery schedule deleted successfully"
    });

    if (selectedStore?.id) {
      loadDeliverySchedules(selectedStore.id);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.storeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.postcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesViewMode = viewMode === "hq" || store.name === contextSelectedStore;
    
    return matchesSearch && matchesViewMode;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-white">Active</Badge>;
      case "maintenance":
        return <Badge className="bg-warning text-white">Maintenance</Badge>;
      case "closed":
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPerformanceIndicator = (average: number, target: number) => {
    const percentage = (average / target) * 100;
    if (percentage >= 95) return { color: "text-success", label: "Excellent" };
    if (percentage >= 85) return { color: "text-primary", label: "Good" };
    if (percentage >= 75) return { color: "text-warning", label: "Average" };
    return { color: "text-destructive", label: "Below Target" };
  };

  const handleEditClick = (store: Store) => {
    setEditingStore({ ...store });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStore) return;

    const storeData = {
      store_id: editingStore.storeId,
      name: editingStore.name,
      postcode: editingStore.postcode,
      address: editingStore.address,
      phone: editingStore.phone,
      manager: editingStore.manager,
      status: editingStore.status,
      opening_hours: editingStore.openingHours,
      daily_target: editingStore.dailyTarget,
      weekly_average: editingStore.weeklyAverage,
      cluster: editingStore.cluster
    };

    if (editingStore.id) {
      // Update existing store
      const { error } = await supabase
        .from('stores')
        .update(storeData)
        .eq('id', editingStore.id);

      if (error) {
        toast({
          title: "Error updating store",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    }

    toast({
      title: "Success",
      description: "Store updated successfully"
    });

    setIsEditDialogOpen(false);
    setEditingStore(null);
    loadStores();
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Invalid file",
            description: "CSV file must contain header and at least one store",
            variant: "destructive"
          });
          return;
        }

        const newStores = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          
          return {
            store_id: values[0] || `ST${String(stores.length + index + 1).padStart(3, '0')}`,
            name: values[1] || 'Unnamed Store',
            postcode: values[2] || '',
            address: values[3] || '',
            phone: values[4] || '',
            manager: values[5] || '',
            status: values[6] || 'active',
            opening_hours: values[7] || '07:00 - 19:00',
            daily_target: parseFloat(values[8]) || 2000,
            weekly_average: parseFloat(values[9]) || 1800,
            cluster: values[10] || null
          };
        });

        const { error } = await supabase
          .from('stores')
          .insert(newStores);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: `${newStores.length} stores uploaded successfully`
        });
        setIsBulkUploadOpen(false);
        loadStores();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = 'Store ID,Name,Postcode,Address,Phone,Manager,Status,Opening Hours,Daily Target,Weekly Average,Cluster\nST999,Sample Store,SW1A 1AA,123 Sample Street,020 1234 5678,John Doe,active,07:00 - 19:00,2500,2300,High Street';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {viewMode === "store_manager" ? `My Store - ${contextSelectedStore}` : "My Stores"}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === "store_manager" 
              ? `Manage store details and delivery schedules for ${contextSelectedStore}`
              : "Manage store locations, details, and performance metrics"
            }
          </p>
        </div>
        {viewMode === "hq" && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsBulkUploadOpen(true)}
              className="shadow-brand"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button className="bg-primary text-primary-foreground shadow-brand hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {viewMode === "store_manager" ? "Store Status" : "Total Stores"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {viewMode === "store_manager" && filteredStores.length > 0 
                ? filteredStores[0].status === 'active' ? 'Active' : filteredStores[0].status
                : filteredStores.length
              }
            </div>
          </CardContent>
        </Card>
        
        {viewMode === "hq" && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Stores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {filteredStores.filter(store => store.status === 'active').length}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search and Brand Filter */}
      {viewMode === "hq" ? (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Brand Filter - Higher Level */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">My Brand:</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
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

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stores by name, ID, or postcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores by name, ID, or postcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stores Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Store Directory</CardTitle>
          <CardDescription>
            Complete list of store locations with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opening Hours</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => {
                const performance = getPerformanceIndicator(store.weeklyAverage, store.dailyTarget);
                return (
                  <TableRow key={store.storeId}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{store.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{store.storeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-sm">{store.postcode}</span>
                        </div>
                        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {store.address}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{store.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{store.manager}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{store.cluster}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(store.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-mono">{store.openingHours}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${performance.color}`}>
                          {performance.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          £{store.weeklyAverage.toLocaleString()} / £{store.dailyTarget.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(store)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewSchedules(store)}>
                          <Truck className="h-3 w-3 mr-1" />
                          Deliveries
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredStores.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No stores found</h3>
              <p>Try adjusting your search terms</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Schedules Dialog */}
      <Dialog open={!!selectedStore && !isScheduleDialogOpen} onOpenChange={(open) => !open && setSelectedStore(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Schedules - {selectedStore?.name}</DialogTitle>
            <DialogDescription>
              Manage delivery schedules for this store
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Weekly Schedule</h3>
              <Button onClick={handleAddSchedule} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </div>

            {deliverySchedules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">No delivery schedules configured</p>
                  <Button onClick={handleAddSchedule} variant="outline" className="mt-4">
                    Add First Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliverySchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {schedule.day_of_week}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{schedule.delivery_time}</span>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.supplier}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{schedule.delivery_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{schedule.notes || '-'}</TableCell>
                      <TableCell>
                        {schedule.is_active ? (
                          <Badge className="bg-success text-white">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditSchedule(schedule)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => schedule.id && handleDeleteSchedule(schedule.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchedule?.id ? 'Edit' : 'Add'} Delivery Schedule</DialogTitle>
            <DialogDescription>
              Configure delivery schedule for {selectedStore?.name}
            </DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week</Label>
                <Select
                  value={editingSchedule.day_of_week}
                  onValueChange={(value) => setEditingSchedule({ ...editingSchedule, day_of_week: value })}
                >
                  <SelectTrigger id="day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Delivery Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={editingSchedule.delivery_time}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, delivery_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={editingSchedule.supplier}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, supplier: e.target.value })}
                  placeholder="e.g., Fresh Foods Ltd"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Delivery Type</Label>
                <Select
                  value={editingSchedule.delivery_type}
                  onValueChange={(value) => setEditingSchedule({ ...editingSchedule, delivery_type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                    <SelectItem value="Frozen">Frozen</SelectItem>
                    <SelectItem value="Dry Goods">Dry Goods</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={editingSchedule.notes || ''}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, notes: e.target.value })}
                  placeholder="Additional delivery instructions or special requirements..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editingSchedule.is_active}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="active">Active Schedule</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Store Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Store Details</DialogTitle>
            <DialogDescription>
              Update store information and assign store cluster category
            </DialogDescription>
          </DialogHeader>
          {editingStore && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={editingStore.name}
                  onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={editingStore.postcode}
                  onChange={(e) => setEditingStore({ ...editingStore, postcode: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editingStore.address}
                  onChange={(e) => setEditingStore({ ...editingStore, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editingStore.phone}
                  onChange={(e) => setEditingStore({ ...editingStore, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={editingStore.manager}
                  onChange={(e) => setEditingStore({ ...editingStore, manager: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cluster">Store Cluster</Label>
                <Select
                  value={editingStore.cluster}
                  onValueChange={(value) => setEditingStore({ ...editingStore, cluster: value })}
                >
                  <SelectTrigger id="cluster">
                    <SelectValue placeholder="Select cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flagship">Flagship</SelectItem>
                    <SelectItem value="High Street">High Street</SelectItem>
                    <SelectItem value="Transport Hub">Transport Hub</SelectItem>
                    <SelectItem value="Business District">Business District</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingStore.status}
                  onValueChange={(value) => setEditingStore({ ...editingStore, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Opening Hours</Label>
                <Input
                  id="hours"
                  value={editingStore.openingHours}
                  onChange={(e) => setEditingStore({ ...editingStore, openingHours: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Daily Target (£)</Label>
                <Input
                  id="target"
                  type="number"
                  value={editingStore.dailyTarget}
                  onChange={(e) => setEditingStore({ ...editingStore, dailyTarget: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Stores</DialogTitle>
            <DialogDescription>
              Upload a CSV file to add multiple stores at once. Download the template to see the required format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Click to select a CSV file or drag and drop
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Select CSV File
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">CSV Format:</p>
              <p className="font-mono text-xs bg-muted p-2 rounded">
                Store ID,Name,Postcode,Address,Phone,Manager,Status,Opening Hours,Daily Target,Weekly Average,Cluster
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template
            </Button>
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
