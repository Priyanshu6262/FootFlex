import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, size, color } = action.payload;
      // Unique ID based on product ID, size, and color to separate variants
      const cartItemId = `${product.id}-${size || 'any'}-${color ? color.replace('#', '') : 'any'}`;
      
      const existingItemIndex = state.items.findIndex(item => item.cartItemId === cartItemId);
      
      if (existingItemIndex > -1) {
        // Increment quantity if exists
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return { 
          ...state, 
          items: [...state.items, { ...product, size, color, cartItemId, quantity: 1 }] 
        };
      }
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.cartItemId !== action.payload)
      };
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
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (product, size, color) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, size, color } });
  };

  const removeFromCart = (cartItemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });
  };

  const updateQuantity = (cartItemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Derived properties
  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const cartTotalMrp = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate discount taking product.discount into account
  const discountTotal = state.items.reduce((total, item) => {
    const itemDiscount = item.price * (item.discount / 100);
    return total + (itemDiscount * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart: state.items, 
      cartCount,
      cartTotalMrp,
      discountTotal,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
