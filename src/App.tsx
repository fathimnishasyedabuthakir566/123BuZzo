
import { Toaster } from "@/components/ui/toaster";
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
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import DriverDashboard from "./pages/DriverDashboard";
import PassengerDashboard from "./pages/PassengerDashboard";
import UserProfile from "./pages/UserProfile";
import DriverProfile from "./pages/DriverProfile";
import AdminProfile from "./pages/AdminProfile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SavedRoutes from "./pages/SavedRoutes";
import AlertsHub from "./pages/AlertsHub";
import LiveRadar from "./pages/LiveRadar";
import LiveTerminal from "./pages/LiveTerminal";
import BusHeatmap from "./pages/BusHeatmap";
import LiveChat from "./components/chat/LiveChat";
import { useProximityAlerts } from "./hooks/useProximityAlerts";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  useProximityAlerts();
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder-client-id"}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/buses" element={<BusList />} />
              <Route path="/bus-directory" element={<BusDirectory />} />
              <Route path="/bus/:id" element={<BusDetails />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/live-radar" element={<LiveRadar />} />
              <Route path="/live-terminal" element={<LiveTerminal />} />
              
              {/* Passenger Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>} />
              <Route path="/saved-routes" element={<ProtectedRoute allowedRoles={['user']}><SavedRoutes /></ProtectedRoute>} />
              
              {/* Driver Protected Routes */}
              <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
              <Route path="/driver-profile" element={<ProtectedRoute allowedRoles={['driver']}><DriverProfile /></ProtectedRoute>} />
              
              {/* Admin Protected Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin-profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
              <Route path="/heatmap" element={<ProtectedRoute allowedRoles={['admin']}><BusHeatmap /></ProtectedRoute>} />
              
              {/* Shared Protected Routes */}
              <Route path="/alerts" element={<ProtectedRoute><AlertsHub /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <LiveChat />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
