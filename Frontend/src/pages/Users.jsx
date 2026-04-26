import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, ShieldAlert, Users as UsersIcon, Search, Filter, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const Users = () => {
  const { isMobileMenuOpen: externalMobileOpen, setIsMobileMenuOpen: externalSetMobileOpen } = useOutletContext() || {};
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  
  const isMobileMenuOpen = externalMobileOpen ?? internalMobileOpen;
  const setIsMobileMenuOpen = externalSetMobileOpen ?? setInternalMobileOpen;

  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Modal states
  const [selectedUserOrders, setSelectedUserOrders] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchUsers = async (currentSkip = 0, currentLimit = 15, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else if (currentSkip === 0 && !isLoadMore) setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/users?skip=${currentSkip}&limit=${currentLimit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setUsers(prev => {
            const newUsers = [...prev, ...data.users];
            const uniqueIds = new Set();
            return newUsers.filter(u => {
              if (uniqueIds.has(u._id)) return false;
              uniqueIds.add(u._id);
              return true;
            });
          });
        } else {
          setUsers(data.users);
        }
        setHasMore(data.hasMore);
      } else {
        if (res.status === 401) navigate('/admin/login');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }
    fetchUsers(0, 15, false);
  }, []);

  const handleShowMore = () => {
    if (!hasMore) return;
    const newSkip = users.length;
    const limit = newSkip === 15 ? 25 : 35;
    fetchUsers(newSkip, limit, true);
  };

  const handleBlockToggle = async (userId, currentBlockedStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentBlockedStatus ? 'unblock' : 'block'} this user?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: data.isBlocked } : u));
      } else {
        alert('Failed to update block status');
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
    }
  };

  const handleViewOrders = async (user) => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUserOrders({ user, orders: data });
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-main flex relative">
      {/* Sidebar glow */}
      <div className="absolute left-0 top-0 w-64 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none -z-10" />

      <AdminSidebar 
        activeId="users" 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content */}
      <main className="flex-grow font-sans selection:bg-primary/30 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Shield className="text-primary animate-pulse" size={20} />
              <span className="text-primary font-semibold uppercase tracking-widest text-sm">Administration</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">Manage Users</h1>
            <p className="text-text-muted mt-2 max-w-xl text-lg">
              Monitor customer activity, block suspicious accounts, and view user-specific order histories.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="bg-background-card border border-border-accent rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-primary transition-all w-full md:w-64 text-white"
                />
             </div>
             <button className="p-3 bg-background-card border border-border-accent rounded-2xl text-text-muted hover:text-white hover:border-primary transition-all">
               <Filter size={24} />
             </button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-background-card border border-border-accent rounded-3xl overflow-hidden shadow-xl relative max-h-[600px] flex flex-col">
            <div className="overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="sticky top-0 z-10 bg-background-card border-b border-border-accent/50 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider">Lifetime Stats</th>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider">Returns/Cancellations</th>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-accent/30">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-text-muted">No users found.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <UsersIcon size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-primary transition-colors">{user.name || 'Unknown'}</p>
                              <p className="text-xs text-text-muted mt-1">{user.email || 'No email provided'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-white font-medium">{user.totalOrders} Orders</span>
                            <span className="text-xs text-emerald-400 font-bold tracking-wider">₹{user.totalSales?.toFixed(2) || '0.00'} Sales</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-sm font-bold ${user.cancelledReturned > 0 ? 'text-red-400' : 'text-text-muted'}`}>
                            {user.cancelledReturned} issues
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                            user.isBlocked
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleViewOrders(user)}
                              disabled={ordersLoading}
                              className="p-2 bg-background-main border border-border-accent rounded-xl text-text-muted hover:text-white hover:border-white/20 transition-all group-hover:shadow-md disabled:opacity-50"
                              title="View Orders"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                              className={`p-2 border rounded-xl transition-all group-hover:shadow-md flex items-center gap-2 px-3 ${
                                user.isBlocked
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                  : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                              }`}
                            >
                              {user.isBlocked ? (
                                <><Shield size={16} /><span className="text-xs font-bold uppercase">Unblock</span></>
                              ) : (
                                <><ShieldAlert size={16} /><span className="text-xs font-bold uppercase">Block</span></>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {loadingMore && (
              <div className="flex justify-center items-center py-6 border-t border-border-accent/30 bg-background-card">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && users.length > 0 && (
              <div className="flex justify-center items-center py-6 border-t border-border-accent/30 bg-background-card sticky bottom-0 z-10">
                {hasMore ? (
                  <button
                    onClick={handleShowMore}
                    disabled={loadingMore}
                    className="px-10 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : 'Show More'}
                  </button>
                ) : (
                  <span className="text-text-muted text-xs font-bold uppercase tracking-widest">No more data available</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      </main>

      {/* User Orders Modal */}
      <AnimatePresence>
        {selectedUserOrders && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUserOrders(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background-card border border-border-accent rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col"
            >
              <div className="p-8 border-b border-border-accent shrink-0 flex justify-between items-center bg-background-card/90 backdrop-blur-md rounded-t-[2rem]">
                <div>
                  <h3 className="text-2xl font-black text-white">Order History</h3>
                  <p className="text-sm text-text-muted mt-1 font-medium">{selectedUserOrders.user.name}'s Orders</p>
                </div>
                <button 
                  onClick={() => setSelectedUserOrders(null)}
                  className="p-3 bg-background-main border border-border-accent rounded-full text-text-muted hover:text-white hover:border-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar p-8">
                {selectedUserOrders.orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
                    <p className="text-text-muted font-medium">This user hasn't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedUserOrders.orders.map((order) => (
                      <div key={order._id} className="bg-background-main border border-border-accent rounded-2xl p-6 hover:border-primary/30 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                          <div>
                            <p className="text-xs font-mono text-text-muted mb-1">ID: {order._id}</p>
                            <p className="text-sm text-white font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-emerald-400 tracking-wider">₹{(order.amount || 0).toFixed(2)}</span>
                            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                              ['delivered'].includes((order.status || '').toLowerCase()) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              ['cancelled', 'returned'].includes((order.status || '').toLowerCase()) ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-primary/10 text-primary border-primary/20'
                            }`}>
                              {order.status || 'Pending'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 bg-background-card border border-border-accent/50 rounded-xl p-3">
                              <div className="w-16 h-16 rounded-lg bg-white/5 border border-border-accent shrink-0 p-2">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-lighten" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{item.name}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                  <span className="text-xs font-medium text-text-muted">Qty: <span className="text-white">{item.quantity}</span></span>
                                  {item.size && <span className="text-xs font-medium text-text-muted">Size: <span className="text-white">{item.size}</span></span>}
                                  {item.color && (
                                    <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                                      Color: <span className="w-2.5 h-2.5 rounded-full inline-block border border-border-accent shadow-sm" style={{ backgroundColor: item.color }} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
