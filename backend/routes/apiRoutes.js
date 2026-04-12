const express = require('express');
const router = express.Router();
const Transcript = require('../models/Transcript');
const AuditLog = require('../models/AuditLog');
const { extractDataWithOllama } = require('../services/llmService');
const { evaluateRisk } = require('../services/riskEngine');

// Store transcript snippet
router.post('/transcript', async (req, res) => {
  try {
    const { sessionId, text, speaker } = req.body;
    const newTranscript = new Transcript({ sessionId, text, speaker });
    await newTranscript.save();
    
    res.status(201).json({ success: true, message: 'Transcript saved.' });
  } catch (err) {
    console.error('Error saving transcript:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Process application via LLM + Risk Engine
router.post('/process-application', async (req, res) => {
  try {
    const { sessionId, age, location } = req.body;

    // 1. Fetch full transcript for the session
    const transcripts = await Transcript.find({ sessionId }).sort({ createdAt: 1 });
    const fullText = transcripts.map(t => `${t.speaker}: ${t.text}`).join('\n');

    if (!fullText) {
      return res.status(400).json({ success: false, error: 'No transcript found for session.' });
    }

    // 2. LLM Extraction using Local Ollama
    const llmOutput = await extractDataWithOllama(fullText);

    // 3. Risk Engine
    const decision = evaluateRisk({ age, location }, llmOutput);

    // 4. Save Audit Log
    const auditLog = new AuditLog({
      sessionId,
      transcriptSnippet: fullText, // Saving full text or snippet for audit
      extractedData: llmOutput,
      ageEstimate: age,
      location,
      decision,
      confidenceScore: llmOutput.confidence_score || 0.9,
    });
    await auditLog.save();

    res.status(200).json({ success: true, decision, llmOutput });
  } catch (error) {
    console.error('Application Processing Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch Audit Logs for Dashboard
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching logs' });
  }
});

module.exports = router;
