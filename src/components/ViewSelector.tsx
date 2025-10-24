import { Building2, Store, Factory } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useView } from "@/contexts/ViewContext";
import { useNavigate } from "react-router-dom";

export function ViewSelector() {
  const { viewMode, setViewMode } = useView();
  const navigate = useNavigate();

  const handleViewChange = (value: string) => {
    const newMode = value as "hq" | "store_manager" | "manufacturing";
    setViewMode(newMode);
    navigate("/");
  };

  return (
    <div className="flex items-center gap-4">
      <Tabs value={viewMode} onValueChange={handleViewChange}>
        <TabsList className="grid w-[360px] grid-cols-3">
          <TabsTrigger value="store_manager" className="gap-2">
            <Store className="h-4 w-4" />
            Store View
          </TabsTrigger>
          <TabsTrigger value="hq" className="gap-2">
            <Building2 className="h-4 w-4" />
            Demand Planner
          </TabsTrigger>
          <TabsTrigger value="manufacturing" className="gap-2">
            <Factory className="h-4 w-4" />
            Manufacturer
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
