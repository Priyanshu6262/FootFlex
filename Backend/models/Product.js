const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  coupon: { type: String },
  imageUrl: { type: String, required: true },
  inventory: [{
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 }
  }],
  totalQuantity: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
