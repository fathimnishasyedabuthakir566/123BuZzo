import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Search, User as UserIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin";
import type { UserRole, User } from "@/types";
import { authService, UserActivity } from "@/services/authService";
import { toast } from "sonner";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingShell, setLoadingShell] = useState(true);

  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const initializePage = async () => {
      const user = await authService.getCurrentUser();
      if (!user || user.role !== "admin") {
        navigate("/auth");
        return;
      }
      setCurrentUser(user);
      setLoadingShell(false);
      fetchActivity();
    };
    initializePage();
  }, [navigate]);

  const fetchActivity = async () => {
    setLoading(true);
    const data = await authService.getUserActivity();
    setUsers(data);
    setLoading(false);
  };

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
    const matchesDate = !dateFilter || (user.createdAt && new Date(user.createdAt).toISOString().split('T')[0] === dateFilter);
    return matchesSearch && matchesRole && matchesDate;
  }).sort((a, b) => {
    const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
    const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
    return timeB - timeA; // Sort by latest login explicitly
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: users.length,
    activeToday: users.filter(u => u.lastActive && new Date(u.lastActive).toDateString() === new Date().toDateString()).length,
    newToday: users.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString()).length,
  };

  if (loadingShell) {
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
          userName={currentUser?.name || "Admin"}
          userRole={currentUser?.role === 'admin' ? "System Administrator" : "Bus Operator"}
          activeTab="users"
        />

        <main className="flex-1 overflow-auto">
          <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full shadow-sm" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground">Monitor and manage all system users</p>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="secondary" className="rounded-full w-10 h-10 p-0 border border-border/50 shadow-sm overflow-hidden">
                {currentUser?.profilePhoto ? (
                  <img src={currentUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-primary" />
                )}
              </Button>
            </Link>
          </header>

          <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4 transition-transform hover:scale-105 duration-300">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Registered Users</p>
                <p className="text-3xl font-black mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{stats.total}</p>
              </div>
              <div className="glass-card rounded-xl p-4 transition-transform hover:scale-105 duration-300">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Users Today</p>
                <p className="text-3xl font-black mt-2 text-success">{stats.activeToday}</p>
              </div>
              <div className="glass-card rounded-xl p-4 transition-transform hover:scale-105 duration-300">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">New Registrations Today</p>
                <p className="text-3xl font-black mt-2 text-info">{stats.newToday}</p>
              </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden shadow-soft border border-border/50">
              <div className="p-5 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
                <div>
                  <h2 className="text-lg font-bold">User Directory</h2>
                  <p className="text-xs text-muted-foreground">Manage accounts and permissions</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-10 py-2 text-sm w-48 transition-all focus:w-64"
                    />
                  </div>

                  <select
                    className="input-field py-2 text-sm w-36 font-medium text-foreground"
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="driver">Driver</option>
                    <option value="user">Passenger</option>
                  </select>

                  <input
                    type="date"
                    className="input-field py-2 text-sm w-40 text-muted-foreground"
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                    title="Filter by Registration Date"
                  />

                  <Button variant="accent" size="sm" onClick={downloadCSV} className="ml-2 font-bold shadow-sm">
                    Export CSV
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[400px]">
                {loading && users.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-12">
                    <div className="animate-pulse flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <p className="text-sm text-muted-foreground font-medium">Loading directory...</p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-secondary/40 border-b border-border/50">
                      <tr>
                        <th className="p-4 text-left font-bold text-xs text-muted-foreground uppercase tracking-wider">User Profile</th>
                        <th className="p-4 text-left font-bold text-xs text-muted-foreground uppercase tracking-wider">Role Access</th>
                        <th className="p-4 text-left font-bold text-xs text-muted-foreground uppercase tracking-wider">Registration</th>
                        <th className="p-4 text-left font-bold text-xs text-muted-foreground uppercase tracking-wider">Last Login</th>
                        <th className="p-4 text-center font-bold text-xs text-muted-foreground uppercase tracking-wider">Logins</th>
                        <th className="p-4 text-left font-bold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="p-4 left-0 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right pr-6">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {currentUsers.map((user, idx) => (
                        <tr key={idx} className="hover:bg-muted/40 transition-colors cursor-pointer group" onClick={() => setSelectedUser(user)}>
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${user.role.toLowerCase() === 'admin' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              user.role.toLowerCase() === 'driver' ? 'bg-accent/10 text-accent border-accent/20' :
                                'bg-secondary text-muted-foreground border-border/50'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-medium text-foreground/80 whitespace-nowrap">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="p-4 text-sm font-medium text-foreground/80">
                            {user.lastActive ? new Date(user.lastActive).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                          </td>
                          <td className="p-4 text-center font-black text-primary/80">
                            {user.loginHistory?.length || 0}
                          </td>
                          <td className="p-4 text-sm">
                            {user.isBlocked ? (
                              <div className="flex items-center gap-1.5 text-destructive font-bold text-xs bg-destructive/10 px-2 py-1 rounded-md w-max">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" /> Blocked
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-success font-bold text-xs bg-success/10 px-2 py-1 rounded-md w-max">
                                <span className="w-1.5 h-1.5 rounded-full bg-success" /> Active
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-sm pr-6" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-2 justify-end">
                              <Button variant="secondary" size="sm" className="h-8 font-bold shadow-sm" onClick={() => setSelectedUser(user)}>
                                View Details
                              </Button>
                              {user.isBlocked ? (
                                <Button variant="outline" size="sm" className="text-success border-success/30 hover:bg-success/10 hover:text-success h-8 font-medium shadow-sm transition-all" onClick={() => handleUnblockUser(user._id)}>Unblock</Button>
                              ) : (
                                <Button variant="outline" size="sm" className="text-warning border-warning/30 hover:bg-warning/10 hover:text-warning h-8 font-medium shadow-sm transition-all" onClick={() => handleBlockUser(user._id)}>Block</Button>
                              )}
                              <Button variant="destructive" size="sm" className="h-8 font-medium shadow-sm" onClick={() => handleDeleteUser(user._id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {!loading && currentUsers.length === 0 && (
                  <div className="p-12 text-center">
                    <UserIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No users found matching your search.</p>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-border flex justify-between items-center bg-muted/10">
                  <span className="text-sm font-medium text-muted-foreground">Showing <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-foreground">{filteredUsers.length}</span></span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="font-medium shadow-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
                    <div className="flex items-center justify-center w-8 text-sm font-bold text-foreground bg-background border border-border rounded-md shadow-sm">{currentPage}</div>
                    <Button variant="outline" size="sm" className="font-medium shadow-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Details Modal (enhanced) */}
          {selectedUser && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedUser(null)}>
              <div className="bg-background w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden border border-border/50 transform transition-all" onClick={e => e.stopPropagation()}>
                {/* Header Profile Section */}
                <div className="p-8 pb-10 bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-border/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                  
                  <div className="flex justify-between items-start relative z-10 w-full mb-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-black text-4xl shadow-xl ring-4 ring-background">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-3xl font-black tracking-tight text-foreground">{selectedUser.name}</h3>
                          {selectedUser.isBlocked ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-black uppercase tracking-widest border border-destructive/20 shadow-sm">Blocked</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-black uppercase tracking-widest border border-success/20 shadow-sm">Active</span>
                          )}
                        </div>
                        <p className="text-muted-foreground font-medium text-lg">{selectedUser.email}</p>
                        <div className="flex items-center gap-3 mt-4 pt-2">
                          <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-inner ${selectedUser.role.toLowerCase() === 'admin' ? 'bg-destructive/10 text-destructive' : selectedUser.role.toLowerCase() === 'driver' ? 'bg-accent/10 text-accent' : 'bg-secondary text-foreground'}`}>
                            {selectedUser.role} Account
                          </span>
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 bg-background px-3 py-1 rounded-md border border-border/50 shadow-sm">
                            📞 {selectedUser.phone || 'No phone recorded'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full bg-background/50 hover:bg-background shadow-sm hover:rotate-90 transition-transform" onClick={() => setSelectedUser(null)}>
                      <p className="text-lg">✕</p>
                    </Button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-8 grid md:grid-cols-2 gap-8 bg-background">
                  {/* Stats Column */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Account Information</h4>
                      <div className="space-y-4">
                        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-dashed border-border group hover:border-primary/30 transition-colors">
                          <span className="text-sm font-semibold text-muted-foreground">Joined</span>
                          <span className="text-sm font-bold text-foreground group-hover:text-primary">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
                        </div>
                        <div className="glass-card p-4 rounded-xl flex items-center justify-between border-dashed border-border group hover:border-primary/30 transition-colors">
                          <span className="text-sm font-semibold text-muted-foreground">User ID</span>
                          <span className="text-xs font-mono bg-muted/50 px-2 py-1 rounded text-muted-foreground tracking-wider">{selectedUser._id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/20 p-5 rounded-2xl border border-border/50 space-y-4">
                       <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Management Actions</h4>
                       <div className="grid grid-cols-2 gap-3">
                        {selectedUser.isBlocked ? (
                          <Button className="w-full font-bold bg-success hover:bg-success/90 text-white shadow-md" onClick={() => handleUnblockUser(selectedUser._id)}>Restore Access</Button>
                        ) : (
                          <Button variant="outline" className="w-full font-bold text-warning border-warning/30 hover:bg-warning/10 shadow-sm" onClick={() => handleBlockUser(selectedUser._id)}>Suspend User</Button>
                        )}
                        <Button variant="destructive" className="w-full font-bold shadow-md" onClick={() => handleDeleteUser(selectedUser._id)}>Delete Data</Button>
                       </div>
                    </div>
                  </div>
                  
                  {/* Activity Column */}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center justify-between">
                      Recent Activity
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">{selectedUser.loginHistory?.length || 0} Sessions</span>
                    </h4>
                    
                    <div className="glass-card rounded-2xl p-2 border border-border/50 shadow-inner bg-muted/10 h-[280px]">
                      <div className="h-full overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {selectedUser.loginHistory && selectedUser.loginHistory.length > 0 ? (
                          selectedUser.loginHistory.slice().reverse().map((hist, i) => (
                            <div key={i} className="flex flex-col gap-2 p-4 bg-background border border-border/40 hover:border-primary/30 rounded-xl transition-colors shadow-sm relative overflow-hidden group">
                              {i === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-sm text-foreground">{new Date(hist.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(hist.timestamp).toLocaleTimeString()}</p>
                                {i === 0 && <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">Latest</span>}
                              </div>
                              <div className="flex justify-between items-end mt-1">
                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><span className="opacity-50">📱</span> {hist.device || 'Unknown Client'}</p>
                                <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded font-bold text-muted-foreground tracking-wider">{hist.ip || 'Unknown IP'}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                              <span className="text-xl opacity-20">🚫</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">No session history available.</p>
                            <p className="text-xs text-muted-foreground mt-1">This user hasn't logged in recently.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default AdminUsers;
