import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Plus, CheckCircle2, X,
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const CATEGORIES = ['All', 'Men', 'Women', 'Kids'];

// ── Category Tab Bar ───────────────────────────────────────────────────────
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

// ── Offer Card ─────────────────────────────────────────────────────────────
const OfferCard = ({ offer, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-background-card border border-border-accent rounded-3xl p-6 shadow-xl flex flex-col gap-3 relative group"
  >
    {/* Badge */}
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/15 text-primary">
        {offer.category}
      </span>
      <button
        onClick={() => onDelete(offer._id)}
        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
        title="Delete offer"
      >
        <Trash2 size={16} />
      </button>
    </div>

    <div>
      <h3 className="text-white font-bold text-lg leading-tight">{offer.title}</h3>
      {offer.description && <p className="text-text-muted text-sm mt-1">{offer.description}</p>}
    </div>

    <div className="flex items-center gap-3 flex-wrap">
      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 font-black text-xl rounded-2xl">
        {offer.discountPercent}% OFF
      </span>
      {offer.couponCode && (
        <span className="px-3 py-1 bg-background-main border border-border-accent text-white text-sm font-mono font-bold rounded-xl">
          {offer.couponCode}
        </span>
      )}
    </div>
  </motion.div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const AddOffer = ({ isMobileMenuOpen: externalMobileOpen, setIsMobileMenuOpen: externalSetMobileOpen }) => {
  const navigate = useNavigate();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileMenuOpen = externalMobileOpen ?? internalMobileOpen;
  const setIsMobileMenuOpen = externalSetMobileOpen ?? setInternalMobileOpen;

  const [offers, setOffers]         = useState([]);
  const [filterCat, setFilterCat]   = useState('All');
  const [loading, setLoading]       = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '', description: '', discountPercent: '',
    category: 'All', couponCode: '', isActive: true, type: 'offer',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res   = await fetch('http://localhost:5000/api/offers/admin?type=offer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOffers(await res.json());
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
        body: JSON.stringify({ ...form, type: 'offer' }),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setForm({ title: '', description: '', discountPercent: '', category: 'All', couponCode: '', isActive: true, type: 'offer' });
        fetchOffers();
      } else { alert('Failed to create offer'); }
    } catch { alert('Error connecting to server'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    const token = localStorage.getItem('adminToken');
    const res   = await fetch(`http://localhost:5000/api/offers/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setOffers(prev => prev.filter(o => o._id !== id));
    else alert('Failed to delete offer');
  };

  const displayed = filterCat === 'All'
    ? offers
    : offers.filter(o => o.category === filterCat || o.category === 'All');

  return (
    <div className="flex relative">
      <AdminSidebar 
        activeId="add-offer" 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main */}
      <main className="flex-grow p-6 md:p-10 lg:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Manage Offers</h1>
            <p className="text-text-muted">Create and manage category-based discount offers.</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={20} /> New Offer
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-8">
          <p className="text-text-muted text-sm font-semibold mb-3">Filter by Category</p>
          <CategoryTabs active={filterCat} onChange={setFilterCat} />
        </div>

        {/* Offer grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence>
            {displayed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayed.map(offer => (
                  <OfferCard key={offer._id} offer={offer} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted">
                No offers found for <span className="text-white font-bold">{filterCat}</span>. Click "New Offer" to add one.
              </div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Create Offer Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-background-main border border-border-accent w-full max-w-lg rounded-[3rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">New Offer</h2>
                  <p className="text-text-muted text-sm">Create a category-specific discount offer.</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Offer Title *</label>
                  <input
                    type="text" required value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Summer Sale"
                    className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of the offer..."
                    rows={3}
                    className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all resize-none"
                  />
                </div>

                {/* Discount + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Discount (%) *</label>
                    <input
                      type="number" min="1" max="100" required value={form.discountPercent}
                      onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                      placeholder="e.g. 25"
                      className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all"
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

                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Coupon Code (optional)</label>
                  <input
                    type="text" value={form.couponCode}
                    onChange={e => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE25"
                    className="w-full bg-background-card border border-border-accent rounded-2xl py-3 px-4 text-white font-mono focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={submitting}
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><CheckCircle2 size={20} /> Create Offer</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddOffer;
