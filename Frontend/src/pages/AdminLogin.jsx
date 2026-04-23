import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin-dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin-dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_30px_rgba(0,122,255,0.2)]"
          >
            <ShieldCheck className="text-primary w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Admin <span className="text-primary">Portal</span>
          </h1>
          <p className="text-[#71717a] mt-2 text-sm font-medium">Restricted Access • FootFlex Central Control</p>
        </div>

        <div className="bg-[#18181b]/50 backdrop-blur-xl border border-[#27272a] rounded-[2rem] p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#71717a] uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] focus:border-primary/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#3f3f46] outline-none transition-all"
                  placeholder="admin@footflex.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-[#71717a] uppercase tracking-widest">Password</label>
                <button type="button" className="text-xs text-primary hover:underline font-bold">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] focus:border-primary/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#3f3f46] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3"
              >
                <AlertCircle className="text-rose-500 shrink-0" size={18} />
                <p className="text-rose-500 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_25px_rgba(0,122,255,0.3)] hover:shadow-[0_15px_35px_rgba(0,122,255,0.4)] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  AUTHORIZE ACCESS
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[#3f3f46] text-xs font-medium">
          Authorized personnel only. All access attempts are logged.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
