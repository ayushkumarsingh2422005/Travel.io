const db = require('../config/db');
const crypto = require('crypto');
const { assignDriverToBooking, moveCompletedBooking, cancelBooking } = require('../utils/BookingTransaction');

// Generate unique booking ID
const generateBookingId = () => {
    return crypto.createHash('sha256').update(Date.now().toString() + Math.random().toString()).digest('hex');
};

// Create a new booking (DEPRECATED - Use payment flow instead)
const createBooking = async (req, res) => {
    res.status(400).json({
        success: false,
        message: 'Direct booking creation is not allowed. Please use the payment flow: POST /payment/create-order followed by POST /payment/verify'
    });
};

// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT 
                b.*,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                v.image as vehicle_image,
                v.no_of_seats,
                ven.name as vendor_name,
                ven.phone as vendor_phone,
                d.name as driver_name,
                d.phone as driver_phone,
                p.name as partner_name,
                cc.segment as cab_category_name,
                cc.price_per_km as cab_category_price_per_km,
                cc.category_image as cab_category_image
            FROM bookings b
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN vendors ven ON b.vendor_id = ven.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN users p ON b.partner_id = p.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.customer_id = ?
        `;

        const params = [userId];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [bookings] = await db.execute(query, params);

        // Count total bookings for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM bookings WHERE customer_id = ?';
        const countParams = [userId];
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Bookings retrieved successfully',
            data: {
                bookings,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting user bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bookings',
            error: error.message
        });
    }
};

// Get vendor's bookings
const getVendorBookings = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT 
                b.*,
                u.name as customer_name,
                u.phone as customer_phone,
                u.email as customer_email,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                v.image as vehicle_image,
                d.name as driver_name,
                d.phone as driver_phone,
                p.name as partner_name,
                cc.segment as cab_category_name,
                cc.price_per_km as cab_category_price_per_km,
                cc.category_image as cab_category_image
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN users p ON b.partner_id = p.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.vendor_id = ?
        `;

        const params = [vendorId];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [bookings] = await db.execute(query, params);

        // Count total bookings for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM bookings WHERE vendor_id = ?';
        const countParams = [vendorId];
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Vendor bookings retrieved successfully',
            data: {
                bookings,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting vendor bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vendor bookings',
            error: error.message
        });
    }
};

// Get single booking details
const getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        const userType = req.user.type; // 'user' or 'vendor'

        let query = `
            SELECT 
                b.*,
                u.name as customer_name,
                u.phone as customer_phone,
                u.email as customer_email,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                v.image as vehicle_image,
                v.no_of_seats,
                v.per_km_charge,
                ven.name as vendor_name,
                ven.phone as vendor_phone,
                ven.email as vendor_email,
                d.name as driver_name,
                d.phone as driver_phone,
                p.name as partner_name,
                cc.segment as cab_category_name,
                cc.price_per_km as cab_category_price_per_km,
                cc.category_image as cab_category_image
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN vendors ven ON b.vendor_id = ven.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN users p ON b.partner_id = p.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.id = ?
        `;

        const params = [bookingId];

        // Add authorization check
        if (userType === 'user') {
            query += ' AND b.customer_id = ?';
            params.push(userId);
        } else if (userType === 'vendor') {
            query += ' AND b.vendor_id = ?';
            params.push(userId);
        }

        const [bookings] = await db.execute(query, params);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or access denied'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking details retrieved successfully',
            data: bookings[0]
        });

    } catch (error) {
        console.error('Error getting booking details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get booking details',
            error: error.message
        });
    }
};

// Update booking status (vendor only)
const updateBookingStatus = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;
        const { status, driver_id } = req.body;

        // Validate status
        const validStatuses = ['waiting', 'approved', 'preongoing', 'ongoing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
            });
        }

        // Check if booking exists and belongs to vendor
        const [bookings] = await db.execute(`
            SELECT * FROM bookings 
            WHERE id = ? AND vendor_id = ?
        `, [bookingId, vendorId]);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or access denied'
            });
        }

        const booking = bookings[0];

        // Check if driver is provided for approved status
        if (status === 'approved' && !driver_id) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required when approving booking'
            });
        }

        // If driver is provided, verify driver belongs to vendor
        if (driver_id) {
            const [drivers] = await db.execute(`
                SELECT * FROM drivers 
                WHERE id = ? AND vendor_id = ? AND is_active = 1
            `, [driver_id, vendorId]);

            if (drivers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Driver not found or not available'
                });
            }
        }

        // Update booking
        const updateFields = ['status = ?'];
        const updateValues = [status];

        if (driver_id) {
            updateFields.push('driver_id = ?');
            updateValues.push(driver_id);
        }

        updateValues.push(bookingId);

        await db.execute(`
            UPDATE bookings 
            SET ${updateFields.join(', ')} 
            WHERE id = ?
        `, updateValues);

        // If status is completed or cancelled, move to prevbookings (handled by trigger)
        if (status === 'completed' || status === 'cancelled') {
            if (status === 'completed') {
                await moveCompletedBooking(bookingId);
            } else {
                await cancelBooking(bookingId);
            }
        }

        // Get updated booking
        const [updatedBookings] = await db.execute(`
            SELECT 
                b.*,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                d.name as driver_name,
                d.phone as driver_phone,
                cc.segment as cab_category_name,
                cc.price_per_km as cab_category_price_per_km
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.id = ?
        `, [bookingId]);

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: updatedBookings[0]
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status',
            error: error.message
        });
    }
};

