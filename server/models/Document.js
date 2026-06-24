const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalFileName: String,
  fileUrl: String,
  fileKey: String,
  mimeType: String,
  source: { type: String, enum: ['upload', 'whatsapp'], default: 'upload' },
  category: {
    type: String,
    enum: ['identity', 'finance', 'property', 'insurance', 'legal', 'vehicle', 'medical', 'other'],
    default: 'other',
  },
  aiExtracted: {
    documentType: String,
    holderName: String,
    issuedDate: Date,
    expiryDate: Date,
    keyFields: mongoose.Schema.Types.Mixed,
    summary: String,
    confidence: Number,
  },
  reminders: [
    {
      daysBefore: Number,
      sent: { type: Boolean, default: false },
      sentAt: Date,
    },
  ],
  tags: [String],
  isDeleted: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

documentSchema.index({ userId: 1, 'aiExtracted.expiryDate': 1 });

module.exports = mongoose.model('Document', documentSchema);
