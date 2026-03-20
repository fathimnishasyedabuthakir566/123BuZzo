import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bus, MapPin, Clock, Shield, Users, ArrowRight, CheckCircle2, Wifi, Activity, Navigation, Search } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { busService } from "@/services/busService";
import { authService } from "@/services/authService";
import { useTranslation } from "react-i18next";
import type { Bus as BusType } from "@/types";
import { cn } from "@/lib/utils";

const Index = () => {
  const { t } = useTranslation();
  const [buses, setBuses] = useState<BusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        const lowerRole = (user.role || 'user').toLowerCase();
        if (lowerRole === 'admin') navigate('/admin');
        else if (lowerRole === 'driver') navigate('/driver');
        else navigate('/dashboard');
      }
    };
    checkAuthAndRedirect();

    const fetchBuses = async () => {
      try {
        const data = await busService.getAllBuses();
        setBuses(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch buses for home page:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuses();
  }, [navigate]);

  return (
    <Layout>
      {/* --- HERO SECTION: MESH GRADIENT --- */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden mesh-bg pt-20">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow stagger-3" />
        
        <div className="section-container relative z-10 py-24">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Hero Left: Text & CTA */}
            <div className="text-center lg:text-left space-y-10">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-premium border-white/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-2xl animate-fade-in text-glow">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-neon-pulse" />
                {t('hero_network_status')} • Tirunelveli
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter italic animate-slide-up">
                {t('hero_title_fast')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">{t('hero_title_smart')}</span> <br/>
                {t('hero_title_global')}
              </h1>

              <p className="text-xl md:text-2xl text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed animate-fade-in stagger-2">
                {t('hero_subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4 animate-fade-in stagger-3">
                <Link to="/buses">
                  <Button className="h-16 px-12 bg-teal-500 hover:bg-teal-600 text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-glow transform hover:-translate-y-1 transition-all">
                    <Navigation className="w-5 h-5" />
                    {t('track_buses_now')}
                  </Button>
                </Link>
                <Link to="/bus-directory">
                  <Button variant="outline" className="h-16 px-12 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs rounded-3xl backdrop-blur-xl transition-all group">
                    <Search className="w-5 h-5" />
                    {t('bus_directory')}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="pt-16 grid grid-cols-3 gap-8 border-t border-white/5 animate-fade-in stagger-4">
                {[
                  { label: "Active Fleet", value: "450+" },
                  { label: "Daily Rides", value: "12K" },
                  { label: "Sync Latency", value: "0.2s" }
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-2xl md:text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Right: Premium Visual Overlay */}
            <div className="relative group perspective-2000 hidden lg:block">
              <div className="absolute -inset-10 bg-gradient-to-tr from-teal-500/20 to-primary/20 blur-[150px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative glass-premium border-white/10 p-4 rounded-[4rem] overflow-hidden transform rotate-6 scale-95 group-hover:rotate-0 group-hover:scale-100 transition-all duration-1000 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                 <div className="absolute inset-0 bg-slate-900/60 z-10" />
                 <img 
                   src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
                   alt="Transit System" 
                   className="w-full h-[700px] object-cover grayscale opacity-40 contrast-150"
                 />
                 
                 {/* Floating Interface Particles */}
                 <div className="absolute top-20 left-12 z-20 space-y-6">
                    {[
                      { id: "72N-12", title: "NELLAI EXPRESS", time: "08:30 AM" },
                      { id: "45J-99", title: "JUNCTION FLYER", time: "08:45 AM" }
                    ].map((card, i) => (
                       <div key={i} className={cn(
                         "p-8 glass-premium rounded-[2.5rem] w-80 animate-float shadow-2xl",
                         i === 1 ? "stagger-3 ml-20 mt-10" : ""
                       )}>
                          <div className="flex justify-between items-center mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-teal-400" />
                             </div>
                             <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-neon-pulse" />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.id}</p>
                          <h4 className="text-xl font-black text-white tracking-tight">{card.title}</h4>
                          <p className="text-xs font-bold text-teal-400/80 mt-2">Arriving at {card.time}</p>
                       </div>
                    ))}
                 </div>

                 <div className="absolute bottom-16 right-16 z-20 p-10 glass-premium rounded-[3rem] w-80 text-center animate-float-slow">
                    <Wifi className="w-10 h-10 mx-auto mb-6 text-teal-400 animate-neon-pulse" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">{t('neural_link_active')}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-4 font-medium">Platform-wide telemetry synchronization established across all mobile units.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LIVE STATS OVERVIEW --- */}
      <div className="bg-[#0a0d14] py-24 relative z-20 border-y border-white/5">
        <div className="section-container">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: "Network Health", value: "Optimal", icon: Activity, color: "text-emerald-500" },
                { label: "Live Buses", value: "248", icon: Bus, color: "text-teal-400" },
                { label: "Active Loops", value: "1,204", icon: Navigation, color: "text-blue-400" },
                { label: "Verified Nodes", value: "100%", icon: CheckCircle2, color: "text-emerald-400" }
              ].map((stat, i) => (
                <div key={i} className="p-8 glass-premium rounded-[3rem] text-center group hover:border-teal-500/30 transition-all">
                   <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6", stat.color)}>
                      <stat.icon className="w-7 h-7" />
                   </div>
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* --- FEATURE EXPERIENCE --- */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="section-container relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-8 italic">
                A NEW ERA OF <br/>
                <span className="text-teal-500">MOBILITY.</span>
              </h2>
              <div className="space-y-12">
                {[
                  { icon: Navigation, title: "Precision Radar", desc: "Military-grade telemetry tracking with 99.9% uptime and zero-latency updates." },
                  { icon: Clock, title: "Predictive Intelligence", desc: "AI-driven algorithms calculate ETAs based on live traffic density and driver feedback." },
                  { icon: Shield, title: "Trust Protocol", desc: "Every location update is cryptographicly verified by the driver console for absolute accuracy." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="w-16 h-16 rounded-[2rem] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 group-hover:bg-teal-500 transition-all">
                      <item.icon className="w-8 h-8 text-teal-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Visual */}
            <div className="lg:w-1/2 p-8 glass-premium rounded-[4rem] relative">
               <div className="absolute -top-12 -right-12 p-8 glass-premium rounded-full animate-float">
                  <Wifi className="w-10 h-10 text-teal-400" />
               </div>
               <div className="bg-slate-900 rounded-[3rem] p-4 border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-white/5">
                     <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Global Terminal View</span>
                     <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                     </div>
                  </div>
                  <div className="space-y-3 p-6">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="p-5 glass-premium rounded-2xl flex items-center justify-between border-white/5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                 <Bus className="w-5 h-5 text-teal-400" />
                              </div>
                              <div>
                                 <p className="text-xs font-black text-white">ROUTE 7{i}N</p>
                                 <p className="text-[10px] font-bold text-slate-500">JUNCTION • VANNARPETTAI</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-black text-emerald-400">{2 * i} MIN</p>
                              <p className="text-[10px] font-bold text-slate-600 uppercase">On Time</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 mesh-bg relative overflow-hidden">
        <div className="section-container relative z-10 text-center">
           <h2 className="text-6xl md:text-8xl font-black text-white tracking-widest italic mb-8">{t('hero_title_fast')}</h2>
           <p className="text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">Join the thousands of commuters moving smarter every day.</p>
           <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/auth?mode=register">
                <Button className="h-20 px-16 rounded-[2.5rem] bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-all shadow-glow-white">
                   Get Started
                </Button>
              </Link>
           </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

