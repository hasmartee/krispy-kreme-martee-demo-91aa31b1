import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ViewProvider } from "@/contexts/ViewContext";
import { ViewSelector } from "@/components/ViewSelector";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

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
          <AppSidebar />
          <div className="flex-1 flex flex-col transition-smooth">
            <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
              <ViewSelector />
              
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
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ViewProvider>
  );
}