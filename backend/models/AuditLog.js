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
  decision: {
    eligible: Boolean,
    loan_amount: Number,
    interest_rate: Number,
    tenure: [Number],
    reason: String
  },
  confidenceScore: Number,
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
