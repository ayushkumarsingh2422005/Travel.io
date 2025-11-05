const express = require('express');
const router = express.Router();
const { 
    getAdminDashboard,
    getPendingVendorPayments,
    getPendingPartnerPayments,
    payVendor,
    payPartner,
    getAllPayments,
    getFinancialAnalytics
} = require('../controller/adminController');
const { 
    addCabCategory, 
    updateCabCategory,
    deleteCabCategory,
    getCabCategories,
    getCabCategory
} = require('../controller/cabCategoryController');

// Middleware to protect routes (admin only)
const adminAuthMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
        
        // Check if user is admin (you can add admin role check here)
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Apply middleware to all routes
router.use(adminAuthMiddleware);

// Admin dashboard and analytics routes
router.get('/dashboard', getAdminDashboard);
router.get('/financial-analytics', getFinancialAnalytics);

// Payment management routes
router.get('/pending-vendor-payments', getPendingVendorPayments);
router.get('/pending-partner-payments', getPendingPartnerPayments);
router.get('/all-payments', getAllPayments);

// Payment processing routes
router.post('/pay-vendor', payVendor);
router.post('/pay-partner', payPartner);

// Cab Categories CRUD routes (ADMIN)
router.post('/cab-categories', addCabCategory);
router.get('/cab-categories', getCabCategories);
router.get('/cab-categories/:id', getCabCategory);
router.put('/cab-categories/:id', updateCabCategory);
router.delete('/cab-categories/:id', deleteCabCategory);

module.exports = router;
