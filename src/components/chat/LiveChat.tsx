import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Headphones } from 'lucide-react';
import { chatService, type ChatMessage } from '@/services/chatService';
import { socketService } from '@/services/socketService';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const LiveChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState<'user' | 'driver' | 'admin'>('user');
    const [roomId, setRoomId] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const init = async () => {
            const user = await authService.getCurrentUser();
            if (!user) return;
            const uid = user.id || user._id || '';
            setUserId(uid);
            setUserName(user.name);
            setUserRole(user.role as 'user' | 'driver' | 'admin');
            setRoomId(`support_${uid}`);
        };
        init();
    }, []);

    useEffect(() => {
        if (!roomId || !isOpen) return;

        const loadMessages = async () => {
            const msgs = await chatService.getMessages(roomId);
            setMessages(msgs);
        };
        loadMessages();

        socketService.connect();
        socketService.emit('join-chat', roomId);

        const handleNewMessage = (msg: unknown) => {
            const chatMsg = msg as ChatMessage;
            setMessages(prev => [...prev, chatMsg]);
        };

        const handleTyping = (data: unknown) => {
            const typingData = data as { senderName: string };
            setIsTyping(true);
            setTypingUser(typingData.senderName);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
        };

        socketService.on('chat-message', handleNewMessage);
        socketService.on('user-typing', handleTyping);

        return () => {
            socketService.off('chat-message', handleNewMessage);
            socketService.off('user-typing', handleTyping);
            socketService.emit('leave-chat', roomId);
        };
    }, [roomId, isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !roomId) return;

        const msgData = {
            roomId,
            senderId: userId,
            senderName: userName,
            senderRole: userRole,
            message: newMessage.trim(),
            messageType: 'text' as const,
        };

        socketService.emit('send-chat-message', msgData);
        setNewMessage('');
    };

    const handleTypingEmit = () => {
        socketService.emit('typing', { roomId, senderName: userName });
    };

    const formatTime = (dateStr: string) => {
        try { return format(new Date(dateStr), 'hh:mm aa'); } catch { return ''; }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-2xl hover:shadow-teal-500/30 hover:scale-105 transition-all flex items-center justify-center group"
            >
                <Headphones className="w-7 h-7 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </button>
        );
    }

    return (
        <div className={cn(
            "fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all",
            isMinimized
                ? "bottom-6 right-6 w-72 h-14"
                : "bottom-6 right-6 w-[380px] h-[520px] flex flex-col"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm">Terminal Support</h3>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">
                            {isTyping ? `${typingUser} is typing...` : 'Live Chat'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
                        {/* System welcome */}
                        <div className="text-center py-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
                                Chat Started
                            </span>
                        </div>
                        <div className="bg-teal-50 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                            <p className="text-xs text-teal-700">
                                👋 Welcome to Buzzo Terminal Support! How can we help you today?
                            </p>
                            <p className="text-[9px] text-teal-400 mt-1 font-bold">Support Team</p>
                        </div>

                        {messages.map((msg) => {
                            const isMine = msg.senderId === userId;
                            return (
                                <div key={msg._id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[75%] rounded-2xl px-4 py-2.5",
                                        isMine
                                            ? "bg-teal-500 text-white rounded-br-md"
                                            : "bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-sm"
                                    )}>
                                        {!isMine && (
                                            <p className={cn("text-[10px] font-black uppercase tracking-wider mb-1", isMine ? "text-white/70" : "text-teal-600")}>
                                                {msg.senderName}
                                            </p>
                                        )}
                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                        <p className={cn("text-[9px] mt-1.5 text-right", isMine ? "text-white/50" : "text-slate-300")}>
                                            {formatTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {isTyping && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-[10px]">{typingUser} is typing...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => { setNewMessage(e.target.value); handleTypingEmit(); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim()}
                                className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-teal-300/30"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LiveChat;
