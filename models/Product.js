const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // We keep the manual ID for now to be compatible with shop.js
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  collectionName: { type: String, required: true }, // 'collection' is a reserved keyword in some contexts, using collectionName
  category: { type: String, required: true },
  sub: { type: String },
  desc: { type: String, required: true },
  notes: [{ type: String }],
  sizes: [{ type: String }],
  prices: {
    type: Map,
    of: Number
  },
  badge: { type: String, default: null },
  rating: { type: String, default: '5/5' },
  image: { type: String, required: true },
  images: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
