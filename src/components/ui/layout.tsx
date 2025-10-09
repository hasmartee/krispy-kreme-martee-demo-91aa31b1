import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ViewProvider } from "@/contexts/ViewContext";
import { ViewSelector } from "@/components/ViewSelector";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ViewProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-subtle">
          <AppSidebar />
          <div className="flex-1 flex flex-col transition-smooth">
            <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center px-6 sticky top-0 z-10">
              <ViewSelector />
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