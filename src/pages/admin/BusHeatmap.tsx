import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { busService } from '@/services/busService';
import type { Bus } from '@/types';
import { Layout } from '@/components/layout';
import { Flame, Info, Filter, RefreshCw, BarChart3, TrendingUp, Users, Map as MapIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BusHeatmap = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        highDensity: 0,
        mediumDensity: 0,
        lowDensity: 0,
        totalActive: 0
    });

    const center: [number, number] = [8.7139, 77.7567]; // Tirunelveli

    const fetchHeatmapData = async () => {
        try {
            const data = await busService.getAllBuses(true);
            setBuses(data);
            
            // Calculate pseudo-stats for density
            const active = data.filter(b => b.isActive);
            setStats({
                totalActive: active.length,
                highDensity: active.filter(b => b.crowdLevel === 'high' || b.crowdLevel === 'full').length,
                mediumDensity: active.filter(b => b.crowdLevel === 'medium').length,
                lowDensity: active.filter(b => b.crowdLevel === 'low').length,
            });
        } catch (error) {
            console.error('Heatmap fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHeatmapData();
        const interval = setInterval(fetchHeatmapData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 mb-3">
                            <Flame className="w-3 h-3 animate-pulse" /> Live Pulse
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Terminal Heatmap</h1>
                        <p className="text-slate-500 mt-1">Real-time bus density and operational hotspot analysis</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 font-bold" onClick={fetchHeatmapData}>
                            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} /> Refresh
                        </Button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
                    {/* Left Column: Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
                            <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" /> Metrics Overview
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">High Congestion</span>
                                        <span className="text-xs font-black text-rose-500">{Math.round((stats.highDensity / stats.totalActive) * 100 || 0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${(stats.highDensity / stats.totalActive) * 100}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Medium Flow</span>
                                        <span className="text-xs font-black text-amber-500">{Math.round((stats.mediumDensity / stats.totalActive) * 100 || 0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(stats.mediumDensity / stats.totalActive) * 100}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Low Density</span>
                                        <span className="text-xs font-black text-emerald-500">{Math.round((stats.lowDensity / stats.totalActive) * 100 || 0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(stats.lowDensity / stats.totalActive) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                           <div className="relative z-10">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Peak Services</p>
                                <p className="text-4xl font-black tracking-tighter mb-4">{stats.totalActive} Active</p>
                                <p className="text-sm text-white/70 leading-relaxed font-medium">Buses are currently operating at {(stats.highDensity / stats.totalActive) > 0.3 ? 'high' : 'normal'} capacity across the network.</p>
                           </div>
                           <BarChart3 className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>

                    {/* Right Column: Heatmap Map */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[3rem] p-3 shadow-2xl border border-slate-100 h-[600px] relative overflow-hidden">
                            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {buses.map(bus => {
                                    if (!bus.location || !bus.isActive) return null;
                                    
                                    const density = bus.crowdLevel === 'high' || bus.crowdLevel === 'full' ? 'rose' : 
                                                   bus.crowdLevel === 'medium' ? 'orange' : 'emerald';
                                    
                                    const colors = {
                                        rose: { fill: '#f43f5e', border: '#e11d48' },
                                        orange: { fill: '#f97316', border: '#ea580c' },
                                        emerald: { fill: '#10b981', border: '#059669' }
                                    }[density];

                                    return (
                                        <div key={bus.id}>
                                            <CircleMarker 
                                                center={[bus.location.lat, bus.location.lng]}
                                                radius={40}
                                                pathOptions={{ 
                                                    fillColor: colors.fill, 
                                                    fillOpacity: 0.15,
                                                    color: 'transparent',
                                                    weight: 0
                                                }}
                                            />
                                            <CircleMarker 
                                                center={[bus.location.lat, bus.location.lng]}
                                                radius={20}
                                                pathOptions={{ 
                                                    fillColor: colors.fill, 
                                                    fillOpacity: 0.3,
                                                    color: 'transparent'
                                                }}
                                            />
                                            <CircleMarker 
                                                center={[bus.location.lat, bus.location.lng]}
                                                radius={8}
                                                pathOptions={{ 
                                                    fillColor: colors.fill, 
                                                    fillOpacity: 0.8,
                                                    color: '#fff',
                                                    weight: 2
                                                }}
                                            >
                                                <Popup className="bus-heatmap-popup">
                                                    <div className="p-2">
                                                        <h4 className="font-bold text-slate-800">{bus.busNumber}</h4>
                                                        <p className="text-[10px] text-slate-500 mb-2">{bus.name}</p>
                                                        <div className="flex items-center gap-2">
                                                           <Users className="w-3 h-3 text-primary" />
                                                           <span className="text-[10px] font-black uppercase text-slate-700">{bus.crowdLevel} crowd</span>
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        </div>
                                    );
                                })}
                            </MapContainer>

                            {/* Legend Overlay */}
                            <div className="absolute top-8 right-8 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 space-y-3">
                                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Density Legend</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                                    <span className="text-xs font-bold text-slate-700">Critical Congestion</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span className="text-xs font-bold text-slate-700">Moderate Load</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-slate-700">Smooth Flow</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Analytics Bottom Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                            <MapIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Coverage</p>
                            <p className="text-2xl font-black text-slate-800">12 Routes</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fleet</p>
                            <p className="text-2xl font-black text-slate-800">{stats.totalActive} Buses</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                            <Info className="w-8 h-8 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporting</p>
                            <p className="text-2xl font-black text-slate-800">Operational</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BusHeatmap;
