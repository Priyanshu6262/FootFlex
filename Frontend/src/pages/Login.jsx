import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Star, ArrowRight, Loader2 } from 'lucide-react';

/* ── Floating decoration orb ── */
const Orb = ({ className, animate }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={animate}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
  />
);

/* ── Small floating feature badge ── */
const FloatingBadge = ({ icon: Icon, text, delay, top, left, right }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{ top, left, right }}
    className="absolute hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl
               bg-[#18181b]/80 border border-[#27272a] backdrop-blur text-xs font-semibold text-white
               shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
  >
    <Icon size={13} className="text-primary" />
    {text}
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();
  const [btnState, setBtnState] = useState('idle'); // idle | loading | success
  const cardRef = useRef(null);

  /* ── 3D tilt logic ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  /* ── Simulated Google login ── */
  const handleGoogleLogin = () => {
    if (btnState !== 'idle') return;
    setBtnState('loading');
    // TODO: Replace with real Firebase/OAuth Google sign-in
    setTimeout(() => {
      setBtnState('success');
      setTimeout(() => navigate('/'), 900);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background-main flex items-center justify-center px-4 relative overflow-hidden">

      {/* ── Background orbs ── */}
      <Orb className="w-[500px] h-[500px] -top-32 -left-32 bg-primary/10" animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }} />
      <Orb className="w-[400px] h-[400px] -bottom-24 -right-20 bg-indigo-500/10" animate={{ scale: [1, 1.15, 1], y: [0, -15, 0] }} />
      <Orb className="w-56 h-56 top-1/2 left-1/3 bg-primary/5" animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} />

      {/* ── Floating feature badges ── */}
      <FloatingBadge icon={Shield}  text="Secure Login"         delay={0.6} top="20%" left="5%" />
      <FloatingBadge icon={Zap}     text="Instant Access"       delay={0.7} top="35%" right="4%" />
      <FloatingBadge icon={Star}    text="Premium Experience"   delay={0.8} top="72%" left="6%" />

      {/* ── Login Card ── */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md z-10"
      >
        {/* Card glow ring */}
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-primary/30 via-transparent to-indigo-500/20 pointer-events-none" />

        {/* Glass card */}
        <div className="relative rounded-[2rem] bg-[#18181b]/80 border border-[#27272a] backdrop-blur-xl
                        shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,122,255,0.08)]
                        px-8 py-10">

          {/* Inner depth shimmer */}
          <motion.div
            className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* ── Logo ── */}
          <motion.div
            style={{ transform: 'translateZ(30px)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-2.5 mb-8"
          >
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="FootFlex"
                className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(0,122,255,0.4)] group-hover:scale-105 transition-transform"
              />
              <span className="text-white font-bold text-2xl tracking-wide">
                Foot<span className="text-primary">Flex</span>
              </span>
            </Link>
          </motion.div>

          {/* ── Welcome text ── */}
          <motion.div
            style={{ transform: 'translateZ(20px)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-[#71717a] text-sm leading-relaxed">
              Sign in to access your account,<br />orders, and exclusive member deals.
            </p>
          </motion.div>

          {/* ── Divider with OR label ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex-1 h-px bg-[#27272a]" />
            <span className="text-[#52525b] text-xs font-medium">Continue with</span>
            <div className="flex-1 h-px bg-[#27272a]" />
          </motion.div>

          {/* ── Google Button ── */}
          <motion.div
            style={{ transform: 'translateZ(40px)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <motion.button
              onClick={handleGoogleLogin}
              disabled={btnState !== 'idle'}
              whileHover={btnState === 'idle' ? { scale: 1.02, y: -2 } : {}}
              whileTap={btnState === 'idle' ? { scale: 0.97, y: 1 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl
                         bg-white text-[#1f1f1f] font-semibold text-sm overflow-hidden
                         shadow-[0_4px_0px_rgba(0,0,0,0.25),0_0_20px_rgba(255,255,255,0.08)]
                         hover:shadow-[0_6px_0px_rgba(0,0,0,0.25),0_0_30px_rgba(255,255,255,0.12)]
                         disabled:opacity-60 disabled:cursor-not-allowed transition-shadow duration-200"
            >
              {/* Shimmer sweep */}
              {btnState === 'idle' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                />
              )}

              <AnimatePresence mode="wait">
                {btnState === 'loading' ? (
                  <motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-[#4285F4]" />
                    <span>Signing in...</span>
                  </motion.div>
                ) : btnState === 'success' ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-green-600">
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>✓</motion.span>
                    <span>Signed in! Redirecting...</span>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3">
                    {/* Google 'G' logo SVG */}
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                      <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2C36.5 32.4 34 35 30.5 36.7v5.3h7.6C43.1 37.4 47.5 31.5 47.5 24.5z" fill="#4285F4"/>
                      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9C30.1 38 27.2 39 24 39c-5.8 0-10.7-3.9-12.5-9.2H3.7v6.1C7.5 43.4 15.2 48 24 48z" fill="#34A853"/>
                      <path d="M11.5 29.8C10.5 26.8 10.5 23.6 11.5 20.6v-5.9H3.7C.9 18.8-.5 23.2.1 27.5l11.4 2.3z" fill="#FBBC05"/>
                      <path d="M24 9.5c3.2 0 6.1 1.1 8.4 3.2l6.3-6.3C34 2.3 29.2 0 24 0 15.2 0 7.5 4.6 3.7 11.5l7.8 6.1C13.3 13.4 18.2 9.5 24 9.5z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                    <ArrowRight size={15} className="ml-auto" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* ── Fine print ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-center text-[#52525b] text-xs mt-6 leading-relaxed"
          >
            By continuing, you agree to FootFlex's{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms</Link> &{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </motion.p>

        </div>
      </motion.div>

    </div>
  );
};

export default Login;
