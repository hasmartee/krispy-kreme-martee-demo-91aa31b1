import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ViewProvider } from "@/contexts/ViewContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SuggestedProduction from "./pages/SuggestedProduction";
import SuggestedOrdering from "./pages/SuggestedOrdering";
import ProductRange from "./pages/ProductRange";
import StoreProductRange from "./pages/StoreProductRange";
import StoreManagement from "./pages/StoreManagement";
import Analytics from "./pages/Analytics";
import LiveSales from "./pages/LiveSales";
import Settings from "./pages/Settings";
import Inventory from "./pages/Inventory";
import MyIngredients from "./pages/MyIngredients";
import MySuppliers from "./pages/MySuppliers";
import MyRecipes from "./pages/MyRecipes";
import MyLogistics from "./pages/MyLogistics";
import MyTasks from "./pages/MyTasks";
import Compliance from "./pages/Compliance";
import Deliveries from "./pages/Deliveries";
import MyTeam from "./pages/MyTeam";
import SuggestedStaffing from "./pages/SuggestedStaffing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ViewProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/analytics" replace />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/live-sales" element={<LiveSales />} />
                      <Route path="/suggested-production" element={<SuggestedProduction />} />
                      <Route path="/suggested-staffing" element={<SuggestedStaffing />} />
                      <Route path="/suggested-ordering" element={<SuggestedOrdering />} />
                      <Route path="/products" element={<ProductRange />} />
                      <Route path="/store-products" element={<StoreProductRange />} />
                      <Route path="/stores" element={<StoreManagement />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/ingredients" element={<MyIngredients />} />
                      <Route path="/suppliers" element={<MySuppliers />} />
                      <Route path="/recipes" element={<MyRecipes />} />
                      <Route path="/logistics" element={<MyLogistics />} />
                      <Route path="/tasks" element={<MyTasks />} />
                      <Route path="/team" element={<MyTeam />} />
                      <Route path="/compliance" element={<Compliance />} />
                      <Route path="/deliveries" element={<Deliveries />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          </ViewProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
