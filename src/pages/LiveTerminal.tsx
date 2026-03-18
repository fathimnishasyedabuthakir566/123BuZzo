import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { busService } from '@/services/busService';
import { socketService } from '@/services/socketService';
import type { Bus } from '@/types';
import { 
    Clock, 
    Bus as BusIcon, 
    Navigation, 
    Users, 
    AlertCircle, 
    Search,
    Wifi,
    MapPin,
    ArrowRight,
    Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const LiveTerminal = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState({ temp: 32, condition: 'Clear Skies' });

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

        socketService.on('receive-location', (data: any) => {
            setBuses(prev => prev.map(bus => {
                const busId = bus.id || bus._id;
                if (busId === data.busId || busId === data.routeId) {
                    return {
                        ...bus,
                        location: {
                            lat: data.lat,
                            lng: data.lng,
                            lastUpdated: data.lastUpdated || new Date().toISOString()
                        },
                        speed: data.speed ?? bus.speed,
                        status: data.status ?? bus.status,
                        crowdLevel: data.crowdLevel ?? bus.crowdLevel,
                        isActive: data.isActive ?? true,
                        currentStop: data.currentStop ?? bus.currentStop,
                        nextStop: data.nextStop ?? bus.nextStop
                    } as Bus;
                }
                return bus;
            }));
        });

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const poll = setInterval(fetchBuses, 30000);

        return () => {
            clearInterval(timer);
            clearInterval(poll);
            socketService.off('receive-location');
        };
    }, []);

    const filteredBuses = buses.filter(bus => 
        bus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.routeTo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeBuses = filteredBuses.filter(b => b.isActive);
    const scheduledBuses = filteredBuses.filter(b => !b.isActive);

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen bg-[#07090c] text-slate-300 font-mono overflow-hidden flex flex-col">
                {/* Board Header with Weather Ticker */}
                <div className="w-full bg-amber-500 text-black py-1 overflow-hidden whitespace-nowrap">
                   <div className="animate-scroll inline-block">
                      <span className="mx-8 font-black uppercase text-[10px] tracking-widest">
                         [ WEATHER ADVISORY: {weather.temp}°C {weather.condition} ] • [ NETWORK STATUS: OPTIMAL ] • [ TERMINAL A: OPERATIONAL ] • [ ALL ROUTES TRACKING LIVE ] • [ SYSTEM UPDATED: {format(currentTime, 'HH:mm')} ]
                      </span>
                      <span className="mx-8 font-black uppercase text-[10px] tracking-widest">
                         [ WEATHER ADVISORY: {weather.temp}°C {weather.condition} ] • [ NETWORK STATUS: OPTIMAL ] • [ TERMINAL A: OPERATIONAL ] • [ ALL ROUTES TRACKING LIVE ] • [ SYSTEM UPDATED: {format(currentTime, 'HH:mm')} ]
                      </span>
                   </div>
                </div>

                <header className="p-8 bg-slate-900/20 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                            <BusIcon className="w-8 h-8 text-amber-500 animate-bus-tilt" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-widest uppercase text-glow">Live Terminal Board</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-2 text-emerald-500 text-xs font-black">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-dot shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> NETWORK LIVE
                                </span>
                                <span className="w-px h-3 bg-white/10" />
                                <span className="text-amber-500/70 text-xs font-black uppercase tracking-widest">
                                    {format(currentTime, 'EEEE, MMMM do')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-5xl font-black text-white tracking-tighter transition-all tabular-nums text-glow">
                                {format(currentTime, 'HH:mm:ss')}
                            </p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 text-terminal-amber">Local Terminal UTC+5:30</p>
                        </div>
                        
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="SEARCH ROUTE / BUS..."
                                className="h-14 w-64 bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-amber-500/40 outline-none transition-all placeholder:text-slate-700 uppercase"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Main Board Content */}
                <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4">
                    {/* Left: Departures Board */}
                    <div className="lg:col-span-3 border-r border-white/5 overflow-y-auto custom-terminal-scrollbar">
                        <div className="p-1">
                            <table className="w-full text-left border-separate border-spacing-y-2 px-4 pb-12">
                                <thead>
                                    <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Bus No</th>
                                        <th className="px-6 py-4">Destination</th>
                                        <th className="px-6 py-4">Current Location</th>
                                        <th className="px-6 py-4">ETA</th>
                                        <th className="px-6 py-4 text-right pr-12">Load</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeBuses.map((bus) => (
                                        <tr key={bus.id} className="group bg-slate-900/30 hover:bg-slate-800/50 transition-all border border-white/5 rounded-xl cursor-pointer">
                                            <td className="px-6 py-6 rounded-l-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">ON-TIME</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-black text-amber-500 text-lg">
                                                {bus.busNumber}
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-white text-lg font-black uppercase tracking-tight">{bus.routeTo}</span>
                                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">VIA {bus.via?.[0] || 'DIRECT'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-xs font-black uppercase">{bus.currentStop || 'Departing'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-amber-500/50" />
                                                    <span className="text-xl font-black text-white tabular-nums">{bus.eta || 'LIVE'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 rounded-r-2xl text-right pr-12">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase border",
                                                    bus.crowdLevel === 'high' || bus.crowdLevel === 'full' 
                                                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                                                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                )}>
                                                    <Users className="w-3 h-3" />
                                                    {bus.crowdLevel || 'Low'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Scheduled Divider */}
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-px bg-white/5 flex-1" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Scheduled Services</span>
                                                <div className="h-px bg-white/5 flex-1" />
                                            </div>
                                        </td>
                                    </tr>

                                    {scheduledBuses.map((bus) => (
                                        <tr key={bus.id} className="opacity-40 hover:opacity-100 transition-opacity">
                                            <td className="px-6 py-4">
                                                <span className="text-slate-500 text-xs font-black uppercase tracking-widest">SCHEDULED</span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-400">
                                                {bus.busNumber}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 font-bold uppercase text-sm">
                                                {bus.routeTo}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-xs uppercase font-bold">
                                                Not In Service
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-xs uppercase font-bold">
                                                -- : --
                                            </td>
                                            <td className="px-6 py-4 text-right pr-12 text-slate-600 text-xs uppercase font-bold">
                                                N/A
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Live Intel / Alerts */}
                    <div className="bg-black/20 p-8 space-y-12 overflow-y-auto">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center justify-between">
                                Fleet Intel
                                <Gauge className="w-4 h-4 text-amber-500" />
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                    <p className="text-2xl font-black text-white">{activeBuses.length}</p>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Live Fleet</p>
                                </div>
                                <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                    <p className="text-2xl font-black text-white">{filteredBuses.length}</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Routes</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center justify-between">
                                Network Alerts
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse" />
                                    <div>
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-tight">Congestion Alert</p>
                                        <p className="text-xs text-white/70 mt-1 font-bold">Heavier traffic detected near Main Junction. Some delays expected.</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-tight">Weather Status</p>
                                        <p className="text-xs text-white/70 mt-1 font-bold">Clear skies across all reporting sectors. Visibility 100%.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <Wifi className="w-12 h-12 mb-4" />
                                    <h4 className="text-xl font-black tracking-tighter uppercase leading-none mb-2">Driver Sync</h4>
                                    <p className="text-xs font-bold leading-relaxed opacity-80">Drivers: Switch tracking ON to appear on the terminal board in real-time.</p>
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-black/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                .custom-terminal-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-terminal-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-terminal-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .text-terminal-amber {
                    color: #f59e0b;
                    text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
                }
            `}</style>
        </Layout>
    );
};

export default LiveTerminal;
