
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BusList from "./pages/BusList";
import BusDetails from "./pages/BusDetails";
import BusDirectory from "./pages/BusDirectory";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import DriverDashboard from "./pages/driver/DriverDashboard";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import PassengerDashboard from "./pages/passenger/PassengerDashboard";
import UserProfile from "./pages/passenger/UserProfile";
import DriverProfile from "./pages/driver/DriverProfile";
import AdminProfile from "./pages/admin/AdminProfile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SavedRoutes from "./pages/passenger/SavedRoutes";
import AlertsHub from "./pages/passenger/AlertsHub";
import LiveRadar from "./pages/LiveRadar";
import LiveTerminal from "./pages/LiveTerminal";
import BusHeatmap from "./pages/admin/BusHeatmap";
import { useProximityAlerts } from "./hooks/useProximityAlerts";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import BuzzoAI from "./components/chat/BuzzoAI";
import ProximityScan from "./components/shared/ProximityScan";

const queryClient = new QueryClient();

const App = () => {
  useProximityAlerts();

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder-client-id"}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="relative min-h-screen bg-slate-950 text-white selection:bg-teal-500/30">
            {/* Global Neural Grid Overlay */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
            
            <Sonner position="top-right" expand={false} richColors closeButton />
            
            <BrowserRouter>
              <div className="relative z-10 min-h-screen flex flex-col">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/buses" element={<BusList />} />
                  <Route path="/bus-directory" element={<BusDirectory />} />
                  <Route path="/bus/:id" element={<BusDetails />} />
                  <Route path="/live-radar" element={<LiveRadar />} />
                  <Route path="/live-terminal" element={<LiveTerminal />} />

                    {/* Unified Dashboard Protected Route */}
                    {/* Notifications Page */}
                    <Route path="/notifications" element={<ProtectedRoute allowedRoles={["user","driver","admin"]}><Notifications /></ProtectedRoute>} />
                   <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["user","driver","admin"]}><Dashboard /></ProtectedRoute>} />
                   <Route path="/profile" element={<ProtectedRoute allowedRoles={["user"]}><UserProfile /></ProtectedRoute>} />
                   <Route path="/saved-routes" element={<ProtectedRoute allowedRoles={["user"]}><SavedRoutes /></ProtectedRoute>} />
                   <Route path="/alerts" element={<ProtectedRoute allowedRoles={["user"]}><AlertsHub /></ProtectedRoute>} />

                  {/* Driver Protected Routes */}
                  <Route path="/driver" element={<ProtectedRoute allowedRoles={["driver"]}><DriverDashboard /></ProtectedRoute>} />
                  <Route path="/driver-profile" element={<ProtectedRoute allowedRoles={["driver"]}><DriverProfile /></ProtectedRoute>} />

                  {/* Admin Protected Routes */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
                  <Route path="/admin-profile" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProfile /></ProtectedRoute>} />
                  <Route path="/heatmap" element={<ProtectedRoute allowedRoles={["admin"]}><BusHeatmap /></ProtectedRoute>} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Global Tactical Components */}
                <ProximityScan />
                <BuzzoAI />
              </div>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
