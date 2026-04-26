import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

const AdminNavbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-background-card/80 backdrop-blur-xl border-b border-border-accent z-[60] px-6 md:px-10 flex items-center justify-between">
      {/* Left: Brand & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <Link to="/admin" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl italic">F</span>
          </div>
          <span className="text-white font-black text-xl tracking-tighter hidden sm:block">
            FOOTFLEX <span className="text-primary italic">ADMIN</span>
          </span>
        </Link>
      </div>

      {/* Right: Profile & Logout */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-border-accent">
          <div className="text-right">
            <p className="text-sm font-bold text-white leading-tight">Admin</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Active Now</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-background-main border border-border-accent flex items-center justify-center text-primary shadow-inner">
            <User size={20} />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-lg shadow-red-500/5 group"
          title="Logout"
        >
          <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
