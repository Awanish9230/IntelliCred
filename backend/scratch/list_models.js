const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function listGeminiModels() {
  console.log("🚀 Listing Available Gemini Models...");
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("❌ Gemini API Key is missing in .env");
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(key);
    // Use the older method to list models to see what's available
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("✅ Models found:");
      data.models.forEach(m => {
        console.log(` - ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.error("❌ No models found in response:", data);
    }
  } catch (err) {
    console.error("❌ Failed to list models:", err.message);
  }
}

listGeminiModels();