// Cancel booking (user only)
const cancelUserBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;

        // Check if booking exists and belongs to user
        const [bookings] = await db.execute(`
            SELECT * FROM bookings 
            WHERE id = ? AND customer_id = ? AND status IN ('waiting', 'approved')
        `, [bookingId, userId]);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or cannot be cancelled'
            });
        }

        // Update booking status to cancelled
        await db.execute(`
            UPDATE bookings 
            SET status = 'cancelled' 
            WHERE id = ?
        `, [bookingId]);

        // Move to prevbookings (handled by trigger)
        await cancelBooking(bookingId);

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
};

// Get driver's bookings
const getDriverBookings = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT 
                b.*,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                v.image as vehicle_image,
                ven.name as vendor_name,
                ven.phone as vendor_phone,
                cc.segment as cab_category_name,
                cc.price_per_km as cab_category_price_per_km,
                cc.category_image as cab_category_image
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN vendors ven ON b.vendor_id = ven.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.driver_id = ?
        `;

        const params = [driverId];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [bookings] = await db.execute(query, params);

        // Count total bookings for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM bookings WHERE driver_id = ?';
        const countParams = [driverId];
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Driver bookings retrieved successfully',
            data: {
                bookings,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting driver bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get driver bookings',
            error: error.message
        });
    }
};

// Update booking status by driver
const updateBookingStatusByDriver = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { bookingId } = req.params;
        const { status } = req.body;

        // Validate status - drivers can only update to specific statuses
        const validDriverStatuses = ['preongoing', 'ongoing', 'completed'];
        if (!validDriverStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Drivers can only update to: ' + validDriverStatuses.join(', ')
            });
        }

        // Check if booking exists and is assigned to driver
        const [bookings] = await db.execute(`
            SELECT * FROM bookings 
            WHERE id = ? AND driver_id = ?
        `, [bookingId, driverId]);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or not assigned to you'
            });
        }

        const booking = bookings[0];

        // Validate status transition
        const validTransitions = {
            'approved': ['preongoing'],
            'preongoing': ['ongoing'],
            'ongoing': ['completed']
        };

        if (!validTransitions[booking.status] || !validTransitions[booking.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${booking.status} to ${status}`
            });
        }

        let updateQuery = `UPDATE bookings SET status = ?`;
        let updateParams = [status];

        // OTP Verification for starting trip (preongoing -> ongoing)
        if (status === 'ongoing') {
            const { otp } = req.body;
            if (!otp) {
                return res.status(400).json({ success: false, message: 'OTP is required to start the trip' });
            }
            if (otp !== booking.booking_otp) {
                return res.status(400).json({ success: false, message: 'Invalid OTP' });
            }
            // OTP matches
            updateQuery += `, is_otp_verified = 1, start_time = CURRENT_TIMESTAMP`;
        }

        updateQuery += ` WHERE id = ?`;
        updateParams.push(bookingId);

        // Update booking status
        await db.execute(updateQuery, updateParams);

        // If status is completed, move to prevbookings (handled by trigger)
        if (status === 'completed') {
            await moveCompletedBooking(bookingId);
        }

        // Get updated booking
        const [updatedBookings] = await db.execute(`
            SELECT 
                b.*,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                cc.category as cab_category_name,
                cc.price_per_km as cab_category_price_per_km
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.id = ?
        `, [bookingId]);

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: updatedBookings[0]
        });

    } catch (error) {
        console.error('Error updating booking status by driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status',
            error: error.message
        });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getVendorBookings,
    getBookingDetails,
    updateBookingStatus,
    cancelUserBooking,
    getDriverBookings,
    updateBookingStatusByDriver
};