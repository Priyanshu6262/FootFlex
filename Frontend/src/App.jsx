import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Men from './pages/Men';
import Women from './pages/Women';
import Kids from './pages/Kids';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ListedProducts from './pages/ListedProducts';
import Users from './pages/Users';
import AddOffer from './pages/AddOffer';
import UpcomingDeals from './pages/UpcomingDeals';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Addresses from './pages/Addresses';
import AdminLogin from './pages/AdminLogin';
import Footer from './components/Footer';
import { FilterProvider } from './context/FilterContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* ── Standalone admin pages (NO main site Navbar / Footer) ── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin-dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/listed-products" element={<AdminLayout><ListedProducts /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><Users /></AdminLayout>} />
              <Route path="/admin/add-offer" element={<AdminLayout><AddOffer /></AdminLayout>} />
              <Route path="/admin/upcoming-deals" element={<AdminLayout><UpcomingDeals /></AdminLayout>} />

              {/* ── Main site layout (with Navbar + Footer) ── */}
              <Route path="/*" element={
                <div className="min-h-screen flex flex-col bg-background-main selection:bg-primary/30">
                  <Navbar />
                  <main className="flex-grow pt-20">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/men" element={<Men />} />
                      <Route path="/women" element={<Women />} />
                      <Route path="/kids" element={<Kids />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/addresses" element={<Addresses />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/wishlist" element={<div className="h-screen flex items-center justify-center text-3xl">Wishlist Coming Soon</div>} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </Router>
        </CartProvider>
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;
