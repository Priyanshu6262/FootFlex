import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-7 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU5LjUgMGguNXY2MGgtLjVWMHptLTIwIDBoLjV2NjBoLS41VjB6bS0yMCAwaC41djYwaC0uNVYwem0tMjAgMGguNXY2MGgtLjZWMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-30" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">

          {/* Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left pt-10 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-border-accent/50 border border-border-accent backdrop-blur-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">New Air Tech 2026</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-6 tracking-tight"
            >
              STEP INTO <br />
              <span className="text-gradient-blue relative inline-block">
                STYLE
                <svg className="absolute -bottom-2 left-0 w-full h-3 md:h-4 text-primary opacity-50" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00035 7.8286C37.3337 2.16193 125.6 -4.9714 198 6.0286" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-secondary text-lg md:text-xl max-w-lg mb-10 leading-relaxed"
            >
              Experience the perfect blend of high-end aesthetics and cutting-edge athletic performance. Your next victory starts here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
            >
              <Link to="/products" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-hover hover:shadow-[0_0_30px_rgba(0,122,255,0.4)] transition-all duration-300 flex items-center justify-center gap-2 group">
                Shop Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-border-accent text-white font-bold text-lg hover:border-white hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-3 group">
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={10} className="ml-0.5" fill="currentColor" />
                </div>
                Explore Collection
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex items-center gap-12 mt-16 pt-8 border-t border-border-accent/50 max-w-md w-full justify-center lg:justify-start"
            >
              <div>
                <h4 className="text-white font-black text-2xl">50k+</h4>
                <p className="text-text-muted text-xs uppercase tracking-wider mt-1">Sneakers Sold</p>
              </div>
              <div className="w-px h-8 bg-border-accent" />
              <div>
                <h4 className="text-white font-black text-2xl">4.9</h4>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-star-rating" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* 3D Shoe Visual Presentation */}
          <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[700px] flex items-center justify-center">
            {/* Platform/Base */}
            <div className="absolute bottom-10 w-[80%] h-[40px] bg-primary/20 rounded-[100%] blur-xl transform rotate-x-60" />

            {/* Main Shoe Image (Floating and Rotating) */}
            <motion.img
              src="/images/hero-shoe.png"
              alt="Premium FootFlex Hero Shoe"
              className="relative z-10 w-[110%] max-w-[800px] origin-center drop-shadow-[0_45px_35px_rgba(0,0,0,0.6)]"
              initial={{ y: 20, rotateZ: -10 }}
              animate={{
                y: [-10, 10, -10],
                rotateZ: [-5, -2, -5]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Floating Elements around shoe */}
            <motion.div
              className="absolute top-1/4 right-10 z-20 bg-background-card/80 backdrop-blur-md border border-border-accent p-4 rounded-2xl shadow-xl flex items-center gap-3"
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              transition={{ opacity: { delay: 0.8 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <div>
                <p className="text-text-muted text-xs font-semibold">Price</p>
                <p className="text-white font-bold text-lg">₹189.99</p>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-1/4 left-0 z-20 bg-background-card/80 backdrop-blur-md border border-border-accent px-5 py-3 rounded-2xl shadow-xl"
              initial={{ opacity: 0, x: -20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
              transition={{ opacity: { delay: 1 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white text-sm font-semibold">In Stock</span>
              </div>
              <p className="text-text-secondary text-xs">Ready to ship</p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
