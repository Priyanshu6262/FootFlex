const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, amount, paymentMethod, paymentStatus, razorpayOrderId, razorpayPaymentId } = req.body;
    
    const newOrder = new Order({
      userId,
      items,
      shippingAddress,
      amount,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    
    const orders = await Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalCount = await Order.countDocuments();
    
    res.status(200).json({ orders, totalCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
