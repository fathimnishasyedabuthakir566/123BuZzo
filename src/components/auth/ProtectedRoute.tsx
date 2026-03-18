import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { User, UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    checkAuth();
    window.addEventListener("user-updated", checkAuth);
    return () => window.removeEventListener("user-updated", checkAuth);
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>;
  }

  if (!user) {
    // Redirect to auth with current path as redirect destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase() as UserRole)) {
    // Role not allowed - redirect to their actual dashboard
    const roleMap: Record<string, string> = {
      admin: "/admin",
      driver: "/driver",
      user: "/dashboard"
    };
    return <Navigate to={roleMap[user.role.toLowerCase()] || "/"} replace />;
  }

  return <>{children}</>;
};
