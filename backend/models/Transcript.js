const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  speaker: {
    type: String,
    enum: ['customer', 'agent'],
    default: 'customer'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transcript', transcriptSchema);
