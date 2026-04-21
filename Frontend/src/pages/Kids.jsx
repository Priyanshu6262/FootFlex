import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import FilterDrawer from '../components/FilterDrawer';
import SortDropdown from '../components/SortDropdown';
import { products } from '../data/products';

const Kids = () => {
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    sizes: [],
    colors: []
  });
  const [sortBy, setSortBy] = useState('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter Update Handler
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clear') {
      setActiveFilters({ categories: [], sizes: [], colors: [] });
      return;
    }

    setActiveFilters(prev => {
      const currentList = prev[filterType];
      const isSelected = currentList.includes(value);

      return {
        ...prev,
        [filterType]: isSelected 
          ? currentList.filter(item => item !== value)
          : [...currentList, value]
      };
    });
  };

  // Memoized Filter & Sort Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    // 1. Array filtration
    let result = products.filter(product => {
      // Must be Kids' shoe
      if (product.gender !== "Kids") return false;

      // Check Categories
      if (activeFilters.categories.length > 0) {
        if (!activeFilters.categories.includes(product.category)) return false;
      }
      
      // Check Sizes (Intersection: Does the product have ANY of the selected sizes?)
      if (activeFilters.sizes.length > 0) {
        const hasSize = activeFilters.sizes.some(size => product.sizes?.includes(size));
        if (!hasSize) return false;
      }

      // Check Colors 
      if (activeFilters.colors.length > 0) {
        const hasColor = activeFilters.colors.some(color => product.colorNames?.includes(color));
        if (!hasColor) return false;
      }

      return true;
    });

    // 2. Sorting Math
    result = result.sort((a, b) => {
      const aFinalPrice = a.price * (1 - (a.discount || 0) / 100);
      const bFinalPrice = b.price * (1 - (b.discount || 0) / 100);

      switch (sortBy) {
        case 'price_asc':
          return aFinalPrice - bFinalPrice;
        case 'price_desc':
          return bFinalPrice - aFinalPrice;
        case 'discount':
          return (b.discount || 0) - (a.discount || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.reviews - a.reviews;
        case 'recommended':
        default:
          return a.id - b.id;
      }
    });

    return result;
  }, [activeFilters, sortBy]);

  return (
    <div className="min-h-screen pb-24">
      {/* Banner */}
      <div className="bg-background-card border-b border-border-accent py-12 px-6">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Kids Playground</h1>
          <p className="text-text-muted max-w-2xl text-lg">
            Durability meets fun. Equip the next generation with FootFlex athletic gear designed for comfort, resilience, and boundless energy.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 mt-8 flex gap-8">
        {/* Desktop Sidebar */}
        <FilterSidebar 
          activeFilters={activeFilters} 
          onFilterChange={handleFilterChange} 
        />

        {/* Mobile Drawer */}
        <FilterDrawer 
          isOpen={isMobileFilterOpen} 
          onClose={() => setIsMobileFilterOpen(false)} 
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Product Grid Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="text-text-secondary text-sm font-medium">
              Showing <span className="text-white font-bold">{filteredAndSortedProducts.length}</span> Results
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-background-card border border-border-accent rounded-xl text-white hover:border-primary/50 transition-colors"
              >
                <Filter size={18} />
                <span className="text-sm font-medium">Filter</span>
              </button>
              
              {/* Sort Component */}
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            </div>
          </div>

          {/* Grid Layout Container */}
          {filteredAndSortedProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredAndSortedProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout shrink
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border-accent rounded-3xl"
            >
              <div className="w-16 h-16 rounded-full bg-background-card flex items-center justify-center mb-4">
                <Filter size={24} className="text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Iterations Found</h3>
              <p className="text-text-muted max-w-sm mb-6">We couldn't find any shoes matching your specific filter combination.</p>
              <button 
                onClick={() => handleFilterChange('clear', null)}
                className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Kids;
