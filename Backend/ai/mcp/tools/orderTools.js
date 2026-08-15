const Order = require('../../../models/Order');

/**
 * Helper to build Date range for filtering MongoDB queries.
 */
function getDateRange(dateFilter, startDate, endDate) {
  const now = new Date();
  let start = null;
  let end = null;

  if (!dateFilter && !startDate && !endDate) {
    return { start: null, end: null };
  }

  const cleanFilter = String(dateFilter || '').toLowerCase().trim();

  if (cleanFilter === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (cleanFilter === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  } else if (cleanFilter === 'this_week' || cleanFilter === 'week' || cleanFilter === 'last_7_days') {
    start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else if (cleanFilter === 'this_month' || cleanFilter === 'month' || cleanFilter === 'last_30_days') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(cleanFilter)) {
    const [y, m, d] = cleanFilter.split('-').map(Number);
    start = new Date(y, m - 1, d, 0, 0, 0, 0);
    end = new Date(y, m - 1, d, 23, 59, 59, 999);
  } else {
    if (startDate) start = new Date(startDate);
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }
  }

  return { start, end };
}

/**
 * MCP Tool: get_user_orders
 * Retrieves real-time orders for the authenticated user with optional date filtering (e.g. today, yesterday, this_week, this_month, or YYYY-MM-DD).
 */
async function getUserOrders(params = {}) {
  const { userId, limit = 10, dateFilter = null, startDate = null, endDate = null } = params;

  if (!userId) {
    throw new Error('User authentication is required to access order history.');
  }

  const query = { userId };

  const { start, end } = getDateRange(dateFilter, startDate, endDate);
  if (start || end) {
    query.createdAt = {};
    if (start) query.createdAt.$gte = start;
    if (end) query.createdAt.$lte = end;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const formattedOrders = orders.map(order => {
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    return {
      orderId: String(order._id),
      userId: order.userId,
      items: order.items.map(i => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        quantity: i.quantity,
        price: i.price,
        size: i.size,
        color: i.color
      })),
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt,
      formattedDate: orderDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      returnRequest: order.returnRequest || null
    };
  });

  return {
    count: formattedOrders.length,
    dateFilterApplied: dateFilter || (start ? 'custom_date_range' : 'all_time'),
    filterApplied: !!(start || end),
    orders: formattedOrders,
    message: formattedOrders.length === 0
      ? (dateFilter === 'today' ? 'No orders have been placed today.' : `No orders found for period: ${dateFilter || 'all time'}.`)
      : `Found ${formattedOrders.length} order(s) for user.${dateFilter ? ' (Filter: ' + dateFilter + ')' : ''}`
  };
}

/**
 * MCP Tool: get_order_status
 * Fetches real-time status update for a specific order or latest order matching date criteria.
 */
async function getOrderStatus(params = {}) {
  const { userId, orderId, dateFilter } = params;

  if (!userId) {
    throw new Error('User authentication is required to check order status.');
  }

  const query = { userId };

  if (orderId && orderId.length === 24) {
    query._id = orderId;
  } else if (dateFilter) {
    const { start, end } = getDateRange(dateFilter);
    if (start || end) {
      query.createdAt = {};
      if (start) query.createdAt.$gte = start;
      if (end) query.createdAt.$lte = end;
    }
  }

  const order = await Order.findOne(query).sort({ createdAt: -1 }).lean();

  if (!order) {
    return {
      found: false,
      message: dateFilter === 'today' 
        ? 'No orders found placed today.' 
        : 'No matching orders found for your account.'
    };
  }

  // Define tracking status step index
  const statusSteps = ['pending', 'processing', 'shipped', 'out-for-delivery', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status.toLowerCase());

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();

  return {
    found: true,
    orderId: String(order._id),
    status: order.status,
    paymentStatus: order.paymentStatus,
    amount: order.amount,
    itemsCount: order.items.length,
    itemsSummary: order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
    createdAt: order.createdAt,
    formattedDate: orderDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    trackingProgress: currentStep >= 0 ? `${currentStep + 1} of ${statusSteps.length}` : order.status,
    message: `Order #${String(order._id).slice(-6)} placed on ${orderDate.toLocaleDateString()} is currently '${order.status}'.`
  };
}

module.exports = {
  getUserOrders,
  getOrderStatus
};
