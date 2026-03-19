import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bus, Menu, X, MapPin, User as UserIcon, LogIn, Globe, Zap, Activity, ShieldCheck, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useTranslation } from "react-i18next";
import NotificationBell from "@/components/notifications/NotificationBell";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };

    fetchUser();
    window.addEventListener('user-updated', fetchUser);
    return () => window.removeEventListener('user-updated', fetchUser);
  }, [location.pathname]);

  const getDashboardPath = () => {
    if (!user) return "/";
    const role = (user.role || 'user').toLowerCase();
    if (role === 'admin') return "/admin";
    if (role === 'driver') return "/driver";
    return "/dashboard";
  };

  const navLinks = [
    { href: getDashboardPath(), label: "Fleet Hub" },
    { href: "/live-radar", label: "Live Radar" },
    { href: "/live-terminal", label: "Neural Terminal" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-6",
        isScrolled ? "bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 py-4" : "bg-transparent"
    )}>
      <div className="max-w-[1400px] mx-auto px-10">
        <div className="flex items-center justify-between h-14">
          {/* Logo - BUZZO Identity */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-[1.25rem] bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-teal-500/50 transition-all duration-500 group-hover:scale-105">
                <Bus className="w-6 h-6 text-teal-400 group-hover:rotate-12 transition-transform" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
               <span className="text-2xl font-black text-white tracking-[-0.05em] uppercase flex items-center gap-1">
                 BUZZO <span className="text-teal-500">.</span>
               </span>
               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Neural Link</span>
                  <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">Tirunelveli</span>
               </div>
            </div>
          </Link>

          {/* Desktop Navigation - Tactical Hub */}
          <nav className="hidden lg:flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    location.pathname === link.href 
                        ? "bg-white text-slate-950 shadow-xl" 
                        : "text-slate-400 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-4 px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest group cursor-help transition-all hover:bg-white/10">
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] leading-none mb-1">Weather Satellite</span>
                  <div className="flex items-center gap-2 text-white italic">
                     <Sun className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-45 transition-transform" />
                     <span className="text-[11px] tracking-tighter">32.4°C / TIRUNELVELI</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <Globe className="w-4 h-4 text-teal-500" />
               <select 
                value={i18n.language}
                onChange={changeLanguage}
                className="bg-transparent outline-none cursor-pointer text-white"
               >
                 <option value="en">Global (EN)</option>
                 <option value="ta">Local (TA)</option>
                 <option value="hi">Regional (HI)</option>
               </select>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <Link to={getDashboardPath() === "/" ? "/auth" : getDashboardPath()} className="group">
                  <div className="h-12 px-6 bg-slate-900 border border-white/10 rounded-2xl flex items-center gap-3 hover:border-teal-500/50 transition-all">
                     {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Identity" className="w-6 h-6 rounded-lg object-cover" />
                     ) : (
                        <UserIcon className="w-5 h-5 text-teal-500" />
                     )}
                     <div className="text-left hidden xl:block">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{user.name?.split(' ')[0]}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{user.role}</p>
                     </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <button className="h-12 px-8 text-[10px] font-black text-white uppercase tracking-widest hover:text-teal-400 transition-colors">
                    Identify
                  </button>
                </Link>
                <Link to="/auth?mode=register">
                  <button className="h-12 px-8 bg-teal-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-glow hover:scale-105 active:scale-95 transition-all">
                    Initiate Proximity
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 p-8 glass-premium border border-white/10 rounded-[2.5rem] animate-scale-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                      "p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      location.pathname === link.href 
                          ? "bg-white text-slate-950 border-white" 
                          : "text-slate-400 border-white/5 hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/5 mt-4 grid grid-cols-2 gap-4">
                {user ? (
                   <Link to={getDashboardPath() === "/" ? "/auth" : getDashboardPath()} className="col-span-2" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full h-16 bg-slate-900 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-3">
                         <UserIcon className="w-5 h-5 text-teal-500" /> Identity Panel
                      </button>
                   </Link>
                ) : (
                   <>
                     <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <button className="w-full h-14 bg-white/5 border border-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">Login</button>
                     </Link>
                     <Link to="/auth?mode=register" onClick={() => setIsMenuOpen(false)}>
                        <button className="w-full h-14 bg-teal-500 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-glow">Start</button>
                     </Link>
                   </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
