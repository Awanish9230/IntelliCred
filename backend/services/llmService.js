const axios = require('axios');

/**
 * Sends combined transcript to standard local Ollama endpoint
 * Assumes Ollama is running on localhost:11434 with a model like 'llama3' or 'mistral'
 */
const extractDataWithOllama = async (transcriptText, model = 'llama3') => {
  const prompt = `
    You are an intelligent data extraction assistant for a loan application system.
    Read the following transcript between an agent and a customer.
    Extract the following information:
    1. income (as a number)
    2. employment (string)
    3. loan_purpose (string)
    4. risk_flags (list of strings representing negative sentiments or risks mentioned)
    
    Output strictly in valid JSON format only, matching this structure:
    {
      "income": number,
      "employment": "string",
      "loan_purpose": "string",
      "risk_flags": ["string"],
      "confidence_score": 0.0 to 1.0
    }
    
    Do not output any markdown formatting, only the JSON block.

    Transcript:
    """
    ${transcriptText}
    """
  `;

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: model,
      prompt: prompt,
      stream: false,
      format: 'json' // Supported by newer ollama versions to enforce json
    });

    const outputText = response.data.response;
    return JSON.parse(outputText);
  } catch (error) {
    console.error('Error with Ollama LLM extraction:', error.message);
    throw new Error('LLM processing failed');
  }
};

module.exports = {
  extractDataWithOllama
};
