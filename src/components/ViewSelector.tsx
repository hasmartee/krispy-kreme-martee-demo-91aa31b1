import { BarChart3, Store, Factory } from "lucide-react";
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
    <div className="flex items-center">
      <Tabs value={viewMode} onValueChange={handleViewChange}>
        <TabsList className="grid w-[420px] grid-cols-3">
          <TabsTrigger value="hq" className="flex items-center justify-center gap-2">
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span>Demand Planner</span>
          </TabsTrigger>
          <TabsTrigger value="manufacturing" className="flex items-center justify-center gap-2">
            <Factory className="h-4 w-4" />
            <span>Manufacturer</span>
          </TabsTrigger>
          <TabsTrigger value="store_manager" className="flex items-center justify-center gap-2">
            <Store className="h-4 w-4" />
            <span>Store</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
