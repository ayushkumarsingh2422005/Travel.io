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
// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        // Base subquery for bookings - include add_ons_details and pricing fields
        let bookingSubQuery = `
            SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, cab_category_id, 
                   pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, booking_otp,
                   add_ons_details, addon_charges, base_fare, toll_charges, state_tax, parking_charges,
                   driver_night_charges, admin_commission, driver_payout, trip_type, micro_category
            FROM bookings
            WHERE customer_id = ?
        `;
        let bookingParams = [userId];

        // Base subquery for prevbookings
        let prevBookingSubQuery = `
            SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, NULL as cab_category_id, 
                   pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, NULL as booking_otp,
                   add_ons_details, addon_charges, base_fare, toll_charges, state_tax, parking_charges,
                   driver_night_charges, admin_commission, driver_payout, trip_type, micro_category
            FROM prevbookings
            WHERE customer_id = ?
        `;
        let prevBookingParams = [userId];

        // Filter by status if provided
        if (status) {
            if (['waiting', 'approved', 'preongoing', 'ongoing'].includes(status)) {
                bookingSubQuery += ' AND status = ?';
                bookingParams.push(status);
                prevBookingSubQuery = `SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, NULL as cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, NULL as booking_otp, add_ons_details, addon_charges, base_fare, toll_charges, state_tax, parking_charges, driver_night_charges, admin_commission, driver_payout, trip_type, micro_category FROM prevbookings WHERE 1=0`;
                prevBookingParams = [];
            } 
            else if (['completed', 'cancelled'].includes(status)) {
                 prevBookingSubQuery += ' AND status = ?';
                 prevBookingParams.push(status);
                 bookingSubQuery = `SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, booking_otp, add_ons_details, addon_charges, base_fare, toll_charges, state_tax, parking_charges, driver_night_charges, admin_commission, driver_payout, trip_type, micro_category FROM bookings WHERE 1=0`;
                 bookingParams = [];
            }
        }

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
            FROM (
                ${bookingSubQuery}
                UNION ALL
                ${prevBookingSubQuery}
            ) AS b
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN vendors ven ON b.vendor_id = ven.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN users p ON b.partner_id = p.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE 1=1
        `;

        const params = [...bookingParams, ...prevBookingParams];

        query += ' ORDER BY b.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [bookings] = await db.execute(query, params);

        // Parse add-ons and apply 5-hour visibility rule
        const now = new Date();
        bookings.forEach(booking => {
            // Parse add-ons details
            try {
                booking.add_ons_details = JSON.parse(booking.add_ons_details || '[]');
            } catch (e) {
                booking.add_ons_details = [];
            }

            // Apply 5-hour visibility rule for upcoming bookings
            if (booking.status !== 'completed' && booking.status !== 'cancelled') {
                const pickupTime = new Date(booking.pickup_date);
                const hoursDiff = (pickupTime - now) / (1000 * 60 * 60);

                if (hoursDiff > 5) {
                    // Hide driver and vehicle details
                    booking.driver_name = null;
                    booking.driver_phone = null;
                    booking.vehicle_model = null;
                    booking.vehicle_registration = null;
                    booking.vehicle_image = null;
                    booking.driver_details_hidden = true;
                    
                    // Calculate when details will be available
                    const detailsAvailableAt = new Date(pickupTime.getTime() - (5 * 60 * 60 * 1000));
                    booking.driver_details_available_at = detailsAvailableAt.toISOString();
                } else {
                    booking.driver_details_hidden = false;
                }
            }
        });

        // Count total bookings for pagination
        let countQuery = `
             SELECT COUNT(*) as total FROM (
                ${bookingSubQuery}
                UNION ALL
                ${prevBookingSubQuery}
            ) as count_table
        `;
        const [countResult] = await db.execute(countQuery, params);
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
// Get vendor's bookings
const getVendorBookings = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        // Base subquery for bookings - include add_ons_details and pricing fields
        let bookingSubQuery = `
            SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, cab_category_id, 
                   pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at,
                   add_ons_details, addon_charges, base_fare, toll_charges, state_tax, parking_charges,
                   driver_night_charges, admin_commission, driver_payout, trip_type, micro_category
            FROM bookings
            WHERE vendor_id = ?
        `;
        let bookingParams = [vendorId];

        // Base subquery for prevbookings
        let prevBookingSubQuery = `
            SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, NULL as cab_category_id, 
                   pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at,
                   add_ons_details, addon_charges, base_fare, toll_charges, state_tax, parking_charges,
                   driver_night_charges, admin_commission, driver_payout, trip_type, micro_category
            FROM prevbookings
            WHERE vendor_id = ?
        `;
        let prevBookingParams = [vendorId];

        // Filter by status if provided
        if (status) {
            // Check if status applies to active bookings (waiting, approved, preongoing, ongoing)
            if (['waiting', 'approved', 'preongoing', 'ongoing'].includes(status)) {
                bookingSubQuery += ' AND status = ?';
                bookingParams.push(status);
                // prevbookings only has completed/cancelled, so return nothing if searching for active statuses
                prevBookingSubQuery = `SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, NULL as cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, add_ons_details, addon_charges, base_fare, toll_charges, state_tax, parking_charges, driver_night_charges, admin_commission, driver_payout, trip_type, micro_category FROM prevbookings WHERE 1=0`;
                prevBookingParams = [];
            } 
            // Check if status applies to history (completed, cancelled)
            else if (['completed', 'cancelled'].includes(status)) {
                 prevBookingSubQuery += ' AND status = ?';
                 prevBookingParams.push(status);
                 // bookings table shouldn't typically have completed (moved) but might have cancelled? 
                 // Actually bookings does have status enum 'completed'/'cancelled' before they are moved trigger-wise? 
                 // The utils/bookingTransaction moveCompletedBooking deletes it from bookings. 
                 // So we can assume they are in prevbookings.
                 bookingSubQuery = `SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, add_ons_details, addon_charges, base_fare, toll_charges, state_tax, parking_charges, driver_night_charges, admin_commission, driver_payout, trip_type, micro_category FROM bookings WHERE 1=0`;
                 bookingParams = [];
            }
        }

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
            FROM (
                ${bookingSubQuery}
                UNION ALL
                ${prevBookingSubQuery}
            ) AS b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN users p ON b.partner_id = p.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE 1=1
        `;

        const params = [...bookingParams, ...prevBookingParams];

        query += ' ORDER BY b.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [bookings] = await db.execute(query, params);

        // Parse add-ons details for each booking
        bookings.forEach(booking => {
            try {
                booking.add_ons_details = JSON.parse(booking.add_ons_details || '[]');
            } catch (e) {
                booking.add_ons_details = [];
            }
        });

        // Count total for pagination
        // Using simplified count queries
        let countQuery = `
            SELECT COUNT(*) as total FROM (
                ${bookingSubQuery}
                UNION ALL
                ${prevBookingSubQuery}
            ) as count_table
        `;
        
        const [countResult] = await db.execute(countQuery, params);
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

        let bookingSubQuery = `
            SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, booking_otp, is_otp_verified, add_ons_details
            FROM bookings
            WHERE id = ?
        `;
        let prevBookingSubQuery = `
            SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, NULL as cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, NULL as booking_otp, 0 as is_otp_verified, NULL as add_ons_details
            FROM prevbookings
            WHERE id = ?
        `;
        
        let subQueryParams = [bookingId];

        // Add authorization check inside subqueries is redundant if we check outside, but safer if keys collide. 
        // For simplicity, we can filter in the main query.
        
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
            FROM (
                ${bookingSubQuery}
                UNION ALL
                ${prevBookingSubQuery}
            ) AS b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN vendors ven ON b.vendor_id = ven.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN users p ON b.partner_id = p.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE 1=1 
        `;

        const params = [bookingId, bookingId];

        // Add authorization check
        if (userType === 'user') {
            query += ' AND b.customer_id = ?';
            params.push(userId);
        } else if (userType === 'vendor') {
            query += ' AND b.vendor_id = ?';
            params.push(userId);
        } else if (userType === 'driver') { // Add driver check if needed, though usually implicit via route or different endpoint
             // query += ' AND b.driver_id = ?';
             // params.push(userId);
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
// Get driver's bookings
const getDriverBookings = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        // Base subquery for bookings
        let bookingSubQuery = `
            SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, booking_otp
            FROM bookings
            WHERE driver_id = ?
        `;
        let bookingParams = [driverId];

        // Base subquery for prevbookings
        let prevBookingSubQuery = `
            SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, NULL as cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, NULL as booking_otp
            FROM prevbookings
            WHERE driver_id = ?
        `;
        let prevBookingParams = [driverId];

        // Filter by status if provided
        if (status) {
            if (['waiting', 'approved', 'preongoing', 'ongoing'].includes(status)) {
                bookingSubQuery += ' AND status = ?';
                bookingParams.push(status);
                prevBookingSubQuery = `SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, NULL as cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, NULL as booking_otp FROM prevbookings WHERE 1=0`;
                prevBookingParams = [];
            } 
            else if (['completed', 'cancelled'].includes(status)) {
                 prevBookingSubQuery += ' AND status = ?';
                 prevBookingParams.push(status);
                 bookingSubQuery = `SELECT id, vendor_id, customer_id, vehicle_id, driver_id, partner_id, cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, price, status, created_at, booking_otp FROM bookings WHERE 1=0`;
                 bookingParams = [];
            }
        }

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
            FROM (
                ${bookingSubQuery}
                UNION ALL
                ${prevBookingSubQuery}
            ) AS b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN vendors ven ON b.vendor_id = ven.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE 1=1
        `;

        const params = [...bookingParams, ...prevBookingParams];

        query += ' ORDER BY b.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [bookings] = await db.execute(query, params);

        // Count total bookings for pagination
        let countQuery = `
             SELECT COUNT(*) as total FROM (
                ${bookingSubQuery}
                UNION ALL
                ${prevBookingSubQuery}
            ) as count_table
        `;
        const [countResult] = await db.execute(countQuery, params);
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
            updateQuery += `, is_otp_verified = 1`;
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
                cc.segment as cab_category_name,
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

