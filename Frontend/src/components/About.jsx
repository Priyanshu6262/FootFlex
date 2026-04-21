import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target, ShieldCheck } from 'lucide-react';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const features = [
    {
      icon: <Zap size={24} className="text-primary" />,
      title: "Ultra-Light Core",
      desc: "Aerospace-grade materials provide maximum energy return with virtually no weight."
    },
    {
      icon: <Target size={24} className="text-primary" />,
      title: "Precision Fit",
      desc: "3D mapped interior molds to your exact foot shape within hours of wear."
    },
    {
      icon: <ShieldCheck size={24} className="text-primary" />,
      title: "Durability Plus",
      desc: "Carbon-infused outsoles designed to outlast standard rubber by 300%."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background-main">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Image composition */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-[2rem] overflow-hidden border border-border-accent group">
              <div className="absolute inset-0 bg-gradient-to-tr from-background-card/80 to-transparent z-10" />
              <img 
                src="/images/about-shoe.png" 
                alt="Innovative footwear craftsmanship" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 blur-[2px] group-hover:blur-0"
              />
              
              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 p-8 z-20 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <div className="flex items-center gap-4 text-white">
                   <div className="w-12 h-12 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center bg-white/10">
                     <span className="font-bold">01</span>
                   </div>
                   <div>
                     <h3 className="font-bold text-xl">The Anatomy</h3>
                     <p className="text-text-secondary text-sm">Engineered micro-layers</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-60" />
            <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-blue-700/20 rounded-full blur-3xl opacity-60" />
          </motion.div>

          {/* Text Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-1/2"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-primary font-semibold uppercase tracking-widest text-sm">The FootFlex Difference</span>
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              Engineering <span className="italic font-light text-text-secondary">Comfort.</span><br />
              Mastering <span className="text-primary">Performance.</span>
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-text-secondary text-lg mb-10 leading-relaxed">
              We don't just make shoes; we build propulsion engines for your feet. Every stitch and material choice is calculated to enhance your natural movement while surrounding you in premium comfort.
            </motion.p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              {features.map((feature, idx) => (
                <motion.div key={idx} variants={itemVariants} className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-background-card border border-border-accent flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h4 className="text-white font-bold text-lg">{feature.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.button variants={itemVariants} className="inline-flex items-center gap-2 text-white font-semibold border-b border-primary pb-1 hover:text-primary transition-colors group">
              Discover Our Technology
              <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
            </motion.button>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
