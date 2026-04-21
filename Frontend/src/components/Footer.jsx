import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background-card pt-20 pb-10 border-t border-border-accent relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="FootFlex Logo" className="w-12 h-12 my-[-8px] object-contain" />
              <span className="text-white font-bold text-xl tracking-wide">
                Foot<span className="text-primary">Flex</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Premium footwear crafted for those who dare to move. Pushing boundaries in performance and style since 2026.
            </p>
            <div className="flex gap-4">
              {[Globe, Mail, Phone, MapPin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-background-main border border-border-accent flex items-center justify-center text-text-secondary hover:text-white hover:border-primary hover:bg-primary/10 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Shop</h4>
            <ul className="space-y-4">
              {['Men\'s Shoes', 'Women\'s Shoes', 'Kids\' Shoes', 'New Arrivals', 'Sale & Offers'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-text-secondary hover:text-primary transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-border-accent group-hover:bg-primary transition-colors" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Order Status', 'Shipping & Delivery', 'Returns', 'Contact Us'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-text-secondary hover:text-primary transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-border-accent group-hover:bg-primary transition-colors" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-6">Stay in the Loop</h4>
            <p className="text-text-muted text-sm mb-4">
              Join our newsletter for exclusive drops and fitness tips.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-background-main border border-border-accent text-white text-sm rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
                required
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary-hover transition-colors">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-accent flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} FootFlex. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-text-muted hover:text-white text-xs transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-text-muted hover:text-white text-xs transition-colors">Terms of Service</Link>
            <Link to="#" className="text-text-muted hover:text-white text-xs transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
