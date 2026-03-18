import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import { Layout } from "@/components/layout";
import { AuthForm, RoleSelector } from "@/components/auth";
import type { UserRole } from "@/types";
import { authService } from "@/services/authService";
import { toast } from "sonner";

type AuthMode = "login" | "register";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>((searchParams.get("mode") as AuthMode) || "login");
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "user");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(!searchParams.get("mode") && !searchParams.get("role"));

  useEffect(() => {
    const modeParam = searchParams.get("mode") as AuthMode;
    const roleParam = searchParams.get("role") as UserRole;
    if (modeParam) {
      setMode(modeParam);
      setShowRoleSelection(false);
    }
    if (roleParam) {
      setRole(roleParam);
      setShowRoleSelection(false);
    }
  }, [searchParams]);

  const navigateByRole = (userRole?: string) => {
    const lowerRole = (userRole || 'user').toLowerCase();
    if (lowerRole === 'admin') navigate('/admin');
    else if (lowerRole === 'driver') navigate('/driver');
    else navigate('/dashboard');
  };

  const handleSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    try {
      // Google login already handled in AuthForm — just redirect
      if ((data as any)?._skipForm) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          toast.success("Google login successful!");
          navigateByRole(currentUser.role);
        }
        return;
      }

      if (mode === 'login') {
        const response = await authService.login({
          email: data.email,
          password: data.password,
          role: role,
        });

        if (response.success) {
          toast.success("Login successful!");
          navigateByRole(response.user?.role);
        } else {
          toast.error(response.error || "Login failed");
        }
      } else {
        if (data.password !== data.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const response = await authService.register({
          name: data.name || 'User',
          email: data.email,
          password: data.password,
          role: role,
          phone: data.phone,
          city: data.city,
        });

        if (response.success) {
          toast.success("Account created successfully!");
          navigateByRole(response.user?.role);
        } else {
          toast.error(response.error || "Registration failed");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: UserRole, selectedMode: AuthMode) => {
    setRole(selectedRole);
    setMode(selectedMode);
    setShowRoleSelection(false);
  };

  if (showRoleSelection) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden bg-slate-50 font-sans">
        {/* Dynamic Background Blobs */}
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-teal-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-slate-900/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter text-slate-900 drop-shadow-sm">Choose Your Role</h1>
          <p className="text-slate-500 font-medium text-lg mb-16 text-center">Select your role to access the features designed for you</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* Passenger Card */}
            <div className="bg-white border border-slate-100 hover:border-teal-200 transition-colors p-8 rounded-[2rem] flex flex-col items-center text-center shadow-soft h-full">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-6 ring-2 ring-teal-500/20 border border-teal-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h2 className="text-xl font-bold mb-4 text-slate-900">Passenger</h2>
              <p className="text-slate-500 text-sm mb-10 flex-1 leading-relaxed">
                Track buses, view routes, and get real-time updates
              </p>
              <div className="w-full space-y-3 mt-auto">
                <button 
                  onClick={() => handleRoleSelect("user", "login")}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleRoleSelect("user", "register")}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors border border-slate-200"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Driver Card */}
            <div className="bg-white border border-slate-100 hover:border-teal-200 transition-colors p-8 rounded-[2rem] flex flex-col items-center text-center shadow-soft h-full">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-6 ring-2 ring-teal-500/20 border border-teal-500/30">
                <Bus className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold mb-4 text-slate-900">Driver</h2>
              <p className="text-slate-500 text-sm mb-10 flex-1 leading-relaxed">
                Manage trips, share location, and view assigned buses
              </p>
              <div className="w-full space-y-3 mt-auto">
                <button 
                  onClick={() => handleRoleSelect("driver", "login")}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleRoleSelect("driver", "register")}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors border border-slate-200"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Admin Card */}
            <div className="bg-white border border-slate-100 hover:border-teal-200 transition-colors p-8 rounded-[2rem] flex flex-col items-center text-center shadow-soft h-full">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-6 ring-2 ring-teal-500/20 border border-teal-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h2 className="text-xl font-bold mb-4 text-slate-900">Admin</h2>
              <p className="text-slate-500 text-sm mb-10 flex-1 leading-relaxed">
                Manage users, buses, routes, and monitor activity
              </p>
              <div className="w-full space-y-3 mt-auto">
                <button 
                  onClick={() => handleRoleSelect("admin", "login")}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleRoleSelect("admin", "register")}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors border border-slate-200"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden bg-slate-50 font-sans">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-teal-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-slate-900/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      {/* Modern Header / Brand */}
      <div className="relative z-20 flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-3xl gradient-btn-buzzo flex items-center justify-center shadow-2xl mb-6 transform hover:rotate-6 transition-transform cursor-pointer" onClick={() => setShowRoleSelection(true)} title="Back to Role Selection">
          <Bus className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-1">
          BUZZO <span className="text-teal-600 italic">TRANSIT</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">
          Real-Time Tracking System
        </p>
      </div>

      {/* Auth Card */}
      <div className="relative z-20 w-full max-w-md bg-white rounded-[3rem] p-8 sm:p-10 shadow-soft border border-slate-100 animate-scale-in">
        <RoleSelector role={role} onRoleChange={setRole} />
        
        <AuthForm
          mode={mode}
          role={role}
          onSubmit={handleSubmit}
          onModeChange={setMode}
          isLoading={isLoading}
        />
      </div>

      {/* Decoration / Illustration Placeholder */}
      <div className="absolute bottom-10 opacity-5 pointer-events-none hidden lg:block">
        <Bus className="w-64 h-64 text-slate-900 -rotate-12" />
      </div>

      {/* Footer Text */}
      <div className="relative z-20 mt-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" onClick={() => setShowRoleSelection(true)}>
          ← BACK TO ROLE SELECTION
        </p>
      </div>
    </div>
  );
};

export default Auth;
