const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    productId: String,
    name: String,
    image: String,
    quantity: Number,
    price: Number,
    size: String,
    color: String
  }],
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Online', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'return-requested', 'returned'] 
  },
  returnRequest: {
    reason: String,
    description: String,
    image: String,
    pickupAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    requestedAt: Date
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
