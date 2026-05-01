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

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Turnstile verification response:', data); // Add this log to help debugging
    return data.success;
  } catch (err) {
    console.error('Error verifying Turnstile:', err);
    return false;
  }
};

module.exports = verifyTurnstile;
