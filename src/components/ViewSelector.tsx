import { Building2, Store, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useView } from "@/contexts/ViewContext";
import { useNavigate } from "react-router-dom";

export function ViewSelector() {
  const { viewMode, setViewMode } = useView();
  const navigate = useNavigate();

  const handleViewChange = (value: string) => {
    setViewMode(value as "hq" | "store_manager" | "store_team");
    navigate("/analytics");
  };

  return (
    <div className="flex items-center gap-4">
      <Tabs value={viewMode} onValueChange={handleViewChange}>
        <TabsList className="grid w-[360px] grid-cols-3">
          <TabsTrigger value="store_manager" className="gap-2">
            <Store className="h-4 w-4" />
            Store Manager
          </TabsTrigger>
          <TabsTrigger value="store_team" className="gap-2">
            <Users className="h-4 w-4" />
            Store Team
          </TabsTrigger>
          <TabsTrigger value="hq" className="gap-2">
            <Building2 className="h-4 w-4" />
            HQ View
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
