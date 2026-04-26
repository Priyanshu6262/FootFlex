import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Plus, Tag, Clock, Settings2, Box,
  CheckCircle2, Package, X, LayoutDashboard, Edit2, Trash2
} from 'lucide-react';

import AdminSidebar from '../components/AdminSidebar';

// --- Product Form ---
const ProductForm = ({ initialData, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    gender: initialData?.gender || 'Men',
    category: initialData?.category || 'Running Shoes',
    price: initialData?.price || '',
    discount: initialData?.discount || '',
    coupon: initialData?.coupon || '',
    image: null,
    inventory: initialData?.inventory || []
  });
  const [currentVariant, setCurrentVariant] = useState({ size: '6', color: 'Black', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    initialData?.imageUrl ? `http://localhost:5000${initialData.imageUrl}` : null
  );

  const categories = ['Running Shoes', 'Casual Shoes', 'Sports Shoes', 'Formal Shoes'];
  const sizes = ['6', '7', '8', '9', '10', '11', '12'];
  const colors = ['Black', 'White', 'Blue', 'Green', 'Gray', 'Red', 'Orange'];

  const handleAddVariant = () => {
    if (currentVariant.quantity < 1) { alert('Quantity must be at least 1'); return; }
    const exists = formData.inventory.findIndex(v => v.size === currentVariant.size && v.color === currentVariant.color);
    if (exists >= 0) {
      const updated = [...formData.inventory];
      updated[exists].quantity += Number(currentVariant.quantity);
      setFormData({ ...formData, inventory: updated });
    } else {
      setFormData({ ...formData, inventory: [...formData.inventory, { ...currentVariant, quantity: Number(currentVariant.quantity) }] });
    }
  };

  const handleRemoveVariant = (index) => {
    setFormData({ ...formData, inventory: formData.inventory.filter((_, i) => i !== index) });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WEBP formats are supported.'); return;
    }
    let compressedFile;
    try {
      compressedFile = await imageCompression(file, { maxSizeMB: 0.15, maxWidthOrHeight: 1920, useWebWorker: true });
      if (compressedFile.size > 150 * 1024) { alert('Image too large. Try a smaller image.'); return; }
      setFormData(prev => ({ ...prev, image: compressedFile }));
      setPreviewImage(URL.createObjectURL(compressedFile));
    } catch { alert('Failed to compress image.'); return; }

    setIsRemovingBg(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { window.location.href = '/admin/login'; return; }
      const bgData = new FormData();
      bgData.append('image', compressedFile);
      const bgResponse = await fetch('http://localhost:5000/api/ai/remove-bg', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: bgData
      });
      if (bgResponse.status === 401) { localStorage.removeItem('adminToken'); window.location.href = '/admin/login'; return; }
      if (bgResponse.ok) {
        const blob = await bgResponse.blob();
        const cleanedFile = new File([blob], 'cleaned_image.png', { type: 'image/png' });
        setFormData(prev => ({ ...prev, image: cleanedFile }));
        setPreviewImage(URL.createObjectURL(cleanedFile));
      }
    } catch (err) { console.error('BG removal error:', err); }
    finally { setIsRemovingBg(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.inventory.length === 0) { alert('Add at least one size/color variant.'); return; }
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'inventory') data.append(key, JSON.stringify(formData[key]));
      else if (formData[key] !== null && formData[key] !== undefined) data.append(key, formData[key]);
    });
    try {
      const url = initialData ? `http://localhost:5000/api/products/${initialData._id}` : 'http://localhost:5000/api/products';
      const method = initialData ? 'PUT' : 'POST';
      const response = await fetch(url, { method, body: data });
      if (response.ok) {
        const result = await response.json();
        alert(initialData ? 'Product updated!' : 'Product added!');
        if (!initialData) {
          setFormData({ name: '', gender: 'Men', category: 'Running Shoes', price: '', discount: '', coupon: '', image: null, inventory: [] });
          setPreviewImage(null);
        }
        if (onSuccess) onSuccess(result.product);
      } else { alert('Failed to save product'); }
    } catch { alert('Error connecting to server'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-background-card/50 backdrop-blur-xl border border-border-accent p-8 rounded-[2.5rem] shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all" placeholder="e.g. Nike Air Max Apex" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Price (INR)</label>
              <input type="number" name="price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Discount (%)</label>
              <input type="number" name="discount" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none appearance-none">
                {['Men','Women','Kids','Unisex'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Category</label>
              <select name="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none appearance-none">
                {categories.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Coupon/Offer</label>
            <input type="text" name="coupon" value={formData.coupon} onChange={e => setFormData({...formData, coupon: e.target.value})} className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all" placeholder="e.g. SUMMER25" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Product Image</label>
          <div className="relative group h-[300px]">
            <input type="file" accept="image/*" onChange={handleImageChange} required={!previewImage} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className={`w-full h-full border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all relative overflow-hidden ${previewImage ? 'border-primary/50' : 'border-border-accent group-hover:border-primary'}`}>
              {previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className={`w-full h-full object-contain p-4 transition-opacity ${isRemovingBg ? 'opacity-50' : 'opacity-100'}`} />
                  {isRemovingBg && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-main/60 backdrop-blur-sm z-20">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Removing Background...</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Plus size={40} className="text-text-muted mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-text-muted text-sm group-hover:text-white transition-colors">Click to upload image</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Variants */}
      <div className="bg-background-card/80 border border-border-accent rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><Package size={22} className="text-primary" />Inventory Variants</h3>
          <div className="bg-primary/20 text-primary px-4 py-1.5 rounded-full font-black text-sm">Total: {formData.inventory.reduce((s, i) => s + i.quantity, 0)}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end bg-background-main p-4 rounded-2xl border border-border-accent">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Size</label>
            <select value={currentVariant.size} onChange={e => setCurrentVariant({...currentVariant, size: e.target.value})} className="w-full bg-background-card border border-border-accent rounded-xl py-2.5 px-3 text-white outline-none appearance-none">
              {sizes.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Color</label>
            <select value={currentVariant.color} onChange={e => setCurrentVariant({...currentVariant, color: e.target.value})} className="w-full bg-background-card border border-border-accent rounded-xl py-2.5 px-3 text-white outline-none appearance-none">
              {colors.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Quantity</label>
            <input type="number" min="1" value={currentVariant.quantity} onChange={e => setCurrentVariant({...currentVariant, quantity: parseInt(e.target.value)||1})} className="w-full bg-background-card border border-border-accent rounded-xl py-2.5 px-3 text-white outline-none" />
          </div>
          <button type="button" onClick={handleAddVariant} className="w-full py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"><Plus size={16}/>Add</button>
        </div>
        {formData.inventory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {formData.inventory.map((v, i) => (
              <div key={i} className="flex items-center justify-between bg-background-main border border-border-accent p-3 rounded-xl">
                <div>
                  <div className="text-white font-bold text-sm">Size {v.size} · {v.color}</div>
                  <div className="text-text-muted text-xs">{v.quantity} in stock</div>
                </div>
                <button type="button" onClick={() => handleRemoveVariant(i)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"><X size={15}/></button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-5 text-text-muted text-sm border border-dashed border-border-accent rounded-xl">No variants added yet.</p>
        )}
      </div>

      <div className="flex gap-4">
        {onCancel && <button type="button" onClick={onCancel} className="flex-1 py-4 bg-background-main border border-border-accent text-white rounded-2xl font-bold text-lg hover:bg-white/5 transition-all">Cancel</button>}
        <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={22}/>{initialData ? 'Update Product' : 'Save Product'}</>}
        </button>
      </div>
    </form>
  );
};

// --- Main Page ---
const ListedProducts = ({ isMobileMenuOpen: externalMobileOpen, setIsMobileMenuOpen: externalSetMobileOpen }) => {
  const navigate = useNavigate();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileMenuOpen = externalMobileOpen ?? internalMobileOpen;
  const setIsMobileMenuOpen = externalSetMobileOpen ?? setInternalMobileOpen;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products, status:', res.status);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
      else alert('Failed to delete product');
    } catch { alert('Error deleting product'); }
  };

  return (
    <div className="min-h-screen bg-background-main flex relative">
      {/* Sidebar glow */}
      <div className="absolute left-0 top-0 w-64 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none -z-10" />

      <AdminSidebar 
        activeId="listed-products" 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 lg:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Listed Products</h1>
            <p className="text-text-muted">Manage your store's inventory and product listings.</p>
          </div>
          <button
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-background-card border border-border-accent rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background-main border-b border-border-accent">
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider">Product</th>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider">Category</th>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider">Price</th>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-[#a1a1aa] text-xs uppercase font-bold tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-accent">
                  {products.length > 0 ? products.map(product => (
                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-background-main border border-border-accent shrink-0">
                            {product.imageUrl
                              ? <img src={`http://localhost:5000${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">No Img</div>
                            }
                          </div>
                          <div className="font-bold text-white text-base max-w-[200px] truncate" title={product.name}>{product.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-secondary">{product.category}</div>
                        <div className="text-xs text-text-muted">{product.gender}</div>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">₹{product.price?.toLocaleString('en-IN') || '0'}</td>
                      <td className="px-6 py-4 text-white font-semibold">{product.totalQuantity || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-colors" title="Edit"><Edit2 size={18}/></button>
                          <button onClick={() => handleDelete(product._id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors" title="Delete"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center text-text-muted">No products found. Click "Add Product" to get started!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit / Add Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-background-main border border-border-accent w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-6 md:p-10 shadow-2xl relative"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                    <p className="text-text-muted">{editingProduct ? 'Update product details.' : 'Create a new listing for your store.'}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"><X size={22}/></button>
                </div>
                <ProductForm
                  initialData={editingProduct}
                  onCancel={() => setIsModalOpen(false)}
                  onSuccess={() => { setIsModalOpen(false); fetchProducts(); }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ListedProducts;
