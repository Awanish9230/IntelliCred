const verifyTurnstile = require('../utils/verifyTurnstile');

const captchaVerify = async (req, res, next) => {
  const turnstileToken = req.body.turnstileToken;

  if (!turnstileToken) {
    return res.status(400).json({ success: false, error: 'Captcha verification failed. Token missing.' });
  }

  try {
    const isValid = await verifyTurnstile(turnstileToken);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Captcha verification failed. Invalid or expired token.' });
    }
    next();
  } catch (err) {
    console.error('Captcha middleware error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during Captcha verification.' });
  }
};

module.exports = captchaVerify;
