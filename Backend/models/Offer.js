const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  category: {
    type: String,
    enum: ['All', 'Men', 'Women', 'Kids'],
    default: 'All',
    required: true,
  },
  type: {
    type: String,
    enum: ['offer', 'deal'],
    default: 'offer',
    required: true,
  },
  // For deals: optional start/end date
  startDate: { type: Date },
  endDate: { type: Date },
  // Optional: tie to specific products
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  couponCode: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Offer', offerSchema);
