const express = require('express');
const router = express.Router();
const {
    createPaymentOrder,
    verifyPaymentAndCreateBooking,
    getPaymentStatus,
    getUserPaymentHistory,
    handleRazorpayWebhook
} = require('../controller/paymentController');

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

// Webhook endpoint (no auth required)
router.post('/webhook', handleRazorpayWebhook);

// Apply middleware to all other routes
router.use(authMiddleware);

// Payment routes
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPaymentAndCreateBooking);
router.get('/status/:payment_id', getPaymentStatus);
router.get('/history', getUserPaymentHistory);

module.exports = router;
