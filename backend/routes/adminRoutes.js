const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Transcript = require('../models/Transcript');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { generateForensicReport } = require('../services/reportService');
const { executePayout } = require('../services/payoutService');

// Dashboard Statistics
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApplications = await AuditLog.countDocuments();
    
    const logs = await AuditLog.find();

    // ── Approval metrics (use explicit status for consistency)
    const approvedLogs = logs.filter(l => l.decision?.status === 'approved');
    const approved = approvedLogs.length;
    const approvalRate = totalApplications > 0 ? ((approved / totalApplications) * 100).toFixed(1) : 0;

    // ── Financial aggregation
    const totalDisbursed = approvedLogs.reduce((sum, l) => sum + (l.decision?.loan_amount || 0), 0);
    const avgLoan = approved > 0 ? (totalDisbursed / approved).toFixed(0) : 0;

    // ── Delinquency tracking
    const defaultCount = logs.filter(l => l.repaymentStatus === 'defaulted').length;
    const defaultRate = approved > 0 ? ((defaultCount / approved) * 100).toFixed(1) : 0;

    // ── Build a list of default customers for the admin
    const defaultAccounts = logs
      .filter(l => l.repaymentStatus === 'defaulted')
      .map(l => ({
        sessionId: l.sessionId,
        loanAmount: l.decision?.loan_amount || 0,
        nextDueDate: l.nextDueDate,
        lastPaymentDate: l.lastPaymentDate,
        location: l.location
      }));

    // ── Risk Distribution
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

    // ── Geo Clusters
    const regions = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
    const geoClusters = regions.map(region => ({
       region,
       riskLevel: Math.floor(Math.random() * 40) + 10
    }));

    const activeConnections = req.io ? req.io.engine.clientsCount : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalApplications,
        approvalRate: `${approvalRate}%`,
        avgLoan: `₹${Number(avgLoan).toLocaleString('en-IN')}`,
        totalDisbursed: `₹${totalDisbursed.toLocaleString('en-IN')}`,
        defaultCount,
        defaultRate: `${defaultRate}%`,
        defaultAccounts,
        activeConnections,
        riskDistribution,
        geoClusters
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

router.patch('/logs/:id/decision', verifyToken, isAdmin, async (req, res) => {
    try {
      const { status, eligible } = req.body;
      const log = await AuditLog.findById(req.params.id);
      if (!log) return res.status(404).json({ success: false, error: 'Log not found' });
      
      const prevStatus = log.decision?.status;

      // Update decision
      log.decision = { 
        ...log.decision, 
        status: status || log.decision.status,
        eligible: eligible !== undefined ? eligible : log.decision.eligible
      };
      
      // TRIGGER PAYOUT if status changed to approved
      if (status === 'approved' && prevStatus !== 'approved') {
         console.log('ADMIN APPROVED: Disbursing funds...');
         const payoutResult = await executePayout({
            amount: log.decision.loan_amount,
            name: log.email || 'Customer',
            sessionId: log.sessionId
         });
         log.payoutData = payoutResult;
      }

      await log.save();
      res.json({ success: true, message: 'Loan status updated by admin', log });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update decision' });
    }
});

// Download Forensic PDF Report
router.get('/logs/:id/report', verifyToken, isAdmin, async (req, res) => {
  try {
     const log = await AuditLog.findById(req.params.id);
     const transcripts = await Transcript.find({ sessionId: log.sessionId }).sort({ createdAt: 1 });
     const transcriptText = transcripts.map(t => `[${t.speaker}] ${t.text}`).join('\n');

     const pdfPath = await generateForensicReport(log, transcriptText, log.decision?.trustProfile || {});
     res.download(pdfPath);
  } catch (error) {
     res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

module.exports = router;
