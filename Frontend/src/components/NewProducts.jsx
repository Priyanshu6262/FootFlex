import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { products } from '../data/products';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewProducts = () => {
  // Only take new products for this section
  const newProducts = products.filter(p => p.isNew).slice(0, 3);

  return (
    <section className="py-24 bg-background-main relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-gradient-to-l from-background-card to-transparent -z-10" />

      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left mb-8 md:mb-0"
          >
             <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-badge-new animate-pulse" />
                <span className="text-badge-new font-semibold uppercase tracking-widest text-sm">Just Dropped</span>
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-white">Latest <br className="hidden md:block"/>Innovations</h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-4 items-center"
          >
             <p className="text-text-secondary hidden lg:block max-w-xs mr-4 text-sm">Experience the latest advancements in footwear technology before anyone else.</p>
             <Link to="/products" className="group flex items-center justify-center w-14 h-14 rounded-full bg-background-card border border-border-accent hover:bg-primary hover:border-primary transition-all">
                <ArrowRight size={24} className="text-white group-hover:translate-x-1 transition-transform" />
             </Link>
          </motion.div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewProducts;
