const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');

// Public routes
router.post('/signup', validationRules.signup, validate, signup);
router.post('/verify-otp', validationRules.verifyOTP, validate, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', validationRules.login, validate, login);
router.post('/forgot-password', validationRules.email, validate, forgotPassword);
router.post('/reset-password', validationRules.resetPassword, validate, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
