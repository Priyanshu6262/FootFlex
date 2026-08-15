const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
  docType: { type: String, enum: ['product', 'policy'], required: true },
  refId: { type: String },
  title: { type: String, required: true },
  category: { type: String },
  gender: { type: String },
  price: { type: Number },
  content: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  embedding: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for text or category filter acceleration
knowledgeSchema.index({ docType: 1, category: 1 });

module.exports = mongoose.model('Knowledge', knowledgeSchema);
