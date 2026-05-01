const verifyTurnstile = async (token) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY is not configured in backend .env');
    return true; // Bypass verification if secret key is missing (for local dev fallback)
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.success;
  } catch (err) {
    console.error('Error verifying Turnstile:', err);
    return false;
  }
};

module.exports = verifyTurnstile;
