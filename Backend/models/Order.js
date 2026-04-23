const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'Initiated', enum: ['Initiated', 'Shipped', 'Out for Delivery', 'Delivered'] },
  customerName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
