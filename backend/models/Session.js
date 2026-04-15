const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentStep: {
    type: String,
    enum: ['DOCUMENT_UPLOAD', 'VIDEO_CALL', 'FINAL_DECISION'],
    default: 'DOCUMENT_UPLOAD'
  },
  loanType: {
    type: String,
    default: 'Personal Loan'
  },
  requestedAmount: Number,
  idDocumentImage: String, // Store image for resumability
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'abandoned'],
    default: 'active'
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
