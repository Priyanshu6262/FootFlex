const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  type: { type: String, enum: ['Home', 'Work'], default: 'Home' },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Address', addressSchema);
