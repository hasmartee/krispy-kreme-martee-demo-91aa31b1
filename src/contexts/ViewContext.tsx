import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ViewMode = "hq" | "store";

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("store");
  const [selectedStore, setSelectedStore] = useState<string>("");

  // Load first store on mount
  useEffect(() => {
    let mounted = true;
    
    const loadFirstStore = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('name')
          .order('name')
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error('Error loading store:', error);
          return;
        }
        
        if (mounted && data?.name) {
          setSelectedStore(data.name);
        }
      } catch (error) {
        console.error('Error loading store:', error);
      }
    };
    
    loadFirstStore();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode, selectedStore, setSelectedStore }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
