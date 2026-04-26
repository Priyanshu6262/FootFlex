// This bridge registers the toast function into WishlistContext so they don't have circular deps
import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';

const ToastBridge = () => {
  const { showToast } = useToast();
  const { registerToast } = useWishlist();

  useEffect(() => {
    registerToast(showToast);
  }, [showToast, registerToast]);

  return null;
};

export default ToastBridge;
