import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Navigation, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const BuzzoAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hello! I'm Buzzo AI. How can I help you move smarter today?" }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');

        // Simulated AI response logic
        setTimeout(() => {
            let aiResponse = "I'm analyzing the live telemetry for you...";
            
            if (userMsg.toLowerCase().includes('junction')) {
                aiResponse = "The next bus to Junction is Route 72N, arriving in approximately 8 minutes at the main terminal.";
            } else if (userMsg.toLowerCase().includes('delay')) {
                aiResponse = "Currently, there are minor delays on the Chennai route due to corridor maintenance. Expect +10m on all 45J units.";
            } else if (userMsg.toLowerCase().includes('pass')) {
                aiResponse = "You can access your Digital Boarding Pass from your Dashboard under the 'My Pass' tab.";
            } else {
                aiResponse = "I've received your query. Based on current traffic density and bus availability, I recommend taking the Express flyer for the fastest commute.";
            }

            setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-8 left-8 z-[100]">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center shadow-glow border border-white/10 hover:scale-105 transition-all group scale-in"
                >
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">!</div>
                    <Sparkles className="w-8 h-8 text-teal-400 group-hover:rotate-12 transition-transform" />
                </button>
            ) : (
                <div className="w-[400px] h-[600px] glass-premium rounded-[3rem] border border-white/10 flex flex-col shadow-2xl animate-scale-in">
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 bg-slate-900/40 rounded-t-[3rem] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-white tracking-tighter uppercase italic">Buzzo AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Link Active</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={cn(
                                "max-w-[85%] p-5 rounded-3xl text-sm font-medium leading-relaxed animate-fade-in",
                                msg.role === 'ai' 
                                    ? "bg-white/5 border border-white/5 text-slate-200" 
                                    : "bg-teal-500 text-white ml-auto shadow-lg"
                            )}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="px-8 flex gap-2 overflow-x-auto no-scrollbar pb-4">
                        {['Junction ETA', 'Traffic Alerts', 'Pass Info'].map(action => (
                            <button 
                                key={action}
                                onClick={() => { setInput(action); }}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
                            >
                                {action}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-8 pt-0">
                        <div className="relative">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about routes, delays..."
                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 pr-16 text-white focus:outline-none focus:border-teal-500 transition-all"
                            />
                            <button 
                                onClick={handleSend}
                                className="absolute right-3 top-3 w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[8px] text-center text-slate-600 mt-4 font-bold uppercase tracking-[0.3em]">Powered by Buzzo Neural Engine v2.0</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuzzoAI;
