import { Heart, Eye, Star } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import AddToCartButton from './AddToCartButton';

const ProductCard = ({ product }) => {
  // 3D Tilt Effect variables
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top, width, height } = currentTarget.getBoundingClientRect();
    
    // Values from -1 to 1 representing position from center
    const x = (clientX - left - width / 2) / (width / 2);
    const y = (clientY - top - height / 2) / (height / 2);
    
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  // Generate rotate values based on mouse position
  // Invert the X and Y logic for correct tilt perspective
  const rotateX = useMotionTemplate`${mouseY.get() * -10}deg`;
  const rotateY = useMotionTemplate`${mouseX.get() * 10}deg`;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative bg-background-card rounded-[2rem] p-4 border border-border-accent/50 hover:border-primary/50 transition-colors duration-500 perspective-1000"
    >
      {/* Dynamic glow effect that follows mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              300px circle at calc(50% + ${mouseX.get() * 50}px) calc(50% + ${mouseY.get() * 50}px),
              rgba(0,122,255,0.15),
              transparent 40%
            )
          `,
        }}
      />

      {/* Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 " style={{ transform: "translateZ(30px)" }}>
        {product.isNew && (
          <span className="bg-badge-new text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(132,204,22,0.5)]">
            NEW
          </span>
        )}
        {product.discount > 0 && (
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,122,255,0.5)]">
            {product.discount}% OFF
          </span>
        )}
      </div>

      {/* Action Buttons (floating) */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0" style={{ transform: "translateZ(40px)" }}>
        <button className="w-10 h-10 rounded-full bg-background-main/80 backdrop-blur border border-border-accent flex items-center justify-center text-text-secondary hover:text-white hover:border-primary hover:bg-primary/20 transition-all">
          <Heart size={18} />
        </button>
        <button className="w-10 h-10 rounded-full bg-background-main/80 backdrop-blur border border-border-accent flex items-center justify-center text-text-secondary hover:text-white hover:border-primary hover:bg-primary/20 transition-all">
          <Eye size={18} />
        </button>
      </div>

      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block relative h-56 mb-6 rounded-2xl overflow-hidden bg-gradient-to-b from-background-main to-transparent flex items-center justify-center">
        {/* Background glow for image */}
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <motion.img 
          src={product.image} 
          alt={product.name}
          className="w-[85%] object-contain drop-shadow-2xl z-10 block"
          style={{ transform: "translateZ(60px)" }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />
      </Link>

      {/* Product Details */}
      <div className="px-2" style={{ transform: "translateZ(20px)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">{product.category}</span>
          <div className="flex items-center gap-1 text-star-rating">
            <Star size={14} fill="currentColor" />
            <span className="text-text-secondary text-sm ml-1">{product.rating}</span>
          </div>
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h3 className="text-white font-bold text-lg mb-4 truncate hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <span className="text-text-muted text-xs line-through mb-0.5">₹{product.price.toFixed(2)}</span>
                <span className="text-primary font-bold text-xl">₹{(product.price * (1 - product.discount/100)).toFixed(2)}</span>
              </>
            ) : (
              <>
                <span className="invisible text-text-muted text-xs line-through mb-0.5">₹0</span>
                <span className="text-primary font-bold text-xl">₹{product.price.toFixed(2)}</span>
              </>
            )}
          </div>
          
          <AddToCartButton product={product} />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
