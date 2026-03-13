import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, AlertTriangle, Bus, MapPin, MessageSquare, Info } from 'lucide-react';
import { notificationService, type Notification } from '@/services/notificationService';
import { socketService } from '@/services/socketService';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const typeIcons: Record<string, React.ElementType> = {
    bus_arrival: Bus,
    delay: AlertTriangle,
    platform_change: MapPin,
    proximity: MapPin,
    system: Info,
    route_alert: AlertTriangle,
    chat: MessageSquare,
};

const typeColors: Record<string, string> = {
    bus_arrival: 'bg-emerald-100 text-emerald-600',
    delay: 'bg-amber-100 text-amber-600',
    platform_change: 'bg-blue-100 text-blue-600',
    proximity: 'bg-violet-100 text-violet-600',
    system: 'bg-slate-100 text-slate-600',
    route_alert: 'bg-rose-100 text-rose-600',
    chat: 'bg-teal-100 text-teal-600',
};

const priorityBorder: Record<string, string> = {
    urgent: 'border-l-4 border-l-red-500',
    high: 'border-l-4 border-l-amber-500',
    medium: 'border-l-4 border-l-blue-400',
    low: '',
};

const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadNotifications = async () => {
            const user = await authService.getCurrentUser();
            if (!user) return;

            const data = await notificationService.getNotifications(user.id || user._id || '');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);

            // Subscribe to real-time notifications
            socketService.connect();
            socketService.emit('subscribe-notifications', user.id || user._id);

            socketService.on('system-notification', (notif: unknown) => {
                const n = notif as Notification;
                setNotifications(prev => [{ ...n, _id: Date.now().toString(), isRead: false, createdAt: new Date().toISOString() }, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        };

        loadNotifications();

        return () => {
            socketService.off('system-notification');
        };
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleMarkRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        const user = await authService.getCurrentUser();
        if (!user) return;
        await notificationService.markAllAsRead(user.id || user._id || '');
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (id: string) => {
        await notificationService.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n._id !== id));
    };

    const formatTime = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            const now = new Date();
            const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
            if (diffMin < 1) return 'Just now';
            if (diffMin < 60) return `${diffMin}m ago`;
            if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
            return format(d, 'MMM d');
        } catch {
            return '';
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors group"
                title="Notifications"
            >
                <Bell className={cn("w-5 h-5 transition-colors", unreadCount > 0 ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black px-1 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[999] animate-scale-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
                        <div>
                            <h3 className="font-black text-sm text-slate-800">Notifications</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{unreadCount} unread</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                                    title="Mark all read"
                                >
                                    <CheckCheck className="w-4 h-4 text-slate-500" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto max-h-[400px] divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map((notif) => {
                                const Icon = typeIcons[notif.type] || Info;
                                return (
                                    <div
                                        key={notif._id}
                                        className={cn(
                                            "px-5 py-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer group relative",
                                            !notif.isRead && "bg-primary/[0.03]",
                                            priorityBorder[notif.priority]
                                        )}
                                        onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", typeColors[notif.type] || 'bg-slate-100 text-slate-600')}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn("text-sm font-bold truncate", notif.isRead ? "text-slate-500" : "text-slate-800")}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                                                <p className="text-[10px] text-slate-300 mt-1 font-bold uppercase tracking-wider">{formatTime(notif.createdAt)}</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
