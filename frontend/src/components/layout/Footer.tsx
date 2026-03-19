import { Link } from "react-router-dom";
import { Bus, Heart, Mail, Phone, MapPin, Zap, ShieldCheck, Activity, Globe, Cpu } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10 overflow-hidden relative">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-16 mb-20">
          {/* Brand & Neural Status */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-4 mb-8 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-teal-500/50 transition-all">
                <Bus className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight uppercase italic">BUZZO<span className="text-teal-500">.</span></span>
                <span className="text-[10px] text-slate-500 font-black block uppercase tracking-widest leading-none">Neural Transit Network</span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mb-10">
              Autonomous fleet synchronization for the Tirunelveli corridor. 
              Real-time neural telemetry tracking for the modern commuter.
            </p>
            
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                     <ShieldCheck className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">Connection Encrypted</p>
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AES-256 Neural Protocol</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Node Access</h4>
            <ul className="space-y-4 text-sm font-black uppercase tracking-widest">
              <li>
                <Link to="/live-radar" className="text-slate-500 hover:text-teal-400 transition-colors">Tactical Radar</Link>
              </li>
              <li>
                <Link to="/live-terminal" className="text-slate-500 hover:text-teal-400 transition-colors">Neural Terminal</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-500 hover:text-teal-400 transition-colors">Project Info</Link>
              </li>
            </ul>
          </div>

          {/* Logistics */}
          <div className="lg:col-span-1">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8">Command Console</h4>
            <ul className="space-y-4 text-sm font-black uppercase tracking-widest">
              <li>
                <Link to="/auth" className="text-slate-500 hover:text-teal-400 transition-colors">Admin Sync</Link>
              </li>
              <li>
                <Link to="/auth?role=driver" className="text-slate-500 hover:text-teal-400 transition-colors">Unit Uplink</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-500 hover:text-teal-400 transition-colors">Fleet Hub</Link>
              </li>
            </ul>
          </div>

          {/* Real-time Ticker Simulation */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-[2.5rem] glass-premium border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-20 transition-opacity group-hover:opacity-100">
                  <Activity className="w-12 h-12 text-teal-500 animate-pulse" />
               </div>
               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Global Fleet Health
               </h4>
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        <span>Synced Units</span>
                        <span className="text-teal-400">92%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full w-[92%] bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        <span>Latency</span>
                        <span className="text-emerald-400">12ms</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full w-[15%] bg-emerald-500 rounded-full" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
               © {new Date().getFullYear()} BUZZO NEURAL NETWORK. ALL SYSTEMS OPTIMAL.
             </p>
          </div>
          <div className="flex items-center gap-10">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-neon-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Live</span>
             </div>
             <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI v4.2 Active</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

