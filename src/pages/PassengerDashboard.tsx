import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Bus, MapPin, Clock, Bell, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { busService } from "@/services/busService";
import type { Bus as BusType } from "@/types";

const PassengerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [recentBuses, setRecentBuses] = useState<BusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    { label: "Alerts", value: "2", icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pass Level", value: "Gold", icon: Star, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <Layout>
      <div className="section-container py-12">
        {/* Welcome Header */}
        <div className="relative mb-12 p-10 rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-100/5 rounded-full blur-[80px] -ml-32 -mb-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-teal-400 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Passenger Portal</p>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                Welcome back, <span className="text-teal-400">{user?.name?.split(' ')[0] || 'Passenger'}</span>!
              </h1>
              <p className="text-slate-400 max-w-lg font-medium">
                Your daily transit hub is ready. Track your favorite buses and manage your commute from one place.
              </p>
            </div>
            
            <div className="flex gap-4">
               <Link to="/buses">
                 <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-teal-500/20">
                   Track Now
                 </Button>
               </Link>
               <Link to="/profile">
                 <Button variant="outline" className="border-slate-700 text-white font-bold h-14 px-8 rounded-2xl hover:bg-slate-800 transition-all">
                   My Profile
                 </Button>
               </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-soft hover:shadow-lg transition-all animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Active Buses */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Buses on Your Routes</h2>
                <Link to="/buses" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {isLoading ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2.5rem]" />)
                ) : (
                  recentBuses.map((bus, i) => (
                    <div key={bus.id} className="group bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-soft card-hover-premium cursor-pointer">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                          <Bus className="w-6 h-6 text-white animate-bus-tilt" />
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          bus.status === 'on-time' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {bus.status}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight mb-1">{bus.name}</h4>
                      <p className="text-slate-500 text-sm font-medium mb-6">{bus.routeFrom} → {bus.routeTo}</p>
                      
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                           <Clock className="w-4 h-4 text-teal-500" />
                           <span>Every {bus.scheduledTime[0]?.split(':')[0] || '30'} mins</span>
                         </div>
                         <div className="flex items-center gap-1 text-[10px] font-black text-teal-600 uppercase tracking-widest">
                           Track <ArrowRight className="w-3 h-3" />
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Trip Recommendations Section */}
              <div className="mt-12 p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-inner">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Personalized Recommendations</h2>
                 <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                       <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-2 block">Top Rated</span>
                       <h5 className="font-bold text-slate-900">Nellai Express (Chennai Route)</h5>
                       <p className="text-xs text-slate-500 mt-1">98% punctuality record this week</p>
                    </div>
                    <div className="flex-1 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                       <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2 block">Less Crowded</span>
                       <h5 className="font-bold text-slate-900">Morning SFS (Madurai Route)</h5>
                       <p className="text-xs text-slate-500 mt-1">Typical occupancy: 40% between 8-10 AM</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Sidebar Info */}
           <div className="space-y-8">
              <div className="bg-teal-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-teal-600/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <Bell className="w-10 h-10 mb-6 text-teal-200" />
                  <h3 className="text-2xl font-black mb-4 text-white tracking-tight">Transit Alerts</h3>
                  <p className="text-teal-500 bg-white/90 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block mb-4">Urgent Update</p>
                  <p className="text-teal-500 font-medium leading-relaxed bg-white/95 p-6 rounded-2xl shadow-lg mb-8">
                    Construction on Main St. may cause 10-15 min delays for all routes near Junction.
                  </p>
                  <Button className="w-full bg-teal-800 hover:bg-teal-900 text-white border-none font-bold rounded-2xl h-14 uppercase tracking-widest text-xs">
                    View Live Updates
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-soft">
                <h3 className="text-lg font-black mb-6 text-slate-900 tracking-tight flex items-center justify-between">
                  Live Weather
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal Transit</span>
                </h3>
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-lg transform -rotate-3">
                      <span className="text-3xl animate-bus-tilt">🌤️</span>
                   </div>
                   <div>
                      <p className="text-3xl font-black text-slate-900 tabular-nums">32°C</p>
                      <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partly Cloudy</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl">
                 <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Quick Actions</h4>
                 <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-between border-slate-800 hover:bg-slate-800 text-white rounded-xl h-12">
                       <span>Scan QR Ticket</span>
                       <ArrowRight className="w-4 h-4 opacity-50" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between border-slate-800 hover:bg-slate-800 text-white rounded-xl h-12">
                       <span>Report Issue</span>
                       <ArrowRight className="w-4 h-4 opacity-50" />
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default PassengerDashboard;
