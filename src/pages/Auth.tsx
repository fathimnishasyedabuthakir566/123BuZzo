import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Bus, Mail, Lock, User, Phone, Eye, EyeOff, Shield, HeartHandshake, ArrowRight } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import type { UserRole } from "@/types";
import { GoogleLogin } from "@react-oauth/google";

type AuthMode = "login" | "register";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<AuthMode>((searchParams.get("mode") as AuthMode) || "login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user" as UserRole, // user = passenger
  });

  useEffect(() => {
    const modeParam = searchParams.get("mode") as AuthMode;
    if (modeParam) setMode(modeParam);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigateByRole = (userRole?: string) => {
    const lowerRole = (userRole || 'user').toLowerCase();
    if (lowerRole === 'admin') navigate('/admin');
    else if (lowerRole === 'driver') navigate('/driver');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        if (response.success) {
          toast.success("Authentication confirmed.");
          navigateByRole(response.user?.role);
        } else {
          toast.error(response.error || "Login sequence failed.");
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match.");
          setIsLoading(false);
          return;
        }

        const response = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          city: "Default City", // Automatically fill if required by older schemas
        });

        if (response.success) {
          toast.success("Profile registered successfully!");
          navigateByRole(response.user?.role);
        } else {
          toast.error(response.error || "Registration encountered an error.");
        }
      }
    } catch (err) {
      toast.error("An unexpected network anomaly occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 font-sans selection:bg-teal-500/30">
      
      {/* Left Panel - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-24 border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-slate-900 to-slate-950 z-0" />
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-teal-500/10 rounded-full blur-[120px] -mt-32 -mr-32 animate-pulse-slow pointer-events-none" />
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.5)] group-hover:scale-105 transition-all">
               <Bus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">BUZZO<span className="text-teal-400 italic">TRANSIT</span></h1>
          </Link>
          
          <div className="mt-20 max-w-lg">
             <h2 className="text-5xl font-black text-white tracking-tighter leading-[1.1] mb-6 drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">SYNCHRONIZE</span> YOUR JOURNEY.
             </h2>
             <p className="text-slate-400 text-lg font-medium leading-relaxed">
               Welcome to the neural transit network. Access real-time fleet telemetry, active routing grids, and predictive arrival coordinates directly from your device.
             </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
           <div className="space-y-2">
              <div className="text-teal-400 font-black text-2xl">450+</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active Fleet Units</div>
           </div>
           <div className="space-y-2">
              <div className="text-teal-400 font-black text-2xl">&lt; 10ms</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Telemetry Latency</div>
           </div>
        </div>
      </div>

      {/* Right Panel - Form (Takes full width on small screens) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
         {/* Mobile Logo */}
         <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
               <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-white tracking-tighter text-xl">BUZZO</span>
         </div>

         <div className="w-full max-w-md">
            <div className="mb-10 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest mb-6">
                 <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                 Secure Terminal
               </div>
               <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                 {mode === "login" ? "Identity Authorization" : "New Registration Profile"}
               </h3>
               <p className="text-slate-500 text-sm font-medium">
                 {mode === "login" ? "Enter your credentials to access the neural network" : "Create your identity to connect to the transit grid"}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
               
               {/* Name (Included in both login and register as requested) */}
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                  </div>
                  <input 
                     type="text" 
                     name="name"
                     value={formData.name}
                     onChange={handleChange}
                     required
                     className="block w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-medium backdrop-blur-md shadow-inner"
                     placeholder="Full Identity Name"
                  />
               </div>

               {/* Email (Included in both) */}
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                  </div>
                  <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     required
                     className="block w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-medium backdrop-blur-md shadow-inner"
                     placeholder="Network Email ID"
                  />
               </div>

               {/* Phone (Register only) */}
               {mode === "register" && (
                  <div className="relative group animate-fade-in">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                     </div>
                     <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-medium backdrop-blur-md shadow-inner"
                        placeholder="Contact Number"
                     />
                  </div>
               )}

               {/* Password (Included in both) */}
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                  </div>
                  <input 
                     type={showPassword ? "text" : "password"}
                     name="password"
                     value={formData.password}
                     onChange={handleChange}
                     required
                     className="block w-full pl-12 pr-12 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-medium backdrop-blur-md shadow-inner"
                     placeholder="Security Code (Password)"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                     </button>
                  </div>
               </div>

               {/* Confirm Password (Register only) */}
               {mode === "register" && (
                  <div className="relative group animate-fade-in">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                     </div>
                     <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="block w-full pl-12 pr-12 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-medium backdrop-blur-md shadow-inner"
                        placeholder="Confirm Security Code"
                     />
                     <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-500 hover:text-white transition-colors">
                           {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                     </div>
                  </div>
               )}

               {/* Role Confirmation (Radio Buttons for both) */}
               <div className="pt-4 border-t border-slate-800/50 mt-6">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                     {mode === "login" ? "Confirm Authority Level" : "Select Your Role Authority"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     {[
                       { id: 'user', label: 'Passenger', icon: User },
                       { id: 'driver', label: 'Driver', icon: Bus },
                       { id: 'admin', label: 'Admin', icon: Shield }
                     ].map((r) => (
                        <label 
                           key={r.id}
                           className={`cursor-pointer group flex flex-col items-center p-3 rounded-xl border transition-all ${
                              formData.role === r.id 
                                ? "bg-teal-500/10 border-teal-500/50 ring-1 ring-teal-500/50" 
                                : "bg-slate-950/30 border-slate-800 hover:border-slate-600 hover:bg-slate-900/50"
                           }`}
                        >
                           <input 
                              type="radio" 
                              name="role" 
                              value={r.id}
                              checked={formData.role === r.id}
                              onChange={handleChange}
                              className="sr-only"
                           />
                           <r.icon className={`w-5 h-5 mb-2 ${formData.role === r.id ? "text-teal-400" : "text-slate-500 group-hover:text-slate-400"}`} />
                           <span className={`text-xs font-bold ${formData.role === r.id ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`}>
                              {r.label}
                           </span>
                        </label>
                     ))}
                  </div>
               </div>

               {/* Submit Button */}
               <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-16 mt-4 flex items-center justify-center gap-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black uppercase text-sm tracking-widest rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.3)] transition-all disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
               >
                  {isLoading ? (
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-bounce [animation-delay:-0.3s]" />
                     </div>
                  ) : (
                     <>
                        {mode === "login" ? "Sign In Sequence" : "Initialize Account"} 
                        <ArrowRight className="w-5 h-5" />
                     </>
                  )}
               </button>

            </form>

            <div className="mt-8 text-center border-t border-slate-800 pt-8">
               <p className="text-sm font-medium text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2">
                  {mode === "login" ? "Unregistered entity?" : "Already possess authorization?"}
                  <button 
                     type="button"
                     onClick={() => setMode(mode === "login" ? "register" : "login")}
                     className="text-teal-400 font-bold hover:text-teal-300 transition-colors uppercase text-xs tracking-wider"
                  >
                     {mode === "login" ? "Create Registration Profile" : "Access Sign In"}
                  </button>
               </p>

               <div className="mt-8">
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4">Or authenticate via network</p>
                 <div className="flex justify-center [&_iframe]:!rounded-[1rem] [&>div>div]:!bg-slate-900 border border-slate-800 rounded-2xl w-max mx-auto overflow-hidden">
                    <GoogleLogin
                       onSuccess={async (credentialResponse) => {
                         if (credentialResponse.credential) {
                           try {
                             const response = await authService.googleLogin(credentialResponse.credential, formData.role);
                             if (response.success) {
                               toast.success("Google telemetry sync successful!");
                               navigateByRole(response.user?.role);
                             } else {
                               toast.error(response.error || "Google login failed");
                             }
                           } catch (error) {
                             toast.error("An error occurred during Google sign-in.");
                           }
                         }
                       }}
                       onError={() => toast.error("Google Synchronization Failed")}
                       useOneTap
                       theme="filled_black"
                       shape="rectangular"
                       size="large"
                    />
                 </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default Auth;
