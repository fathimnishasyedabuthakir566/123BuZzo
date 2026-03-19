import { useState, useEffect } from "react";
import { Wrench, ShieldAlert, CheckCircle2, AlertTriangle, Activity, Settings, Cpu, Zap, Thermometer, Gauge } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const data = [
  { name: "00:00", temp: 65, vibration: 40 },
  { name: "04:00", temp: 68, vibration: 42 },
  { name: "08:00", temp: 85, vibration: 58 },
  { name: "12:00", temp: 92, vibration: 75 },
  { name: "16:00", temp: 88, vibration: 65 },
  { name: "20:00", temp: 75, vibration: 50 },
  { name: "23:59", temp: 70, vibration: 45 },
];

const PredictiveMaintenance = () => {
  const [activeUnit, setActiveUnit] = useState<string>("UNIT-01");

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Unit Selector & Health */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass-premium rounded-[2.5rem] p-10 border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Cpu className="w-20 h-20 text-teal-500" />
             </div>
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Asset Identification</h3>
             <div className="space-y-4">
                {["UNIT-01", "UNIT-08", "UNIT-12", "UNIT-24"].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setActiveUnit(unit)}
                    className={cn(
                      "w-full p-6 rounded-2xl border transition-all flex items-center justify-between group",
                      activeUnit === unit 
                        ? "bg-teal-500 border-teal-400 shadow-glow" 
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                         activeUnit === unit ? "bg-white/20" : "bg-slate-900"
                       )}>
                          <Settings className={cn("w-5 h-5", activeUnit === unit ? "text-white" : "text-teal-500")} />
                       </div>
                       <div className="text-left">
                          <p className={cn("text-sm font-black uppercase tracking-widest", activeUnit === unit ? "text-white" : "text-slate-300")}>{unit}</p>
                          <p className={cn("text-[9px] font-bold uppercase tracking-widest", activeUnit === unit ? "text-white/70" : "text-slate-500")}>Neural Relay B12</p>
                       </div>
                    </div>
                    {unit === "UNIT-08" && (
                       <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    )}
                  </button>
                ))}
             </div>
          </div>

          <div className="glass-premium rounded-[2.5rem] p-10 border-white/10 shadow-2xl bg-slate-900/50">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-amber-500" /> Risk Assessment
             </h3>
             <div className="space-y-8">
                <div>
                   <div className="flex justify-between items-end mb-3">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Brake Thermal Stress</p>
                      <p className="text-xl font-black text-emerald-500 italic">LOW</p>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full">
                      <div className="h-full w-[24%] bg-emerald-500 rounded-full shadow-glow" />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between items-end mb-3">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Suspension Wear</p>
                      <p className="text-xl font-black text-amber-500 italic">MODERATE</p>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full">
                      <div className="h-full w-[68%] bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Neural Telemetry Charts */}
        <div className="flex-1 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-premium rounded-[2rem] p-8 border-white/10 shadow-xl bg-slate-900/30 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                    <Thermometer className="w-7 h-7 text-teal-400" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Core Temp</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">82.4°C</p>
                 </div>
              </div>
              <div className="glass-premium rounded-[2rem] p-8 border-white/10 shadow-xl bg-slate-900/30 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Gauge className="w-7 h-7 text-indigo-400" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Fluid Pressure</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">4.2 bar</p>
                 </div>
              </div>
              <div className="glass-premium rounded-[2rem] p-8 border-white/10 shadow-xl bg-slate-900/30 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Zap className="w-7 h-7 text-emerald-400" />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Voltage Level</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">24.2v</p>
                 </div>
              </div>
           </div>

           <div className="glass-premium rounded-[2.5rem] p-12 border-white/10 shadow-2xl relative overflow-hidden h-[500px]">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                       <Activity className="w-3 h-3 text-teal-400" /> Neural Telemetry History
                    </h4>
                    <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Unit Stress Propagation</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-teal-500" />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Temp Profile</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-indigo-500" />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Vibration Index</span>
                    </div>
                 </div>
              </div>

              <div className="h-[320px] w-full mt-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                      className="font-black uppercase tracking-[0.2em]"
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #ffffff10", borderRadius: "1.5rem", fontSize: "10px", fontWeight: "900", color: "#fff" }}
                      itemStyle={{ color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#14b8a6" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="vibration" 
                      stroke="#6366f1" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorVib)" 
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-10 bg-slate-900/60 backdrop-blur-md border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-glow">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Optimization Status</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none">AI confirmed peak efficiency</p>
                    </div>
                 </div>
                 <button className="h-12 px-10 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                    Initiate Calibration
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Critical Logs */}
      <div className="glass-premium rounded-[2.5rem] p-12 border-white/10 shadow-2xl relative overflow-hidden">
         <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Logged Strategic Anomalies
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { time: "09:42", unit: "UNIT-08", error: "Vibration threshold breach (z-axis)", gravity: "CRITICAL" },
              { time: "11:20", unit: "UNIT-24", error: "Coolant pressure variance detected", gravity: "OPTIMIZED" },
              { time: "14:05", unit: "UNIT-01", error: "Tire pressure low (Left-Rear)", gravity: "WARNING" },
            ].map((log, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-900 border border-white/5 relative group hover:border-white/10 transition-all">
                 <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-slate-500">{log.time}</span>
                    <span className={cn(
                      "text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest",
                      log.gravity === "CRITICAL" ? "bg-red-500 text-white" : 
                      log.gravity === "WARNING" ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-slate-950"
                    )}>{log.gravity}</span>
                 </div>
                 <h5 className="text-sm font-black text-white uppercase tracking-widest mb-2">{log.unit}</h5>
                 <p className="text-xs text-slate-500 font-medium">{log.error}</p>
                 <div className="absolute inset-0 border border-teal-500/0 group-hover:border-teal-500/10 rounded-3xl transition-all" />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default PredictiveMaintenance;
