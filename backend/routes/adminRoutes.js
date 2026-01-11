const express = require('express');
const router = express.Router();
const {
    getAdminDashboard,
    getPendingVendorPayments,
    getPendingPartnerPayments,
    payVendor,
    payPartner,
    getAllPayments,
    getFinancialAnalytics,
    // Vendor Management
    getAllVendors,
    getVendorDetails,
    toggleVendorStatus,
    applyVendorPenalty,
    suspendVendor,
    getVendorBookings,
    // Driver Management
    getAllDrivers,
    toggleDriverStatus,
    // User/Client Management
    getAllUsers,
    getUserDetails,
    updateUserData,
    deleteUser,
    // Statistics
    getAnnualBookingsStats,
    getWebsiteReachStats,
    getAdminStats
} = require('../controller/adminController');
const {
    addCabCategory,
    updateCabCategory,
    deleteCabCategory,
    getCabCategories,
    getCabCategory
} = require('../controller/cabCategoryController');

// Middleware to protect routes (admin only)
const upload = require('../middleware/uploadMiddleware'); // Import Upload Middleware

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

// Cab Categories CRUD routes (ADMIN) - Matching Frontend Structure
// Frontend calls: /api/admin/cab-category/all, /add, /update/:id, /delete/:id
router.post('/cab-category/add', upload.single('image'), addCabCategory);
router.get('/cab-category/all', getCabCategories);
router.get('/cab-category/:id', getCabCategory);
router.put('/cab-category/:id', upload.single('image'), updateCabCategory); // Note: Frontend might use /update/:id, checking needed but standard REST is better
router.delete('/cab-category/:id', deleteCabCategory);

// Add-Ons Routes
const { addAddOn, getAddOns } = require('../controller/addOnController');
router.post('/add-ons/add', addAddOn);
router.get('/add-ons/all', getAddOns);
// router.delete('/add-ons/:id', deleteAddOn); // If implemented

// Penalty Routes
const { addPenalty, getPenalties } = require('../controller/penaltyController');
router.post('/penalties/add', addPenalty);
router.get('/penalties/all', getPenalties);

// ==================== VENDOR MANAGEMENT ====================
// Get all vendors with filtering and pagination
router.get('/vendors', getAllVendors);
// Get vendor details with bookings, vehicles, and drivers
router.get('/vendors/:vendorId', getVendorDetails);
// Activate/deactivate vendor
router.put('/vendors/:vendorId/status', toggleVendorStatus);
// Apply penalty to vendor
router.post('/vendors/:vendorId/penalty', applyVendorPenalty);
// Suspend/unsuspend vendor
router.put('/vendors/:vendorId/suspend', suspendVendor);
// Get vendor bookings
router.get('/vendors/:vendorId/bookings', getVendorBookings);

// ==================== DRIVER MANAGEMENT ====================
// Get all drivers with filtering and pagination
router.get('/drivers', getAllDrivers);
// Activate/deactivate driver
router.put('/drivers/:driverId/status', toggleDriverStatus);

// ==================== USER/CLIENT MANAGEMENT ====================
// Get all users/clients with filtering and pagination
router.get('/users', getAllUsers);
// Get user details with bookings
router.get('/users/:userId', getUserDetails);
// Update user data (admin)
router.put('/users/:userId', updateUserData);
// Delete user (admin)
router.delete('/users/:userId', deleteUser);

// ==================== STATISTICS & ANALYTICS ====================
// Get annual bookings statistics
router.get('/stats/annual-bookings', getAnnualBookingsStats);
// Get website reach and leads statistics
router.get('/stats/website-reach', getWebsiteReachStats);
// Get comprehensive admin statistics
router.get('/stats', getAdminStats);

module.exports = router;
