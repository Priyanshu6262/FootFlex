import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star } from "lucide-react";

const CATEGORIES = ["Sports", "Formal", "Running", "Casual", "Sneakers", "Training"];
const SIZES = [6, 7, 8, 9, 10, 11];
const COLORS = [
  { name: "Black", colorClass: "bg-black" },
  { name: "White", colorClass: "bg-white" },
  { name: "Blue", colorClass: "bg-blue-500" },
  { name: "Red", colorClass: "bg-red-500" },
  { name: "Grey", colorClass: "bg-gray-500" },
  { name: "Green", colorClass: "bg-green-500" }
];
const RATINGS = [4, 3, 2];
const DISCOUNTS = [10, 20, 30, 40, 50];

const FilterDrawer = ({ isOpen, onClose, activeFilters, onFilterChange }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-background-main border-r border-border-accent shadow-2xl flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-accent">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-background-card text-text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {(activeFilters.categories.length > 0 || 
                activeFilters.sizes.length > 0 || 
                activeFilters.colors.length > 0 ||
                activeFilters.rating !== null ||
                activeFilters.discount !== null
              ) && (
                <button
                  onClick={() => onFilterChange('clear', null)}
                  className="w-full mb-6 py-2 rounded-xl bg-background-card border border-border-accent text-sm font-semibold text-white uppercase tracking-wider hover:bg-border-accent transition-colors"
                >
                  Clear All Filters
                </button>
              )}

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Category</h3>
                <div className="space-y-3">
                  {CATEGORIES.map(category => (
                    <label 
                      key={category} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => onFilterChange('categories', category)}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.categories.includes(category) ? 'bg-primary border-primary' : 'border-border-accent bg-background-card group-hover:border-primary/50'}`}>
                        {activeFilters.categories.includes(category) && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${activeFilters.categories.includes(category) ? 'text-white' : 'text-text-muted group-hover:text-text-secondary'}`}>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Size</h3>
                <div className="grid grid-cols-2 gap-2">
                  {SIZES.map(size => (
                    <label 
                      key={size}
                      className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-background-card border border-border-accent"
                      onClick={() => onFilterChange('sizes', size)}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.sizes.includes(size) ? 'bg-primary border-primary' : 'border-border-accent bg-background-main'}`}>
                        {activeFilters.sizes.includes(size) && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`text-sm ${activeFilters.sizes.includes(size) ? 'text-white font-bold' : 'text-text-muted'}`}>UK {size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Color</h3>
                <div className="grid grid-cols-2 gap-2">
                  {COLORS.map(color => (
                    <label 
                      key={color.name}
                      className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-background-card border border-border-accent"
                      onClick={() => onFilterChange('colors', color.name)}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.colors.includes(color.name) ? 'bg-primary border-primary' : 'border-border-accent bg-background-main'}`}>
                        {activeFilters.colors.includes(color.name) && <Check size={14} className="text-white" />}
                      </div>
                      <div className={`w-4 h-4 rounded-full ${color.colorClass} border border-white/20`} />
                      <span className={`text-sm ${activeFilters.colors.includes(color.name) ? 'text-white font-bold' : 'text-text-muted'}`}>{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Rating</h3>
                <div className="space-y-3">
                  {RATINGS.map(rating => (
                    <label 
                      key={rating}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => onFilterChange('rating', rating)}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.rating === rating ? 'bg-primary border-primary' : 'border-border-accent bg-background-card'}`}>
                        {activeFilters.rating === rating && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-white">{rating}</span>
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-text-muted">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Discount</h3>
                <div className="space-y-3">
                  {DISCOUNTS.map(discount => (
                    <label 
                      key={discount}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => onFilterChange('discount', discount)}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${activeFilters.discount === discount ? 'bg-primary border-primary' : 'border-border-accent bg-background-card'}`}>
                        {activeFilters.discount === discount && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`text-sm ${activeFilters.discount === discount ? 'text-white font-bold' : 'text-text-muted'}`}>{discount}% and above</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-accent bg-background-main">
               <button 
                onClick={onClose}
                className="w-full py-4 rounded-full bg-primary text-white font-bold hover:shadow-[0_0_20px_rgba(0,122,255,0.4)] transition-all"
              >
                 Apply Filters
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;
