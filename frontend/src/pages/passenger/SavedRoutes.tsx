import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Plus, Trash2, Bell, BellOff, MapPin, Navigation, Route, Edit2, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { savedRouteService, type SavedRoute } from '@/services/savedRouteService';
import { authService } from '@/services/authService';
import { busService } from '@/services/busService';
import type { Bus } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SavedRoutes = () => {
    const [routes, setRoutes] = useState<SavedRoute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [formData, setFormData] = useState({ name: '', fromStop: '', toStop: '' });
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const init = async () => {
            const user = await authService.getCurrentUser();
            if (!user) return;
            const uid = user.id || user._id || '';
            setUserId(uid);

            const [savedRoutes, allBuses] = await Promise.all([
                savedRouteService.getRoutes(uid),
                busService.getAllBuses()
            ]);
            setRoutes(savedRoutes);
            setBuses(allBuses);
            setIsLoading(false);
        };
        init();
    }, []);

    const handleAddRoute = async () => {
        if (!formData.name || !formData.fromStop || !formData.toStop) {
            toast.error('Please fill all fields');
            return;
        }

        const newRoute = await savedRouteService.createRoute({
            userId,
            name: formData.name,
            fromStop: formData.fromStop,
            toStop: formData.toStop,
            notifyOnApproach: true,
            notifyRadius: 500,
        });

        if (newRoute) {
            setRoutes(prev => [newRoute, ...prev]);
            setFormData({ name: '', fromStop: '', toStop: '' });
            setShowAddForm(false);
            toast.success('Route saved!');
        } else {
            toast.error('Failed to save route');
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await savedRouteService.deleteRoute(id);
        if (ok) {
            setRoutes(prev => prev.filter(r => r._id !== id));
            toast.success('Route deleted');
        }
    };

    const handleToggleNotify = async (route: SavedRoute) => {
        const updated = await savedRouteService.updateRoute(route._id, {
            notifyOnApproach: !route.notifyOnApproach
        });
        if (updated) {
            setRoutes(prev => prev.map(r => r._id === route._id ? { ...r, notifyOnApproach: !r.notifyOnApproach } : r));
        }
    };

    // Find matching buses for a saved route
    const getMatchingBuses = (route: SavedRoute) => {
        return buses.filter(b =>
            b.routeFrom?.toLowerCase().includes(route.fromStop.toLowerCase()) ||
            b.routeTo?.toLowerCase().includes(route.toStop.toLowerCase()) ||
            b.via?.some(v => v.toLowerCase().includes(route.fromStop.toLowerCase()) || v.toLowerCase().includes(route.toStop.toLowerCase()))
        ).slice(0, 3);
    };

    // Unique stops from all buses for the form dropdowns
    const allStops = [...new Set([
        ...buses.map(b => b.routeFrom),
        ...buses.map(b => b.routeTo),
        ...buses.flatMap(b => b.via || []),
    ].filter(Boolean))].sort();

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 mb-3">
                            <Route className="w-3 h-3" /> Your Commute
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Saved Routes</h1>
                        <p className="text-slate-500 mt-1">Quick access to your daily commute paths with smart alerts</p>
                    </div>
                    <Button
                        variant="hero"
                        className="rounded-2xl h-12 px-6 gap-2 font-black shadow-lg"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {showAddForm ? 'Cancel' : 'Add Route'}
                    </Button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-8 animate-scale-in">
                        <h3 className="text-lg font-black text-slate-800 mb-6">Create New Route</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Route Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Daily Commute"
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">From Stop</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none"
                                    value={formData.fromStop}
                                    onChange={e => setFormData(prev => ({ ...prev, fromStop: e.target.value }))}
                                >
                                    <option value="">Select origin</option>
                                    {allStops.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">To Stop</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none"
                                    value={formData.toStop}
                                    onChange={e => setFormData(prev => ({ ...prev, toStop: e.target.value }))}
                                >
                                    <option value="">Select destination</option>
                                    {allStops.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <Button variant="hero" className="rounded-xl h-12 px-8 font-black" onClick={handleAddRoute}>
                            Save Route
                        </Button>
                    </div>
                )}

                {/* Routes List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl skeleton" />)}
                    </div>
                ) : routes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <MapPin className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-400">No saved routes yet</h3>
                        <p className="text-slate-400 mt-1">Save your frequently used routes for quick access and smart alerts</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {routes.map(route => {
                            const matchingBuses = getMatchingBuses(route);
                            return (
                                <div key={route._id} className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all group">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                                <Navigation className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800">{route.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                                    <span className="font-semibold">{route.fromStop}</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                    <span className="font-semibold">{route.toStop}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleNotify(route)}
                                                className={cn("p-2 rounded-xl transition-colors", route.notifyOnApproach ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400")}
                                                title={route.notifyOnApproach ? "Notifications ON" : "Notifications OFF"}
                                            >
                                                {route.notifyOnApproach ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(route._id)}
                                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Matching buses */}
                                    {matchingBuses.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Next Available Buses</p>
                                            <div className="flex flex-wrap gap-2">
                                                {matchingBuses.map(bus => (
                                                    <div key={bus.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                                        <div className={cn("w-2 h-2 rounded-full",
                                                            bus.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                                        )} />
                                                        <span className="text-xs font-bold text-slate-700">{bus.busNumber}</span>
                                                        <span className="text-[10px] text-slate-400">{bus.scheduledTime?.[0] || '--:--'}</span>
                                                        {bus.crowdLevel && (
                                                            <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase",
                                                                bus.crowdLevel === 'low' ? 'bg-emerald-100 text-emerald-600' :
                                                                bus.crowdLevel === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-red-100 text-red-600'
                                                            )}>
                                                                {bus.crowdLevel}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SavedRoutes;
