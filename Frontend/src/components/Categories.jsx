import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { categories } from '../data/products';
import { Link } from 'react-router-dom';

const Categories = () => {
  return (
    <section className="py-24 bg-background-main border-t border-border-accent/30 relative">
       {/* Background gradient */}
       <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Shop by Category</h2>
            <p className="text-text-secondary max-w-lg">Find the perfect fit for your lifestyle. Engineered for athletes, designed for everyone.</p>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:text-white transition-colors group">
            View All Categories
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
              <ArrowUpRight size={16} className="text-primary group-hover:text-white" />
            </span>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="flex overflow-x-auto pb-10 -mx-6 px-6 gap-6 snap-x snap-mandatory no-scrollbar">
          {categories.map((category, index) => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[350px] group relative rounded-[2rem] overflow-hidden"
            >
               {/* Card Background Container */}
               <div className="bg-background-card border border-border-accent h-[400px] rounded-[2rem] p-6 flex flex-col justify-between relative z-10 transition-colors duration-500 group-hover:border-primary/50 group-hover:bg-[#121215]">
                  
                  {/* Category Info */}
                  <div className="relative z-20">
                     <p className="text-text-muted text-sm font-semibold mb-1 transform group-hover:-translate-y-1 transition-transform duration-300">0{index + 1} / Collection</p>
                     <h3 className="text-white text-2xl font-bold transform group-hover:-translate-y-1 transition-transform duration-300 delay-75">{category.name}</h3>
                  </div>

                  {/* Image Container */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                     <div className="absolute inset-0 bg-gradient-to-t from-background-card via-transparent to-transparent opacity-80" />
                     {/* Glow behind image */}
                     <div className="absolute w-3/4 h-1/2 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     
                     <img 
                       src={category.image} 
                       alt={category.name} 
                       className="w-[85%] object-contain drop-shadow-2xl transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 ease-out"
                     />
                  </div>

                  {/* Bottom Action */}
                  <div className="relative z-20 flex justify-between items-end">
                     <p className="text-text-secondary text-sm max-w-[150px] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        {category.desc}
                     </p>
                     <Link to={`/${category.id}`} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center ml-auto transform group-hover:scale-110 active:scale-95 transition-all shadow-xl group-hover:bg-primary group-hover:text-white">
                        <ArrowUpRight size={24} />
                     </Link>
                  </div>

               </div>
               
               {/* Hover Outline Effect */}
               <div className="absolute inset-0 rounded-[2rem] ring-1 ring-primary pointer-events-none opacity-0 group-hover:opacity-100 transform scale-[0.98] group-hover:scale-100 transition-all duration-500 z-20" />
            </motion.div>
          ))}
        </div>
        
        {/* Mobile View All Link */}
        <div className="mt-8 md:hidden flex justify-center">
           <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background-card border border-border-accent text-white font-medium hover:bg-white hover:text-black transition-colors">
             View All Categories
           </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
