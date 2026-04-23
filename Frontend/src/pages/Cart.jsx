import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronRight, ShieldCheck, Tag, CreditCard, MapPin, Package, CheckCircle2, ChevronLeft, Plus, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const steps = ['BAG', 'ADDRESS', 'PAYMENT'];

const Cart = () => {
  const { cart, cartCount, cartTotalMrp, discountTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Address selection state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user && activeStep === 1) {
      fetchAddresses();
    }
  }, [activeStep, user]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/address?userId=${user.uid}`);
      const data = await response.json();
      setAddresses(data);
      // Auto-select default address if available
      const defaultAddr = data.find(addr => addr.isDefault);
      if (defaultAddr && !selectedAddress) {
        setSelectedAddress(defaultAddr);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  const totalAmount = cartTotalMrp - discountTotal;

  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center bg-background-main">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 text-center tracking-tight">Order Confirmed!</h1>
        <p className="text-text-muted text-lg text-center max-w-md mb-8">
          Thank you for your purchase. We've received your order and are getting it ready to ship.
        </p>
        <Link to="/" onClick={clearCart} className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-40 pb-24 px-6 flex flex-col items-center text-center bg-background-main">
        <div className="w-32 h-32 mb-8 opacity-20"><Package size={128} className="text-white" /></div>
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Your bag is empty</h2>
        <p className="text-[#a1a1aa] mb-8 max-w-sm">Looks like you haven't added anything to your bag yet. Let's get you some fresh kicks.</p>
        <Link to="/men" className="bg-white text-black font-bold uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto bg-background-main">
      
      {/* Checkout Progress Bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#27272a] -z-10 rounded-full overflow-hidden">
             <motion.div 
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
             />
          </div>
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-500 ${
                index <= activeStep ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
              }`}>
                {index < activeStep ? <CheckCircle2 size={16} /> : index + 1}
              </div>
              <span className={`text-[10px] sm:text-xs font-bold tracking-wider ${index <= activeStep ? 'text-white' : 'text-[#71717a]'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Column: Form Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* STEP 0: BAG */}
            {activeStep === 0 && (
              <motion.div 
                key="step-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col gap-6">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="bg-background-card border border-border-accent rounded-3xl p-4 sm:p-6 flex gap-4 sm:gap-6 relative group overflow-hidden">
                      <Link to={`/product/${item.id}`} className="w-24 sm:w-32 h-24 sm:h-32 bg-[#18181b] rounded-2xl flex items-center justify-center border border-[#27272a] overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-screen" />
                      </Link>
                      
                      <div className="flex flex-col justify-between w-full">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-white font-bold sm:text-lg tracking-tight mb-1">{item.name}</h3>
                            <p className="text-text-muted text-xs sm:text-sm font-medium mb-3">{item.gender}'s {item.category} Shoes</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-[#d4d4d8]">Size: <span className="text-white font-bold ml-1">{item.size}</span></div>
                              <div className="text-[#d4d4d8]">Color: <span className="font-bold flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-gray-600 inline-block ml-1" style={{ backgroundColor: item.color }}/></span></div>
                            </div>
                          </div>
                          
                          <button onClick={() => removeFromCart(item.cartItemId)} className="text-[#a1a1aa] hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-full">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center gap-3 bg-[#18181b] border border-[#27272a] rounded-xl p-1">
                            <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#27272a] rounded-lg transition-colors font-bold">-</button>
                            <span className="w-6 text-center text-white font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#27272a] rounded-lg transition-colors font-bold">+</button>
                          </div>
                          <div className="text-right">
                             {item.discount > 0 && <div className="text-xs text-text-muted line-through mb-0.5">₹{(item.price * item.quantity).toFixed(2)}</div>}
                             <div className="text-lg font-black text-white">₹{((item.price * (1 - item.discount / 100)) * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 1: ADDRESS */}
            {activeStep === 1 && (
              <motion.div 
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-background-card border border-border-accent rounded-[2.5rem] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border-accent">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <MapPin size={24} />
                      </div>
                      <h2 className="text-xl font-black text-white uppercase tracking-wider">Select Delivery Address</h2>
                    </div>
                    <Link to="/addresses" className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-border-accent rounded-xl text-xs font-bold text-white hover:bg-[#27272a] transition-all uppercase tracking-widest">
                       <Plus size={16} /> Manage Addresses
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.slice(0, showAllAddresses ? addresses.length : 3).map((addr) => (
                      <div 
                        key={addr._id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`cursor-pointer p-5 rounded-3xl border-2 transition-all relative group ${selectedAddress?._id === addr._id ? 'border-primary bg-primary/5' : 'border-border-accent bg-[#18181b] hover:border-[#3f3f46]'}`}
                      >
                         <div className="flex items-start gap-4">
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAddress?._id === addr._id ? 'border-primary' : 'border-[#52525b]'}`}>
                               {selectedAddress?._id === addr._id && <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,122,255,0.6)]" />}
                            </div>
                            <div className="flex-grow">
                               <div className="flex items-center gap-3 mb-2">
                                  <span className="text-white font-bold uppercase tracking-tight">{addr.name}</span>
                                  <span className="bg-[#27272a] text-[10px] font-black px-2 py-0.5 rounded text-text-muted uppercase">{addr.type}</span>
                                  {addr.isDefault && <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">Default</span>}
                               </div>
                               <p className="text-text-secondary text-sm leading-relaxed mb-1">{addr.street}</p>
                               <p className="text-white text-xs font-semibold">{addr.city}, {addr.state} - {addr.pincode}</p>
                               <p className="text-text-muted text-xs mt-3 flex items-center gap-1.5"><Phone size={12}/> {addr.phone}</p>
                            </div>
                         </div>
                      </div>
                    ))}

                    {addresses.length > 3 && !showAllAddresses && (
                      <button 
                        onClick={() => setShowAllAddresses(true)}
                        className="py-4 text-primary font-black text-xs uppercase tracking-[0.2em] border border-dashed border-border-accent rounded-2xl hover:bg-primary/5 transition-all"
                      >
                        Show {addresses.length - 3} More Addresses
                      </button>
                    )}

                    {addresses.length === 0 && (
                      <div className="text-center py-12 bg-[#18181b] rounded-3xl border border-dashed border-border-accent">
                         <MapPin size={40} className="mx-auto text-text-muted mb-4 opacity-20" />
                         <p className="text-text-muted font-medium mb-6">No saved addresses found.</p>
                         <Link to="/addresses" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(0,122,255,0.3)]">
                           ADD NEW ADDRESS
                         </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PAYMENT */}
            {activeStep === 2 && (
              <motion.div 
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-background-card border border-border-accent rounded-[2.5rem] p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-accent">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <CreditCard size={24} />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Payment Method</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Method 1 */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`cursor-pointer p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-[#27272a] bg-[#18181b] hover:border-[#3f3f46]'}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-[#52525b]'}`}>
                           {paymentMethod === 'card' && <div className="w-3 h-3 bg-primary rounded-full" />}
                         </div>
                         <div>
                            <p className="text-white font-black uppercase text-sm tracking-wide">Credit / Debit Card</p>
                            <p className="text-[#a1a1aa] text-xs">Visa, MasterCard, Amex, RuPay</p>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-50"><CreditCard size={20} className="text-white" /></div>
                    </div>
                    
                    {/* Method 2 */}
                    <div 
                      onClick={() => setPaymentMethod('upi')}
                      className={`cursor-pointer p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-[#27272a] bg-[#18181b] hover:border-[#3f3f46]'}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-primary' : 'border-[#52525b]'}`}>
                           {paymentMethod === 'upi' && <div className="w-3 h-3 bg-primary rounded-full" />}
                         </div>
                         <p className="text-white font-black uppercase text-sm tracking-wide">UPI PhonePe / GPay / Paytm</p>
                      </div>
                    </div>

                    {/* Method 3 */}
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`cursor-pointer p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-[#27272a] bg-[#18181b] hover:border-[#3f3f46]'}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-[#52525b]'}`}>
                           {paymentMethod === 'cod' && <div className="w-3 h-3 bg-primary rounded-full" />}
                         </div>
                         <div>
                            <p className="text-white font-black uppercase text-sm tracking-wide">Pay on Delivery</p>
                            <p className="text-[#a1a1aa] text-xs">Pay with cash or UPI directly at your door</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Dummy Card Input if card is selected */}
                  <AnimatePresence>
                    {paymentMethod === 'card' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-4 pt-6 border-t border-border-accent overflow-hidden"
                      >
                         <input type="text" placeholder="Card Number" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors" />
                         <div className="flex gap-4">
                            <input type="text" placeholder="MM/YY" className="w-1/2 bg-[#18181b] border border-[#27272a] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors" />
                            <input type="text" placeholder="CVV" className="w-1/2 bg-[#18181b] border border-[#27272a] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors" />
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Column: Price Summary */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-background-card border border-border-accent rounded-[2.5rem] p-6 lg:p-8 sticky top-32">
             
             {/* Selected Address Summary (Only in Steps > 1) */}
             <AnimatePresence>
                {activeStep === 2 && selectedAddress && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 bg-[#18181b] rounded-3xl border border-border-accent">
                      <div className="flex items-center gap-2 mb-3">
                         <MapPin size={16} className="text-primary" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Delivering to:</span>
                      </div>
                      <p className="text-white font-bold text-sm mb-1">{selectedAddress.name}</p>
                      <p className="text-text-muted text-xs leading-relaxed">{selectedAddress.street}, {selectedAddress.city} - {selectedAddress.pincode}</p>
                   </motion.div>
                )}
             </AnimatePresence>

             <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6 pb-4 border-b border-border-accent flex items-center gap-2">
               Price Details 
               <span className="text-[10px] text-primary bg-primary/10 px-2.5 py-1 rounded-full ml-auto">{cartCount} {cartCount > 1 ? 'ITEMS' : 'ITEM'}</span>
             </h3>
             
             {/* Apply Coupon (Only in BAG step) */}
             <AnimatePresence>
               {activeStep === 0 && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                   <div className="flex relative">
                     <input type="text" placeholder="Coupon Code" className="w-full h-12 bg-[#18181b] border border-[#27272a] rounded-xl pl-4 pr-24 text-white uppercase focus:outline-none focus:border-primary transition-colors text-xs font-bold tracking-widest" />
                     <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest rounded-lg transition-all hover:bg-primary hover:text-white">Apply</button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-[#a1a1aa]">Total MRP</span>
                  <span className="text-white">₹{cartTotalMrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-[#a1a1aa]">Discount</span>
                  <span className="text-green-500">- ₹{discountTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-[#a1a1aa]">Shipping Fee</span>
                  <span className="text-green-500 font-black">Free</span>
                </div>
             </div>

             <div className="flex justify-between items-center text-xl font-black text-white pt-5 border-t border-border-accent mb-8">
                <span className="text-xs uppercase tracking-widest">Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
             </div>

             {/* Dynamic Error Message */}
             {activeStep === 1 && !selectedAddress && addresses.length > 0 && (
               <p className="text-rose-500 text-[10px] font-black uppercase text-center mb-4 tracking-widest animate-pulse">Please select a delivery address</p>
             )}

             <button 
               disabled={activeStep === 1 && !selectedAddress}
               onClick={async () => {
                 if (activeStep < 2) {
                   setActiveStep(activeStep + 1);
                 } else {
                   // FINAL PAYMENT STEP
                   try {
                     if (paymentMethod === 'cod') {
                        // --- COD FLOW ---
                        const orderData = {
                          userId: user.uid,
                          items: cart.map(item => ({
                            productId: item.id,
                            name: item.name,
                            image: item.image,
                            quantity: item.quantity,
                            price: item.price * (1 - (item.discount || 0) / 100),
                            size: item.size,
                            color: item.color
                          })),
                          shippingAddress: selectedAddress,
                          amount: totalAmount,
                          paymentMethod: 'COD',
                          paymentStatus: 'Pending'
                        };

                        const response = await fetch('http://localhost:5000/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(orderData)
                        });

                        if (response.ok) {
                          setOrderPlaced(true);
                          clearCart();
                        } else {
                          alert('Failed to place order. Please try again.');
                        }
                     } else {
                        // --- ONLINE FLOW (RAZORPAY) ---
                        // 1. Create order on backend
                        const orderRes = await fetch('http://localhost:5000/api/payments/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: totalAmount })
                        });
                        const razorpayOrder = await orderRes.json();

                        // 2. Open Razorpay Modal
                        const options = {
                          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
                          amount: razorpayOrder.amount,
                          currency: "INR",
                          name: "FootFlex",
                          description: "Order Payment",
                          order_id: razorpayOrder.id,
                          handler: async (response) => {
                             // 3. Verify Payment
                             const verifyRes = await fetch('http://localhost:5000/api/payments/verify-payment', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify(response)
                             });

                             if (verifyRes.ok) {
                                // 4. Place Order on Backend
                                const orderData = {
                                  userId: user.uid,
                                  items: cart.map(item => ({
                                    productId: item.id,
                                    name: item.name,
                                    image: item.image,
                                    quantity: item.quantity,
                                    price: item.price * (1 - (item.discount || 0) / 100),
                                    size: item.size,
                                    color: item.color
                                  })),
                                  shippingAddress: selectedAddress,
                                  amount: totalAmount,
                                  paymentMethod: 'Online',
                                  paymentStatus: 'Paid',
                                  razorpayOrderId: response.razorpay_order_id,
                                  razorpayPaymentId: response.razorpay_payment_id
                                };

                                const saveOrderRes = await fetch('http://localhost:5000/api/orders', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(orderData)
                                });

                                if (saveOrderRes.ok) {
                                  setOrderPlaced(true);
                                  clearCart();
                                }
                             } else {
                               alert("Payment verification failed. Please contact support.");
                             }
                          },
                          prefill: {
                            name: selectedAddress.name,
                            contact: selectedAddress.phone,
                          },
                          theme: { color: "#007aff" }
                        };

                        const rzp = new window.Razorpay(options);
                        rzp.open();
                     }
                   } catch (error) {
                     console.error('Checkout error:', error);
                     alert('An error occurred during checkout.');
                   }
                 }
               }}
               className={`w-full font-black h-14 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] text-xs ${
                 (activeStep === 1 && !selectedAddress) 
                 ? 'bg-[#27272a] text-[#52525b] cursor-not-allowed' 
                 : 'bg-primary text-white shadow-[0_0_25px_rgba(0,122,255,0.2)] hover:shadow-[0_0_40px_rgba(0,122,255,0.4)] hover:bg-primary/90 active:scale-95'
               }`}
             >
               {activeStep === 0 && <>Checkout <ChevronRight size={18} /></>}
               {activeStep === 1 && <>Continue <ChevronRight size={18} /></>}
               {activeStep === 2 && <span className="flex items-center gap-2"><ShieldCheck size={20}/> Pay Now</span>}
             </button>

             {/* Back Button */}
             {activeStep > 0 && (
               <button 
                 onClick={() => setActiveStep(activeStep - 1)}
                 className="w-full mt-6 text-[10px] font-black text-text-muted hover:text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
               >
                 <ChevronLeft size={16} /> Back to {steps[activeStep - 1]}
               </button>
             )}

             <div className="mt-8 flex items-center justify-center gap-2 text-[#71717a] text-xs">
               <ShieldCheck size={16} /> <span>Safe and Secure Payments. 100% Authentic products.</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
