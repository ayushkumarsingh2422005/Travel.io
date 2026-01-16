const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getVendorBookings,
    getBookingDetails,
    updateBookingStatus,
    cancelUserBooking,
    getDriverBookings,
    updateBookingStatusByDriver,
    verifyOtpAndStartTrip,
    getPublicBookingDetails,
    completeTripPublic
} = require('../controller/bookingController');

// Public Driver Routes (No Auth Required - Link Based)
router.post('/driver/verify-otp', verifyOtpAndStartTrip);
router.post('/driver/complete-trip', completeTripPublic);
router.get('/public/:bookingId', getPublicBookingDetails);

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

// User booking routes
router.post('/user/create', createBooking);
router.get('/user/my-bookings', getUserBookings);
router.get('/user/booking/:bookingId', getBookingDetails);
router.put('/user/booking/:bookingId/cancel', cancelUserBooking);

// Vendor booking routes
router.get('/vendor/my-bookings', getVendorBookings);
router.get('/vendor/booking/:bookingId', getBookingDetails);
router.put('/vendor/booking/:bookingId/status', updateBookingStatus);

// Driver booking routes
router.get('/driver/my-bookings', getDriverBookings);
router.get('/driver/booking/:bookingId', getBookingDetails);
router.put('/driver/booking/:bookingId/status', updateBookingStatusByDriver);

module.exports = router;
