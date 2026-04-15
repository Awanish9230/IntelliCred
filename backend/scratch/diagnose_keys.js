const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); 

async function testGemini() {
  console.log("\n--- Testing Gemini ---");
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes("your_")) {
    console.error("❌ Gemini API Key is missing or invalid in .env");
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say 'Gemini 2.0 is OK'");
    console.log("✅ Gemini Success:", result.response.text().trim());
  } catch (err) {
    console.error("❌ Gemini Failed:", err.message);
  }
}

async function testGroq() {
  console.log("\n--- Testing Groq ---");
  const keys = (process.env.GROQ_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
  
  if (keys.length === 0 || keys[0].includes("key_")) {
    console.error("❌ No Groq keys found in .env");
    return;
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const groq = new Groq({ apiKey: key });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: "Say 'Groq is OK'" }],
        model: "llama-3.1-8b-instant",
      });
      console.log(`✅ Groq Key #${i+1} Success:`, completion.choices[0].message.content.trim());
    } catch (err) {
      console.error(`❌ Groq Key #${i+1} Failed:`, err.message);
    }
  }
}

async function runDiagnostics() {
  console.log("🚀 Starting AI Key Diagnostics...");
  await testGemini();
  await testGroq();
  console.log("\n🏁 Diagnostics Complete.");
}

runDiagnostics();
