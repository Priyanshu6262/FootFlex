import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Men from './pages/Men';
import Women from './pages/Women';
import Kids from './pages/Kids';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Footer from './components/Footer';
import { FilterProvider } from './context/FilterContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <FilterProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Main layout pages */}
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
                    <Route path="/wishlist" element={<div className="h-screen flex items-center justify-center text-3xl">Wishlist Coming Soon</div>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<AdminDashboard />} />
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
  );
}

export default App;
