import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase-helper";

export type ViewMode = "hq" | "store_manager" | "manufacturing";

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("store_manager");
  const [selectedStore, setSelectedStore] = useState<string>("");

  // Load Bank Station as default for store manager view
  useEffect(() => {
    let mounted = true;
    
    const loadBankStore = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('name')
          .eq('name', 'Bank Station')
          .maybeSingle() as any;
        
        if (error) {
          console.error('Error loading Bank Station:', error);
          return;
        }
        
        if (mounted && data?.name) {
          setSelectedStore(data.name);
        }
      } catch (error) {
        console.error('Error loading Bank Station:', error);
      }
    };
    
    loadBankStore();
    
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
