const mongoose = require('mongoose');

function generateUserCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ANB-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    default: null, // null for Google-only accounts
  },
  googleId: {
    type: String,
    default: null,
  },
  userCode: {
    type: String,
    unique: true,
    default: generateUserCode,
  },
  points: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  postalCode: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
