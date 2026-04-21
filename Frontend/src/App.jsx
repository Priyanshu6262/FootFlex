import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Men from './pages/Men';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background-main selection:bg-primary/30">
        <Navbar />
        <main className="flex-grow pt-20"> {/* pt-20 to account for fixed navbar */}
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Added placeholder routes to complete the structure later */}
            <Route path="/men" element={<Men />} />
            <Route path="/women" element={<div className="h-screen flex items-center justify-center text-3xl">Women Collection Coming Soon</div>} />
            <Route path="/kids" element={<div className="h-screen flex items-center justify-center text-3xl">Kids Collection Coming Soon</div>} />
            <Route path="/cart" element={<div className="h-screen flex items-center justify-center text-3xl">Cart Coming Soon</div>} />
            <Route path="/wishlist" element={<div className="h-screen flex items-center justify-center text-3xl">Wishlist Coming Soon</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
