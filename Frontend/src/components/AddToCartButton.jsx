import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const AddToCartButton = ({ product, size, color }) => {
  const { addToCart } = useCart();
  const [state, setState] = useState('idle'); // idle | adding | added
  const [particles, setParticles] = useState([]);

  const handleClick = () => {
    if (state !== 'idle') return;

    // Spawn spark particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i * 360) / 8,
    }));
    setParticles(newParticles);

    setState('adding');
    setTimeout(() => {
      addToCart(product, size || product.sizes[0], color || product.colors[0]);
      setState('added');
      setTimeout(() => {
        setState('idle');
        setParticles([]);
      }, 1800);
    }, 600);
  };

  const isAdded = state === 'added';
  const isAdding = state === 'adding';

  return (
    <div className="relative flex items-center justify-center">

      {/* Spark Particles */}
      <AnimatePresence>
        {isAdded && particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary pointer-events-none z-20"
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((p.angle * Math.PI) / 180) * 30,
              y: Math.sin((p.angle * Math.PI) / 180) * 30,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        disabled={state !== 'idle'}
        whileHover={state === 'idle' ? { scale: 1.06, y: -2 } : {}}
        whileTap={state === 'idle' ? { scale: 0.93, y: 1 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`relative overflow-hidden flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 select-none
          ${isAdded
            ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
            : isAdding
            ? 'bg-primary/80 text-white cursor-wait'
            : 'bg-primary text-white shadow-[0_4px_0px_rgba(0,50,150,0.8),0_0_20px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_0px_rgba(0,50,150,0.8),0_0_30px_rgba(0,122,255,0.5)]'
          }
        `}
        style={{
          // 3D depth base layer
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Animated gradient shimmer overlay */}
        {state === 'idle' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          />
        )}

        {/* Glow pulse ring */}
        {state === 'idle' && (
          <motion.div
            className="absolute inset-0 rounded-2xl border border-primary/40 pointer-events-none"
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Icon */}
        <AnimatePresence mode="wait">
          {isAdded ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check size={18} strokeWidth={3} />
            </motion.div>
          ) : isAdding ? (
            <motion.div
              key="loading"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, ease: 'linear' }}
            >
              <Sparkles size={16} />
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: [-5, 5, -5, 0] }}
              transition={{ duration: 0.4 }}
            >
              <ShoppingBag size={18} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Label */}
        <AnimatePresence mode="wait">
          {isAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="whitespace-nowrap"
            >
              Added!
            </motion.span>
          ) : isAdding ? (
            <motion.span
              key="adding"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="whitespace-nowrap"
            >
              Adding...
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="whitespace-nowrap"
            >
              Add to Cart
            </motion.span>
          )}
        </AnimatePresence>

        {/* 3D bottom edge shadow layer */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-black/30 pointer-events-none"
        />
      </motion.button>
    </div>
  );
};

export default AddToCartButton;
