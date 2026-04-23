const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String, required: true },
  specifications: { type: String, required: true },
  gender: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  coupon: { type: String },
  imageUrl: { type: String, required: true },
  sizes: [String],
  colors: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
