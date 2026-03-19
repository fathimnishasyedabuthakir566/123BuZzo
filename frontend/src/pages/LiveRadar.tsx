import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import AllBusesMap from '@/components/map/AllBusesMap';
import { busService } from '@/services/busService';
import type { Bus, BusStatus } from '@/types';
import { Radar, Navigation, List, Filter, Search, Map as MapIcon, Info, Users, Clock, Bus as BusIcon, Activity, Zap, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { socketService } from '@/services/socketService';

const LiveRadar = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'delayed' | 'active'>('all');

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const data = await busService.getAllBuses(true);
                setBuses(data);
            } catch (error) {
                console.error('Error fetching buses:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBuses();

        socketService.connect();
        
        interface LocationPayload {
            busId: string;
            routeId: string;
            lat: number;
            lng: number;
            speed?: number;
            status?: BusStatus;
            crowdLevel?: "low" | "medium" | "high" | "full";
            isActive?: boolean;
            lastUpdated: string;
        }

        socketService.on('receive-location', (data: LocationPayload) => {
            setBuses(prev => prev.map(bus => {
                const busId = bus.id || bus._id;
                if (busId === data.busId || busId === data.routeId) {
                    return {
                        ...bus,
                        speed: data.speed ?? bus.speed,
                        location: {
                            lat: data.lat,
                            lng: data.lng,
                            lastUpdated: data.lastUpdated
                        },
                        status: data.status ?? bus.status,
                        crowdLevel: data.crowdLevel ?? bus.crowdLevel,
                        isActive: data.isActive ?? bus.isActive
                    };
                }
                return bus;
            }));
        });

        const interval = setInterval(fetchBuses, 60000);
        return () => {
            clearInterval(interval);
            socketService.off('receive-location');
        };
    }, []);

    const filteredBuses = buses.filter(bus => {
        const queryMatch = bus.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bus.busNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === 'all') return queryMatch;
        if (activeTab === 'delayed') return queryMatch && bus.status === 'delayed';
        if (activeTab === 'active') return queryMatch && bus.isActive;
        return queryMatch;
    });

    return (
        <Layout>
            <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row mesh-bg">
                {/* Tactical Sidebar */}
                <div className="w-full md:w-[450px] h-1/2 md:h-full glass-premium border-r border-white/5 flex flex-col shadow-2xl z-20 backdrop-blur-2xl">
                    <div className="p-10 border-b border-white/5 bg-slate-900/40">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] border border-teal-500/20 mb-4 backdrop-blur-md">
                                    <Radar className="w-3 h-3 animate-pulse" /> Neural Command
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Radar Feed</h1>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/5">
                                <Cpu className="w-6 h-6 text-teal-500 animate-pulse" />
                            </div>
                        </div>
                        
                        <div className="relative mb-8 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                            <input 
                                type="text"
                                placeholder="IDENTIFY UNIT OR NODE..."
                                className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 text-sm font-black text-white placeholder:text-slate-600 focus:border-teal-500/50 outline-none transition-all tracking-widest uppercase"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5">
                            {(['all', 'active', 'delayed'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab 
                                            ? "bg-teal-500 text-white shadow-glow" 
                                            : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {isLoading ? (
                            <div className="p-10 space-y-6">
                                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-[2.5rem] border border-white/5" />)}
                            </div>
                        ) : filteredBuses.length === 0 ? (
                            <div className="p-20 text-center">
                                <Search className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Signal Detected</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                {filteredBuses.map(bus => (
                                    <div 
                                        key={bus.id}
                                        onClick={() => setSelectedBus(bus)}
                                        className={cn(
                                            "p-8 rounded-[2.5rem] cursor-pointer transition-all border-2 group",
                                            selectedBus?.id === bus.id 
                                                ? "bg-teal-500/10 border-teal-500/50 shadow-glow" 
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-slate-900 text-teal-400 uppercase tracking-widest border border-teal-500/20">
                                                ID: {bus.busNumber}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {bus.isActive ? (
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-neon-pulse" /> Telemetry Locked
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Lost</span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-3 uppercase mb-1">
                                            {bus.name}
                                            {bus.status === 'delayed' && <ShieldAlert className="w-5 h-5 text-amber-500" />}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bus.routeFrom} <ArrowRight className="w-3 h-3 inline mx-1" /> {bus.routeTo}</p>
                                        
                                        {bus.location && bus.isActive && (
                                            <div className="mt-8 grid grid-cols-3 gap-3">
                                                <div className="bg-slate-900/50 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                                    <Zap className="w-4 h-4 text-teal-400 mb-1" />
                                                    <span className="text-[10px] font-black text-white uppercase">{bus.speed || 0} km/h</span>
                                                </div>
                                                <div className="bg-slate-900/50 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                                    <Clock className="w-4 h-4 text-amber-500 mb-1" />
                                                    <span className="text-[10px] font-black text-white uppercase">{bus.eta || 'LIVE'}</span>
                                                </div>
                                                <div className="bg-slate-900/50 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                                    <Users className="w-4 h-4 text-emerald-500 mb-1" />
                                                    <span className="text-[10px] font-black text-white uppercase">{bus.crowdLevel || 'OPT'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Command Map Area */}
                <div className="flex-1 relative h-1/2 md:h-full">
                    <AllBusesMap initialBuses={buses} />
                    
                    {/* Futuristic HUD Overlays */}
                    <div className="absolute inset-0 pointer-events-none border-[20px] border-slate-900/20">
                         <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-teal-500/30 rounded-tl-[3rem]" />
                         <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-teal-500/30 rounded-tr-[3rem]" />
                         <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-teal-500/30 rounded-bl-[3rem]" />
                         <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-teal-500/30 rounded-br-[3rem]" />
                    </div>

                    <div className="absolute top-10 right-10 z-[1000] flex flex-col gap-4">
                        <button className="w-16 h-16 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center border border-white/10 hover:bg-teal-500 hover:text-white transition-all pointer-events-auto shadow-glow">
                            <Navigation className="w-6 h-6" />
                        </button>
                        <button className="w-16 h-16 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all pointer-events-auto">
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Telemetry HUD */}
                    <div className="absolute bottom-10 left-10 z-[1000] flex gap-6 pointer-events-auto">
                        <div className="glass-premium rounded-[2.5rem] p-6 pr-10 border-white/10 flex items-center gap-6 shadow-2xl animate-float-slow">
                            <div className="w-16 h-16 rounded-3xl bg-teal-500 text-white flex items-center justify-center shadow-glow">
                                <Activity className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 leading-none">Global Active Fleet</p>
                                <p className="text-4xl font-black text-white tracking-tighter leading-none">{buses.filter(b => b.isActive).length}<span className="text-teal-500 text-lg"> units</span></p>
                            </div>
                        </div>
                        
                        <div className="glass-premium rounded-[2.5rem] p-6 pr-10 border-white/10 flex items-center gap-6 shadow-2xl animate-float">
                            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(245,158,11,0.3)]">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 leading-none">Corridor Deviations</p>
                                <p className="text-4xl font-black text-white tracking-tighter leading-none">{buses.filter(b => b.status === 'delayed').length}<span className="text-amber-500 text-lg"> alerts</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default LiveRadar;

