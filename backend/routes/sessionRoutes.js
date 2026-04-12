const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const router = express.Router();

// Generate a new session
router.post('/generate', async (req, res) => {
  try {
    const { deviceInfo } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const sessionId = uuidv4();

    const newSession = new Session({
      sessionId,
      ipAddress,
      deviceInfo
    });

    await newSession.save();
    res.status(201).json({ success: true, sessionId, message: 'Session generated securely.' });
  } catch (error) {
    console.error('Error generating session:', error);
    res.status(500).json({ success: false, error: 'Failed to generate session' });
  }
});

// Validate an existing session
router.get('/validate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOne({ sessionId: id });
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Invalid or expired session link.' });
    }
    
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during validation' });
  }
});

module.exports = router;
