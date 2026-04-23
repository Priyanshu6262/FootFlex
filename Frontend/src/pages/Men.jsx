import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import FilterDrawer from '../components/FilterDrawer';
import SortDropdown from '../components/SortDropdown';
import ActiveFilters from '../components/ActiveFilters';
import CategoryBanner from '../components/CategoryBanner';
import { useFilters } from '../context/FilterContext';

const Men = () => {
  const { filterState, toggleFilter, setSort, clearAllFilters } = useFilters();
  const activeFilters = filterState.men;
  const sortBy = activeFilters.sort;

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [backendProducts, setBackendProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        const mappedProducts = data.map(p => ({
          id: p._id,
          name: p.name,
          image: `http://localhost:5000${p.imageUrl}`,
          price: p.price,
          discount: p.discount,
          category: p.gender, // keeping category as gender for filter compatibility if needed, though product.category might be better
          gender: p.gender,
          rating: 4.5,
          reviews: Math.floor(Math.random() * 200) + 10,
          isNew: (new Date() - new Date(p.createdAt)) < (7 * 24 * 60 * 60 * 1000),
          details: p.details,
          specifications: p.specifications,
          colors: p.colors,
          colorNames: p.colors, // Assuming colors array holds the names now
          sizes: p.sizes,
          coupon: p.coupon
        }));
        
        setBackendProducts(mappedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter Update Handler
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clear') {
      clearAllFilters('men');
      return;
    }
    toggleFilter('men', filterType, value);
  };

  // Memoized Filter & Sort Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    // 1. Array filtration
    let result = backendProducts.filter(product => {
      // Must be Men's shoe
      if (product.gender !== "Men") return false;

      // Check Categories
      if (activeFilters.categories.length > 0) {
        if (!activeFilters.categories.includes(product.category)) return false;
      }
      
      // Check Sizes
      if (activeFilters.sizes.length > 0) {
        const hasSize = activeFilters.sizes.some(size => product.sizes?.includes(size));
        if (!hasSize) return false;
      }

      // Check Colors 
      if (activeFilters.colors.length > 0) {
        const hasColor = activeFilters.colors.some(color => product.colorNames?.includes(color));
        if (!hasColor) return false;
      }

      // Check Rating
      if (activeFilters.rating !== null) {
        if (product.rating < activeFilters.rating) return false;
      }

      // Check Discount
      if (activeFilters.discount !== null) {
        if ((product.discount || 0) < activeFilters.discount) return false;
      }

      return true;
    });

    // 2. Sorting Math
    result = [...result].sort((a, b) => {
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
  }, [activeFilters, sortBy, backendProducts]);

  return (
    <div className="min-h-screen pb-24 bg-background-main">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center text-white">
          <p className="text-xl text-red-400">Error: {error}</p>
        </div>
      ) : (
        <>
          <CategoryBanner
        title="Men's Selection"
        description="High-performance gear engineered for the modern athlete. From track to street, find your perfect pair."
        offers={[
          { ticker: '🔥 30% Off Running Shoes — Today Only!', accent: '' },
          { ticker: '👟 Buy 1 Get 1 on All Sneakers', accent: 'lime' },
          { ticker: '🚀 Free Shipping above ₹2000', accent: 'lime' },
        ]}
        upcomingDeals={[
          'Weekend Sale — 30% Off',
          'Buy 1 Get 1 on Sneakers',
          'Free Shipping on ₹2000+',
        ]}
        newLaunches={[
          'New Running Collection',
          'Elite Sneaker Drop',
          'Latest Sports Shoes',
        ]}
      />

      {/* Main Content Area */}
      <div className="container mx-auto px-6 mt-8">
        <div className="flex gap-8">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
                <SortDropdown sortBy={sortBy} onSortChange={(value) => setSort('men', value)} />
              </div>
            </div>

            {/* Active Filter Chips */}
            <ActiveFilters pageKey="men" />

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
                      layout
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
                <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
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
      </>
      )}
    </div>
  );
};

export default Men;
