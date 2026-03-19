import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import {
    Bus as BusIcon,
    Clock,
    TrendingUp,
    AlertTriangle,
    History,
    Zap,
    Activity,
    Shield
} from 'lucide-react';
import type { Bus } from '@/types';
import { cn } from '@/lib/utils';

interface TripAnalyticsProps {
    buses: Bus[];
}

const TripAnalytics = ({ buses }: TripAnalyticsProps) => {
    // Generate mock analytics based on current buses
    const activeBusesCount = buses.filter(b => b.isActive).length;
    const delayedBusesCount = buses.filter(b => b.status === 'delayed').length;

    const radialData = [
        { name: 'Active', value: activeBusesCount, fill: '#10b981' },
        { name: 'Delayed', value: delayedBusesCount, fill: '#f59e0b' },
        { name: 'Total', value: buses.length, fill: '#3b82f6' },
    ];

    const hourlyActivityData = [
        { hour: '06:00', active: 5, efficiency: 98 },
        { hour: '08:00', active: 12, efficiency: 92 },
        { hour: '10:00', active: 15, efficiency: 85 },
        { hour: '12:00', active: 10, efficiency: 94 },
        { hour: '14:00', active: 14, efficiency: 88 },
        { hour: '16:00', active: 18, efficiency: 82 },
        { hour: '18:00', active: 16, efficiency: 90 },
        { hour: '20:00', active: 8, efficiency: 96 },
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* --- TOP PERFORMANCE METRICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AnalyticsCard
                    title="TELEMETRY ACTIVE"
                    value={activeBusesCount.toString()}
                    icon={Activity}
                    trend="0.2ms Latency"
                    color="cyan"
                    subtitle="Live Units"
                />
                <AnalyticsCard
                    title="FLEET EFFICIENCY"
                    value="94%"
                    icon={Zap}
                    trend="+2.4% vs Avg"
                    color="teal"
                    subtitle="Neural ETA Score"
                />
                <AnalyticsCard
                    title="SYSTEM ALERTS"
                    value={delayedBusesCount.toString()}
                    icon={AlertTriangle}
                    trend="Requires Attention"
                    color="amber"
                    subtitle="Active Notices"
                />
                <AnalyticsCard
                    title="HISTORICAL NODES"
                    value="1.2k"
                    icon={History}
                    trend="Stable"
                    color="indigo"
                    subtitle="Verified Trips"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Efficiency Graph */}
                <div className="lg:col-span-2 glass-premium p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-teal-400" />
                                Efficiency Radar
                            </h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Hourly Telemetry Performance</p>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                             <span className="text-[10px] font-black text-teal-400 tracking-widest">LIVE SYNC</span>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyActivityData}>
                                <defs>
                                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: '#0f172a', 
                                        borderRadius: '20px', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                        color: '#fff'
                                    }}
                                />
                                <Area type="monotone" dataKey="efficiency" stroke="#14b8a6" strokeWidth={4} fillOpacity={1} fill="url(#colorEff)" />
                                <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Radial */}
                <div className="glass-premium p-10 rounded-[3rem] border-white/5 flex flex-col items-center">
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase italic mb-8 w-full text-center">Fleet Status</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart innerRadius="30%" outerRadius="100%" data={radialData} startAngle={180} endAngle={0}>
                                <RadialBar
                                    background={{ fill: 'rgba(255,255,255,0.05)' }}
                                    dataKey="value"
                                    cornerRadius={20}
                                />
                                <Tooltip />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
                            <span className="text-4xl font-black text-white">{buses.length}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Fleet</span>
                        </div>
                    </div>
                    
                    <div className="w-full space-y-4 mt-8">
                       {radialData.map((d, i) => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                               <div className="flex items-center gap-3">
                                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}</span>
                               </div>
                               <span className="text-sm font-black text-white">{d.value} Units</span>
                           </div>
                       ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface AnalyticsCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend: string;
    color: 'cyan' | 'teal' | 'amber' | 'indigo';
    subtitle: string;
}

const AnalyticsCard = ({ title, value, icon: Icon, trend, color, subtitle }: AnalyticsCardProps) => {
    const colorVariants = {
        cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-cyan-500/10',
        teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-teal-500/10',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/10',
    };

    return (
        <div className={cn(
            "glass-premium p-8 rounded-[2.5rem] border group hover:scale-105 transition-all duration-500",
            colorVariants[color]
        )}>
            <div className="flex items-center justify-between mb-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transition-transform group-hover:rotate-12")}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</p>
                    <p className="text-xs font-bold text-white mt-1">{subtitle}</p>
                </div>
            </div>
            <div className="text-5xl font-black text-white tracking-tighter mb-2">{value}</div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">{trend}</p>
        </div>
    );
};

export default TripAnalytics;

