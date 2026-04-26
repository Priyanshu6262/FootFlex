import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight, X, Plus, Minus } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart, removeProductFromCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Size/Qty Selection Modal
  const [modalProduct, setModalProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  const openModal = (product) => {
    setModalProduct(product);
    setSelectedSize(product.sizes?.[0] || '');
    setSelectedQty(1);
  };

  const handleMoveToCart = () => {
    if (!selectedSize && modalProduct.sizes?.length > 0) {
      showToast('Please select a size', 'error');
      return;
    }
    // Mutual exclusivity: remove all cart variants of same product
    removeProductFromCart(modalProduct.id);
    // Add to cart
    addToCart(modalProduct, selectedSize, modalProduct.colors?.[0] || null);
    // Remove from wishlist
    removeFromWishlist(modalProduct.id, true);
    showToast('Moved to Cart 🛒', 'cart');
    setModalProduct(null);
    navigate('/cart');
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-background-main flex flex-col items-center justify-center px-6 pt-24 pb-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-8 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
            <Heart size={56} className="text-rose-500 opacity-40" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Your Wishlist is Empty</h1>
          <p className="text-text-muted text-lg max-w-sm mx-auto mb-10">
            Start browsing and tap the heart icon on any product to save it here.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
          >
            Start Shopping <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">My Wishlist</h1>
            <p className="text-text-muted mt-2">
              <span className="text-primary font-bold">{wishlistCount}</span> item{wishlistCount !== 1 ? 's' : ''} saved
            </p>
          </div>
          <Link to="/" className="text-text-muted hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-1">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlist.map((product) => {
              const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="bg-background-card border border-border-accent rounded-3xl overflow-hidden group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
                >
                  {/* Image */}
                  <Link to={`/product/${product.id}`} className="block relative h-56 bg-[#18181b] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-6 mix-blend-lighten group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                        {product.discount}% OFF
                      </span>
                    )}
                    {product.isNew && (
                      <span className="absolute top-3 right-3 bg-badge-new text-black text-[10px] font-black px-2.5 py-1 rounded-full">NEW</span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-5">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-white font-bold text-base mb-1 truncate hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-text-muted text-xs mb-4 uppercase tracking-wider">{product.gender}'s Shoes</p>

                    <div className="flex items-end gap-2 mb-5">
                      <span className="text-xl font-black text-primary">₹{discountedPrice.toFixed(0)}</span>
                      {product.discount > 0 && (
                        <span className="text-sm text-text-muted line-through mb-0.5">₹{product.price}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                      >
                        <ShoppingBag size={16} /> Add to Bag
                      </button>
                      <button
                        onClick={() => {
                          removeFromWishlist(product.id);
                          showToast('Removed from Wishlist', 'info');
                        }}
                        className="w-11 h-11 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        title="Remove from Wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Size & Qty Selection Modal */}
      <AnimatePresence>
        {modalProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setModalProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background-card border border-border-accent rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#18181b] rounded-2xl flex items-center justify-center border border-border-accent">
                    <img src={modalProduct.image} alt={modalProduct.name} className="w-12 h-12 object-contain mix-blend-lighten" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg leading-tight">{modalProduct.name}</h3>
                    <p className="text-primary font-bold text-sm mt-1">
                      ₹{(modalProduct.price * (1 - (modalProduct.discount || 0) / 100)).toFixed(0)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalProduct(null)}
                  className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Size Selection */}
              {modalProduct.sizes?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Select Size (UK)</p>
                  <div className="flex flex-wrap gap-2">
                    {modalProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl border-2 text-sm font-bold transition-all ${
                          selectedSize === size
                            ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,122,255,0.2)]'
                            : 'border-border-accent text-text-muted hover:border-primary/50 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Quantity</p>
                <div className="flex items-center gap-4 bg-background-main border border-border-accent rounded-xl p-1 w-fit">
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-white font-black text-lg w-6 text-center">{selectedQty}</span>
                  <button
                    onClick={() => setSelectedQty(selectedQty + 1)}
                    className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleMoveToCart}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3 text-base"
              >
                <ShoppingBag size={20} /> Move to Cart & Checkout
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
