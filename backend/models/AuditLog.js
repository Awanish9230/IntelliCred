const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  videoUrl: String,
  transcriptSnippet: String,
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
  },
  ageEstimate: Number,
  location: String,
  geoCoordinates: {
    lat: Number,
    lng: Number
  },
  bureauData: mongoose.Schema.Types.Mixed,
  requestedAmount: Number,
  docVerificationStatus: String,
  idDocumentImage: String,
  decision: {
    eligible: Boolean,
    loan_amount: Number,
    interest_rate: Number,
    tenure: [Number],
    reason: String,
    score: Number,
    trustProfile: mongoose.Schema.Types.Mixed,
    status: String
  },
  payoutData: mongoose.Schema.Types.Mixed, // Receipt from RazorpayX
  blinkCount: Number,
  stressLevel: String,
  voiceHash: String,
  structuredAnswers: mongoose.Schema.Types.Mixed, // Stores (Question -> Answer) pairs
  confidenceScore: Number,
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
