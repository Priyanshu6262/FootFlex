import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Tag,
  Clock,
  Settings2,
  Box,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Eye,
  Calendar,
  CheckCircle2,
  Truck,
  PackageCheck,
  Package,
  Sparkles,
  X
} from 'lucide-react';

// --- Sidebar Menu Items ---
const sidebarItems = [
  { id: 'all-orders', label: 'All Orders', icon: ShoppingBag },
  { id: 'add-product', label: 'Add Product', icon: Plus },
  { id: 'add-offer', label: 'Add Offer', icon: Tag },
  { id: 'upcoming-deals', label: 'Upcoming Deals', icon: Clock },
  { id: 'manage-orders', label: 'Manage Orders', icon: Settings2 },
  { id: 'available-products', label: 'Available Products', icon: Box },
];

// --- Removed Mock Data ---

// --- Sub-components ---

const StatusBadge = ({ status }) => {
  const styles = {
    'Initiated': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Shipped': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Out for Delivery': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Delivered': 'bg-badge-new/10 text-badge-new border-badge-new/20',
  };

  const icons = {
    'Initiated': <Package size={14} />,
    'Shipped': <Truck size={14} />,
    'Out for Delivery': <Clock size={14} />,
    'Delivered': <CheckCircle2 size={14} />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

const AllOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    fetchOrders(0, true);
  }, []);

  const fetchOrders = async (currentSkip, isInitial = false) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders?limit=${limit}&skip=${currentSkip}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();

      if (isInitial) {
        setOrders(data.orders);
      } else {
        setOrders(prev => [...prev, ...data.orders]);
      }

      if (data.orders.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleShowMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchOrders(newSkip, false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');

      const updatedOrder = await res.json();

      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: updatedOrder.status } : order
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Order Management</h2>
          <p className="text-text-muted">Track and manage customer orders across the platform.</p>
        </div>
      </div>

      <div className="relative">
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style dangerouslySetInnerHTML={{
            __html: `
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
          `}} />
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-background-card border border-border-accent rounded-3xl p-6 min-w-[320px] max-w-[320px] snap-center flex flex-col justify-between shadow-xl"
            >
              {(() => {
                const item = order.items && order.items.length > 0 ? order.items[0] : {};
                const customerName = order.shippingAddress?.name || 'Unknown';
                return (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-lg">#{order._id.slice(-6).toUpperCase()}</span>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-background-main border border-border-accent shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name || 'Product'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-text-muted">No Image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">{item.name || 'Unknown Product'}</h3>
                        <p className="text-text-muted text-sm">Qty: {item.quantity || 0}{order.items && order.items.length > 1 ? ` (+${order.items.length - 1})` : ''}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-background-main p-3 rounded-2xl border border-border-accent min-w-0">
                        <p className="text-[#a1a1aa] text-[10px] uppercase font-bold tracking-wider mb-1">Customer</p>
                        <p className="text-white text-sm font-semibold truncate">{customerName}</p>
                      </div>
                      <div className="bg-background-main p-3 rounded-2xl border border-border-accent min-w-0">
                        <p className="text-[#a1a1aa] text-[10px] uppercase font-bold tracking-wider mb-1">Date</p>
                        <p className="text-white text-sm font-semibold truncate">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#a1a1aa] text-xs font-semibold pl-1">Change Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Initiated">Initiated</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all">
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            </motion.div>
          ))}

          {orders.length === 0 && (
            <div className="w-full text-center py-20 text-text-muted">No orders found.</div>
          )}
        </div>
      </div>

      {hasMore && orders.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleShowMore}
            className="px-8 py-3 bg-background-card border border-border-accent hover:border-primary text-white font-bold rounded-xl transition-all"
          >
            Show More Orders
          </button>
        </div>
      )}
    </div>
  );
};

