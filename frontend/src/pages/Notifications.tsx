import { useEffect, useState } from 'react';
import { notificationService, type Notification } from '@/services/notificationService';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/layout';
import { Bell, CheckCheck, Trash2, AlertTriangle, Bus, MapPin, MessageSquare, Info, Filter, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
  bus_arrival: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  delay: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  platform_change: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  proximity: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  system: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  route_alert: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  chat: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const priorityGlow: Record<string, string> = {
  urgent: 'shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)] border-red-500/20',
  high: 'shadow-[0_0_15px_-5px_rgba(245,158,11,0.5)] border-amber-500/20',
  medium: 'shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)] border-blue-500/20',
  low: 'border-white/5',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const user = await authService.getCurrentUser();
    if (!user) return;
    const data = await notificationService.getNotifications(user.id || user._id || '', filter === 'unread');
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
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

  return (
    <Layout>
      <div className="relative min-h-[90vh] bg-slate-950/50 pt-10 pb-20 overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-1/4 -right-64 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <ArrowLeft className="w-3 h-3" /> Back to Fleet Hub
              </Link>
              <h1 className="text-5xl font-black text-white tracking-tighter italic">
                TACTICAL <span className="text-teal-500">ALERTS</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-2">Manage your real-time network intelligence and trip updates.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-xl">
                <button 
                  onClick={() => setFilter('all')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === 'all' ? "bg-white text-slate-950 shadow-xl" : "text-slate-500 hover:text-white"
                  )}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('unread')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === 'unread' ? "bg-white text-slate-950 shadow-xl" : "text-slate-500 hover:text-white"
                  )}
                >
                  Unread ({unreadCount})
                </button>
              </div>
              
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllRead} variant="outline" className="h-12 px-6 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
                  <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Terminal...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-24 text-center glass-premium border-white/5 rounded-[3rem]">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-center mx-auto mb-8">
                 <Bell className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Zero Alerts Found</h3>
              <p className="text-slate-500 font-medium">Your neural link is currently quiet. All network nodes are stable.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif, index) => {
                const Icon = typeIcons[notif.type] || Info;
                return (
                  <div
                    key={notif._id}
                    className={cn(
                      'group relative p-8 glass-premium backdrop-blur-3xl rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-1',
                      !notif.isRead ? 'bg-white/[0.03] border-white/10' : 'bg-transparent border-white/5 opacity-70',
                      priorityGlow[notif.priority],
                      `animate-slide-up`
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-8">
                      <div className={cn('w-16 h-16 rounded-[1.5rem] border flex items-center justify-center shrink-0 shadow-lg', typeColors[notif.type])}>
                        <Icon className="w-8 h-8" />
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className={cn('text-xl font-black tracking-tight uppercase italic', notif.isRead ? 'text-slate-400' : 'text-white')}>
                              {notif.title}
                            </h3>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)] animate-pulse" />
                            )}
                          </div>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <p className={cn('text-sm font-medium leading-relaxed mb-4', notif.isRead ? 'text-slate-600' : 'text-slate-400')}>
                          {notif.message}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                            {notif.priority} Priority
                          </span>
                          <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                            Ref: {notif._id.substring(notif._id.length - 8).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {!notif.isRead && (
                          <button 
                            onClick={() => handleMarkRead(notif._id)} 
                            className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white transition-all shadow-lg"
                            title="Acknowledge Alert"
                          >
                            <CheckCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(notif._id)} 
                          className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-600 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                          title="Purge Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination/Load More? */}
          {!loading && notifications.length > 0 && (
            <div className="text-center mt-16">
               <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">End of Intelligence Stream</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
