const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  isBlocked: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
