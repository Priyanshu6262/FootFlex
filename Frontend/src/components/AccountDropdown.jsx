import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Heart, Gift, Phone, CreditCard,
  Tag, Wallet, MapPin, LogIn, UserPlus, ChevronRight, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuSection1 = [
  { icon: Package,    label: 'Orders',          path: '/orders' },
  { icon: Heart,      label: 'Wishlist',         path: '/wishlist' },
  { icon: Gift,       label: 'Gift Cards',       path: '/gift-cards' },
  { icon: Phone,      label: 'Contact Us',       path: '/contact' },
];

const menuSection2 = [
  { icon: CreditCard, label: 'Credit',           path: '/credit' },
  { icon: Tag,        label: 'Coupons',          path: '/coupons' },
  { icon: Wallet,     label: 'Saved Cards',      path: '/saved-cards' },
  { icon: MapPin,     label: 'Saved Addresses',  path: '/addresses' },
];

const AccountDropdown = ({ isOpen, onClose }) => {
  const panelRef = useRef(null);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-full right-0 mt-3 w-72 z-50 rounded-2xl overflow-hidden
                     bg-[#18181b]/90 backdrop-blur-xl border border-[#27272a]
                     shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,122,255,0.08)]"
        >
          {/* ── Welcome Header ── */}
          <div className="px-5 py-5 border-b border-[#27272a]">
            {user ? (
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_15px_rgba(0,122,255,0.3)]">
                  <img src={user.photoURL || 'https://via.placeholder.com/150'} alt={user.displayName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white font-bold text-base tracking-wide truncate max-w-[160px]">{user.displayName}</p>
                  <p className="text-[#71717a] text-xs truncate max-w-[160px]">{user.email}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-white font-bold text-base tracking-wide">Welcome</p>
                <p className="text-[#71717a] text-xs mt-0.5 leading-relaxed">
                  To access account and manage orders
                </p>
              </>
            )}

            {/* Login / Signup or Logout Button */}
            {user ? (
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                           border border-rose-500 text-rose-500 font-bold text-sm tracking-wider
                           hover:bg-rose-500 hover:text-white transition-all duration-300
                           shadow-[0_0_12px_rgba(244,63,94,0.15)] hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]"
              >
                <LogOut size={16} />
                LOGOUT
              </button>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                           border border-primary text-primary font-bold text-sm tracking-wider
                           hover:bg-primary hover:text-white transition-all duration-300
                           shadow-[0_0_12px_rgba(0,122,255,0.15)] hover:shadow-[0_0_20px_rgba(0,122,255,0.35)]"
              >
                <LogIn size={16} />
                LOGIN / SIGNUP
              </Link>
            )}
          </div>

          {/* ── Section 1 ── */}
          <div className="py-2 border-b border-[#27272a]">
            {menuSection1.map(({ icon: Icon, label, path }) => (
              <Link
                key={label}
                to={path}
                onClick={onClose}
                className="flex items-center justify-between px-5 py-2.5 group
                           hover:bg-white/5 transition-colors duration-150 rounded-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center
                                  group-hover:bg-primary/20 group-hover:border group-hover:border-primary/30 transition-all">
                    <Icon size={15} className="text-[#a1a1aa] group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm text-[#a1a1aa] group-hover:text-white font-medium transition-colors">
                    {label}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="text-[#3f3f46] group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            ))}
          </div>

          {/* ── Section 2 ── */}
          <div className="py-2">
            {menuSection2.map(({ icon: Icon, label, path }) => (
              <Link
                key={label}
                to={path}
                onClick={onClose}
                className="flex items-center justify-between px-5 py-2.5 group
                           hover:bg-white/5 transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center
                                  group-hover:bg-primary/20 group-hover:border group-hover:border-primary/30 transition-all">
                    <Icon size={15} className="text-[#a1a1aa] group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm text-[#a1a1aa] group-hover:text-white font-medium transition-colors">
                    {label}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="text-[#3f3f46] group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountDropdown;
