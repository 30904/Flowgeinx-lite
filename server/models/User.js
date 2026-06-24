const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  whatsappLinked: { type: Boolean, default: false },
  whatsappPhone: { type: String },
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'pro'], default: 'free' },
    razorpaySubId: String,
    status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
    currentPeriodEnd: Date,
  },
  docCount: { type: Number, default: 0 },
  familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
