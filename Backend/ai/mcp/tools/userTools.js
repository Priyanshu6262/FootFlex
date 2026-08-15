const User = require('../../../models/User');
const Address = require('../../../models/Address');
const Order = require('../../../models/Order');

/**
 * MCP Tool: get_user_profile
 * Fetches authenticated user account profile from MongoDB.
 */
async function getUserProfile(params = {}) {
  const { userId } = params;

  if (!userId) {
    throw new Error('Authentication required. Please log in to access your FootFlex profile.');
  }

  const user = await User.findOne({ firebaseUid: userId }).lean();
  if (!user) {
    return {
      found: false,
      message: 'User profile not found in FootFlex database.'
    };
  }

  return {
    found: true,
    userId: user.firebaseUid,
    name: user.name || 'FootFlex User',
    email: user.email || 'N/A',
    wishlistCount: user.wishlist ? user.wishlist.length : 0,
    createdAt: user.createdAt
  };
}

/**
 * MCP Tool: get_user_addresses
 * Fetches saved delivery addresses belonging strictly to the authenticated user.
 */
async function getUserAddresses(params = {}) {
  const { userId } = params;

  if (!userId) {
    throw new Error('Authentication required. Please log in to access saved addresses.');
  }

  const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();

  return {
    count: addresses.length,
    addresses: addresses.map(addr => ({
      id: String(addr._id),
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault
    }))
  };
}

/**
 * MCP Tool: get_user_wishlist
 * Fetches saved wishlist items belonging strictly to the authenticated user.
 */
async function getUserWishlist(params = {}) {
  const { userId } = params;

  if (!userId) {
    throw new Error('Authentication required. Please log in to access your wishlist.');
  }

  const user = await User.findOne({ firebaseUid: userId }).populate('wishlist').lean();

  if (!user || !user.wishlist) {
    return { count: 0, items: [] };
  }

  return {
    count: user.wishlist.length,
    items: user.wishlist.map(p => ({
      id: String(p._id),
      name: p.name,
      category: p.category,
      gender: p.gender,
      price: p.price,
      imageUrl: p.imageUrl
    }))
  };
}

/**
 * MCP Tool: cancel_user_order
 * Cancels a pending/processing order belonging strictly to the authenticated user.
 */
async function cancelUserOrder(params = {}) {
  const { userId, orderId } = params;

  if (!userId) {
    throw new Error('Authentication required. Please log in to cancel an order.');
  }

  if (!orderId) {
    throw new Error('Order ID is required to process cancellation.');
  }

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    return {
      success: false,
      message: `Order #${orderId} was not found under your account.`
    };
  }

  if (['shipped', 'out-for-delivery', 'delivered', 'returned'].includes(order.status.toLowerCase())) {
    return {
      success: false,
      message: `Order #${orderId} cannot be cancelled because it is already '${order.status}'. Please wait for delivery to request a return.`
    };
  }

  if (order.status.toLowerCase() === 'cancelled') {
    return {
      success: false,
      message: `Order #${orderId} has already been cancelled.`
    };
  }

  order.status = 'cancelled';
  await order.save();

  return {
    success: true,
    orderId: String(order._id),
    status: 'cancelled',
    amount: order.amount,
    refundInitiated: order.paymentStatus === 'Paid',
    message: `Order #${String(order._id).slice(-6)} has been successfully cancelled.${order.paymentStatus === 'Paid' ? ' A full refund of ₹' + order.amount + ' has been initiated to your original payment method.' : ''}`
  };
}

module.exports = {
  getUserProfile,
  getUserAddresses,
  getUserWishlist,
  cancelUserOrder
};
