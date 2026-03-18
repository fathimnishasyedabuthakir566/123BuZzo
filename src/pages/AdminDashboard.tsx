import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Plus, Search, Square, User as UserIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminSidebar,
  AdminStats,
  BusListItem,
  QuickUpdatePanel,
  AddBusModal,
  EditBusModal,
  TripAnalytics,
  DriverManager,
  PassengerRecords,
} from "@/components/admin";
import type { Bus, User } from "@/types";
import { socketService } from "@/services/socketService";
import { busService } from "@/services/busService";
import { authService, UserActivity } from "@/services/authService";
import AllBusesMap from "@/components/map/AllBusesMap";
import { toast } from "sonner";

// Theme import removed

// Sample data - will be replaced with API calls
const sampleBuses: Bus[] = [];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('view') || 'dashboard';
  // Theme hook removed

  const [user, setUser] = useState<User | null>(null);
  const [showAddBus, setShowAddBus] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  // Tracking State
  const [trackedBusId, setTrackedBusId] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    const data = await busService.getAllBuses(true);
    setBuses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      // Get user first so shell renders immediately
      const currentUser = await authService.getCurrentUser();

      if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "driver")) {
        // Admin dashboard only for admin/driver roles
        navigate("/auth");
        return;
      }

      setUser(currentUser);
      setLoading(false); // Shell is ready

      // Fetch business data in background
      fetchBuses();
    };

    initializeDashboard();

    // Connect socket on mount
    socketService.connect();

    return () => {
      // Disconnect on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socketService.disconnect();
    };
  }, [navigate, fetchBuses]);

  const handleStartTracking = (busId: string) => {
    if (trackedBusId) {
      toast.error("You are already tracking a bus. Stop it first.");
      return;
    }

    if (!('geolocation' in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info(`Starting tracking for bus ${busId}...`);
    socketService.joinRoute(busId); // Driver joins the room too
    setTrackedBusId(busId);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socketService.emit('update-location', {
          routeId: busId,
          lat: latitude,
          lng: longitude
        });
      },
      (error) => {
        console.error("Error getting location", error);
        toast.error("Geolocation failed: " + error.message);
        handleStopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
    watchIdRef.current = id;
  };

  const handleStopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackedBusId(null);
    toast.success("Stopped tracking");
  };

  const handleUpdateBus = async (id: string, data: Partial<Bus>) => {
    const success = await busService.updateBus(id, data);
    if (success) {
      toast.success("Bus updated successfully");
      setEditingBus(null);
      fetchBuses();
    } else {
      toast.error("Failed to update bus");
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      const success = await busService.deleteBus(id);
      if (success) {
        toast.success("Bus deleted successfully");
        fetchBuses();
      } else {
        toast.error("Failed to delete bus");
      }
    }
  };

  const handleCreateBus = async (data: any) => {
    const success = await busService.createBus(data as any);
    if (success) {
      toast.success("Bus created successfully");
      setShowAddBus(false);
      fetchBuses();
    } else {
      toast.error("Failed to create bus");
    }
  };

  // Quick Update Handler
  const handleQuickUpdate = async (busId: string, data: { currentLocation: string; eta: string }) => {
    try {
      const success = await busService.updateBus(busId, {
        currentLocation: data.currentLocation,
        eta: data.eta
      });

      if (success) {
        toast.success("Location updated successfully");
        fetchBuses(); // Refresh the list
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error("Failed to update location");
    }
  };

  const filteredBuses = buses.filter(
    (bus) =>
      bus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-96 w-full max-w-4xl skeleton rounded-2xl mx-6" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-background flex">
        <AdminSidebar
          userName={user?.name || "Admin"}
          userRole={user?.role === 'admin' ? "System Administrator" : "Bus Operator"}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Control Center</h1>
                <p className="text-muted-foreground">Monitor systems, manage buses, and assign personnel</p>
              </div>

              <div className="flex gap-2">
                {/* Theme toggle removed */}
                {trackedBusId && (
                  <Button variant="destructive" onClick={handleStopTracking} className="animate-pulse">
                    <Square className="w-4 h-4 mr-2" fill="currentColor" />
                    Stop Tracking (Live)
                  </Button>
                )}
                <Button variant="accent" onClick={() => setShowAddBus(true)}>
                  <Plus className="w-4 h-4" />
                  Add New Bus
                </Button>
                <Link to="/profile">
                  <Button variant="secondary" className="rounded-full w-10 h-10 p-0 border border-border/50 shadow-sm overflow-hidden">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary" />
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <>
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 mb-8 flex flex-col items-center justify-center text-center shadow-sm border border-border/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />
                  <h2 className="text-3xl font-black tracking-tight text-foreground relative z-10 mb-2">Welcome Back, {user.name}!</h2>
                  <p className="text-muted-foreground font-medium mb-6 relative z-10 max-w-md">Access your control center to monitor buses, analyze trips, and manage the system's users.</p>
                  
                  <Link to="/admin/users" className="relative z-10">
                    <Button size="lg" className="h-12 px-8 font-black text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 hover:scale-105 transform duration-300">
                      View User Activity
                    </Button>
                  </Link>
                </div>

                <AdminStats buses={buses} />
                <div className="mt-6">
                  <QuickUpdatePanel buses={buses} onUpdate={handleQuickUpdate} />
                </div>
              </>
            )}

            {activeTab === 'buses' && (
              <div className="glass-card rounded-xl">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Your Buses</h2>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search buses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-10 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {loading && buses.length === 0 ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 w-full skeleton rounded-xl p-4 m-4" />
                    ))
                  ) : filteredBuses.length > 0 ? (
                    filteredBuses.map((bus) => (
                      <BusListItem
                        key={bus.id}
                        bus={bus}
                        onEdit={() => setEditingBus(bus)}
                        onDelete={() => handleDeleteBus(bus.id)}
                        onTrack={() => handleStartTracking(bus.id)}
                        isTracking={trackedBusId === bus.id}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No buses found. Add one to get started.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'drivers' && (
              <DriverManager />
            )}

            {activeTab === 'passengers' && (
              <PassengerRecords />
            )}

            {activeTab === 'location' && (
              <div className="glass-card rounded-xl overflow-hidden h-[600px] border-2 border-primary/10">
                <AllBusesMap initialBuses={buses} />
              </div>
            )}

            {activeTab === 'analytics' && (
              <TripAnalytics buses={buses} />
            )}

            {activeTab === 'users' && (
              <UserActivityTable />
            )}
          </div>
        </main>

        <AddBusModal isOpen={showAddBus} onClose={() => setShowAddBus(false)} onSubmit={handleCreateBus} />
        <EditBusModal
          isOpen={!!editingBus}
          bus={editingBus}
          onClose={() => setEditingBus(null)}
          onSubmit={handleUpdateBus}
        />
      </div >
    </Layout >
  );
};

const UserActivityTable = () => {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);
  const itemsPerPage = 10;

  const fetchActivity = async () => {
    setLoading(true);
    const data = await authService.getUserActivity();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleBlockUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to block this user?")) {
      const res = await authService.blockUser(userId);
      if (res.success) {
        toast.success(res.message);
        fetchActivity();
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleUnblockUser = async (userId: string) => {
    const res = await authService.unblockUser(userId);
    if (res.success) {
      toast.success(res.message);
      fetchActivity();
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("WARNING: This will permanently delete the user. Are you sure?")) {
      const res = await authService.deleteUser(userId);
      if (res.success) {
        toast.success(res.message);
        setSelectedUser(null);
        fetchActivity();
      } else {
        toast.error(res.message);
      }
    }
  };

  const downloadCSV = () => {
    const headers = ["Name", "Email", "Role", "Phone", "Registration Date", "Last Active", "Status"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => [
        u.name,
        u.email,
        u.role,
        u.phone || 'N/A',
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
        u.lastActive ? new Date(u.lastActive).toLocaleString() : 'N/A',
        u.isBlocked ? 'Blocked' : 'Active'
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone || "").includes(searchQuery);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: users.length,
    activeToday: users.filter(u => u.lastActive && new Date(u.lastActive).toDateString() === new Date().toDateString()).length,
    newToday: users.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString()).length,
  };

  if (loading && users.length === 0) return <div>Loading user activity...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Registered Users</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active Users Today</p>
          <p className="text-2xl font-bold text-success">{stats.activeToday}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">New Registrations Today</p>
          <p className="text-2xl font-bold text-info">{stats.newToday}</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">User Management</h2>
            <p className="text-sm text-muted-foreground">Monitor and manage all system users</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-1.5 text-sm w-48"
              />
            </div>

            <select
              className="input-field py-1.5 text-sm w-32"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
              <option value="user">Passenger</option>
            </select>

            <Button variant="outline" size="sm" onClick={downloadCSV}>Export CSV</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-4 text-left font-medium text-sm text-muted-foreground uppercase">User</th>
                <th className="p-4 text-left font-medium text-sm text-muted-foreground uppercase">Role</th>
                <th className="p-4 text-left font-medium text-sm text-muted-foreground uppercase">Reg Date</th>
                <th className="p-4 text-left font-medium text-sm text-muted-foreground uppercase">Last Login</th>
                <th className="p-4 text-left font-medium text-sm text-muted-foreground uppercase">Status</th>
                <th className="p-4 text-left font-medium text-sm text-muted-foreground uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentUsers.map((user, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.role.toLowerCase() === 'admin' ? 'bg-destructive/10 text-destructive' :
                      user.role.toLowerCase() === 'driver' ? 'bg-accent/10 text-accent' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm whitespace-nowrap">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-sm">
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-4 text-sm">
                    {user.isBlocked ? (
                      <span className="text-destructive font-medium">Blocked</span>
                    ) : (
                      <span className="text-success font-medium">Active</span>
                    )}
                  </td>
                  <td className="p-4 text-sm" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                       {user.isBlocked ? (
                          <Button variant="outline" size="sm" className="text-success border-success/30 hover:bg-success/10 h-8" onClick={() => handleUnblockUser(user._id)}>Unblock</Button>
                        ) : (
                          <Button variant="outline" size="sm" className="text-warning border-warning/30 hover:bg-warning/10 h-8" onClick={() => handleBlockUser(user._id)}>Block</Button>
                        )}
                        <Button variant="destructive" size="sm" className="h-8" onClick={() => handleDeleteUser(user._id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentUsers.length === 0 && <div className="p-8 text-center text-muted-foreground">No users found.</div>}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-secondary/20">
            <span className="text-sm text-muted-foreground">Showing page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold">User Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>✕</Button>
            </div>
            <div className="p-6 space-y-6 bg-muted/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{selectedUser.name}</h4>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 bg-secondary rounded text-xs font-mono">{selectedUser.role}</span>
                    <span className="px-2 py-1 bg-secondary rounded text-xs font-mono">{selectedUser.phone || 'No phone'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 border-b border-border pb-2">Recent Login Activity</h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {selectedUser.loginHistory && selectedUser.loginHistory.length > 0 ? (
                    selectedUser.loginHistory.slice().reverse().map((hist, i) => (
                      <div key={i} className="flex justify-between items-center p-3 glass-card rounded-lg text-sm">
                        <div>
                          <p className="font-medium">{new Date(hist.timestamp).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Device: {hist.device || 'Unknown'}</p>
                        </div>
                        <span className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded">{hist.ip || 'Unknown IP'}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No login history recorded.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-card flex justify-end">
              <Button onClick={() => setSelectedUser(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
