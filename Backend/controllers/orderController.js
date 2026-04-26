const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, amount, paymentMethod, paymentStatus, razorpayOrderId, razorpayPaymentId } = req.body;
    
    console.log('--- Incoming Order Request ---');
    console.log('Full Request Body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', userId);
    console.log('Items:', JSON.stringify(items, null, 2));
    console.log('Amount:', amount);
    
    // Inventory validation and deduction
    const Product = require('../models/Product');
    for (const item of items) {
      console.log(`Checking stock for Product ID: ${item.productId}, Size: ${item.size}, Color: ${item.color}`);
      const product = await Product.findById(item.productId);
      if (!product) {
        console.warn(`Product not found: ${item.productId}`);
        return res.status(404).json({ error: `Product not found: ${item.name}` });
      }

      const variant = product.inventory.find(v => String(v.size) === String(item.size) && String(v.color) === String(item.color));
      if (!variant) {
        console.warn(`Variant not found for product ${product.name}. Available inventory:`, JSON.stringify(product.inventory, null, 2));
        return res.status(400).json({ error: `Variant not found for ${item.name} (${item.size}, ${item.color})` });
      }

      if (variant.quantity < item.quantity) {
        console.warn(`Insufficient stock for ${product.name}. Requested: ${item.quantity}, Available: ${variant.quantity}`);
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.name} (${item.size}, ${item.color}). Requested: ${item.quantity}, Available: ${variant.quantity}` 
        });
      }
    }

    // Pass 2: Deduction
    for (const item of items) {
      const product = await Product.findById(item.productId);
      const variantIndex = product.inventory.findIndex(v => v.size === item.size && v.color === item.color);
      
      product.inventory[variantIndex].quantity -= item.quantity;
      product.totalQuantity -= item.quantity;
      await product.save();
    }

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
    console.log('Order created successfully:', savedOrder._id);
    res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(400).json({ error: error.message || 'Failed to place order' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    console.log('Admin Fetch Orders - Query:', { page, limit, status });

    const query = {};
    if (status && status !== 'All') {
      if (status.toLowerCase() === 'pending') {
        query.status = { $regex: new RegExp(`^(${status}|Initiated)$`, 'i') };
      } else {
        query.status = { $regex: new RegExp(`^${status}$`, 'i') };
      }
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalCount = await Order.countDocuments(query);
    const hasMore = totalCount > (skip + orders.length);
    
    console.log(`Found ${orders.length} orders out of ${totalCount} total.`);
    res.status(200).json({ orders, totalCount, hasMore });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
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
