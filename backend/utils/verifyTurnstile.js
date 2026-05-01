const axios = require('axios');

const verifyTurnstile = async (token) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not configured in backend .env');
    return false; // Fail verification if secret key is missing
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Turnstile verification response:', response.data); // Add this log to help debugging
    return response.data.success;
  } catch (err) {
    console.error('Error verifying Turnstile:', err.message);
    return false;
  }
};

module.exports = verifyTurnstile;
