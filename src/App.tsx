import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import { AppLayout } from "./components/layout/app-layout";
import { useAuthStore } from "./store/auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/app" replace />} />
            <Route path="/auth/signin" element={!isAuthenticated ? <Auth mode="signin" /> : <Navigate to="/app" replace />} />
            <Route path="/auth/signup" element={!isAuthenticated ? <Auth mode="signup" /> : <Navigate to="/app" replace />} />
            
            {/* Protected Routes */}
            <Route path="/app" element={isAuthenticated ? <AppLayout /> : <Navigate to="/" replace />}>
              <Route index element={<Dashboard />} />
              <Route path="applications" element={<Applications />} />
              <Route path="documents" element={<div className="text-center py-20 text-muted-foreground">Documents page coming soon...</div>} />
              <Route path="calendar" element={<div className="text-center py-20 text-muted-foreground">Calendar page coming soon...</div>} />
              <Route path="settings" element={<div className="text-center py-20 text-muted-foreground">Settings page coming soon...</div>} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
