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

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalApplications,
        approvalRate: `${approvalRate}%`,
        avgLoan: `₹${avgLoan}`
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

router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// Full Audit Log access (Optional: could add deletion here too)
router.delete('/logs/:id', verifyToken, isAdmin, async (req, res) => {
    try {
      await AuditLog.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Log deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to delete log' });
    }
});

module.exports = router;
