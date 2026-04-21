import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Men from './pages/Men';
import Women from './pages/Women';
import Kids from './pages/Kids';
import Login from './pages/Login';
import Footer from './components/Footer';
import { FilterProvider } from './context/FilterContext';

function App() {
  return (
    <FilterProvider>
      <Router>
        <Routes>
          {/* Standalone pages — no Navbar/Footer */}
          <Route path="/login" element={<Login />} />

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
                  <Route path="/cart" element={<div className="h-screen flex items-center justify-center text-3xl">Cart Coming Soon</div>} />
                  <Route path="/wishlist" element={<div className="h-screen flex items-center justify-center text-3xl">Wishlist Coming Soon</div>} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </FilterProvider>
  );
}

export default App;
