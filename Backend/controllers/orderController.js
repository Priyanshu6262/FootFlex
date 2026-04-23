const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { items, customerName } = req.body;
    
    const orderPromises = items.map(item => {
      const newOrder = new Order({
        productName: item.name,
        productImage: item.image,
        quantity: item.quantity,
        price: item.price * (1 - (item.discount || 0) / 100),
        customerName: customerName || 'Guest'
      });
      return newOrder.save();
    });

    const savedOrders = await Promise.all(orderPromises);
    res.status(201).json({ message: 'Orders placed successfully', orders: savedOrders });
  } catch (error) {
    console.error('Error placing orders:', error);
    res.status(500).json({ error: 'Failed to place orders' });
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
