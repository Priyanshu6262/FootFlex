import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronRight, ShieldCheck, Tag, CreditCard, MapPin, Package, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const steps = ['BAG', 'ADDRESS', 'PAYMENT'];

const Cart = () => {
  const { cart, cartCount, cartTotalMrp, discountTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Address state
  const [address, setAddress] = useState({ name: '', phone: '', pincode: '', address: '', city: '', state: '' });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStep]);

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
                <div className="bg-background-card border border-border-accent rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-accent">
                    <MapPin className="text-primary" size={24} />
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Delivery Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider pl-1">Full Name</label>
                      <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-[#18181b] border border-[#27272a] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors" placeholder="John Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider pl-1">Mobile Number</label>
                      <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-[#18181b] border border-[#27272a] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors" placeholder="+91 9876543210" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider pl-1">Pincode</label>
                      <input type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full bg-[#18181b] border border-[#27272a] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors" placeholder="110001" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider pl-1">City/District</label>
                      <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full bg-[#18181b] border border-[#27272a] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors" placeholder="New Delhi" />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider pl-1">Delivery Address</label>
                      <textarea value={address.address} onChange={e => setAddress({...address, address: e.target.value})} rows={3} className="w-full bg-[#18181b] border border-[#27272a] rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors resize-none" placeholder="House/Flat No., Building Name, Street..."></textarea>
                    </div>
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
                <div className="bg-background-card border border-border-accent rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-accent">
                    <CreditCard className="text-primary" size={24} />
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Payment Method</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Method 1 */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-[#27272a] bg-[#18181b] hover:border-[#3f3f46]'}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-[#52525b]'}`}>
                           {paymentMethod === 'card' && <div className="w-3 h-3 bg-primary rounded-full" />}
                         </div>
                         <div>
                            <p className="text-white font-bold">Credit / Debit Card</p>
                            <p className="text-[#a1a1aa] text-xs">Visa, MasterCard, Amex, RuPay</p>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-50"><CreditCard size={20} className="text-white" /></div>
                    </div>
                    
                    {/* Method 2 */}
                    <div 
                      onClick={() => setPaymentMethod('upi')}
                      className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-[#27272a] bg-[#18181b] hover:border-[#3f3f46]'}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-primary' : 'border-[#52525b]'}`}>
                           {paymentMethod === 'upi' && <div className="w-3 h-3 bg-primary rounded-full" />}
                         </div>
                         <p className="text-white font-bold">UPI PhonePe / GPay / Paytm</p>
                      </div>
                    </div>

                    {/* Method 3 */}
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-[#27272a] bg-[#18181b] hover:border-[#3f3f46]'}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-[#52525b]'}`}>
                           {paymentMethod === 'cod' && <div className="w-3 h-3 bg-primary rounded-full" />}
                         </div>
                         <div>
                            <p className="text-white font-bold">Pay on Delivery</p>
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
          <div className="bg-background-card border border-border-accent rounded-3xl p-6 lg:p-8 sticky top-32">
             <h3 className="text-white font-bold uppercase tracking-wider mb-6 pb-4 border-b border-border-accent flex items-center gap-2">
               <Tag size={18} className="text-primary"/> Price Details 
               <span className="text-xs text-[#a1a1aa] bg-[#18181b] px-2 py-0.5 rounded-full ml-auto">({cartCount} Item{cartCount > 1 ? 's' : ''})</span>
             </h3>
             
             {/* Apply Coupon (Only in BAG step) */}
             <AnimatePresence>
               {activeStep === 0 && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                   <div className="flex relative">
                     <input type="text" placeholder="Coupon Code" className="w-full h-12 bg-[#18181b] border border-[#27272a] rounded-xl pl-4 pr-24 text-white uppercase focus:outline-none focus:border-primary transition-colors text-sm" />
                     <button className="absolute right-1 top-1 bottom-1 px-4 bg-[#27272a] hover:bg-[#3f3f46] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors">Apply</button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-[#a1a1aa]">Total MRP</span>
                  <span className="text-white">₹{cartTotalMrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-[#a1a1aa]">Discount on MRP</span>
                  <span className="text-green-500">- ₹{discountTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-[#a1a1aa]">Coupon Discount</span>
                  <span className="text-primary cursor-pointer hover:underline">Apply Coupon</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-[#a1a1aa]">Shipping Fee</span>
                  <span className="text-green-500 uppercase font-bold text-xs tracking-wider">Free</span>
                </div>
             </div>

             <div className="flex justify-between items-center text-lg font-black text-white pt-5 border-t border-border-accent mb-8">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
             </div>

             {/* Action Button */}
             <button 
               onClick={() => {
                 if (activeStep < 2) setActiveStep(activeStep + 1);
                 else setOrderPlaced(true);
               }}
               className="w-full bg-primary text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
             >
               {activeStep === 0 && <>PLACE ORDER <ChevronRight size={20} /></>}
               {activeStep === 1 && <>PROCEED TO PAYMENT <ChevronRight size={20} /></>}
               {activeStep === 2 && <span className="flex items-center gap-2"><ShieldCheck size={20}/> PAY & COMPLETE ORDER</span>}
             </button>

             {/* Back Button */}
             {activeStep > 0 && (
               <button 
                 onClick={() => setActiveStep(activeStep - 1)}
                 className="w-full mt-4 text-sm font-bold text-[#a1a1aa] hover:text-white uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
               >
                 <ChevronLeft size={16} /> BACK TO {steps[activeStep - 1]}
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
