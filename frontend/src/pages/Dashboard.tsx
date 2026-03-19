// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "@/services/authService";
import type { User } from "@/types";
import AdminDashboard from "./admin/AdminDashboard";
import DriverDashboard from "./driver/DriverDashboard";
import PassengerDashboard from "./passenger/PassengerDashboard";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const current = await authService.getCurrentUser();
      setUser(current);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Not logged in – redirect to auth page
    return <Navigate to="/auth?mode=login" replace />;
  }

  const role = (user.role || "USER").toUpperCase();
  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "DRIVER":
      return <DriverDashboard />;
    default:
      // Treat any other role as passenger/user
      return <PassengerDashboard />;
  }
};

export default Dashboard;
