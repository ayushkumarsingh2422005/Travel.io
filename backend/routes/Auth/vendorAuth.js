const express = require('express');
const router = express.Router();
const db = require('../../config/db');
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
    resetPassword,
    generateAadhaarLink,
    // processAadhaarCallback,
    getAadhaarStatus
} = require('../../controller/Auth/vendorAuthController');

// Middleware to verify vendor token
// const verifyToken = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1];
//         // console.log(token)
//         if (!token) {
//             return res.status(401).json({ status: 0, message: 'No token provided' });
//         }

//         // Verify token logic here
//         // For now, just checking if vendor exists with this id
//         const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
//         const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
//         console.log(decoded);
//         const [vendor] = await db.execute('SELECT * FROM vendors WHERE email = ?', [decoded.email]);
//         console.log(vendor);
//         if (vendor.length === 0) {
//             return res.status(401).json({ status: 0, message: 'Invalid token' });
//         }
        
//         req.vendorId = vendor[0].id;
//         next();
//     } catch (error) {
//         console.error('Token verification error:', error);
//         res.status(500).json({ status: 0, message: 'Server error during authentication' });
//     }
// };

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
        // console.log(decoded)
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

// Aadhaar verification routes
router.post('/generate-aadhaar-link', authMiddleware, generateAadhaarLink);
// router.post('/aadhaar-callback', processAadhaarCallback);
router.get('/aadhaar-status', authMiddleware, getAadhaarStatus);

module.exports = router; 