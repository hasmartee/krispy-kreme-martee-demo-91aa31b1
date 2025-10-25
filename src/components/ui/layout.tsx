import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ViewProvider } from "@/contexts/ViewContext";
import { ViewSelector } from "@/components/ViewSelector";
import { User, LogOut, Settings, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ViewProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-subtle">
          {/* Desktop Sidebar - hidden on tablet/mobile */}
          <div className="hidden lg:block">
            <AppSidebar />
          </div>

          {/* Mobile/Tablet Sidebar - shown as drawer */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64 lg:hidden">
              <AppSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex flex-col transition-smooth w-full">
            <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                {/* Hamburger menu for tablet/mobile */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <ViewSelector />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {user?.email || "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ViewProvider>
  );
}