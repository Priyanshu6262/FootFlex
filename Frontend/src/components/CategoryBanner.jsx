import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Zap, ArrowRight, CalendarDays, Sparkles } from 'lucide-react';

const CategoryBanner = ({ title, description, offers, upcomingDeals = [], newLaunches = [] }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!offers?.length) return;
    const t = setInterval(() => setActiveIdx(i => (i + 1) % offers.length), 2800);
    return () => clearInterval(t);
  }, [offers]);

  const current = offers?.[activeIdx];

  return (
    <div className="bg-background-card border-b border-border-accent py-8 px-6 overflow-hidden relative">

      {/* Ambient glow */}
      <motion.div
        className="absolute -top-16 right-60 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(0,122,255,0.06)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container mx-auto relative z-10 flex items-center gap-8">

        {/* ──────── LEFT: Title + Announcement + Description ──────── */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-4xl md:text-5xl font-bold text-white mb-3"
          >
            {title}
          </motion.h1>

          {/* Announcement Bar */}
          {offers?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="flex items-center gap-3 mb-3 w-fit"
            >
              {/* Label */}
              <div className="flex items-center gap-1.5 bg-primary/15 border border-primary/35 rounded-full px-3 py-1 flex-shrink-0">
                <Megaphone size={11} className="text-primary" />
                <span className="text-primary text-[10px] font-black tracking-widest uppercase">Offer</span>
                <span className="relative flex h-1.5 w-1.5 ml-0.5">
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full bg-primary"
                    animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
              </div>

              {/* Ticker */}
              <div className="flex items-center gap-2 bg-background-main/50 border border-border-accent rounded-full px-4 py-1.5 backdrop-blur overflow-hidden">
                <Zap size={11} className="text-primary flex-shrink-0" fill="currentColor" />
                <div className="relative h-4 overflow-hidden w-44">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeIdx}
                      initial={{ y: 18, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -18, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className={`absolute text-xs font-semibold whitespace-nowrap ${current?.accent === 'lime' ? 'text-badge-new' : 'text-white'}`}
                    >
                      {current?.ticker}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex gap-1 ml-1">
                  {offers.map((_, i) => (
                    <button key={i} onClick={() => setActiveIdx(i)}
                      className={`rounded-full transition-all duration-300 ${i === activeIdx ? 'w-3 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border-accent hover:bg-text-muted'}`}
                    />
                  ))}
                </div>
                <motion.button whileHover={{ x: 2 }} className="flex items-center gap-0.5 text-primary text-[10px] font-bold ml-1 flex-shrink-0">
                  Shop <ArrowRight size={9} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="text-text-muted max-w-xl text-lg"
          >
            {description}
          </motion.p>
        </div>

        {/* ──────── RIGHT: Upcoming Deals + New Launches ──────── */}
        {(upcomingDeals.length > 0 || newLaunches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="hidden lg:flex flex-col gap-3 w-64 flex-shrink-0"
          >
            {/* Upcoming Deals */}
            {upcomingDeals.length > 0 && (
              <div className="bg-background-main/60 border border-border-accent rounded-2xl px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2 mb-2.5">
                  <CalendarDays size={13} className="text-primary" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">Upcoming Deals</span>
                </div>
                <ul className="space-y-1.5">
                  {upcomingDeals.map((deal, i) => (
                    <motion.li
                      key={deal}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.07 }}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0 group-hover:scale-150 transition-transform" />
                      <span className="text-xs text-text-muted group-hover:text-white transition-colors font-medium truncate">{deal}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* New Launches */}
            {newLaunches.length > 0 && (
              <div className="bg-background-main/60 border border-badge-new/25 rounded-2xl px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles size={13} className="text-badge-new" />
                  <span className="text-xs font-black text-badge-new uppercase tracking-wider">New Launches</span>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-auto text-[9px] font-bold text-badge-new bg-badge-new/15 border border-badge-new/30 px-1.5 py-0.5 rounded-full"
                  >
                    LIVE
                  </motion.span>
                </div>
                <ul className="space-y-1.5">
                  {newLaunches.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <span className="w-1 h-1 rounded-full bg-badge-new flex-shrink-0 group-hover:scale-150 transition-transform" />
                      <span className="text-xs text-text-muted group-hover:text-white transition-colors font-medium truncate">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default CategoryBanner;
