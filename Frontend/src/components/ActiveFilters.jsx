import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFilters } from '../context/FilterContext';

const ActiveFilters = ({ pageKey }) => {
  const { filterState, removeFilter, clearAllFilters } = useFilters();
  const activePageFilters = filterState[pageKey];

  const hasFilters = 
    activePageFilters.categories.length > 0 ||
    activePageFilters.sizes.length > 0 ||
    activePageFilters.colors.length > 0 ||
    activePageFilters.rating !== null ||
    activePageFilters.discount !== null;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <AnimatePresence>
        {/* Categories */}
        {activePageFilters.categories.map((cat) => (
          <FilterChip 
            key={`cat-${cat}`}
            label={`Category: ${cat}`}
            onRemove={() => removeFilter(pageKey, 'categories', cat)}
          />
        ))}

        {/* Sizes */}
        {activePageFilters.sizes.map((size) => (
          <FilterChip 
            key={`size-${size}`}
            label={`Size: ${size}`}
            onRemove={() => removeFilter(pageKey, 'sizes', size)}
          />
        ))}

        {/* Colors */}
        {activePageFilters.colors.map((color) => (
          <FilterChip 
            key={`color-${color}`}
            label={`Color: ${color}`}
            onRemove={() => removeFilter(pageKey, 'colors', color)}
          />
        ))}

        {/* Rating */}
        {activePageFilters.rating && (
          <FilterChip 
            label={`Rating: ${activePageFilters.rating}+ Stars`}
            onRemove={() => removeFilter(pageKey, 'rating', activePageFilters.rating)}
          />
        )}

        {/* Discount */}
        {activePageFilters.discount && (
          <FilterChip 
            label={`Discount: ${activePageFilters.discount}%+`}
            onRemove={() => removeFilter(pageKey, 'discount', activePageFilters.discount)}
          />
        )}

        {/* Clear All Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => clearAllFilters(pageKey)}
          className="text-primary text-sm font-semibold hover:underline ml-2"
        >
          Clear All
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

const FilterChip = ({ label, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="flex items-center gap-2 px-3 py-1.5 bg-background-card border border-border-accent rounded-full text-white text-xs font-medium"
  >
    <span>{label}</span>
    <button 
      onClick={onRemove}
      className="p-0.5 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white"
    >
      <X size={14} />
    </button>
  </motion.div>
);

export default ActiveFilters;
