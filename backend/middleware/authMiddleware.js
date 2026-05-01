const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_intellicred';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.isVerified === false) {
      return res.status(403).json({ success: false, error: 'Access denied. Please verify your email.' });
    }
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ success: false, error: 'Invalid token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Access restricted to administrators only.' });
  }
};

module.exports = { verifyToken, isAdmin };
