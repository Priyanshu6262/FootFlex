import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, RefreshCw, UploadCloud, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    reason: '',
    description: '',
    image: '',
    pickupAddress: {
      name: '', phone: '', street: '', city: '', state: '', pincode: ''
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders(1);
  }, [user]);

  const fetchOrders = async (pageNum = 1) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/user/${user.uid}?page=${pageNum}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setOrders(data.orders);
        } else {
          setOrders(prev => [...prev, ...data.orders]);
        }
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreOrders = () => {
    setLoadingMore(true);
    fetchOrders(page + 1);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, { method: 'PUT' });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setReturnForm({
      reason: '',
      description: '',
      image: '',
      pickupAddress: order.shippingAddress || { name: '', phone: '', street: '', city: '', state: '', pincode: '' }
    });
    setIsReturnModalOpen(true);
  };

  const openTimelineModal = (order) => {
    setSelectedOrder(order);
    setIsTimelineModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReturnForm({ ...returnForm, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const submitReturnRequest = async (e) => {
    e.preventDefault();
    if (!returnForm.reason || !returnForm.image) {
      alert('Please select a reason and upload a photo as proof.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${selectedOrder._id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnForm)
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === selectedOrder._id ? { ...o, status: 'return-requested' } : o));
        setIsReturnModalOpen(false);
        alert('Return request submitted successfully.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit return request');
      }
    } catch (err) {
      console.error('Error submitting return:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': 
      case 'returned': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'return-requested': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'shipped': 
      case 'out-for-delivery': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const renderTimeline = (order) => {
    const stages = [
      { key: 'pending', label: 'Order Placed', icon: Package, done: true },
      { key: 'processing', label: 'Processing', icon: RefreshCw, done: ['processing', 'shipped', 'out-for-delivery', 'delivered'].includes(order.status) },
      { key: 'shipped', label: 'Shipped', icon: Truck, done: ['shipped', 'out-for-delivery', 'delivered'].includes(order.status) },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle, done: order.status === 'delivered' }
    ];

    if (order.status === 'cancelled') {
      return (
        <div className="flex items-center gap-4 text-red-500 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
          <XCircle size={24} />
          <span className="font-bold">Order Cancelled</span>
        </div>
      );
    }

    if (['return-requested', 'returned'].includes(order.status)) {
      return (
        <div className="flex items-center gap-4 text-orange-500 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
          <RefreshCw size={24} />
          <span className="font-bold">Return Process: {order.status === 'returned' ? 'Completed' : 'Requested'}</span>
        </div>
      );
    }

    return (
      <div className="relative flex items-center justify-between mt-8 mb-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border-accent z-0" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500" 
             style={{ width: `${(stages.filter(s => s.done).length - 1) / (stages.length - 1) * 100}%` }} />
        
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                stage.done ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-background-card border-border-accent text-text-muted'
              }`}>
                <Icon size={18} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${stage.done ? 'text-white' : 'text-text-muted'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background-main pt-12 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">My Orders</h1>
        <p className="text-text-muted mb-12">View and manage your recent purchases and returns.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-background-card border border-border-accent rounded-3xl">
            <Package size={64} className="mx-auto text-text-muted opacity-20 mb-4" />
            <h3 className="text-2xl font-bold text-white">No orders yet</h3>
            <p className="text-text-muted mt-2">Looks like you haven't made your first purchase.</p>
            <button onClick={() => navigate('/')} className="mt-6 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-background-card border border-border-accent rounded-3xl p-6 md:p-8 hover:border-primary/30 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border-accent/50 pb-6">
                  <div>
                    <p className="text-xs text-text-muted font-mono mb-1">ORDER #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-white font-medium">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-white tracking-wider">₹{(order.amount || 0).toFixed(2)}</span>
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-6">
                      <div 
                        onClick={() => openTimelineModal(order)}
                        className="w-24 h-24 rounded-2xl bg-white/5 border border-border-accent p-3 shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-lighten" />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left cursor-pointer" onClick={() => openTimelineModal(order)}>
                        <h4 className="text-lg font-bold text-white hover:text-primary transition-colors">{item.name}</h4>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
                          <span className="text-sm font-medium text-text-muted">Qty: <span className="text-white">{item.quantity}</span></span>
                          <span className="text-sm font-medium text-text-muted">Size: <span className="text-white">{item.size}</span></span>
                          {item.color && (
                            <span className="text-sm font-medium text-text-muted flex items-center gap-1.5">
                              Color: <span className="w-3 h-3 rounded-full border border-border-accent" style={{ backgroundColor: item.color }} />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                        {['pending', 'processing'].includes(order.status) && (
                          <button 
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-6 py-2.5 w-full bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                          >
                            Cancel Order
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button 
                            onClick={() => openReturnModal(order)}
                            className="px-6 py-2.5 w-full bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl text-sm font-bold hover:bg-orange-500 hover:text-white transition-all"
                          >
                            Return Order
                          </button>
                        )}
                        <button 
                          onClick={() => openTimelineModal(order)}
                          className="px-6 py-2.5 w-full bg-background-main border border-border-accent rounded-xl text-sm font-bold text-white hover:border-primary transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button 
                  onClick={loadMoreOrders}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-primary/10 border border-primary/20 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Loading...</>
                  ) : (
                    'Show More Orders'
                  )}
                </button>
              </div>
            )}
            {!hasMore && orders.length > 0 && (
              <p className="text-center text-text-muted mt-8 text-sm">No more orders to show</p>
            )}
          </div>
        )}
      </div>

      {/* Return Modal */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background-card border border-border-accent rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white">Return Request</h2>
                <button onClick={() => setIsReturnModalOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submitReturnRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Reason for Return *</label>
                  <select 
                    required
                    value={returnForm.reason}
                    onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                    className="w-full bg-background-main border border-border-accent rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                  >
                    <option value="">Select a reason</option>
                    <option value="Size issue">Size issue</option>
                    <option value="Damaged product">Damaged product</option>
                    <option value="Wrong item received">Wrong item received</option>
                    <option value="Quality not good">Quality not good</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Additional Comments (Optional)</label>
                  <textarea 
                    value={returnForm.description}
                    onChange={(e) => setReturnForm({...returnForm, description: e.target.value})}
                    placeholder="Provide more details about the issue..."
                    className="w-full bg-background-main border border-border-accent rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Upload Proof (Photo) *</label>
                  <div className="border-2 border-dashed border-border-accent hover:border-primary transition-colors rounded-2xl p-6 flex flex-col items-center justify-center bg-background-main relative overflow-hidden group">
                    {returnForm.image ? (
                      <div className="relative w-full h-40">
                        <img src={returnForm.image} alt="Proof" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-bold flex items-center gap-2"><Camera size={20}/> Change Photo</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={40} className="text-text-muted mb-3" />
                        <p className="text-sm font-medium text-text-muted">Click to browse or drag image here</p>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" required={!returnForm.image} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Pickup Address</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" required value={returnForm.pickupAddress.name} onChange={(e) => setReturnForm({...returnForm, pickupAddress: {...returnForm.pickupAddress, name: e.target.value}})} className="w-full bg-background-main border border-border-accent rounded-xl px-4 py-3 text-white" />
                    <input type="text" placeholder="Phone Number" required value={returnForm.pickupAddress.phone} onChange={(e) => setReturnForm({...returnForm, pickupAddress: {...returnForm.pickupAddress, phone: e.target.value}})} className="w-full bg-background-main border border-border-accent rounded-xl px-4 py-3 text-white" />
                    <input type="text" placeholder="Street Address" required value={returnForm.pickupAddress.street} onChange={(e) => setReturnForm({...returnForm, pickupAddress: {...returnForm.pickupAddress, street: e.target.value}})} className="w-full md:col-span-2 bg-background-main border border-border-accent rounded-xl px-4 py-3 text-white" />
                    <input type="text" placeholder="City" required value={returnForm.pickupAddress.city} onChange={(e) => setReturnForm({...returnForm, pickupAddress: {...returnForm.pickupAddress, city: e.target.value}})} className="w-full bg-background-main border border-border-accent rounded-xl px-4 py-3 text-white" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="State" required value={returnForm.pickupAddress.state} onChange={(e) => setReturnForm({...returnForm, pickupAddress: {...returnForm.pickupAddress, state: e.target.value}})} className="w-full bg-background-main border border-border-accent rounded-xl px-4 py-3 text-white" />
                      <input type="text" placeholder="PIN" required value={returnForm.pickupAddress.pincode} onChange={(e) => setReturnForm({...returnForm, pickupAddress: {...returnForm.pickupAddress, pincode: e.target.value}})} className="w-full bg-background-main border border-border-accent rounded-xl px-4 py-3 text-white" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-accent">
                  <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 transition-all text-lg uppercase tracking-wider">
                    Submit Return
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline / Order Details Modal */}
      <AnimatePresence>
        {isTimelineModalOpen && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsTimelineModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background-card border border-border-accent rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8 border-b border-border-accent pb-6">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">Order Details</h2>
                  <p className="text-text-muted font-mono">ID: {selectedOrder._id}</p>
                </div>
                <button onClick={() => setIsTimelineModalOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {renderTimeline(selectedOrder)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-border-accent pb-2">Shipping Information</h3>
                  <div className="bg-background-main rounded-2xl p-5 border border-border-accent">
                    <p className="font-bold text-white mb-1">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-sm text-text-muted">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-sm text-text-muted">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                    <p className="text-sm text-text-muted mt-2 pt-2 border-t border-border-accent">Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-border-accent pb-2">Payment Summary</h3>
                  <div className="bg-background-main rounded-2xl p-5 border border-border-accent space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Payment Method</span>
                      <span className="text-white font-bold uppercase">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Payment Status</span>
                      <span className={`font-bold ${selectedOrder.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-orange-500'}`}>{selectedOrder.paymentStatus}</span>
                    </div>
                    <div className="h-px bg-border-accent my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted font-bold uppercase tracking-widest">Total Amount</span>
                      <span className="text-2xl font-black text-primary">₹{(selectedOrder.amount || 0).toFixed(2)}</span>
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

export default MyOrders;
