import { Building2, Store } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useView } from "@/contexts/ViewContext";
import { useNavigate } from "react-router-dom";

export function ViewSelector() {
  const { viewMode, setViewMode } = useView();
  const navigate = useNavigate();

  const handleViewChange = (value: string) => {
    setViewMode(value as "hq" | "store");
    navigate("/analytics");
  };

  return (
    <div className="flex items-center gap-4">
      <Tabs value={viewMode} onValueChange={handleViewChange}>
        <TabsList className="grid w-[240px] grid-cols-2">
          <TabsTrigger value="hq" className="gap-2">
            <Building2 className="h-4 w-4" />
            HQ View
          </TabsTrigger>
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Store View
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
