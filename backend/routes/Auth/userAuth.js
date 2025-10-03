const express = require('express');
const router = express.Router();
const { 
    signup, 
    login, 
    google, 
    verifytoken,
    addPhoneNumber,
    sendPhoneVerificationOTP,
    verifyPhoneOTP,
    forgotPassword,
    resetPassword
} = require('../../controller/Auth/userAuthController');
const authMiddleware = require('../../middleware/authMiddleware');

// Public routes (no authentication required)
// Email/Password Signup
router.post('/signup', signup);

// Email/Password Login
router.post('/login', login);

// Google Sign-In/Up
router.post('/google', google);

// Token verification
router.get('/verifytoken', verifytoken);

// Password reset request
router.post('/forgot-password', forgotPassword);

// Password reset with token
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
// Add/update phone number and send OTP
router.post('/add-phone', authMiddleware, addPhoneNumber);

// Send phone verification OTP (for existing phone numbers)
router.post('/send-phone-otp', authMiddleware, sendPhoneVerificationOTP);

// Verify phone OTP
router.post('/verify-phone-otp', authMiddleware, verifyPhoneOTP);

module.exports = router; 