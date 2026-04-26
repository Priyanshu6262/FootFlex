import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Plus, CheckCircle2, X, Calendar,
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const CATEGORIES = ['All', 'Men', 'Women', 'Kids'];

const CategoryTabs = ({ active, onChange }) => (
  <div className="flex gap-2 flex-wrap">
    {CATEGORIES.map(cat => (
      <button
        key={cat}
        onClick={() => onChange(cat)}
        className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
          active === cat
            ? 'bg-primary text-white shadow-lg shadow-primary/25'
            : 'bg-background-card border border-border-accent text-text-secondary hover:text-white hover:border-primary'
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

const DealCard = ({ deal, onDelete }) => {
  const now     = new Date();
  const start   = deal.startDate ? new Date(deal.startDate) : null;
  const end     = deal.endDate   ? new Date(deal.endDate)   : null;
  const isLive  = (!start || start <= now) && (!end || end >= now);
  const expired = end && end < now;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-background-card border border-border-accent rounded-3xl p-6 shadow-xl flex flex-col gap-3 relative group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/15 text-primary">
            {deal.category}
          </span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            expired ? 'bg-red-500/10 text-red-400' :
            isLive  ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-yellow-500/10 text-yellow-400'
          }`}>
            {expired ? 'Expired' : isLive ? '● Live' : 'Upcoming'}
          </span>
        </div>
        <button
          onClick={() => onDelete(deal._id)}
          className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shrink-0"
          title="Delete deal"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div>
        <h3 className="text-white font-bold text-lg">{deal.title}</h3>
        {deal.description && <p className="text-text-muted text-sm mt-1">{deal.description}</p>}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 font-black text-xl rounded-2xl">
          {deal.discountPercent}% OFF
        </span>
        {deal.couponCode && (
          <span className="px-3 py-1 bg-background-main border border-border-accent text-white text-sm font-mono font-bold rounded-xl">
            {deal.couponCode}
          </span>
        )}
      </div>

      {(start || end) && (
        <div className="flex items-center gap-2 text-xs text-text-muted mt-1 border-t border-border-accent pt-3">
          <Calendar size={13} />
          {start && <span>From {start.toLocaleDateString()}</span>}
          {start && end && <span>·</span>}
          {end && <span>Until {end.toLocaleDateString()}</span>}
        </div>
      )}
    </motion.div>
  );
};

const UpcomingDeals = ({ isMobileMenuOpen: externalMobileOpen, setIsMobileMenuOpen: externalSetMobileOpen }) => {
  const navigate = useNavigate();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileMenuOpen = externalMobileOpen ?? internalMobileOpen;
  const setIsMobileMenuOpen = externalSetMobileOpen ?? setInternalMobileOpen;

  const [deals, setDeals]           = useState([]);
  const [filterCat, setFilterCat]   = useState('All');
  const [loading, setLoading]       = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', discountPercent: '',
    category: 'All', couponCode: '', startDate: '', endDate: '', isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res   = await fetch('http://localhost:5000/api/offers/admin?type=deal', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setDeals(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.discountPercent) { alert('Title and discount are required.'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res   = await fetch('http://localhost:5000/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, type: 'deal' }),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setForm({ title: '', description: '', discountPercent: '', category: 'All', couponCode: '', startDate: '', endDate: '', isActive: true });
        fetchDeals();
      } else { alert('Failed to create deal'); }
    } catch { alert('Error connecting to server'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    const token = localStorage.getItem('adminToken');
    const res   = await fetch(`http://localhost:5000/api/offers/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setDeals(prev => prev.filter(d => d._id !== id));
    else alert('Failed to delete deal');
  };

  const displayed = filterCat === 'All'
    ? deals
    : deals.filter(d => d.category === filterCat || d.category === 'All');

  return (
    <div className="flex relative">
      <AdminSidebar 
        activeId="upcoming-deals" 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main */}
      <main className="flex-grow p-6 md:p-10 lg:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Upcoming Deals</h1>
            <p className="text-text-muted">Schedule and manage time-limited deals by category.</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={20} /> New Deal
          </button>
        </div>

        {/* Category filter */}
        <div className="mb-8">
          <p className="text-text-muted text-sm font-semibold mb-3">Filter by Category</p>
          <CategoryTabs active={filterCat} onChange={setFilterCat} />
        </div>

        {/* Deal grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence>
            {displayed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayed.map(deal => (
                  <DealCard key={deal._id} deal={deal} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted">
                No deals for <span className="text-white font-bold">{filterCat}</span>. Click "New Deal" to schedule one.
              </div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Create Deal Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-background-main border border-border-accent w-full max-w-lg rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Schedule Deal</h2>
                  <p className="text-text-muted text-sm">Set up a time-limited category deal.</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Deal Title *</label>
                  <input
                    type="text" required value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Monsoon Mega Deal"
                    className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description..."
                    rows={3}
                    className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Discount (%) *</label>
                    <input
                      type="number" min="1" max="100" required value={form.discountPercent}
                      onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                      placeholder="e.g. 40"
                      className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none appearance-none"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Start Date</label>
                    <input
                      type="date" value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">End Date</label>
                    <input
                      type="date" value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                      className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Coupon Code (optional)</label>
                  <input
                    type="text" value={form.couponCode}
                    onChange={e => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. DEAL40"
                    className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white font-mono focus:border-primary outline-none"
                  />
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><CheckCircle2 size={20} /> Schedule Deal</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpcomingDeals;
