import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        // Map backend data to ProductCard format
        const mappedProducts = data.map(p => ({
          id: p._id,
          name: p.name,
          image: `http://localhost:5000${p.imageUrl}`,
          price: p.price,
          discount: p.discount,
          category: p.gender,
          rating: 4.5, // Mock rating
          isNew: (new Date() - new Date(p.createdAt)) < (7 * 24 * 60 * 60 * 1000), // New if < 1 week old
          details: p.details,
          specifications: p.specifications,
          colors: p.inventory ? [...new Set(p.inventory.map(item => item.color))] : [],
          sizes: p.inventory ? [...new Set(p.inventory.map(item => item.size))] : [],
          coupon: p.coupon
        }));
        
        setProducts(mappedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background-main">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background-main text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-text-muted">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-primary rounded-xl font-bold"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 px-6 md:px-12 pt-8">
      <div className="container mx-auto">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">All Products</h1>
              <p className="text-text-muted max-w-2xl text-lg">
                Explore our entire collection of premium footwear. From high-performance athletics to street-ready classics.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="bg-background-card border border-border-accent rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-primary transition-all w-full md:w-64"
                  />
               </div>
               <button className="p-3 bg-background-card border border-border-accent rounded-2xl text-text-muted hover:text-white hover:border-primary transition-all">
                 <Filter size={24} />
               </button>
            </div>
          </div>
        </header>

        {products.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6">👟</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Products Found</h2>
            <p className="text-text-muted">Stay tuned! We are currently stocking up our latest collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
