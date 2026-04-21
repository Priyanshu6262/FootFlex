import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'popular', label: 'Popular' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'discount', label: 'Best Discount' },
  { id: 'rating', label: 'Customer Rating' }
];

const SortDropdown = ({ sortBy, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLabel = SORT_OPTIONS.find(opt => opt.id === sortBy)?.label || 'Sort By';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background-card border border-border-accent hover:border-primary/50 text-white rounded-xl transition-colors min-w-[200px] justify-between group"
      >
        <span className="text-sm font-medium">{activeLabel}</span>
        <ChevronDown 
          size={16} 
          className={`text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-white'}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 origin-top-right bg-background-main border border-border-accent rounded-xl shadow-2xl overflow-hidden z-20"
          >
            <div className="py-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSortChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                    sortBy === option.id 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-text-muted hover:bg-background-card hover:text-white'
                  }`}
                >
                  {option.label}
                  {sortBy === option.id && <Check size={16} className="text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SortDropdown;
