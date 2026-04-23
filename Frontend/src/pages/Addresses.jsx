import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, Home, Briefcase, ChevronRight, X, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Addresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home',
    isDefault: false
  });

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/address?userId=${user.uid}`);
      const data = await response.json();
      setAddresses(data);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (addresses.length >= 11 && !editingAddress) {
      alert("Maximum limit of 11 addresses reached.");
      return;
    }

    try {
      const url = editingAddress 
        ? `http://localhost:5000/api/address/${editingAddress._id}`
        : 'http://localhost:5000/api/address';
      
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.uid })
      });

      if (response.ok) {
        fetchAddresses();
        setIsFormOpen(false);
        setEditingAddress(null);
        setFormData({ name: '', phone: '', street: '', landmark: '', city: '', state: '', pincode: '', type: 'Home', isDefault: false });
      }
    } catch (err) {
      console.error("Failed to save address", err);
    }
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setFormData(addr);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await fetch(`http://localhost:5000/api/address/${id}`, { method: 'DELETE' });
      fetchAddresses();
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/address/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      });
      fetchAddresses();
    } catch (err) {
      console.error("Failed to set default", err);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-background-main">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Manage <span className="text-primary">Addresses</span></h1>
            <p className="text-text-secondary font-medium">Save and manage your delivery locations ({addresses.length}/11)</p>
          </div>
          <button 
            onClick={() => { setEditingAddress(null); setIsFormOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:shadow-[0_0_25px_rgba(0,122,255,0.4)] transition-all active:scale-95"
          >
            <Plus size={20} />
            ADD NEW ADDRESS
          </button>
        </div>

        {/* Address List */}
        <div className="grid gap-6">
          {addresses.map((addr) => (
            <motion.div 
              layout
              key={addr._id}
              className={`bg-background-card border rounded-3xl p-6 relative overflow-hidden transition-all ${addr.isDefault ? 'border-primary' : 'border-border-accent'}`}
            >
              {addr.isDefault && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
                  Default
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${addr.type === 'Home' ? 'bg-primary/10 text-primary' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    {addr.type === 'Home' ? <Home size={24} /> : <Briefcase size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-bold text-lg tracking-wide">{addr.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${addr.type === 'Home' ? 'bg-primary/20 text-primary' : 'bg-indigo-500/20 text-indigo-500'}`}>
                        {addr.type}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed mb-1">{addr.street}</p>
                    {addr.landmark && <p className="text-text-muted text-xs mb-3 italic">Landmark: {addr.landmark}</p>}
                    <p className="text-white font-semibold text-sm mb-4">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <div className="flex items-center gap-2 text-text-muted text-xs">
                      <Phone size={14} />
                      <span className="font-medium tracking-widest">{addr.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 justify-end md:justify-start">
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(addr._id)}
                      className="p-3 bg-[#18181b] border border-border-accent rounded-2xl text-text-secondary hover:text-primary hover:border-primary transition-all"
                      title="Set as Default"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleEdit(addr)}
                    className="p-3 bg-[#18181b] border border-border-accent rounded-2xl text-text-secondary hover:text-white hover:border-white transition-all"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(addr._id)}
                    className="p-3 bg-[#18181b] border border-border-accent rounded-2xl text-text-secondary hover:text-rose-500 hover:border-rose-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {addresses.length === 0 && (
            <div className="text-center py-20 bg-background-card border border-dashed border-border-accent rounded-[3rem]">
              <MapPin size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
              <p className="text-text-muted font-medium italic">No addresses saved yet.</p>
            </div>
          )}
        </div>

        {/* Address Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-background-card border border-border-accent w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-border-accent flex justify-between items-center bg-[#18181b]">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                     {editingAddress ? 'Edit' : 'Add New'} <span className="text-primary">Address</span>
                   </h2>
                   <button onClick={() => setIsFormOpen(false)} className="text-text-muted hover:text-white transition-colors">
                     <X size={24} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 bg-background-main border border-border-accent rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Phone Number</label>
                        <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-12 bg-background-main border border-border-accent rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Street Address</label>
                      <input required type="text" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="w-full h-12 bg-background-main border border-border-accent rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all" />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Landmark (Optional)</label>
                        <input type="text" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} className="w-full h-12 bg-background-main border border-border-accent rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Pincode</label>
                        <input required type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full h-12 bg-background-main border border-border-accent rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">City</label>
                        <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full h-12 bg-background-main border border-border-accent rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">State</label>
                        <input required type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full h-12 bg-background-main border border-border-accent rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all" />
                      </div>
                   </div>

                   <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                      <div className="flex gap-4">
                        {['Home', 'Work'].map(type => (
                          <button 
                            key={type} type="button" onClick={() => setFormData({...formData, type})}
                            className={`px-6 py-2 rounded-xl border text-xs font-bold transition-all ${formData.type === type ? 'bg-primary border-primary text-white' : 'bg-transparent border-border-accent text-text-muted hover:text-white'}`}
                          >
                            {type.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <div className="relative">
                            <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({...formData, isDefault: e.target.checked})} className="peer hidden" />
                            <div className="w-6 h-6 rounded-md border-2 border-border-accent peer-checked:bg-primary peer-checked:border-primary transition-all" />
                            <CheckCircle2 size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-all" />
                         </div>
                         <span className="text-xs font-bold text-text-secondary group-hover:text-white transition-colors uppercase tracking-widest">Set as default</span>
                      </label>
                   </div>

                   <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-[0_0_25px_rgba(0,122,255,0.3)] hover:shadow-[0_0_40px_rgba(0,122,255,0.5)] transition-all uppercase tracking-widest mt-4">
                     {editingAddress ? 'Update' : 'Save'} Address
                   </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Addresses;