// Verify OTP and Start Trip (Public/Driver Link)
const verifyOtpAndStartTrip = async (req, res) => {
    try {
        const { booking_id, otp } = req.body;

        if (!booking_id || !otp) {
            return res.status(400).json({ success: false, message: 'Booking ID and OTP are required' });
        }

        // Check booking
        const [bookings] = await db.execute(`
            SELECT * FROM bookings WHERE id = ?
        `, [booking_id]);

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const booking = bookings[0];

        // Verify OTP
        if (booking.booking_otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Update status to ongoing
        await db.execute(`
            UPDATE bookings 
            SET status = 'ongoing', is_otp_verified = 1 
            WHERE id = ?
        `, [booking_id]);

        res.status(200).json({
            success: true,
            message: 'OTP Verified and Trip Started',
            data: {
                booking_id: booking.id,
                status: 'ongoing'
            }
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
};

// Get public booking details (for driver tracking page)
const getPublicBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const [bookings] = await db.execute(`
            SELECT 
                b.id,
                b.pickup_location,
                b.dropoff_location,
                b.pickup_date,
                b.status,
                u.name as customer_name,
                u.phone as customer_phone
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            WHERE b.id = ?
        `, [bookingId]);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bookings[0]
        });
    } catch (error) {
        console.error('Error getting public booking details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get booking details'
        });
    }
};

// Complete Trip (Public/Driver Link)
const completeTripPublic = async (req, res) => {
    try {
        const { booking_id } = req.body;

        if (!booking_id) {
            return res.status(400).json({ success: false, message: 'Booking ID is required' });
        }

        // Check booking
        const [bookings] = await db.execute(`
            SELECT * FROM bookings WHERE id = ?
        `, [booking_id]);

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const booking = bookings[0];

        if (booking.status !== 'ongoing') {
            return res.status(400).json({ success: false, message: 'Trip must be ongoing to complete' });
        }

        // Update status to completed first
        await db.execute(`
            UPDATE bookings 
            SET status = 'completed', drop_date = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [booking_id]);

        // Move to prevbookings handling
        await moveCompletedBooking(booking_id);

        res.status(200).json({
            success: true,
            message: 'Trip Completed Successfully',
            data: {
                booking_id: booking.id,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error('Error completing trip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete trip',
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
    updateBookingStatusByDriver,
    verifyOtpAndStartTrip,
    getPublicBookingDetails,
    completeTripPublic
};