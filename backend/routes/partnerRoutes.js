const express = require('express');
const router = express.Router();
const { 
    getPartnerProfile,
    updatePartnerProfile,
    getPartnerDashboard,
    getPartnerCommissionHistory,
    getPartnerEarnings,
    getPartnerReferralStats
} = require('../controller/partnerController');

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

// Apply middleware to all routes
router.use(authMiddleware);

// Partner profile routes
router.get('/profile', getPartnerProfile);
router.put('/profile', updatePartnerProfile);

// Partner dashboard and analytics routes
router.get('/dashboard', getPartnerDashboard);
router.get('/commission-history', getPartnerCommissionHistory);
router.get('/earnings', getPartnerEarnings);
router.get('/referral-stats', getPartnerReferralStats);

module.exports = router;