const AddProductView = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Men',
    category: 'Running Shoes',
    price: '',
    discount: '',
    coupon: '',
    image: null,
    inventory: []
  });

  const [currentVariant, setCurrentVariant] = useState({ size: '6', color: 'Black', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const categories = ['Running Shoes', 'Casual Shoes', 'Sports Shoes', 'Formal Shoes'];
  const sizes = ['6', '7', '8', '9', '10', '11', '12'];
  const colors = ['Black', 'White', 'Blue', 'Green', 'Gray', 'Red', 'Orange'];

  const handleAddVariant = () => {
    if (currentVariant.quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }
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
    const updated = formData.inventory.filter((_, i) => i !== index);
    setFormData({ ...formData, inventory: updated });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if format is supported
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      alert('Only JPG, PNG, and WEBP formats are supported.');
      return;
    }

    let compressedFile;
    try {
      const options = {
        maxSizeMB: 0.15, // 150KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      compressedFile = await imageCompression(file, options);

      if (compressedFile.size > 150 * 1024) {
        alert('Image size must be under 150KB. Please try a smaller image.');
        return;
      }

      setFormData(prev => ({ ...prev, image: compressedFile }));
      setPreviewImage(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error('Compression error:', error);
      alert('Failed to compress image. Please try again.');
      return;
    }

    // Attempt background removal
    setIsRemovingBg(true);
    try {
      const bgData = new FormData();
      bgData.append('image', compressedFile);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Session expired. Please log in again.');
        window.location.href = '/admin/login';
        return;
      }

      const bgResponse = await fetch('http://localhost:5000/api/ai/remove-bg', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: bgData
      });

      if (bgResponse.status === 401) {
        localStorage.removeItem('adminToken');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/admin/login';
        return;
      }

      if (!bgResponse.ok) {
        const errText = await bgResponse.text();
        console.warn('Background removal failed:', errText, '— using original image.');
        // Gracefully keep the original compressed image
      } else {
        const blob = await bgResponse.blob();
        const cleanedFile = new File([blob], 'cleaned_image.png', { type: 'image/png' });
        setFormData(prev => ({ ...prev, image: cleanedFile }));
        setPreviewImage(URL.createObjectURL(cleanedFile));
      }
    } catch (error) {
      console.error('Background removal error:', error);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.inventory.length === 0) {
      alert('Please add at least one size/color variant with quantity.');
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'inventory') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: data
      });

      if (response.ok) {
        alert('Product added successfully!');
        setFormData({
          name: '', gender: 'Men', category: 'Running Shoes',
          price: '', discount: '', coupon: '', image: null,
          inventory: []
        });
        setPreviewImage(null);
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Add New Product</h2>
        <p className="text-text-muted">Create a new listing for your store catalog.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 bg-background-card/50 backdrop-blur-xl border border-border-accent p-8 rounded-[2.5rem] shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Product Name</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleInputChange} required
                className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all"
                placeholder="e.g. Nike Air Max Apex"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Price (INR)</label>
                <input
                  type="number" name="price" value={formData.price} onChange={handleInputChange} required
                  className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Discount (%)</label>
                <input
                  type="number" name="discount" value={formData.discount} onChange={handleInputChange}
                  className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Gender</label>
                <select
                  name="gender" value={formData.gender} onChange={handleInputChange}
                  className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Category</label>
                <select
                  name="category" value={formData.category} onChange={handleInputChange}
                  className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>


            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Coupon/Offer</label>
              <input
                type="text" name="coupon" value={formData.coupon} onChange={handleInputChange}
                className="w-full bg-background-main border border-border-accent rounded-2xl py-3 px-4 text-white focus:border-primary outline-none transition-all"
                placeholder="e.g. SUMMER25"
              />
            </div>
          </div>

          {/* Right Column (Image Upload) */}
          <div className="space-y-6">
            <label className="block text-sm font-semibold text-text-secondary mb-2">Product Image</label>
            <div className="relative group h-[300px]">
              <input
                type="file" accept="image/*" onChange={handleImageChange} required={!previewImage}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full h-full border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${previewImage ? 'border-primary/50' : 'border-border-accent group-hover:border-primary'} relative overflow-hidden`}>
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Preview" className={`w-full h-full object-contain p-4 rounded-[2rem] transition-opacity ${isRemovingBg ? 'opacity-50' : 'opacity-100'}`} />
                    {isRemovingBg && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-main/50 backdrop-blur-sm z-20">
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

        {/* Inventory Variants Section */}
        <div className="bg-background-card/80 border border-border-accent rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={24} className="text-primary" />
              Inventory Variants
            </h3>
            <div className="bg-primary/20 text-primary px-4 py-1.5 rounded-full font-black text-sm flex items-center gap-2">
              Total Quantity: {formData.inventory.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-background-main p-4 rounded-2xl border border-border-accent">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Size</label>
              <select
                value={currentVariant.size} onChange={(e) => setCurrentVariant({ ...currentVariant, size: e.target.value })}
                className="w-full bg-background-card border border-border-accent rounded-xl py-2.5 px-4 text-white focus:border-primary outline-none appearance-none"
              >
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Color</label>
              <select
                value={currentVariant.color} onChange={(e) => setCurrentVariant({ ...currentVariant, color: e.target.value })}
                className="w-full bg-background-card border border-border-accent rounded-xl py-2.5 px-4 text-white focus:border-primary outline-none appearance-none"
              >
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Quantity</label>
              <input
                type="number" min="1" value={currentVariant.quantity} onChange={(e) => setCurrentVariant({ ...currentVariant, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-background-card border border-border-accent rounded-xl py-2.5 px-4 text-white focus:border-primary outline-none"
              />
            </div>
            <button
              type="button" onClick={handleAddVariant}
              className="w-full py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </div>

          {/* Added Variants List */}
          {formData.inventory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {formData.inventory.map((variant, index) => (
                <div key={index} className="flex items-center justify-between bg-background-main border border-border-accent p-3 rounded-xl">
                  <div>
                    <div className="text-white font-bold text-sm">Size: {variant.size} • {variant.color}</div>
                    <div className="text-text-muted text-xs">{variant.quantity} in stock</div>
                  </div>
                  <button
                    type="button" onClick={() => handleRemoveVariant(index)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-text-muted text-sm border border-dashed border-border-accent rounded-xl">
              No variants added yet. Select size, color, and quantity above.
            </div>
          )}
        </div>

        <button
          type="submit" disabled={isSubmitting}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 size={24} />
              Save Product
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// --- Main Dashboard Layout ---

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('all-orders');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background-main flex relative">
      {/* Sidebar background effects */}
      <div className="absolute left-0 top-0 w-64 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none -z-10" />

      {/* --- Sidebar (Left Section) --- */}
      <aside
        className={`fixed md:sticky top-20 left-0 h-[calc(100vh-80px)] w-72 bg-background-card/30 backdrop-blur-3xl border-r border-border-accent z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="mb-10 px-2">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Management</h2>
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group ${activeSection === item.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-text-secondary hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon size={20} className={activeSection === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                  <span className="font-semibold text-sm">{item.label}</span>
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight">Admin User</div>
                  <div className="text-[10px] text-primary font-semibold uppercase tracking-wider">Super Admin</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content (Right Section) --- */}
      <main className="flex-grow p-6 md:p-10 lg:p-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'all-orders' && <AllOrdersView />}
            {activeSection === 'add-product' && <AddProductView />}

            {!['all-orders', 'add-product'].includes(activeSection) && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-background-card border border-border-accent flex items-center justify-center text-primary animate-pulse">
                  {sidebarItems.find(i => i.id === activeSection)?.icon({ size: 40 })}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {sidebarItems.find(i => i.id === activeSection)?.label}
                  </h2>
                  <p className="text-text-muted max-w-md mx-auto">
                    The {sidebarItems.find(i => i.id === activeSection)?.label} module is currently under development. Please check back later.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('all-orders')}
                  className="px-6 py-2.5 bg-background-card border border-border-accent rounded-xl text-white font-semibold hover:border-primary transition-all flex items-center gap-2 group"
                >
                  <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
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
