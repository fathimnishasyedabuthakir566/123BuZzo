import { useState, useEffect } from 'react';
import { Radar, Wifi, Zap, Navigation, Activity, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProximityScan = () => {
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'LOCKED'>('IDLE');
    const [nearbyCount, setNearbyCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Simulate background scanning
        const scanTimeout = setTimeout(() => {
            setIsVisible(true);
            setStatus('SCANNING');
            
            setTimeout(() => {
                setStatus('LOCKED');
                setNearbyCount(Math.floor(Math.random() * 3) + 1);
            }, 3000);
        }, 2000);

        return () => clearTimeout(scanTimeout);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-10 left-10 z-[100] group">
            <div className={cn(
                "glass-premium rounded-[2.5rem] p-6 pr-10 border-white/10 flex items-center gap-6 shadow-2xl transition-all duration-700 transform",
                status === 'LOCKED' ? "translate-y-0 opacity-100" : "translate-y-4 opacity-80"
            )}>
                <div className="relative">
                    <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500",
                        status === 'SCANNING' ? "bg-teal-500/20 rotate-180" : "bg-teal-500 text-slate-950 shadow-glow"
                    )}>
                        {status === 'SCANNING' ? (
                            <Radar className="w-8 h-8 text-teal-400 animate-spin" />
                        ) : (
                            <Navigation className="w-8 h-8" />
                        )}
                    </div>
                    {status === 'LOCKED' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-950">
                            {nearbyCount}
                        </div>
                    )}
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            status === 'SCANNING' ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                        )} />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] leading-none">
                            {status === 'SCANNING' ? "Neural Scan Active" : "Proximity Lock"}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-white tracking-tighter leading-none italic uppercase">
                            {status === 'SCANNING' ? "Searching..." : `${nearbyCount} Units Near`}
                        </p>
                    </div>
                    {status === 'LOCKED' && (
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5">
                               <Wifi className="w-3 h-3 text-teal-500" />
                               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">5G Neural Hub</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                               <Zap className="w-3 h-3 text-amber-500" />
                               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Low Latency</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl">
                    <h5 className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Tactical Summary
                    </h5>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                           <span className="text-slate-500 uppercase font-black tracking-widest">Detection Confidence</span>
                           <span className="text-white font-black">99.2%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full w-[99%] bg-teal-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProximityScan;
