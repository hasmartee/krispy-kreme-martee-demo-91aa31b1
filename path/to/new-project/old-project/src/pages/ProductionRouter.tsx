import { useView } from "@/contexts/ViewContext";
import Production from "./Production";
import ManufacturingProduction from "./ManufacturingProduction";

export default function ProductionRouter() {
  const { viewMode } = useView();

  if (viewMode === "manufacturing") {
    return <ManufacturingProduction />;
  }

  return <Production />;
}
