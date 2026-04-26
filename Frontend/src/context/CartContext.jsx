import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const CART_KEY = 'footflex_cart';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, size, color } = action.payload;
      const cartItemId = `${product.id}-${size || 'any'}-${color ? color.replace('#', '') : 'any'}`;
      const existingItemIndex = state.items.findIndex(item => item.cartItemId === cartItemId);
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, { ...product, size, color, cartItemId, quantity: 1 }] };
      }
    }
    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter(item => item.cartItemId !== action.payload) };
    case 'REMOVE_PRODUCT_ALL':
      // Remove all cart items for a given product ID (used for mutual exclusivity)
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.cartItemId === action.payload.cartItemId
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: loadCartFromStorage() });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, size, color) =>
    dispatch({ type: 'ADD_TO_CART', payload: { product, size, color } });

  const removeFromCart = (cartItemId) =>
    dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });

  // Remove ALL variants of a product (used when moving to wishlist)
  const removeProductFromCart = (productId) =>
    dispatch({ type: 'REMOVE_PRODUCT_ALL', payload: productId });

  const updateQuantity = (cartItemId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const cartTotalMrp = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountTotal = state.items.reduce((total, item) => {
    const itemDiscount = item.price * ((item.discount || 0) / 100);
    return total + (itemDiscount * item.quantity);
  }, 0);

  // Check if a product (by ID) is in cart
  const isInCart = (productId) => state.items.some(item => item.id === productId);

  return (
    <CartContext.Provider value={{
      cart: state.items,
      cartCount,
      cartTotalMrp,
      discountTotal,
      addToCart,
      removeFromCart,
      removeProductFromCart,
      updateQuantity,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
