const express = require('express');
const router = express.Router();
const { 
    signup, 
    login, 
    google, 
    verifytoken, 
    verifyEmail, 
    resendVerificationEmail, 
    sendPhoneVerificationOTP, 
    verifyPhoneOTP, 
    forgotPassword, 
    resetPassword 
} = require('../../controller/Auth/vendorAuthController');

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Email/Password Signup
router.post('/signup', signup);

// Email/Password Login
router.post('/login', login);

// Google Sign-In/Up
router.post('/google', google);

// Token verification endpoint
router.get('/verifytoken', verifytoken);

// Email verification
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Phone verification (protected routes)
router.post('/send-phone-otp', authMiddleware, sendPhoneVerificationOTP);
router.post('/verify-phone-otp', authMiddleware, verifyPhoneOTP);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router; 