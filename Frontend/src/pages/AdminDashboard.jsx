import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingCart, 
  PlusCircle, 
  Tag, 
  CalendarDays, 
  Package, 
  LayoutList,
  ArrowUpRight
} from 'lucide-react';

// --- Animated Counter Hook (Simplified for UI) ---
const useCounter = (end, duration = 2) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, isCurrency, delay }) => {
  const animatedValue = useCounter(value, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-background-card/50 backdrop-blur-xl border border-border-accent rounded-[2rem] p-6 relative overflow-hidden group shadow-lg"
    >
      {/* Background Glow */}
      <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            {isCurrency && <IndianRupee size={24} className="text-white font-bold" />}
            <h3 className="text-4xl font-bold text-white tracking-tight">
              {animatedValue.toLocaleString()}
            </h3>
          </div>
          <div className="flex items-center gap-1 mt-3 text-badge-new text-xs font-semibold px-2 py-1 rounded-full bg-badge-new/10 w-fit">
            <ArrowUpRight size={14} />
            <span>{trend}</span>
          </div>
        </div>
        
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,122,255,0.2)]">
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

const ActionCard = ({ title, description, icon: Icon, colorClass, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-background-card border border-border-accent rounded-3xl p-6 cursor-pointer overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,122,255,0.15)] transition-all`}
    >
       {/* Ambient Color Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${colorClass.bg}`} />
      
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center border shadow-lg transition-transform group-hover:rotate-12 ${colorClass.iconWrapper}`}>
          <Icon size={28} className={colorClass.icon} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-text-muted text-sm leading-relaxed">
          {description}
        </p>
      </div>

       {/* Interactive Hover Arrow */}
       <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
         <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <ArrowUpRight size={16} />
         </div>
       </div>
    </motion.div>
  );
};

// --- Main Page ---

const AdminDashboard = () => {
  
  // Dummy Data
  const stats = [
    { title: "Total Sales", value: 4580, icon: TrendingUp, trend: "+12.5% this month", isCurrency: false },
    { title: "Total Income", value: 1250000, icon: IndianRupee, trend: "+8.2% this month", isCurrency: true },
    { title: "Total Orders", value: 342, icon: ShoppingCart, trend: "+24% this week", isCurrency: false },
  ];

  const actions = [
    { 
      title: "Add Product", 
      description: "Create new product listings, upload images, and set pricing.", 
      icon: PlusCircle,
      colorClass: { bg: "bg-blue-500", iconWrapper: "bg-blue-500/20 border-blue-500/30", icon: "text-blue-500" }
    },
    { 
      title: "Add Offer", 
      description: "Manage global promotions and setup discount percentages.", 
      icon: Tag,
      colorClass: { bg: "bg-emerald-500", iconWrapper: "bg-emerald-500/20 border-emerald-500/30", icon: "text-emerald-500" }
    },
    { 
      title: "Upcoming Deals", 
      description: "Schedule future category banner deals and announcements.", 
      icon: CalendarDays,
      colorClass: { bg: "bg-purple-500", iconWrapper: "bg-purple-500/20 border-purple-500/30", icon: "text-purple-500" }
    },
    { 
      title: "Manage Orders", 
      description: "Track customer orders, update statuses, and handle returns.", 
      icon: Package,
      colorClass: { bg: "bg-orange-500", iconWrapper: "bg-orange-500/20 border-orange-500/30", icon: "text-orange-500" }
    },
    { 
      title: "Available Products", 
      description: "View, edit, or remove existing products in the catalog.", 
      icon: LayoutList,
      colorClass: { bg: "bg-rose-500", iconWrapper: "bg-rose-500/20 border-rose-500/30", icon: "text-rose-500" }
    },
  ];

  return (
    <div className="min-h-screen pb-24 px-6 md:px-12 pt-8 relative overflow-hidden">
        
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="container mx-auto">
        
        <header className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            Admin Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted"
          >
            Overview and management console for FootFlex store.
          </motion.p>
        </header>

        {/* --- Top Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} delay={0.1 * index + 0.2} />
          ))}
        </div>

        {/* --- Management Section --- */}
        <div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-white mb-6 border-b border-border-accent pb-4"
          >
            Quick Actions
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action, index) => (
              <ActionCard key={action.title} {...action} delay={0.1 * index + 0.6} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
