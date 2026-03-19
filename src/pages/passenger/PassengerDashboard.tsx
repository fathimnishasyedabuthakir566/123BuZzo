import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Bus, MapPin, Clock, Bell, Star, ArrowRight, Ticket, Activity, ShieldCheck, Zap, Cpu, User as UserIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { busService } from "@/services/busService";
import type { Bus as BusType } from "@/types";
import DigitalPass from "@/components/passenger/DigitalPass";
import { cn } from "@/lib/utils";

const PassengerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [recentBuses, setRecentBuses] = useState<BusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'pass'>('activity');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      try {
        const buses = await busService.getAllBuses();
        setRecentBuses(buses.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: "Saved Routes", value: "3", icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Recent Trips", value: "12", icon: Clock, color: "text-teal-500", bg: "bg-teal-500/10" },
    { label: "Alerts Now", value: "2", icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Member Status", value: "Premium", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <Layout>
      <div className="section-container py-12">
        {/* Welcome Header */}
        <div className="relative mb-12 p-10 rounded-[3rem] bg-slate-900 border border-white/5 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_0%,rgba(20,184,166,0.1),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Telemetry Connection Stable
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-none italic">
                MOVE <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">WITHOUT LIMITS.</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Welcome back, {user?.name?.split(' ')[0] || 'Passenger'}. Your neural transit hub is synced and ready with live telemetry from 450+ fleet units.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
               <Link to="/buses">
                 <button className="h-16 px-10 bg-teal-500 hover:bg-teal-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-glow transition-all active:scale-95 flex items-center gap-3">
                   <Activity className="w-5 h-5" /> Launch Radar
                 </button>
               </Link>
               <Link to="/profile">
                 <button className="h-16 px-10 glass-premium border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95 flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5" /> Identity
                 </button>
               </Link>
            </div>
          </div>
        </div>

        {/* --- DYNAMIC CONTENT CONTROLS --- */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
           <button 
             onClick={() => setActiveTab('activity')}
             className={cn(
               "h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
               activeTab === 'activity' ? "bg-slate-900 text-white shadow-xl" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
             )}
           >
              Live Activity
           </button>
           <button 
             onClick={() => setActiveTab('pass')}
             className={cn(
               "h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3",
               activeTab === 'pass' ? "bg-teal-500 text-white shadow-glow" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
             )}
           >
              <Ticket className="w-4 h-4" /> Digital Boarding Pass
           </button>
        </div>

        {activeTab === 'activity' ? (
          <div className="animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-soft hover:shadow-2xl transition-all animate-scale-in group" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className={`w-14 h-14 ${stat.bg} rounded-3xl flex items-center justify-center mb-6 border border-white/5`}>
                      <stat.icon className={`w-7 h-7 ${stat.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-10">
                {/* Active Buses */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Live Telemetry</h2>
                      <Link to="/buses" className="text-[10px] font-black text-teal-600 hover:tracking-widest transition-all uppercase flex items-center gap-2">
                        View Global Network <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                      {isLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[3rem]" />)
                      ) : (
                        recentBuses.map((bus, i) => (
                          <div key={bus.id} className="group bg-white border border-slate-100 p-10 rounded-[3rem] shadow-soft card-hover-premium cursor-pointer relative overflow-hidden">
                            <div className="flex justify-between items-start mb-8">
                              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                                <Bus className="w-7 h-7 text-white animate-bus-move" />
                              </div>
                              <span className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                bus.status === 'on-time' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                              )}>
                                {bus.status}
                              </span>
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 group-hover:text-teal-600 transition-colors tracking-tighter mb-2 uppercase">{bus.name}</h4>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{bus.routeFrom} <ArrowRight className="w-3 h-3 inline mx-1" /> {bus.routeTo}</p>
                            
                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <Clock className="w-4 h-4 text-teal-500" />
                                 <span>ETA {Array.isArray(bus.scheduledTime) ? (bus.scheduledTime[0] || 'LIVE') : (bus.scheduledTime || 'LIVE')}</span>
                               </div>
                               <Zap className="w-4 h-4 text-teal-500 animate-neon-pulse" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-teal-600 rounded-[3rem] p-10 text-white shadow-[0_30px_60px_-15px_rgba(20,184,166,0.3)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.2),transparent_40%)]" />
                      <div className="relative z-10">
                        <Bell className="w-10 h-10 mb-8 text-teal-200" />
                        <h3 className="text-3xl font-black mb-6 italic tracking-tighter">NETWORK ALERTS</h3>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 mb-8">
                          <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-3">System Advisory</p>
                          <p className="font-bold text-white leading-relaxed">
                            Junction corridor reporting high traffic density. Neural ETAs recalibrating (+12m delay predicted).
                          </p>
                        </div>
                        <button className="w-full bg-white text-teal-700 font-black h-16 rounded-2xl uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
                          Live Intel Board
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-soft">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                           <Activity className="w-4 h-4 text-teal-500" /> Smart Forecast
                         </h3>
                         <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-neon-pulse" />
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center shadow-2xl">
                            <span className="text-4xl text-white">🌤️</span>
                         </div>
                         <div>
                            <p className="text-5xl font-black text-slate-900 tracking-tight">32°C</p>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Sky clear • Good visibility</p>
                         </div>
                      </div>
                    </div>

                    {/* Neural Route Prediction */}
                    <div className="glass-premium rounded-[3rem] p-10 border-white/5 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                          <Cpu className="w-16 h-16 text-teal-500" />
                       </div>
                       <div className="relative z-10">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">AI Mission Predictor</h4>
                          <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-3 italic">Likely Objective:</p>
                          <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Central Market</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-10 decoration-teal-500/30 underline underline-offset-4 decoration-2">Based on Monday 09:00 Pattern</p>
                          
                          <div className="space-y-4 mb-10">
                             <div>
                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                   <span>Confidence Index</span>
                                   <span className="text-teal-500">92%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full w-[92%] bg-teal-500 shadow-glow" />
                                </div>
                             </div>
                          </div>

                          <button className="h-14 w-full bg-slate-900 rounded-2xl border border-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:border-teal-500/30 transition-all active:scale-95">
                             Recalibrate Neural Engine
                          </button>
                       </div>
                    </div>
                </div>
              </div>
          </div>
        ) : (
          <div className="animate-fade-in flex justify-center py-20">
             <DigitalPass userName={user?.name || 'Passenger'} userId={user?._id || 'user_id'} />
          </div>
        )}

        {/* Floating View Details Button */}
        <button 
          onClick={() => setShowDetails(true)}
          className="fixed bottom-8 right-8 z-[90] h-14 px-6 bg-slate-900 border border-teal-500/30 text-white rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group"
        >
          <UserIcon className="w-5 h-5 text-teal-400 group-hover:rotate-12 transition-transform" />
          <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">View Details</span>
        </button>

        {/* Account Activity Modal */}
        {showDetails && user && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowDetails(false)}>
            <div className="bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
               <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     <Activity className="w-5 h-5 text-teal-500" /> Account Telemetry
                  </h3>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-white" onClick={() => setShowDetails(false)}>
                     <X className="w-5 h-5" />
                  </Button>
               </div>
               <div className="p-8 space-y-8">
                 {/* Registration & Profile Data */}
                 <div className="p-6 rounded-2xl bg-teal-500/5 border border-teal-500/10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-2xl border border-teal-500/20 shadow-inner">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xl">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <div className="flex gap-3 mt-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-md border border-teal-500/20">
                           Role: {user.role}
                         </span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 px-3 py-1 rounded-md border border-white/10">
                           Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                         </span>
                      </div>
                    </div>
                 </div>

                 {/* Login History */}
                 <div>
                    <h4 className="font-bold mb-4 border-b border-white/5 pb-2 text-white">Recent Synchronization Log</h4>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {user.loginHistory && user.loginHistory.length > 0 ? (
                        user.loginHistory.slice().reverse().map((hist: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-4 border border-white/5 rounded-xl text-sm bg-black/20 hover:border-white/10 transition-colors">
                            <div>
                              <p className="font-bold text-slate-300">{new Date(hist.timestamp).toLocaleString()}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                 <span className="opacity-50">📡</span> {hist.device || 'Unknown Client'}
                              </p>
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest bg-slate-800 text-teal-400 px-3 py-1.5 rounded-md border border-white/5 shadow-inner">
                               {hist.ip || 'Unknown IP'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-8 bg-black/20 rounded-xl border border-white/5">
                           <p className="text-sm font-bold text-slate-400">No telemetry records available.</p>
                        </div>
                      )}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PassengerDashboard;

