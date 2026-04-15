const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
require('dotenv').config();

// Helper for delay/backoff
const wait = (ms) => new Promise(res => setTimeout(res, ms));

// Gemini Key Rotator
const geminiKeys = (process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
let currentGeminiIndex = 0;

const getGeminiClient = () => {
  if (geminiKeys.length === 0) return null;
  return new GoogleGenerativeAI(geminiKeys[currentGeminiIndex]);
};

const rotateGeminiKey = () => {
  if (geminiKeys.length > 1) {
    currentGeminiIndex = (currentGeminiIndex + 1) % geminiKeys.length;
    console.log(`Switched to Gemini Key #${currentGeminiIndex + 1}`);
  }
};

// Groq Key Rotator 
const getKeys = () => {
  const keys = (process.env.GROQ_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
  Object.keys(process.env).forEach(key => {
    if (key.startsWith("GROQ_KEY_")) keys.push(process.env[key].trim());
  });
  return [...new Set(keys)];
};

const groqKeys = getKeys();
let currentGroqKeyIndex = 0;

const getGroqClient = () => {
  if (groqKeys.length === 0) return null;
  return new Groq({ apiKey: groqKeys[currentGroqKeyIndex] });
};

const rotateGroqKey = () => {
  if (groqKeys.length > 1) {
    currentGroqKeyIndex = (currentGroqKeyIndex + 1) % groqKeys.length;
    console.log(`Switched to Groq Key #${currentGroqKeyIndex + 1}`);
  }
};

const SYSTEM_PROMPT = `Extract JSON from loan transcript: 
{"income":int,"employment":str,"loan_purpose":str,"declared_age":int,"verbal_consent":bool,"risk_flags":[str],"confidence_score":float}. 
Look for "agree"/"consent" for verbal_consent. Output JSON ONLY.`;

const callGroq = async (transcript, retryCount = 0) => {
  const client = getGroqClient();
  if (!client) throw new Error("Groq Keys missing");
  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Data: ${transcript}` }
      ],
      model: "llama-3.1-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 1000
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    if (error.status === 429 && retryCount < groqKeys.length) {
      console.warn(`Groq Rate Limit hit. Waiting 2s...`);
      await wait(2000);
      rotateGroqKey();
      return callGroq(transcript, retryCount + 1);
    }
    if (retryCount >= groqKeys.length) {
      throw new Error('All Groq API keys have hit their rate limits.');
    }
    throw error;
  }
};

const callGemini = async (transcript, retryCount = 0) => {
  const genAI = getGeminiClient();
  if (!genAI) throw new Error("Gemini Key missing");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: { 
      responseMimeType: "application/json",
      temperature: 0,
      maxOutputTokens: 1000
    }
  });
  try {
    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nData:\n${transcript}`);
    return JSON.parse(result.response.text());
  } catch (error) {
    if ((error.message?.includes('429') || error.message?.includes('Quota')) && retryCount < geminiKeys.length) {
      console.warn(`Gemini Rate Limit hit. Waiting 2s...`);
      await wait(2000);
      rotateGeminiKey();
      return callGemini(transcript, retryCount + 1);
    }
    if (retryCount >= geminiKeys.length) {
      throw new Error('All Gemini API keys have hit their rate limits.');
    }
    throw error;
  }
};

const extractLoanData = async (transcriptText) => {
  const providers = [{ name: 'Groq', fn: callGroq }]; 
  let lastError = null;
  for (const provider of providers) {
    try {
      const result = await provider.fn(transcriptText);
      return { ...result, provider: provider.name };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`AI Extraction failed: ${lastError.message}`);
};

module.exports = { extractLoanData };
