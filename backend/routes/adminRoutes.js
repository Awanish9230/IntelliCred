const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Transcript = require('../models/Transcript');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Dashboard Statistics
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApplications = await AuditLog.countDocuments();
    
    const logs = await AuditLog.find();
    const approved = logs.filter(l => l.decision?.eligible).length;
    const approvalRate = totalApplications > 0 ? ((approved / totalApplications) * 100).toFixed(1) : 0;

    const totalLoanAmount = logs.reduce((sum, l) => sum + (l.decision?.loan_amount || 0), 0);
    const avgLoan = totalApplications > 0 ? (totalLoanAmount / totalApplications).toFixed(0) : 0;

    // Advanced: Risk Distribution
    const riskMap = {};
    logs.forEach(log => {
      (log.extractedData?.risk_flags || []).forEach(flag => {
        riskMap[flag] = (riskMap[flag] || 0) + 1;
      });
    });
    
    const riskDistribution = Object.entries(riskMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Advanced: Real-time connections
    const activeConnections = req.io ? req.io.engine.clientsCount : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalApplications,
        approvalRate: `${approvalRate}%`,
        avgLoan: `₹${avgLoan}`,
        activeConnections,
        riskDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Management
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ success: true, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update role' });
  }
});

router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// Transcript Viewer
router.get('/transcript/:sessionId', verifyToken, isAdmin, async (req, res) => {
  try {
    const transcripts = await Transcript.find({ sessionId: req.params.sessionId }).sort({ createdAt: 1 });
    res.json({ success: true, transcripts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

router.delete('/logs/:id', verifyToken, isAdmin, async (req, res) => {
    try {
      await AuditLog.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Log deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete log' });
    }
});

module.exports = router;
