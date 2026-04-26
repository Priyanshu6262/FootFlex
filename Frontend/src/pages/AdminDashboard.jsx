import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ShoppingBag, CheckCircle2, Truck, Package,
  LayoutDashboard, TrendingUp, Eye, Clock, Filter, X, Search
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

// ── Shared sub-components ───────────────────────────────────
const StatCard = ({ label, value, icon: Icon, trend, trendUp }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-background-card border border-border-accent p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={80} />
    </div>
    <div className="flex items-start justify-between mb-4">
      <div className="p-3.5 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{value}</h3>
    <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">{label}</p>
  </motion.div>
);

const DashboardView = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Polling every 10 seconds for real-time sync
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-4xl font-black text-white tracking-tight mb-2 italic">ANALYTICS <span className="text-primary NOT-italic tracking-normal">DASHBOARD</span></h2>
        <p className="text-text-muted font-medium">Real-time performance metrics and sales overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Sales" value={`₹${stats?.totalSales || 0}`} icon={TrendingUp} trend={`${(stats?.growthRate || 0) > 0 ? '+' : ''}${stats?.growthRate || 0}%`} trendUp={(stats?.growthRate || 0) >= 0} />
        <StatCard label="Total Orders" value={stats?.totalOrders || 0} icon={Package} trend="+12%" trendUp />
        <StatCard label="Active Orders" value={stats?.activeOrders || 0} icon={Clock} trend="+8%" trendUp />
        <StatCard label="Completed Orders" value={stats?.completedOrders || 0} icon={CheckCircle2} trend="+15%" trendUp />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-background-card border border-border-accent p-8 rounded-[3rem] shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            Recent Revenue
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlySales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background-card border border-border-accent p-8 rounded-[3rem] shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            Category Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.pieData || []} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                  {stats?.pieData?.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusFilters = ['All', 'pending', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned'];

  const fetchOrders = async (currentSkip = 0, currentLimit = 15, status = filterStatus, search = searchQuery, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else if (currentSkip === 0 && !isLoadMore) setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const statusParam = status !== 'All' ? `&status=${status}` : '';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`http://localhost:5000/api/orders/admin?skip=${currentSkip}&limit=${currentLimit}${statusParam}${searchParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setOrders(prev => {
            const newOrders = [...prev, ...data.orders];
            // Remove duplicates just in case
            const uniqueIds = new Set();
            return newOrders.filter(o => {
              if (uniqueIds.has(o._id)) return false;
              uniqueIds.add(o._id);
              return true;
            });
          });
        } else {
          setOrders(data.orders);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load orders. Please check if you are logged in as admin.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { 
    const timeoutId = setTimeout(() => {
      fetchOrders(0, 15, filterStatus, searchQuery, false); 
    }, 500);

    // Polling every 10 seconds for real-time order updates
    // It fetches from 0 up to current loaded length to prevent list shrinking
    const interval = setInterval(() => {
      setOrders(currentOrders => {
        const currentLimit = Math.max(15, currentOrders.length);
        fetchOrders(0, currentLimit, filterStatus, searchQuery, false);
        return currentOrders;
      });
    }, 10000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [filterStatus, searchQuery]);

  const handleShowMore = () => {
    if (!hasMore) return;
    const newSkip = orders.length;
    // As per requirement: First load -> 15. Next -> +25. Next -> +35
    const limit = newSkip === 15 ? 25 : 35;
    fetchOrders(newSkip, limit, filterStatus, searchQuery, true);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: updated.status } : o));
    } catch {
      alert('Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Order Management</h2>
          <p className="text-text-muted">Track and manage customer orders across the platform.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text"
              placeholder="Search Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background-card border border-border-accent rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Horizontal Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full">
            {statusFilters.map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  filterStatus === status
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-background-card text-text-secondary border-border-accent hover:border-primary/50'
                }`}
              >
                {status === 'All' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table View for Orders */}
      <div className="bg-background-card border border-border-accent rounded-3xl overflow-hidden shadow-2xl relative max-h-[600px] flex flex-col">
        <div className="overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-background-card border-b border-border-accent/50 shadow-sm">
              <tr className="text-xs text-text-muted font-bold uppercase tracking-wider">
                <th className="p-5 pl-8">Order ID</th>
                <th className="p-5">Product</th>
                <th className="p-5">Price</th>
                <th className="p-5 text-center">Qty</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-accent/30">
              {orders.map((order, idx) => {
                const item = order.items?.[0] ?? {};
                const displayPrice = order.amount ? `₹${Number(order.amount).toFixed(2)}` : (item.price ? `₹${Number(item.price).toFixed(2)}` : 'N/A');
                const totalQty = order.items?.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0) || (Number(item.quantity) || 0);
                
                let normalizedStatus = (order.status || 'pending').toLowerCase();
                if (normalizedStatus === 'initiated') normalizedStatus = 'pending';

                return (
                  <motion.tr 
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors group/row"
                  >
                    <td className="p-5 pl-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover/row:text-primary transition-colors">#{order._id.slice(-8).toUpperCase()}</span>
                        <span className="text-xs text-text-muted mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background-main border border-border-accent p-2 flex shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-lighten" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white line-clamp-1">{item.name || 'Multiple Items'}</p>
                          <p className="text-xs text-text-muted mt-1">{order.shippingAddress?.name || 'Unknown User'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-bold text-primary">{displayPrice}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-lg">{totalQty}</span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="relative inline-block w-36">
                        <select
                          value={normalizedStatus}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className={`w-full appearance-none border rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer transition-all ${
                            normalizedStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            normalizedStatus === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            normalizedStatus === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            normalizedStatus === 'shipped' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                            'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          {['pending', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned'].map(s => (
                            <option key={s} value={s} className="bg-background-card text-white">{s.replace(/-/g, ' ').toUpperCase()}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                          <Filter size={12} />
                        </div>
                      </div>
                    </td>
                    <td className="p-5 pr-8 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-background-main border border-border-accent text-white rounded-xl text-xs font-bold hover:border-primary hover:text-primary transition-all"
                      >
                        <Eye size={14} /> Details
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {orders.length === 0 && !loading && (
            <div className="w-full flex flex-col items-center justify-center py-24 text-text-muted bg-background-main/50 absolute inset-x-0 bottom-0 top-[60px]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <X size={24} />
              </div>
              <p className="font-bold">No orders found for your search/filter</p>
            </div>
          )}
        </div>

        {/* Loading Indicator for progressive load */}
        {loadingMore && (
          <div className="flex justify-center items-center py-6 border-t border-border-accent/30 bg-background-card">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Show More / No More Data Footer */}
        {!loading && orders.length > 0 && (
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

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background-card border border-border-accent rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-border-accent sticky top-0 bg-background-card/90 backdrop-blur-md z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-white">Order Details</h3>
                  <p className="text-sm text-text-muted mt-1 font-mono tracking-widest uppercase">ID: {selectedOrder._id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 bg-background-main border border-border-accent rounded-full text-text-muted hover:text-white hover:border-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Customer & Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background-main border border-border-accent rounded-2xl p-6">
                    <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Customer Info</h4>
                    <p className="text-white font-bold">{selectedOrder.shippingAddress?.name || 'Unknown User'}</p>
                    <p className="text-text-secondary text-sm mt-1">{selectedOrder.user?.email || 'Guest Checkout'}</p>
                    <p className="text-text-secondary text-sm mt-1">Phone: {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-background-main border border-border-accent rounded-2xl p-6">
                    <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Shipping Address</h4>
                    <p className="text-white font-bold">{selectedOrder.shippingAddress?.address || 'N/A'}</p>
                    <p className="text-text-secondary text-sm mt-1">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}
                    </p>
                    <p className="text-text-secondary text-sm mt-1">{selectedOrder.shippingAddress?.country || 'India'}</p>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Ordered Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-6 bg-background-main border border-border-accent rounded-2xl p-4">
                        <div className="w-20 h-20 rounded-xl bg-white/5 border border-border-accent p-2 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-lighten" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-bold text-lg">{item.name}</h5>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs font-bold text-text-muted">QTY: {item.quantity || 1}</span>
                            {item.size && <span className="text-xs font-bold text-text-muted">SIZE: {item.size}</span>}
                            {item.color && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-text-muted">COLOR:</span>
                                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-primary">₹{Number(item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-background-main border border-border-accent rounded-2xl p-6">
                  <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Payment & Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Payment Method</span>
                      <span className="text-white font-bold uppercase">{selectedOrder.paymentMethod || 'Online'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Order Date</span>
                      <span className="text-white font-bold">
                        {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="h-px bg-border-accent/50 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted font-bold uppercase tracking-widest">Total Amount</span>
                      <span className="text-2xl font-black text-primary">₹{Number(selectedOrder.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Admin Dashboard layout ─────────────────────────────
const AdminDashboard = ({ isMobileMenuOpen: externalMobileOpen, setIsMobileMenuOpen: externalSetMobileOpen }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection]       = useState(searchParams.get('section') || 'dashboard');
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const isMobileMenuOpen = externalMobileOpen ?? internalMobileOpen;
  const setIsMobileMenuOpen = externalSetMobileOpen ?? setInternalMobileOpen;

  useEffect(() => {
    const s = searchParams.get('section');
    if (s) setActiveSection(s);
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  return (
    <div className="flex relative">
      <AdminSidebar 
        activeId={activeSection} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <main className="flex-grow p-6 md:p-10 lg:p-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'dashboard'  && <DashboardView />}
            {activeSection === 'all-orders' && <AllOrdersView />}

            {!['dashboard', 'all-orders'].includes(activeSection) && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-background-card border border-border-accent flex items-center justify-center text-primary animate-pulse">
                   <Clock size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 uppercase italic tracking-tight">
                    Under Development
                  </h2>
                  <p className="text-text-muted max-w-md mx-auto">
                    This module is currently being optimized. Please check back later.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="px-6 py-2.5 bg-background-card border border-border-accent rounded-xl text-white font-semibold hover:border-primary transition-all flex items-center gap-2 group"
                >
                  <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                  Return to Dashboard
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
