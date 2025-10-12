import { BarChart3, Package, Store, TrendingUp, ShoppingCart, Settings, ChevronRight, Target, BookOpen, CheckSquare, Activity, Truck, Home } from "lucide-react";
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

const mainNavigation = [
  { title: "Home", url: "/", icon: Home },
  { title: "My Tasks", url: "/tasks", icon: CheckSquare, highlight: true },
  { title: "Performance", url: "/analytics", icon: BarChart3 },
  { title: "Suggested Production", url: "/suggested-production", icon: TrendingUp },
  { title: "Live Availability", url: "/inventory", icon: Package },
  { title: "Live Sales", url: "/live-sales", icon: Activity },
  { title: "Settings", url: "/settings", icon: Settings },
];

const settingsNavigationHQ = [
  { title: "My Products", url: "/products", icon: Package },
  { title: "My Stores", url: "/stores", icon: Store },
  { title: "My Range Plans", url: "/store-products", icon: ShoppingCart },
  { title: "My Recipes", url: "/recipes", icon: BookOpen },
];

const settingsNavigationStore = [
  { title: "Products", url: "/products", icon: Package, readonly: true },
  { title: "Range", url: "/store-products", icon: ShoppingCart, readonly: true },
  { title: "Recipes", url: "/recipes", icon: BookOpen },
];

export function AppSidebar() {
  const { viewMode } = useView();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const settingsNavigation = viewMode === "store" ? settingsNavigationStore : settingsNavigationHQ;
  const businessLabel = viewMode === "store" ? "My Store" : "My Business";

  return (
    <Sidebar className="w-64" collapsible="none">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Martee AI</h2>
            <p className="text-xs text-muted-foreground">Moto Hospitality</p>
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
                const isHighlight = item.highlight;
                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                        ${isHighlight && !isActive 
                          ? "bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-foreground font-semibold hover:from-primary/20 hover:to-accent/20" 
                          : isActive 
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
        </SidebarGroup>

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
                              <span className="flex-1">
                                {item.title}
                                {'readonly' in item && item.readonly && (
                                  <span className="text-xs ml-2 opacity-60">(View only)</span>
                                )}
                              </span>
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
      </SidebarContent>
    </Sidebar>
  );
}