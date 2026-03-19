import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, ArrowRight, Navigation, Gauge, ChevronRight, Share2, Info, Users } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BusStatus } from "@/types";

interface BusCardProps {
  id: string;
  name: string;
  routeFrom: string;
  routeTo: string;
  status: BusStatus;
  eta?: string;
  lastUpdate?: string;
  currentLocation?: string;
  scheduledTime: string | string[];
  platformNumber?: number;
  className?: string;
  speed?: number;
  nextStop?: string;
  availableSeats?: number;
  capacity?: number;
  isActive?: boolean;
  intermediateStops?: { name: string, order: number }[];
  currentStop?: string;
  crowdLevel?: "low" | "medium" | "high" | "full";
}

const BusCard = ({
  id,
  name,
  routeFrom,
  routeTo,
  status,
  eta,
  lastUpdate,
  currentLocation,
  scheduledTime,
  platformNumber,
  className,
  speed,
  nextStop,
  availableSeats,
  capacity = 45,
  isActive,
  intermediateStops = [],
  currentStop,
  crowdLevel
}: BusCardProps) => {
  const displayScheduledTime = Array.isArray(scheduledTime) ? scheduledTime[0] : scheduledTime;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: `Track ${name}`, url: `${window.location.origin}/bus/${id}` });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/bus/${id}`);
    }
  };

  const isLive = isActive || status === 'active' || status === 'on-route';

  const crowdConfig = {
    low: { label: 'Low', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    medium: { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    high: { label: 'High', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
    full: { label: 'Full', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' }
  };

  const currentCrowd = crowdConfig[crowdLevel || (availableSeats ? (availableSeats < 10 ? 'full' : (availableSeats < 25 ? 'medium' : 'low')) : 'low')];

  const statusColors = {
    active: "bg-emerald-500 text-white",
    'on-route': "bg-blue-500 text-white",
    delayed: "bg-amber-500 text-white",
    inactive: "bg-slate-400 text-white",
    completed: "bg-slate-900 text-white"
  };

  // Calculate progress percentage based on stops
  const progressPercentage = (() => {
    if (!isLive) return 0;
    if (status === 'completed') return 100;
    if (!intermediateStops || intermediateStops.length <= 1) return 0;
    
    const currentStopObj = intermediateStops.find(s => s.name === currentStop);
    if (!currentStopObj) return 10; // Baseline for active

    const totalStops = intermediateStops.length;
    const stopsPassed = currentStopObj.order;
    return Math.min(95, Math.round((stopsPassed / totalStops) * 100));
  })();

  return (
    <div className={cn("block group relative", className)}>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden group/card p-6">
        {/* Top Header Row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/card:scale-110 duration-500",
                isLive ? "bg-slate-900 shadow-slate-200" : "bg-slate-100"
            )}>
              <Bus className={cn(
                "w-7 h-7",
                isLive ? "text-white animate-bus-move" : "text-slate-400"
              )} />
            </div>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter truncate max-w-[150px]">
                    {name}
                  </h3>
                  <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", statusColors[status] || statusColors.inactive)}>
                    {status.replace('-', ' ')}
                  </div>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                  {platformNumber ? `Platform ${platformNumber}` : 'Departing'} <ChevronRight className="w-3 h-3" /> {id.substring(0, 4)}
               </p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-sm font-black text-slate-400 leading-none mb-1">DEPART</p>
             <p className="text-lg font-black text-slate-900 tracking-tighter">{displayScheduledTime}</p>
          </div>
        </div>

        {/* Route Details */}
        <div className="relative mb-6 p-4 rounded-3xl bg-slate-50 border border-slate-100/50">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Source</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{routeFrom}</p>
                </div>
                <div className="flex flex-col items-center px-2">
                    <div className="w-8 h-0.5 bg-slate-200 relative">
                        <div className={cn("absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full", isLive ? "bg-primary animate-pulse" : "bg-slate-300")} style={{ left: isLive ? '40%' : '0%' }} />
                    </div>
                </div>
                <div className="flex-1 min-w-0 text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Dest</p>
                    <p className="text-xs font-black text-primary truncate">{routeTo}</p>
                </div>
            </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Gauge className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Speed</p>
                   <p className="text-xs font-black text-slate-800">{speed || '0'} KM/H</p>
                </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", currentCrowd.bg, currentCrowd.text)}>
                    <Users className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Crowd</p>
                   <p className={cn("text-xs font-black", currentCrowd.text)}>{currentCrowd.label}</p>
                </div>
            </div>
        </div>

        {/* Next Stop & Progress */}
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" /> Next Stop
                </p>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{eta || 'Calculating...'}</p>
            </div>
            <p className="text-sm font-black text-slate-800 uppercase mb-3 truncate">{nextStop || 'Tirunelveli Terminal'}</p>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={cn("h-full bg-primary transition-all duration-1000", isLive ? "animate-pulse" : "")} 
                    style={{ width: `${progressPercentage}%` }} 
                />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <Link to={`/bus/${id}`} className="flex-1">
                <Button variant="hero" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Live Track
                </Button>
            </Link>
            <div className="flex gap-2">
                <button 
                  onClick={handleShare}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all active:scale-95 text-[10px] font-black uppercase"
                >
                    <Share2 className="w-4 h-4 mr-2" /> Share
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
