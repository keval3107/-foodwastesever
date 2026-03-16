import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Risks from "./pages/Risks";
import Analytics from "./pages/Analytics";
import Discounts from "./pages/Discounts";
import Marketplace from "./pages/Marketplace";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { Leaf } from "lucide-react";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
          <Leaf className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading WasteLess AI...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isLoggedIn, user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute adminOnly><Inventory /></ProtectedRoute>} />
      <Route path="/risks" element={<ProtectedRoute adminOnly><Risks /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      <Route path="/discounts" element={<ProtectedRoute><Discounts /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
