import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Bus, LayoutDashboard, MapPin, LogOut, User as UserIcon, TrendingUp, Activity, Wrench, ShieldAlert, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userName?: string;
  userRole?: string;
}

const AdminSidebar = ({
  userName = "User",
  userRole = "Bus Operator"
}: AdminSidebarProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = searchParams.get('view') || 'dashboard';

  const handleLogout = async () => {
    await authService.logout();
    navigate("/auth");
  };

  const navItems = [
    { id: "dashboard", label: "Tactical Hub", icon: Activity, href: "/admin?view=dashboard" },
    { id: "buses", label: "Fleet Units", icon: Bus, href: "/admin?view=buses" },
    { id: "maintenance", label: "Predictive AI", icon: Wrench, href: "/admin?view=maintenance" },
    { id: "drivers", label: "Unit Operators", icon: UserIcon, href: "/admin?view=drivers" },
    { id: "passengers", label: "Neural Traffic", icon: TrendingUp, href: "/admin?view=passengers" },
    { id: "location", label: "Global Radar", icon: MapPin, href: "/admin?view=location" },
    { id: "analytics", label: "Mission Analysis", icon: Database, href: "/admin?view=analytics" },
    { id: "users", label: "User Nodes", icon: ShieldAlert, href: "/admin?view=users" },
  ];

  return (
    <aside className="w-80 glass-premium border-r border-white/5 hidden lg:flex flex-col z-50 shadow-2xl">
      {/* Premium Logo Section */}
      <div className="p-10 border-b border-white/5 bg-slate-900/40">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="w-12 h-12 rounded-[1.25rem] bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-teal-500/50 transition-all duration-500">
              <Bus className="w-6 h-6 text-teal-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black text-white tracking-tighter italic uppercase underline-offset-8 decoration-teal-500/50">BUZZO<span className="text-teal-500">.</span></span>
            <span className="text-[10px] text-slate-500 font-black block uppercase tracking-block leading-none mt-1">Command Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation Nodes */}
      <nav className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar">
        <div>
           <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 px-4">Navigation Nodes</h4>
           <ul className="space-y-2">
             {navItems.map((item) => (
               <li key={item.id}>
                 <Link
                   to={item.href}
                   className={cn(
                       "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]",
                       activeTab === item.id || (item.id === 'terminal' && location.pathname === '/live-terminal')
                         ? "bg-teal-500 text-slate-950 shadow-glow scale-[1.02]"
                         : "text-slate-500 hover:text-white hover:bg-white/5"
                   )}
                 >
                   <item.icon className="w-5 h-5" />
                   {item.label}
                 </Link>
               </li>
             ))}
           </ul>
        </div>
      </nav>

      {/* Operator Identity */}
      <div className="p-8 border-t border-white/5 bg-slate-900/20">
        <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 text-teal-400 font-black text-xl italic">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-[11px] uppercase tracking-widest truncate">{userName}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{userRole}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full h-14 rounded-2xl border border-red-500/10 hover:border-red-500/30 text-red-500/50 hover:text-red-500 flex items-center justify-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

