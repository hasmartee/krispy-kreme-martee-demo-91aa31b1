import { BarChart3, Package, Store, TrendingUp, ShoppingCart, Settings, ChevronRight, Target, BookOpen, CheckSquare, Activity, Truck, Home, ChefHat, Sparkles, Trash2, MessageSquare, ClipboardList, Database } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useView } from "@/contexts/ViewContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mainNavigationStoreManager: Array<{ title: string; url: string; icon: any; sparkles?: boolean }> = [
  { title: "Home", url: "/", icon: Home },
  { title: "My Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Store Deliveries", url: "/suggested-production", icon: Truck, sparkles: true },
  { title: "Daily Waste", url: "/daily-waste", icon: Trash2 },
  { title: "Live Sales", url: "/live-sales", icon: Activity },
];

const mainNavigationHQ: Array<{ title: string; url: string; icon: any; sparkles?: boolean }> = [
  { title: "Home", url: "/", icon: Home },
  { title: "Performance", url: "/analytics", icon: BarChart3 },
  { title: "Suggested Production", url: "/production", icon: ChefHat, sparkles: true },
  { title: "Delivery Plan", url: "/delivery-plan", icon: ClipboardList },
  { title: "Stock Tracker", url: "/live-data", icon: Database },
];

const mainNavigationManufacturing: Array<{ title: string; url: string; icon: any; sparkles?: boolean }> = [
  { title: "Home", url: "/", icon: Home },
  { title: "Production Plan", url: "/production", icon: ChefHat, sparkles: true },
];

const settingsNavigationHQ = [
  { title: "My Products", url: "/products", icon: Package },
  { title: "My Stores", url: "/stores", icon: Store },
  { title: "My Range Plans", url: "/store-products", icon: ShoppingCart },
];

const settingsNavigationStoreManager = [
  { title: "Products", url: "/products", icon: Package },
  { title: "Range", url: "/store-products", icon: ShoppingCart },
  { title: "Store Details", url: "/store-details", icon: Store },
];


export function AppSidebar() {
  const { viewMode } = useView();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const mainNavigation = viewMode === "store_manager" 
    ? mainNavigationStoreManager 
    : viewMode === "manufacturing"
    ? mainNavigationManufacturing
    : mainNavigationHQ;
  
  const settingsNavigation = viewMode === "store_manager" 
    ? settingsNavigationStoreManager 
    : settingsNavigationHQ;
  
  const businessLabel = viewMode === "store_manager" ? "My Store" : "My Business";
  const showSettings = viewMode !== "manufacturing"; // Hide settings for manufacturing view

  return (
    <Sidebar className="w-64" collapsible="none">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Martee AI</h2>
            <p className="text-xs text-muted-foreground">Ole and Steen</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                        ${isActive 
                          ? "bg-primary text-primary-foreground font-semibold shadow-md" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="relative">
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.sparkles && (
                              <Sparkles className="h-2.5 w-2.5 absolute -top-1 -right-1 text-[#ff914d] animate-pulse" />
                            )}
                          </div>
                          <span className="flex-1">{item.title}</span>
                          {isActive && <ChevronRight className="h-4 w-4" />}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showSettings && (
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-muted-foreground hover:text-foreground cursor-pointer">
                  {businessLabel}
                  <ChevronRight className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingsNavigation.map((item) => {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <NavLink 
                            to={item.url} 
                            className={({ isActive }) => `
                              flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                              ${isActive 
                                ? "bg-primary text-primary-foreground font-semibold shadow-md" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }
                            `}
                          >
                            {({ isActive }) => (
                              <>
                                <item.icon className="h-4 w-4 shrink-0" />
                                <span className="flex-1">{item.title}</span>
                                {isActive && <ChevronRight className="h-4 w-4" />}
                              </>
                            )}
                          </NavLink>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>
    </Sidebar>
  );
}