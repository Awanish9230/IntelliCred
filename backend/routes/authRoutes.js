const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const captchaVerify = require('../middleware/captchaVerify');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_intellicred';

// Signup
router.post('/signup', captchaVerify, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'User already exists' });

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const role = email.includes('admin') ? 'admin' : 'customer';
    const user = new User({ 
      name, 
      email, 
      password, 
      role,
      verificationToken: hashedVerificationToken
    });
    
    await user.save();

    // Create Verification URL
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${verificationToken}`;
    
    const message = `
      <h1>Email Verification</h1>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message
      });
      res.status(201).json({ success: true, message: 'Verification email sent. Please check your inbox.' });
    } catch (error) {
      user.verificationToken = undefined;
      await user.save();
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify Email
router.get('/verify/:token', async (req, res) => {
  try {
    // Get hashed token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ verificationToken: hashedToken });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resend Verification Email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'User is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${verificationToken}`;
    
    const message = `
      <h1>Email Verification</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - Resend',
        message
      });
      res.status(200).json({ success: true, message: 'Verification email resent' });
    } catch (error) {
      user.verificationToken = undefined;
      await user.save();
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
router.post('/login', captchaVerify, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ success: false, error: 'Please verify your email before accessing features', isVerified: false });
    }

    const token = jwt.sign({ id: user._id, role: user.role, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', captchaVerify, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password. Please make a request to: \n\n <a href="${resetUrl}">${resetUrl}</a></p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
