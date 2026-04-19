const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [{
    productId: Number,
    name: String,
    size: String,
    quantity: Number,
    price: Number,
    image: String,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  promoCode: {
    type: String,
    default: null,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  customer: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    postalCode: String,
    city: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered'],
    default: 'pending',
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
