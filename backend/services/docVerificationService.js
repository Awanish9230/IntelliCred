const Tesseract = require('tesseract.js');
require('dotenv').config();

/**
 * Free Document Verification Service using Tesseract.js
 * Focus: OCR extraction only. Fraud detection is deferred to Admin manual review.
 */
const verifyIDDocument = async (base64Image, mimeType) => {
  console.log("🚀 Starting Free OCR Verification (Tesseract.js)...");

  try {
    // Strip data prefix if present for Tesseract
    const imageBuffer = Buffer.from(base64Image.split(',')[1] || base64Image, 'base64');

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
      // logger: m => console.log(m.status, m.progress)
    });

    console.log("✅ OCR Complete. Raw Text Length:", text.length);

    // Simple Extraction Logic (Regex based)
    // IDs vary broadly, so we'll look for common patterns
    const nameMatch = text.match(/(?:Name|Name:|Full Name|Mame)\s*[:\-]?\s*([A-Z\s]{3,30})/i);
    const idMatch = text.match(/(?:ID|ID No|Aadhar|PAN|Enrollment)\s*[:\-]?\s*([A-Z0-9\s/\\\-]{5,20})/i);

    const extracted = {
      full_name: nameMatch ? nameMatch[1].trim() : "Unknown (See Image)",
      id_number: idMatch ? idMatch[1].trim() : "Unknown (See Image)",
      dob: "Extracted Manually",
      type: text.toLowerCase().includes('aadhar') ? 'AADHAR' : 
            text.toLowerCase().includes('pan') ? 'PAN' : 
            text.toLowerCase().includes('college') ? 'STUDENT_ID' : 'INSTITUTIONAL_ID'
    };

    return {
      ocr_data: extracted,
      fraud_analysis: {
        is_suspicious: false,
        reason: "Manual Admin Review Required",
        confidence: 1.0,
        signals: ["FREE_OCR_MODE"]
      },
      verification_status: "SUCCESS" // Always success for OCR; Admin verifies fraud manually
    };

  } catch (error) {
    console.error('Tesseract OCR Error:', error.message);
    
    // Fallback if OCR fails completely (bad image)
    return {
      ocr_data: { full_name: "Manual Entry Required", id_number: "N/A", dob: "N/A", type: "UNKNOWN" },
      fraud_analysis: { is_suspicious: true, reason: "OCR Failed to read text. Please check image quality.", confidence: 0, signals: ["OCR_FAILED"] },
      verification_status: "REPROCESS"
    };
  }
};

module.exports = { verifyIDDocument };
