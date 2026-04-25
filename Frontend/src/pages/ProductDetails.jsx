import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Heart, ShieldCheck, Truck, RefreshCcw, Tag, 
  MapPin, CheckCircle2, ChevronRight, MessageSquare
} from 'lucide-react';
import AddToCartButton from '../components/AddToCartButton';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [pincode, setPincode] = useState('');
  const [pinStatus, setPinStatus] = useState(null); // null | 'checking' | 'success'
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    
    const fetchProductData = async () => {
      try {
        // Fetch current product
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const p = await response.json();
        
        const mappedProduct = {
          id: p._id,
          name: p.name,
          image: `http://localhost:5000${p.imageUrl}`,
          price: p.price,
          discount: p.discount,
          category: p.gender,
          gender: p.gender,
          rating: 4.8,
          reviews: 124,
          isNew: (new Date() - new Date(p.createdAt)) < (7 * 24 * 60 * 60 * 1000),
          details: p.details || 'No details available.',
          specifications: p.specifications || {},
          colors: p.inventory ? [...new Set(p.inventory.map(item => item.color))] : [],
          colorNames: p.inventory ? [...new Set(p.inventory.map(item => item.color))] : [],
          sizes: p.inventory ? [...new Set(p.inventory.map(item => item.size))] : [],
          coupon: p.coupon
        };
        
        setProduct(mappedProduct);
        if (mappedProduct.sizes && mappedProduct.sizes.length > 0) setSelectedSize(mappedProduct.sizes[0]);
        if (mappedProduct.colors && mappedProduct.colors.length > 0) setSelectedColor(mappedProduct.colors[0]);

        // Fetch similar products
        const allRes = await fetch('http://localhost:5000/api/products');
        if (allRes.ok) {
           const allProducts = await allRes.json();
           const mappedSimilar = allProducts.map(sp => ({
              id: sp._id,
              name: sp.name,
              image: `http://localhost:5000${sp.imageUrl}`,
              price: sp.price,
              discount: sp.discount,
              category: sp.gender,
              gender: sp.gender,
              rating: 4.5,
              reviews: 100,
              isNew: (new Date() - new Date(sp.createdAt)) < (7 * 24 * 60 * 60 * 1000),
              details: sp.details,
              specifications: sp.specifications,
              colors: sp.inventory ? [...new Set(sp.inventory.map(item => item.color))] : [],
              colorNames: sp.inventory ? [...new Set(sp.inventory.map(item => item.color))] : [],
              sizes: sp.inventory ? [...new Set(sp.inventory.map(item => item.size))] : [],
              coupon: sp.coupon
           }));
           setSimilarProducts(mappedSimilar.filter(sp => sp.gender === mappedProduct.gender && sp.id !== mappedProduct.id));
        }

      } catch (err) {
        console.error("Failed to load product", err);
      }
    };

    fetchProductData();
  }, [id]);

  if (!product) return <div className="min-h-screen pt-32 text-center text-white">Loading...</div>;

  // Mock Images (using the main image and some placeholders)
  const images = [
    product.image,
    '/images/products/product1.png',
    '/images/products/product2.png',
    '/images/products/product3.png',
  ];

  const handlePinCheck = () => {
    if(pincode.length < 5) return;
    setPinStatus('checking');
    setTimeout(() => setPinStatus('success'), 1200);
  };

  const handleWishlistClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
    } else {
      console.log('Added to wishlist');
    }
  };

  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="min-h-screen pb-24 px-6 md:px-12 pt-8 relative overflow-hidden bg-background-main">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="container mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-8 uppercase tracking-wider">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to={`/${product.gender.toLowerCase()}`} className="hover:text-primary transition-colors">{product.gender}</Link>
          <ChevronRight size={14} />
          <span className="text-white">{product.category}</span>
        </div>

        {/* --- MAIN PRODUCT SECTION --- */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20">
          
          {/* Left: Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 h-full">
            
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar py-1">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-primary shadow-[0_0_15px_rgba(0,122,255,0.3)] scale-105' : 'border-[#27272a] hover:border-text-muted opacity-60 hover:opacity-100'}`}
                >
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain p-2 relative z-10" />
                </button>
              ))}
            </div>

            {/* Main Image & Extra Card Column */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Main Image */}
              <motion.div 
                layoutId={`product-image-${product.id}`}
                className="bg-gradient-to-br from-[#18181b] to-background-card rounded-[2.5rem] border border-[#27272a] relative flex items-center justify-center p-8 md:max-h-[450px] aspect-square group overflow-hidden"
              >
                 {/* 3D Glass overlay */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                 <motion.img 
                   key={activeImage}
                   initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                   animate={{ opacity: 1, scale: 1, rotate: 0 }}
                   transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                   src={images[activeImage]} 
                   alt={product.name}
                   className="w-full h-full object-contain drop-shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500 origin-center max-h-[350px]"
                 />
                 
                 {/* Badges */}
                 <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                   {product.isNew && <span className="bg-badge-new text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">NEW IN</span>}
                   {product.discount > 0 && <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">{product.discount}% OFF</span>}
                 </div>

                 {/* Floating Wishlist */}
                 <button onClick={handleWishlistClick} className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-background-main/80 backdrop-blur border border-border-accent flex items-center justify-center text-text-secondary hover:text-rose-500 hover:border-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all group/btn">
                    <Heart size={22} className="group-hover/btn:scale-110 transition-transform" />
                 </button>
              </motion.div>

              {/* Extra Image Card (Matches main image size) */}
              <div className="hidden md:flex bg-background-card rounded-[2.5rem] border border-border-accent relative overflow-hidden group aspect-square md:max-h-[450px]">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                 <img 
                   src="/images/hero-shoe.png" 
                   alt="Lifestyle View" 
                   className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700 blur-[2px] group-hover:blur-0" 
                 />
                 <div className="relative z-20 p-8 flex flex-col justify-end h-full w-full">
                    <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <span className="w-8 h-px bg-primary inline-block" />
                      <span className="text-primary text-xs font-bold uppercase tracking-wider">Premium Tech</span>
                    </div>
                    <h3 className="text-white font-black uppercase tracking-widest text-2xl drop-shadow-xl mb-1">Engineered for Excellence</h3>
                    <p className="text-[#d4d4d8] font-medium drop-shadow-md">Discover the materials behind {product.name}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">{product.name}</h1>
              <p className="text-text-muted text-lg font-medium">{product.gender}'s {product.category} Shoes</p>
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-accent">
              <div className="flex items-center gap-1.5 bg-background-card border border-[#27272a] px-3 py-1.5 rounded-full">
                <Star size={16} className="text-star-rating" fill="currentColor" />
                <span className="text-white font-bold text-sm tracking-wide">{product.rating}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#3f3f46]" />
              <span className="text-primary font-medium text-sm flex items-center gap-2 cursor-pointer hover:underline">
                <MessageSquare size={16} /> Read {product.reviews} Reviews
              </span>
            </div>

            {/* Pricing */}
            <div className="mb-8">
               <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-black text-primary">₹{discountedPrice.toFixed(2)}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-xl text-text-muted line-through mb-1">₹{product.price.toFixed(2)}</span>
                      <span className="text-badge-new font-bold text-lg mb-1">({product.discount}% OFF)</span>
                    </>
                  )}
               </div>
               <p className="text-[#a1a1aa] text-xs uppercase tracking-wider font-semibold">Inclusive of all taxes</p>
            </div>

            {/* Select Color */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold uppercase tracking-wider text-sm">Color</span>
                <span className="text-text-muted text-sm">{product.colorNames[product.colors.indexOf(selectedColor)]}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((color, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 p-1 transition-all ${selectedColor === color ? 'border-primary scale-110 shadow-[0_0_15px_rgba(0,122,255,0.3)]' : 'border-[#27272a] hover:border-text-muted'}`}
                  >
                    <div className={`w-full h-full rounded-full ${color} shadow-inner bg-gradient-to-br from-white/20 to-transparent`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Select Size */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold uppercase tracking-wider text-sm">Select Size (UK)</span>
                <button className="text-primary text-sm font-semibold hover:underline">Size Chart</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-lg font-bold transition-all ${selectedSize === size ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,122,255,0.2)]' : 'bg-background-card border-[#27272a] text-text-secondary hover:border-text-muted hover:text-white'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-10">
              <div className="h-14 w-full md:w-80">
                {/* Wrapping AddToCart to stretch */}
                <div className="[&>div]:w-full [&_button]:w-full [&_button]:h-14 [&_button]:text-base">
                   <AddToCartButton product={product} size={selectedSize} color={selectedColor} />
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="bg-background-card border border-border-accent rounded-3xl p-6 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
               <div className="flex items-center gap-2 mb-4 relative z-10">
                 <Truck className="text-primary" size={20} />
                 <h3 className="text-white font-bold uppercase tracking-wider text-sm">Delivery Options</h3>
               </div>
               
               <div className="relative mb-3 z-10">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                 <input 
                   type="text" 
                   maxLength={6}
                   value={pincode}
                   onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                   placeholder="Enter Delivery PIN Code" 
                   className="w-full h-12 pl-12 pr-24 rounded-xl bg-[#18181b] border border-[#27272a] text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                 />
                 <button 
                   onClick={handlePinCheck}
                   className="absolute right-2 top-1/2 -translate-y-1/2 text-primary font-bold text-xs uppercase tracking-wider px-3 py-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                 >
                   {pinStatus === 'checking' ? 'Checking...' : 'Check'}
                 </button>
               </div>
               
               <AnimatePresence>
                 {pinStatus === 'success' && (
                   <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-green-500 font-semibold text-xs mb-4 flex items-center gap-1.5">
                     <CheckCircle2 size={14} /> Delivery available. Arrives by Tomorrow.
                   </motion.p>
                 )}
               </AnimatePresence>

               <p className="text-xs text-[#71717a] mb-5 leading-relaxed z-10 relative">
                 Please enter PIN code to check delivery time & Pay on Delivery Availability
               </p>

               <ul className="space-y-3 z-10 relative">
                 <li className="flex items-center gap-3 text-sm text-[#d4d4d8] font-medium"><ShieldCheck size={18} className="text-[#a1a1aa]" /> 100% Original Products</li>
                 <li className="flex items-center gap-3 text-sm text-[#d4d4d8] font-medium"><span className="w-5 h-5 flex items-center justify-center text-[#a1a1aa] font-bold text-lg">₹</span> Pay on delivery might be available</li>
                 <li className="flex items-center gap-3 text-sm text-[#d4d4d8] font-medium"><RefreshCcw size={18} className="text-[#a1a1aa]" /> Easy 7 days returns and exchanges</li>
               </ul>
            </div>

          </div>
        </div>

        {/* --- TABS: Details / Specs / Best Offers --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
           
           {/* Product Details Text */}
           <div className="lg:col-span-2 bg-background-card border border-border-accent rounded-3xl p-8 lg:p-10">
             <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">Product Details</h2>
             <div className="prose prose-invert max-w-none text-[#a1a1aa] leading-relaxed">
               <p className="mb-4">
                 Experience the ultimate fusion of performance and style with the {product.name}. Designed intricately for athletes and sneakerheads alike, this shoe boasts a lightweight, breathable mesh upper that wraps your foot in adaptive support.
               </p>
               <p className="mb-4">
                 The innovative foam midsole delivers unparalleled energy return, propelling you forward with every stride. Whether you're hitting the pavement or navigating the urban jungle, the high-traction rubber outsole ensures maximum grip and durability.
               </p>
               <h4 className="text-white font-bold uppercase tracking-wider text-sm mt-8 mb-4">Specifications</h4>
               <ul className="grid grid-cols-2 gap-4">
                 <li className="bg-[#18181b] p-4 rounded-2xl border border-[#27272a]"><span className="block text-xs text-text-muted mb-1">Type</span><span className="text-white font-medium">{product.category}</span></li>
                 <li className="bg-[#18181b] p-4 rounded-2xl border border-[#27272a]"><span className="block text-xs text-text-muted mb-1">Upper Material</span><span className="text-white font-medium">Engineered Mesh</span></li>
                 <li className="bg-[#18181b] p-4 rounded-2xl border border-[#27272a]"><span className="block text-xs text-text-muted mb-1">Outsole</span><span className="text-white font-medium">High-grip Rubber</span></li>
                 <li className="bg-[#18181b] p-4 rounded-2xl border border-[#27272a]"><span className="block text-xs text-text-muted mb-1">Fastening</span><span className="text-white font-medium">Lace-Up</span></li>
               </ul>
             </div>
           </div>

           {/* Best Offers */}
           <div className="bg-background-card border border-border-accent rounded-3xl p-8">
             <div className="flex items-center gap-2 mb-6">
                 <Tag className="text-primary" size={24} />
                 <h2 className="text-xl font-bold text-white uppercase tracking-wider">Best Offers</h2>
             </div>
             
             <div className="space-y-4">
               {[
                 { title: "Bank Offer", desc: "10% Instant Discount on HDFC Bank Credit Cards, up to ₹1,000 on orders of ₹5,000 and above." },
                 { title: "Special Price", desc: "Get extra 5% off (price inclusive of cashback/coupon)." },
                 { title: "Partner Offer", desc: "Sign up for FootFlex Plus and get free shipping on all orders." }
               ].map((offer, i) => (
                 <div key={i} className="bg-primary/5 border border-primary/20 p-4 rounded-2xl hover:bg-primary/10 transition-colors">
                   <h4 className="text-white font-bold text-sm mb-1">{offer.title}</h4>
                   <p className="text-xs text-[#a1a1aa] leading-relaxed">{offer.desc}</p>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* --- RATINGS & REVIEWS --- */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 border-b border-border-accent pb-4">Customer Ratings & Reviews</h2>
          
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Rating Breakdown */}
            <div className="w-full lg:w-1/3 bg-background-card border border-border-accent rounded-3xl p-8 flex flex-col sm:flex-row lg:flex-col items-center gap-8">
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-6xl font-black text-white">{product.rating}</span>
                  <Star size={36} className="text-star-rating" fill="currentColor" />
                </div>
                <p className="text-text-muted font-medium">5.8k Verified Buyers</p>
              </div>

              <div className="flex-1 w-full space-y-3">
                {[
                  { star: 5, count: 3503, percent: 65, color: 'bg-green-500' },
                  { star: 4, count: 975, percent: 20, color: 'bg-emerald-400' },
                  { star: 3, count: 458, percent: 10, color: 'bg-yellow-400' },
                  { star: 2, count: 255, percent: 3, color: 'bg-orange-400' },
                  { star: 1, count: 573, percent: 12, color: 'bg-red-500' },
                ].map((row) => (
                  <div key={row.star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-8 text-sm text-[#a1a1aa] font-medium">
                      {row.star} <Star size={12} fill="currentColor" />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-[#27272a] overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.percent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${row.color}`}
                      />
                    </div>
                    <div className="w-10 text-right text-xs text-text-muted font-medium">{row.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Photos & Reviews List */}
            <div className="w-full lg:w-2/3">
              <h3 className="text-lg font-bold text-white mb-4">Customer Photos</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 mb-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-24 h-24 rounded-2xl border border-border-accent bg-[#18181b] overflow-hidden flex-shrink-0 relative group cursor-pointer">
                    <img src={images[(i)%images.length]} alt={`Customer ${i}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" />
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold text-white mb-6">Top Reviews</h3>
              <div className="space-y-6">
                {[
                  { name: "Rahul S.", rating: 5, date: "Oct 12, 2025", text: "Absolutely love these shoes. The comfort level is insane, feels like walking on clouds. Plus, the design gets so many compliments!" },
                  { name: "Sneha M.", rating: 4, date: "Sep 28, 2025", text: "Great fit and finish. The color is exactly as shown in the pictures. They took a couple of days to break in, but now they are perfect." }
                ].map((review, i) => (
                  <div key={i} className="bg-background-card border border-border-accent rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">{review.name.charAt(0)}</div>
                        <div>
                          <p className="text-white font-bold text-sm">{review.name}</p>
                          <div className="flex items-center gap-1 text-badge-new mt-0.5"><CheckCircle2 size={12} /> <span className="text-[10px] font-semibold uppercase">Verified</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-0.5 text-star-rating mb-1">
                          {[...Array(5)].map((_, j) => <Star key={j} size={12} fill={j < review.rating ? "currentColor" : "none"} className={j < review.rating ? "" : "text-[#3f3f46]"} />)}
                        </div>
                        <p className="text-xs text-text-muted">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- SIMILAR PRODUCTS --- */}
        <div>
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl md:text-3xl font-bold text-white">Similar Products</h2>
             <Link to={`/${product.gender.toLowerCase()}`} className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">View All <ChevronRight size={16} /></Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {similarProducts.slice(0, 4).map(p => (
               <ProductCard key={p.id} product={p} />
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
