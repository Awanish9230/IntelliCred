const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  ipAddress: {
    type: String,
  },
  deviceInfo: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
