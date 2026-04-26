import React, { useState } from 'react';
import AdminNavbar from './AdminNavbar';

const AdminLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-main selection:bg-primary/30">
      <AdminNavbar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      {/* 
          Note: Admin pages have their own sidebar logic currently. 
          The AdminNavbar handles the top space (h-20).
          Children will contain the page content (including sidebars).
      */}
      <div className="pt-20">
        {React.cloneElement(children, { isMobileMenuOpen, setIsMobileMenuOpen })}
      </div>
    </div>
  );
};

export default AdminLayout;
