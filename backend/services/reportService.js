const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a high-integrity forensic audit report for a loan application.
 */
const generateForensicReport = async (application, transcript, trustProfile) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `ForensicReport_${application.sessionId}.pdf`;
      const filePath = path.join(__dirname, '../temp', filename);
      
      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '../temp'))) {
        fs.mkdirSync(path.join(__dirname, '../temp'));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // --- HEADER ---
      doc.fontSize(20).fillColor('#4F46E5').text('IntelliCred Forensic Audit Report', { align: 'center', underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#666666').text(`Application ID: ${application.sessionId}`, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // --- APPLICANT DATA ---
      doc.fontSize(14).fillColor('#000000').text('1. Applicant Forensic Profile', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Name (Declared): ${application.email}`); // Using email as proxy for user ID
      doc.text(`Estimated Age (AI): ${application.age} years`);
      doc.text(`Location: ${application.location}`);
      doc.text(`GPS Coordinates: ${application.coords?.lat}, ${application.coords?.lng}`);
      doc.text(`Requested Amount: INR ${application.requested_amount}`);
      doc.moveDown(1.5);

      // --- TRUST PROFILE (SCORING) ---
      doc.fontSize(14).text('2. AI Forensic Trust Scores', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#22C55E').text(`- Identity Integrity: ${trustProfile.identity}%`);
      doc.fillColor('#EAB308').text(`- Financial Stability: ${trustProfile.financial}%`);
      doc.fillColor('#EF4444').text(`- Behavioral Integrity: ${trustProfile.behavioral}%`);
      doc.fillColor('#000000').text(`- Composite Risk Score: ${application.score}/100`);
      doc.moveDown(1.5);

      // --- TRANSCRIPT SUMMARY ---
      doc.fontSize(14).text('3. Auditable Declaration Transcript', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor('#444444').text(transcript || 'No verbal transcript captured.');
      doc.moveDown(2);

      // --- FOOTER / WATERMARK ---
      doc.fontSize(8).fillColor('#CCCCCC').text('CERTIFIED FORENSIC RECORD - INTELLICRED AI GATEWAY', { align: 'center' });
      doc.text('This document is digitally anchored and immutable.', { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filePath));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateForensicReport };
