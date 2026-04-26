import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const STORAGE_KEY = 'footflex_wishlist';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Toast will be injected via ref so we don't create circular deps
  const toastRef = React.useRef(null);
  const registerToast = (fn) => { toastRef.current = fn; };
  const toast = (msg, type) => toastRef.current?.(msg, type);

  const mapProduct = (p) => ({
    id: p._id,
    name: p.name,
    image: p.imageUrl?.startsWith('http') ? p.imageUrl : `http://localhost:5000${p.imageUrl}`,
    price: p.price,
    discount: p.discount,
    gender: p.gender,
    category: p.gender,
    isNew: (new Date() - new Date(p.createdAt)) < (7 * 24 * 60 * 60 * 1000),
    sizes: p.inventory ? [...new Set(p.inventory.map(i => i.size))] : [],
    colors: p.inventory ? [...new Set(p.inventory.map(i => i.color))] : [],
  });

  const syncState = (products) => {
    setWishlist(products);
    setWishlistIds(new Set(products.map(p => p.id || p._id)));
  };

  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:5000/api/users/${user.uid}/wishlist`);
          if (res.ok) {
            const data = await res.json();
            const mapped = Array.isArray(data) ? data.map(mapProduct) : [];
            syncState(mapped);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          }
        } catch {
          const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          syncState(local);
        } finally {
          setLoading(false);
        }
      } else {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        syncState(local);
      }
    };
    loadWishlist();
  }, [user]);

  const addToWishlist = useCallback(async (product, showToast = true) => {
    const id = product.id || product._id;
    if (wishlistIds.has(id)) return;

    const normalized = {
      id,
      name: product.name,
      image: product.image,
      price: product.price,
      discount: product.discount,
      gender: product.gender || product.category,
      category: product.gender || product.category,
      isNew: product.isNew,
      sizes: product.sizes || [],
      colors: product.colors || [],
    };

    const newList = [...wishlist, normalized];
    syncState(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    if (showToast) toast('Added to Wishlist ❤️', 'wishlist');

    if (user) {
      try {
        await fetch(`http://localhost:5000/api/users/${user.uid}/wishlist/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        });
      } catch (err) {
        console.error('Failed to sync wishlist:', err);
      }
    }
  }, [wishlist, wishlistIds, user]);

  const removeFromWishlist = useCallback(async (productId, silent = false) => {
    const newList = wishlist.filter(p => p.id !== productId);
    syncState(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));

    if (user) {
      try {
        await fetch(`http://localhost:5000/api/users/${user.uid}/wishlist/remove/${productId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to sync remove wishlist:', err);
      }
    }
  }, [wishlist, user]);

  const isWishlisted = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount: wishlist.length,
      loading,
      addToWishlist,
      removeFromWishlist,
      isWishlisted,
      registerToast,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
