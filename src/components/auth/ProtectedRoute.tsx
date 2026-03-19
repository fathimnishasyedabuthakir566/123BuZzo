import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkAuth();

    // Listen for local storage changes (login/logout)
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('user-updated', handleAuthChange);
    return () => window.removeEventListener('user-updated', handleAuthChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes((user.role || 'user').toLowerCase() as UserRole)) {
    // If user doesn't have required role, redirect to their own dashboard
    console.warn(`Access denied. User role: ${user.role}. Allowed: ${allowedRoles}`);
    
    const role = (user.role || 'user').toLowerCase();
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'driver') return <Navigate to="/driver" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
