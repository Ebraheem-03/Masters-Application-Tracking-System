import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import CalendarPage from "./pages/Calendar";
import DocumentsPage from "./pages/Documents";
import SettingsPage from "./pages/Settings";
import NotificationsPage from "./pages/Notifications";
import ProfilePage from "./pages/Profile";
import { AppLayout } from "./components/layout/app-layout";
import { useAuthStore } from "./store/auth";
import NotFound from "./pages/NotFound";
import { AuthInitializer } from "./components/AuthInitializer";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthInitializer />
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/app" replace />} />
            <Route path="/auth/signin" element={!isAuthenticated ? <Auth mode="signin" /> : <Navigate to="/app" replace />} />
            <Route path="/auth/signup" element={!isAuthenticated ? <Auth mode="signup" /> : <Navigate to="/app" replace />} />
            
            {/* Protected Routes */}
            <Route path="/app" element={isAuthenticated ? <AppLayout /> : <Navigate to="/" replace />}>
              <Route index element={<Dashboard />} />
              <Route path="applications" element={<Applications />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
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
