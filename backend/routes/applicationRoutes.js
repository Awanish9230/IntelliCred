const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

router.post('/initialize', auth, async (req, res) => {
  try {
    const sessionId = Math.random().toString(36).substring(7);
    const newSession = new Session({
      sessionId,
      userId: req.user.id,
      currentStep: 'DOCUMENT_UPLOAD',
      status: 'active'
    });
    await newSession.save();
    res.status(201).json({ success: true, sessionId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Fetch user's recent applications with outcomes
router.get('/my-applications', auth, async (req, res) => {
  try {
    const apps = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    
    // Enrich sessions with their final decisions from AuditLog
    const enrichedApps = await Promise.all(apps.map(async (app) => {
      const log = await AuditLog.findOne({ sessionId: app.sessionId }).select('decision createdAt').lean();
      return {
        ...app,
        decision: log ? log.decision : null,
        submittedAt: log ? log.createdAt : null
      };
    }));

    res.status(200).json({ success: true, applications: enrichedApps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Update application step or status
router.patch('/:sessionId/update', auth, async (req, res) => {
  try {
    const { currentStep, status, requestedAmount, idDocumentImage } = req.body;
    const updateData = {};
    if (currentStep) updateData.currentStep = currentStep;
    if (status) updateData.status = status;
    if (requestedAmount) updateData.requestedAmount = requestedAmount;
    if (idDocumentImage) updateData.idDocumentImage = idDocumentImage;

    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.sessionId, userId: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Cancel application
router.post('/:sessionId/cancel', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.sessionId, userId: req.user.id },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.status(200).json({ success: true, message: 'Application cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
