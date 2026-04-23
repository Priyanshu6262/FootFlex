import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AccountDropdown from './AccountDropdown';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'Kids', path: '/kids' },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass-effect py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="FootFlex Logo" className="w-16 h-16 my-[-12px] object-contain drop-shadow-[0_0_15px_rgba(0,122,255,0.3)] group-hover:scale-105 transition-transform duration-300" />
          <span className="text-white font-bold text-xl tracking-wide">
            Foot<span className="text-primary">Flex</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-white relative group ${
                location.pathname === link.path ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full transform origin-left transition-transform duration-300 ${
                location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-text-secondary group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-10 focus:w-[180px] xl:focus:w-[220px] h-9 pl-10 pr-4 rounded-full bg-background-main/40 border border-transparent focus:border-border-accent focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background-main/80 text-white text-sm transition-all duration-300 placeholder:text-transparent focus:placeholder:text-text-muted/70 cursor-pointer focus:cursor-text"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(prev => !prev)}
              className={`flex items-center gap-2 transition-all ${isAccountOpen ? 'text-white' : 'text-text-secondary hover:text-white'}`}
              aria-label="Account"
            >
              {user ? (
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full overflow-hidden border border-border-accent shadow-[0_0_10px_rgba(0,122,255,0.2)]">
                      <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="User" className="w-full h-full object-cover" />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest hidden xl:inline-block">{user.displayName.split(' ')[0]}</span>
                </div>
              ) : (
                <User size={20} />
              )}
            </button>
            <AccountDropdown
              isOpen={isAccountOpen}
              onClose={() => setIsAccountOpen(false)}
            />
          </div>
          <Link to="/wishlist" className="text-text-secondary hover:text-white transition-colors">
            <Heart size={20} />
          </Link>
          <Link to="/cart" className="text-text-secondary hover:text-white transition-colors relative group">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-background-main group-hover:scale-110 transition-transform">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Hamburger Dropdown */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-background-main/95 backdrop-blur-xl md:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border-accent">
              <div className="flex items-center gap-3">
                 {user ? (
                   <>
                     <div className="w-10 h-10 rounded-full overflow-hidden border border-primary">
                        <img src={user.photoURL || 'https://via.placeholder.com/150'} alt="User" className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <p className="text-white font-bold text-sm">{user.displayName}</p>
                        <p className="text-text-muted text-[10px] uppercase tracking-tighter">Premium Member</p>
                     </div>
                   </>
                 ) : (
                   <span className="text-white font-bold text-xl">Menu</span>
                 )}
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-grow p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="relative mb-2">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-background-main border border-border-accent text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-inner"
                />
              </div>
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between text-2xl font-semibold text-text-secondary hover:text-white transition-colors group"
                >
                  {link.name}
                  <ChevronRight size={24} className="opacity-0 group-hover:opacity-100 text-primary transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="p-6 border-t border-border-accent flex justify-around">
               {user ? (
                 <button 
                   onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                   className="flex flex-col items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors"
                 >
                   <User size={24} />
                   <span className="text-xs">Logout</span>
                 </button>
               ) : (
                 <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-2 text-text-secondary hover:text-primary transition-colors">
                   <User size={24} />
                   <span className="text-xs">Login</span>
                 </Link>
               )}
               <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-2 text-text-secondary hover:text-primary transition-colors">
                 <Heart size={24} />
                 <span className="text-xs">Wishlist</span>
               </Link>
               <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-2 text-text-secondary hover:text-primary transition-colors relative">
                 <div className="relative">
                    <ShoppingBag size={24} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                 </div>
                 <span className="text-xs">Cart</span>
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
