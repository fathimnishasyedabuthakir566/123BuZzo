import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import AllBusesMap from '@/components/map/AllBusesMap';
import { busService } from '@/services/busService';
import type { Bus } from '@/types';
import { Radar, Navigation, List, Filter, Search, Map as MapIcon, Info, Users, Clock, Bus as BusIcon } from 'lucide-react';
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

        // Join socket for real-time updates
        socketService.connect();
        
        socketService.on('receive-location', (data: any) => {
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

        const interval = setInterval(fetchBuses, 60000); // Slower polling as backup
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
            <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row bg-slate-50">
                {/* Sidebar */}
                <div className="w-full md:w-[400px] h-1/2 md:h-full bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
                    <div className="p-6 border-b border-slate-100">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 mb-4">
                            <Radar className="w-3 h-3 animate-pulse" /> Live Terminal Radar
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-4 text-gradient">Track All Buses</h1>
                        
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search bus number or route..."
                                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            {(['all', 'active', 'delayed'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab 
                                            ? "bg-white text-slate-800 shadow-sm" 
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl skeleton" />)}
                            </div>
                        ) : filteredBuses.length === 0 ? (
                            <div className="p-12 text-center">
                                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">No buses found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredBuses.map(bus => (
                                    <div 
                                        key={bus.id}
                                        onClick={() => setSelectedBus(bus)}
                                        className={cn(
                                            "p-5 hover:bg-slate-50 cursor-pointer transition-all border-l-4",
                                            selectedBus?.id === bus.id ? "border-primary bg-primary/5" : "border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                                                {bus.busNumber}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {bus.isActive ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-400">OFFLINE</span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-800 leading-tight mb-1">{bus.name}</h3>
                                        <p className="text-xs text-slate-400">{bus.routeFrom} → {bus.routeTo}</p>
                                        
                                        {bus.location && bus.isActive && (
                                            <div className="mt-4 grid grid-cols-3 gap-2">
                                                <div className="bg-white rounded-lg p-2 border border-slate-100 flex flex-col items-center">
                                                    <Navigation className="w-3 h-3 text-primary mb-1" />
                                                    <span className="text-[9px] font-black text-slate-800 uppercase">{bus.speed || 0} km/h</span>
                                                </div>
                                                <div className="bg-white rounded-lg p-2 border border-slate-100 flex flex-col items-center">
                                                    <Clock className="w-3 h-3 text-amber-500 mb-1" />
                                                    <span className="text-[9px] font-black text-slate-800 uppercase">{bus.eta || 'Calculating'}</span>
                                                </div>
                                                <div className="bg-white rounded-lg p-2 border border-slate-100 flex flex-col items-center">
                                                    <Users className="w-3 h-3 text-emerald-500 mb-1" />
                                                    <span className="text-[9px] font-black text-slate-800 uppercase">{bus.crowdLevel || 'Low'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative h-1/2 md:h-full">
                    <AllBusesMap initialBuses={buses} />
                    
                    {/* Floating Map Controls */}
                    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                        <button className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-600 hover:text-primary transition-all">
                            <MapIcon className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-600 hover:text-primary transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Stats overlay */}
                    <div className="absolute bottom-6 left-6 z-[1000] flex gap-4">
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/50 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <BusIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Buses</p>
                                <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">{buses.filter(b => b.isActive).length}</p>
                            </div>
                        </div>
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/50 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Delayed</p>
                                <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">{buses.filter(b => b.status === 'delayed').length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default LiveRadar;
