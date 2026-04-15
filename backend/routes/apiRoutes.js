const express = require('express');
const router = express.Router();
const Transcript = require('../models/Transcript');
const AuditLog = require('../models/AuditLog');
const Session = require('../models/Session');
const { extractLoanData } = require('../services/llmService');
const { evaluateRisk } = require('../services/riskEngine');
const { getBureauReport } = require('../services/bureauService');
const { verifyIDDocument } = require('../services/docVerificationService');

// Verify ID Document via AI
router.post('/verify-document', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) return res.status(400).json({ success: false, error: 'Document image required' });

    const verificationResult = await verifyIDDocument(image, mimeType);
    res.status(200).json({ success: true, ...verificationResult });
  } catch (error) {
    console.error('Doc Verification Route Error:', error.message);
    res.status(500).json({ success: false, error: 'AI Verification Failed' });
  }
});

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

// Process application via LLM + Bureau + Risk Engine
router.post('/process-application', async (req, res) => {
  try {
    const { 
      sessionId, age, location, email, coords, 
      requested_amount, doc_ver_status, id_image,
      blink_count, stress_level, voice_hash 
    } = req.body;

    // 1. Fetch full transcript for the session
    const transcripts = await Transcript.find({ sessionId }).sort({ createdAt: 1 });
    const fullText = transcripts.map(t => `${t.speaker}: ${t.text}`).join('\n');

    if (!fullText) {
      return res.status(400).json({ success: false, error: 'No transcript captured. Please speak more during the session.' });
    }

    // 2. Mock Bureau Fetch
    const bureauData = await getBureauReport(email || 'default@intellicred.com');

    // 3. LLM Extraction using multi-API fallback
    const llmOutput = await extractLoanData(fullText);
    llmOutput.risk_flags = llmOutput.risk_flags || [];
    if (stress_level === 'HIGH') llmOutput.risk_flags.push('High Stress Signature');
    if (blink_count < 3) llmOutput.risk_flags.push('Low Liveness Confidence (Blinks < 3)');

    // 4. Risk Engine (Advanced)
    const decision = evaluateRisk({ 
      age, 
      location: coords, 
      requestedAmount: requested_amount, 
      docVerificationStatus: doc_ver_status 
    }, llmOutput, bureauData);

    // 5. Save Audit Log
    const auditLog = new AuditLog({
      sessionId,
      transcriptSnippet: fullText,
      extractedData: llmOutput,
      bureauData,
      requestedAmount: requested_amount,
      docVerificationStatus: doc_ver_status,
      idDocumentImage: id_image,
      ageEstimate: age,
      location: location || 'Remote',
      geoCoordinates: coords,
      decision,
      blinkCount: blink_count,
      stressLevel: stress_level,
      voiceHash: voice_hash,
      confidenceScore: llmOutput.confidence_score || 0.9,
    });
    await auditLog.save();

    // 6. Update Persistent Session Status
    await Session.findOneAndUpdate(
      { sessionId },
      { $set: { status: 'completed', currentStep: 'FINAL_DECISION' } }
    );

    res.status(200).json({ success: true, decision, llmOutput, bureauData });
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
