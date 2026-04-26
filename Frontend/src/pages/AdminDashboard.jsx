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
  LayoutDashboard, TrendingUp, Eye, Clock, Filter, X
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const statusFilters = ['All', 'pending', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned'];

  const fetchOrders = async (pageNum = 1, status = 'All') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const statusParam = status !== 'All' ? `&status=${status}` : '';
      const res = await fetch(`http://localhost:5000/api/orders/admin?page=${pageNum}${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) setOrders(data.orders);
        else setOrders(prev => [...prev, ...data.orders]);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load orders. Please check if you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    setPage(1);
    fetchOrders(1, filterStatus); 

    // Polling every 10 seconds for real-time order updates
    const interval = setInterval(() => {
      fetchOrders(1, filterStatus); // Fetch latest orders for current filter
    }, 10000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleShowMore = () => {
    const next = page + 1;
    setPage(next);
    fetchOrders(next, filterStatus);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Order Management</h2>
          <p className="text-text-muted">Track and manage customer orders across the platform.</p>
        </div>
        
        {/* Horizontal Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {statusFilters.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
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

      {/* Horizontal View for Orders */}
      <div className="relative group">
        <style>{`.orders-scroll::-webkit-scrollbar { display: none; }`}</style>
        <div className="orders-scroll flex overflow-x-auto gap-6 pb-12 snap-x px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {orders.map((order, idx) => {
            const item         = order.items?.[0] ?? {};
            const displayPrice = order.amount ? `₹${Number(order.amount).toFixed(2)}` : (item.price ? `₹${Number(item.price).toFixed(2)}` : 'N/A');
            const totalQty     = order.items?.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0) || (Number(item.quantity) || 0);
            const displayQty   = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;
            const userName     = order.shippingAddress?.name || 'Unknown User';
            const orderDate    = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            
            // Normalize status to lowercase and handle "initiated"
            let normalizedStatus = (order.status || 'pending').toLowerCase();
            if (normalizedStatus === 'initiated') normalizedStatus = 'pending';

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="min-w-[340px] md:min-w-[380px] bg-background-card border border-border-accent p-8 rounded-[3rem] shadow-2xl snap-center flex flex-col gap-6 relative overflow-hidden transition-all hover:border-primary/30"
              >
                {/* Background ID Glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className="text-white font-bold text-sm">{userName}</span>
                    <span className="text-text-muted text-xs mt-0.5">{orderDate}</span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    normalizedStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                    normalizedStatus === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                    normalizedStatus === 'cancelled' ? 'bg-red-500/10 text-red-400' : 
                    normalizedStatus === 'shipped' ? 'bg-purple-500/10 text-purple-400' : 'bg-primary/10 text-primary'
                  }`}>
                    {normalizedStatus}
                  </div>
                </div>

                <div className="flex items-center gap-5 py-4 border-y border-border-accent/30 z-10">
                  <div className="w-20 h-20 rounded-2xl bg-background-main border border-border-accent p-2 flex items-center justify-center">
                    <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-lighten" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-base line-clamp-1">{item.name || 'Multiple Items'}</h4>
                    <p className="text-text-muted text-xs font-semibold">{displayQty} · <span className="text-primary">{displayPrice}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.color && <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.color }} />}
                      {item.size && <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Size {item.size}</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-5 z-10">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Quick Action</label>
                    <div className="relative group/select">
                      <select
                        value={normalizedStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="w-full bg-background-main border border-border-accent rounded-2xl px-5 py-3.5 text-xs text-white font-bold focus:border-primary outline-none appearance-none cursor-pointer transition-all hover:bg-white/5"
                      >
                        {['pending', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned'].map(s => (
                          <option key={s} value={s}>{s.replace(/-/g, ' ').charAt(0).toUpperCase() + s.replace(/-/g, ' ').slice(1)}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover/select:text-primary transition-colors">
                        <Filter size={14} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                      <Eye size={16} /> Details
                    </button>
                    <button className="p-3.5 bg-background-main border border-border-accent text-text-muted hover:text-white hover:border-white/20 rounded-2xl transition-all">
                      <Clock size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {orders.length === 0 && !loading && (
            <div className="w-full flex flex-col items-center justify-center py-20 text-text-muted bg-background-card/20 rounded-[3rem] border border-dashed border-border-accent min-w-[300px]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <X size={24} />
              </div>
              <p className="font-bold">No orders found for "{filterStatus}"</p>
            </div>
          )}
        </div>
      </div>

      {hasMore && orders.length > 0 && (
        <div className="flex justify-center mt-2">
          <button
            onClick={handleShowMore}
            className="px-10 py-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/20"
          >
            {loading ? 'Processing...' : 'Load More Orders'}
          </button>
        </div>
      )}
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
