import { Ticket, Clock, MapPin, User, CheckCircle2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface DigitalPassProps {
    userName: string;
    userId: string;
}

const DigitalPass = ({ userName, userId }: DigitalPassProps) => {
    const [bookingRef] = useState(`BZO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center">
            {/* The "Physical" Ticket Visual */}
            <div className="w-full max-w-sm relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-primary rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                
                <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5">
                    {/* Header */}
                    <div className="bg-slate-900 dark:bg-black p-8 text-white">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <Ticket className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em]">Valid Today</p>
                                <p className="text-sm font-black text-white">{currentTime.toLocaleDateString()}</p>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-1">{userName.toUpperCase()}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Boarding Pass</p>
                    </div>

                    {/* QR Section */}
                    <div className="p-8 flex flex-col items-center border-b border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                        <div className="p-4 bg-white rounded-3xl shadow-xl mb-4 group-hover:scale-105 transition-transform duration-500">
                             <div className="w-[180px] h-[180px] bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center">
                                 {/* Simulated QR Pattern */}
                                 <div className="absolute inset-2 grid grid-cols-10 grid-rows-10 gap-1 opacity-80">
                                     {[...Array(100)].map((_, i) => (
                                         <div key={i} className={`w-full h-full rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                                     ))}
                                 </div>
                                 <div className="absolute top-2 left-2 w-8 h-8 border-4 border-white rounded-md" />
                                 <div className="absolute top-2 right-2 w-8 h-8 border-4 border-white rounded-md" />
                                 <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-white rounded-md" />
                                 <div className="relative z-10 w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-2xl">
                                     <QrCode className="w-6 h-6 text-white" />
                                 </div>
                             </div>
                        </div>
                        <p className="font-black text-slate-900 dark:text-white tracking-[0.5em] text-lg mb-2">{bookingRef}</p>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> Encrypted & Verified
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-8 grid grid-cols-2 gap-6 bg-white dark:bg-slate-900">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-sm font-black text-slate-800 dark:text-white">Standby Active</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Time</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Ticket Notches */}
                <div className="absolute top-[45%] -left-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 shadow-inner"></div>
                <div className="absolute top-[45%] -right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-950 shadow-inner"></div>
            </div>

            <div className="mt-10 flex gap-4">
                <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                    Add to Wallet
                </Button>
                <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                    View Receipt
                </Button>
            </div>
        </div>
    );
};

export default DigitalPass;
