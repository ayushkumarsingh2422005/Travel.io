const express = require('express');
const router = express.Router();
const { 
    getVendorProfile, 
    updateVendorProfile, 
    updateVendorPassword,
    uploadVendorProfilePic,
    deleteVendorAccount,
    getVendorDashboard,
    getVendorOngoingBookings,
    getVendorCompletedRides,
    getVendorEarnings,
    getPendingBookingRequests,
    acceptBookingRequest
} = require('../controller/vendorController');

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

// Vendor profile routes
router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);
router.put('/password', updateVendorPassword);
router.put('/profile-pic', uploadVendorProfilePic);
router.delete('/account', deleteVendorAccount);

// Vendor dashboard and analytics routes
router.get('/dashboard', getVendorDashboard);
router.get('/ongoing-bookings', getVendorOngoingBookings);
router.get('/completed-rides', getVendorCompletedRides);
router.get('/earnings', getVendorEarnings);

// Booking request routes
router.get('/pending-requests', getPendingBookingRequests);
router.post('/accept-booking', acceptBookingRequest);

module.exports = router;
