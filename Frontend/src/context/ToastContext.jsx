import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, CheckCircle, XCircle, Info } from 'lucide-react';

const ToastContext = createContext();

const ICONS = {
  wishlist: Heart,
  cart: ShoppingBag,
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const COLORS = {
  wishlist: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  cart: 'bg-primary/10 border-primary/20 text-primary',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  info: 'bg-zinc-700/80 border-zinc-600/30 text-zinc-200',
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-24 right-4 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = ICONS[toast.type] || Info;
            const colorClass = COLORS[toast.type] || COLORS.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-xs ${colorClass}`}
                onClick={() => removeToast(toast.id)}
              >
                <Icon size={18} className="shrink-0" fill={toast.type === 'wishlist' ? 'currentColor' : 'none'} />
                <span className="text-sm font-semibold text-white">{toast.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
