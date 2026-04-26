import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Box, Tag, Clock, Settings2, Users as UsersIcon
} from 'lucide-react';

const sidebarItems = [
  { id: 'dashboard',       label: 'Dashboard',       icon: LayoutDashboard, path: '/admin?section=dashboard' },
  { id: 'all-orders',      label: 'All Orders',       icon: ShoppingBag,    path: '/admin?section=all-orders' },
  { id: 'listed-products', label: 'Listed Products',  icon: Box,            path: '/admin/listed-products' },
  { id: 'add-offer',       label: 'Add Offer',        icon: Tag,            path: '/admin/add-offer' },
  { id: 'upcoming-deals',  label: 'Upcoming Deals',   icon: Clock,          path: '/admin/upcoming-deals' },
  { id: 'manage-orders',   label: 'Manage Orders',    icon: Settings2,      path: '/admin?section=manage-orders' },
  { id: 'users',           label: 'Users',            icon: UsersIcon,      path: '/admin/users' },
];

const AdminSidebar = ({ activeId, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed md:sticky top-20 left-0 h-[calc(100vh-80px)] w-72 bg-background-card/30 backdrop-blur-3xl border-r border-border-accent z-50
        transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="mb-10 px-2">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Management</h2>
            <div className="space-y-2">
              {sidebarItems.map(item => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-text-secondary hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                    <span className="font-semibold text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
