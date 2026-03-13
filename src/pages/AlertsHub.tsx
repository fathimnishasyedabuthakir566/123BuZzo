import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Bell, AlertTriangle, Bus, MapPin, Info, MessageSquare, Check, X, Trash2, Filter, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationService, type Notification } from '@/services/notificationService';
import { authService } from '@/services/authService';
import { socketService } from '@/services/socketService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    bus_arrival: { icon: Bus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    delay: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    platform_change: { icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    proximity: { icon: MapPin, color: 'text-violet-600', bg: 'bg-violet-50' },
    system: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50' },
    route_alert: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    chat: { icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-50' },
};

const priorityColors: Record<string, string> = {
    urgent: 'border-l-red-500 bg-red-50/30',
    high: 'border-l-amber-500 bg-amber-50/20',
    medium: 'border-l-blue-400',
    low: 'border-l-transparent',
};

const AlertsHub = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const init = async () => {
            const user = await authService.getCurrentUser();
            if (!user) return;
            const uid = user.id || user._id || '';
            setUserId(uid);

            const data = await notificationService.getNotifications(uid, filter === 'unread');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
            setIsLoading(false);

            // Subscribe to live notifications
            socketService.connect();
            socketService.emit('subscribe-notifications', uid);
            socketService.on('system-notification', (notif: unknown) => {
                const n = notif as Notification;
                setNotifications(prev => [{ ...n, _id: Date.now().toString(), isRead: false, createdAt: new Date().toISOString() }, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        };
        init();

        return () => { socketService.off('system-notification'); };
    }, [filter]);

    const handleMarkRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (id: string) => {
        await notificationService.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n._id !== id));
    };

    const filteredNotifications = notifications.filter(n => {
        if (typeFilter !== 'all' && n.type !== typeFilter) return false;
        return true;
    });

    const formatTime = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'MMM d, hh:mm aa');
        } catch { return ''; }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 mb-3">
                            <Bell className="w-3 h-3" /> Alerts Center
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Alerts Hub</h1>
                        <p className="text-slate-500 mt-1">
                            {unreadCount > 0 ? `You have ${unreadCount} unread alerts` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" className="rounded-xl gap-2 font-bold" onClick={handleMarkAllRead}>
                            <CheckCheck className="w-4 h-4" /> Mark All Read
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-100 p-1">
                        <button
                            className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors",
                                filter === 'all' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                            )}
                            onClick={() => setFilter('all')}
                        >All</button>
                        <button
                            className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors",
                                filter === 'unread' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                            )}
                            onClick={() => setFilter('unread')}
                        >Unread ({unreadCount})</button>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                        {['all', 'delay', 'bus_arrival', 'platform_change', 'proximity', 'system'].map(type => (
                            <button
                                key={type}
                                className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors",
                                    typeFilter === type ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-100 hover:border-primary/30"
                                )}
                                onClick={() => setTypeFilter(type)}
                            >
                                {type === 'all' ? 'All Types' : type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notification List */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl skeleton" />)}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-400">No alerts found</h3>
                        <p className="text-slate-400 mt-1">When there are updates, you&apos;ll see them here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map(notif => {
                            const config = typeConfig[notif.type] || typeConfig.system;
                            const Icon = config.icon;
                            return (
                                <div
                                    key={notif._id}
                                    className={cn(
                                        "bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all group border-l-4",
                                        priorityColors[notif.priority],
                                        !notif.isRead && "ring-1 ring-primary/10"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", config.bg)}>
                                            <Icon className={cn("w-5 h-5", config.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={cn("font-black text-sm", notif.isRead ? "text-slate-500" : "text-slate-800")}>{notif.title}</h4>
                                                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
                                                    notif.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                                    notif.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-400'
                                                )}>
                                                    {notif.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2">{notif.message}</p>
                                            <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-wider">{formatTime(notif.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notif.isRead && (
                                                <button onClick={() => handleMarkRead(notif._id)} className="p-2 rounded-lg hover:bg-emerald-50 transition-colors" title="Mark as read">
                                                    <Check className="w-4 h-4 text-emerald-500" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(notif._id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AlertsHub;
