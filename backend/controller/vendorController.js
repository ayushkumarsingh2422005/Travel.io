const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Get vendor profile information
const getVendorProfile = async (req, res) => {
    try {
        const vendorId = req.user.id; // From auth middleware

        console.log("request recieved here ")
        const [vendors] = await db.execute(
            `SELECT id, name, email, phone, gender, profile_pic, age, current_address, 
            description, amount, total_earnings, star_rating, 
            is_phone_verified, is_email_verified, is_profile_completed,
            aadhar_number, is_aadhaar_verified, pan_number, is_pan_verified,
            created_at, updated_at
            FROM vendors WHERE id = ?`,
            [vendorId]
        );

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        const vendor = vendors[0];

        res.status(200).json({
            success: true,
            message: 'Vendor profile retrieved successfully',
            vendor: vendor
        });
    } catch (error) {
        console.error('Error getting vendor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vendor profile',
            error: error.message
        });
    }
};

// Update vendor profile information
const updateVendorProfile = async (req, res) => {
    try {
        const vendorId = req.user.id; // From auth middleware
        const {
            name,
            phone,
            gender,
            age,
            current_address,
            description
        } = req.body;

        // Check if vendor exists
        const [existingVendors] = await db.execute(
            'SELECT * FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (existingVendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        const vendor = existingVendors[0];

        // Check if phone number is being changed and if it's already taken
        if (phone && phone !== vendor.phone) {
            const [phoneCheck] = await db.execute(
                'SELECT * FROM vendors WHERE phone = ? AND id != ?',
                [phone, vendorId]
            );

            if (phoneCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number already registered with another account'
                });
            }
        }

        // Build update query dynamically based on provided fields
        const updateFields = [];
        const updateValues = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }

        if (phone !== undefined && phone !== vendor.phone) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
            // Reset phone verification if phone is changed
            updateFields.push('is_phone_verified = ?');
            updateValues.push(0);
        } else if (phone !== undefined) {
            // Phone is present but unchanged, just update it (or skip, but safe to update to same value)
            // DO NOT reset verified status
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }

        if (gender !== undefined) {
            updateFields.push('gender = ?');
            updateValues.push(gender);
        }

        if (age !== undefined) {
            updateFields.push('age = ?');
            updateValues.push(age);
        }

        if (current_address !== undefined) {
            updateFields.push('current_address = ?');
            updateValues.push(current_address);
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }

        // Check if profile is completed
        const requiredFields = [name || vendor.name, phone || vendor.phone, gender || vendor.gender,
        age || vendor.age, current_address || vendor.current_address];

        // Check KYC status
        let isPhoneVerified = vendor.is_phone_verified;
        // If phone is being updated, verification status will be reset to 0
        if (phone !== undefined && phone !== vendor.phone) {
            isPhoneVerified = 0;
        }

        const isKycCompleted = isPhoneVerified &&
            vendor.is_email_verified &&
            vendor.is_aadhaar_verified &&
            vendor.is_pan_verified;

        const isProfileCompleted = requiredFields.every(field => field !== null && field !== undefined && field !== '') && isKycCompleted;

        updateFields.push('is_profile_completed = ?');
        updateValues.push(isProfileCompleted ? 1 : 0);

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        updateValues.push(vendorId);

        const updateQuery = `UPDATE vendors SET ${updateFields.join(', ')} WHERE id = ?`;

        await db.execute(updateQuery, updateValues);

        // Get updated vendor data
        const [updatedVendors] = await db.execute(
            `SELECT id, name, email, phone, gender, profile_pic, age, current_address, 
                    description, amount, total_earnings, star_rating, 
                    is_phone_verified, is_email_verified, is_profile_completed,
                    aadhar_number, is_aadhaar_verified, pan_number, is_pan_verified,
                    created_at, updated_at
             FROM vendors WHERE id = ?`,
            [vendorId]
        );

        res.status(200).json({
            success: true,
            message: 'Vendor profile updated successfully',
            vendor: updatedVendors[0]
        });
    } catch (error) {
        console.error('Error updating vendor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vendor profile',
            error: error.message
        });
    }
};

// Update vendor password
const updateVendorPassword = async (req, res) => {
    try {
        const vendorId = req.user.id; // From auth middleware
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get vendor's current password hash
        const [vendors] = await db.execute(
            'SELECT password_hash FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        const vendor = vendors[0];

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, vendor.password_hash);

        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.execute(
            'UPDATE vendors SET password_hash = ? WHERE id = ?',
            [newPasswordHash, vendorId]
        );

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating vendor password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password',
            error: error.message
        });
    }
};

// Upload/Update vendor profile picture
const uploadVendorProfilePic = async (req, res) => {
    try {
        const vendorId = req.user.id; // From auth middleware
        const { profile_pic } = req.body;

        if (!profile_pic) {
            return res.status(400).json({
                success: false,
                message: 'Profile picture URL is required'
            });
        }

        // Check if vendor exists
        const [vendors] = await db.execute(
            'SELECT * FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Update profile picture
        await db.execute(
            'UPDATE vendors SET profile_pic = ? WHERE id = ?',
            [profile_pic, vendorId]
        );

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            profile_pic: profile_pic
        });
    } catch (error) {
        console.error('Error updating vendor profile picture:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile picture',
            error: error.message
        });
    }
};

// Delete vendor account (soft delete by deactivating)
const deleteVendorAccount = async (req, res) => {
    try {
        const vendorId = req.user.id; // From auth middleware
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to delete account'
            });
        }

        // Get vendor's password hash
        const [vendors] = await db.execute(
            'SELECT password_hash FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        const vendor = vendors[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, vendor.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // For now, we'll just mark the account as inactive
        // In a real application, you might want to:
        // 1. Soft delete by setting a deleted_at timestamp
        // 2. Anonymize personal data
        // 3. Handle related data (vehicles, bookings, etc.)

        // Update email to make it unusable for future registrations
        const deletedEmail = `deleted_${Date.now()}_${vendorId}@deleted.com`;
        await db.execute(
            'UPDATE vendors SET email = ?, is_profile_completed = 0 WHERE id = ?',
            [deletedEmail, vendorId]
        );

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting vendor account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account',
            error: error.message
        });
    }
};

// Get vendor dashboard statistics
const getVendorDashboard = async (req, res) => {
    try {
        const vendorId = req.user.id;

        // Get total ongoing bookings
        const [ongoingBookings] = await db.execute(`
            SELECT COUNT(*) as count
            FROM bookings 
            WHERE vendor_id = ? AND status IN ('waiting', 'approved', 'preongoing', 'ongoing')
        `, [vendorId]);

        // Get total completed rides
        const [completedRides] = await db.execute(`
            SELECT COUNT(*) as count
            FROM prevbookings 
            WHERE vendor_id = ? AND status = 'completed'
        `, [vendorId]);

        // Get total earnings from completed rides
        const [totalEarnings] = await db.execute(`
            SELECT COALESCE(SUM(price), 0) as total
            FROM prevbookings 
            WHERE vendor_id = ? AND status = 'completed'
        `, [vendorId]);

        // Get pending payments (completed rides not yet paid by admin)
        const [pendingPayments] = await db.execute(`
            SELECT COALESCE(SUM(price), 0) as total
            FROM prevbookings 
            WHERE vendor_id = ? AND status = 'completed'
            AND id NOT IN (
                SELECT DISTINCT booking_id 
                FROM payments 
                WHERE vendor_id = ? AND status = 'completed'
            )
        `, [vendorId, vendorId]);

        // Get paid amount by admin
        const [paidAmount] = await db.execute(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments 
            WHERE vendor_id = ? AND status = 'completed'
        `, [vendorId]);

        // Get recent completed rides (last 5)
        const [recentRides] = await db.execute(`
            SELECT 
                pb.id,
                pb.pickup_location,
                pb.dropoff_location,
                pb.pickup_date,
                pb.price,
                pb.status,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model
            FROM prevbookings pb
            LEFT JOIN users u ON pb.customer_id = u.id
            LEFT JOIN vehicles v ON pb.vehicle_id = v.id
            WHERE pb.vendor_id = ? AND pb.status = 'completed'
            ORDER BY pb.created_at DESC
            LIMIT 5
        `, [vendorId]);

        res.status(200).json({
            success: true,
            message: 'Vendor dashboard data retrieved successfully',
            data: {
                ongoing_bookings: ongoingBookings[0].count,
                completed_rides: completedRides[0].count,
                total_earnings: totalEarnings[0].total,
                pending_payments: pendingPayments[0].total,
                paid_amount: paidAmount[0].total,
                recent_rides: recentRides
            }
        });
    } catch (error) {
        console.error('Error getting vendor dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vendor dashboard data',
            error: error.message
        });
    }
};

// Get vendor's ongoing bookings
const getVendorOngoingBookings = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        let query = `
            SELECT 
                b.id,
                b.pickup_location,
                b.dropoff_location,
                b.pickup_date,
                b.drop_date,
                b.price,
                b.status,
                b.created_at,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                d.name as driver_name,
                d.phone as driver_phone
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            WHERE b.vendor_id = ? AND b.status IN ('waiting', 'approved', 'preongoing', 'ongoing')
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
        let countQuery = `
            SELECT COUNT(*) as total
            FROM bookings 
            WHERE vendor_id = ? AND status IN ('waiting', 'approved', 'preongoing', 'ongoing')
        `;
        const countParams = [vendorId];
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Ongoing bookings retrieved successfully',
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
        console.error('Error getting vendor ongoing bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve ongoing bookings',
            error: error.message
        });
    }
};

// Get vendor's completed rides
const getVendorCompletedRides = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { page = 1, limit = 10, start_date, end_date } = req.query;

        let query = `
            SELECT 
                pb.id,
                pb.pickup_location,
                pb.dropoff_location,
                pb.pickup_date,
                pb.drop_date,
                pb.price,
                pb.status,
                pb.created_at,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                d.name as driver_name,
                d.phone as driver_phone,
                CASE 
                    WHEN p.id IS NOT NULL AND p.status = 'completed' THEN 'paid'
                    ELSE 'pending'
                END as payment_status
            FROM prevbookings pb
            LEFT JOIN users u ON pb.customer_id = u.id
            LEFT JOIN vehicles v ON pb.vehicle_id = v.id
            LEFT JOIN drivers d ON pb.driver_id = d.id
            LEFT JOIN payments p ON pb.id = p.booking_id AND p.vendor_id = ? AND p.status = 'completed'
            WHERE pb.vendor_id = ? AND pb.status = 'completed'
        `;

        const params = [vendorId, vendorId];

        if (start_date) {
            query += ' AND pb.created_at >= ?';
            params.push(start_date);
        }
        if (end_date) {
            query += ' AND pb.created_at <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY pb.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [rides] = await db.execute(query, params);

        // Count total rides for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM prevbookings 
            WHERE vendor_id = ? AND status = 'completed'
        `;
        const countParams = [vendorId];
        if (start_date) {
            countQuery += ' AND created_at >= ?';
            countParams.push(start_date);
        }
        if (end_date) {
            countQuery += ' AND created_at <= ?';
            countParams.push(end_date);
        }
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Completed rides retrieved successfully',
            data: {
                rides,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting vendor completed rides:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve completed rides',
            error: error.message
        });
    }
};

// Get vendor's earnings summary
const getVendorEarnings = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { period = 'all' } = req.query; // all, month, week

        let dateFilter = '';
        const params = [vendorId];

        if (period === 'month') {
            dateFilter = ' AND pb.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        } else if (period === 'week') {
            dateFilter = ' AND pb.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        }

        // Get total earnings for the period
        const [totalEarnings] = await db.execute(`
            SELECT COALESCE(SUM(price), 0) as total
            FROM prevbookings 
            WHERE vendor_id = ? AND status = 'completed'${dateFilter}
        `, params);

        // Get paid amount for the period
        const [paidAmount] = await db.execute(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments 
            WHERE vendor_id = ? AND status = 'completed'${dateFilter}
        `, params);

        // Get pending amount for the period
        const [pendingAmount] = await db.execute(`
            SELECT COALESCE(SUM(price), 0) as total
            FROM prevbookings 
            WHERE vendor_id = ? AND status = 'completed'
            AND id NOT IN (
                SELECT DISTINCT booking_id 
                FROM payments 
                WHERE vendor_id = ? AND status = 'completed'
            )${dateFilter}
        `, [vendorId, vendorId]);

        // Get earnings breakdown by month (last 6 months)
        const [monthlyBreakdown] = await db.execute(`
            SELECT 
                DATE_FORMAT(pb.created_at, '%Y-%m') as month,
                COUNT(*) as rides_count,
                COALESCE(SUM(pb.price), 0) as total_earnings
            FROM prevbookings pb
            WHERE pb.vendor_id = ? AND pb.status = 'completed'
            AND pb.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(pb.created_at, '%Y-%m')
            ORDER BY month DESC
        `, [vendorId]);

        res.status(200).json({
            success: true,
            message: 'Vendor earnings retrieved successfully',
            data: {
                period,
                total_earnings: totalEarnings[0].total,
                paid_amount: paidAmount[0].total,
                pending_amount: pendingAmount[0].total,
                monthly_breakdown: monthlyBreakdown
            }
        });
    } catch (error) {
        console.error('Error getting vendor earnings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vendor earnings',
            error: error.message
        });
    }
};

// Get pending booking requests (unassigned bookings)
const getPendingBookingRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        let query = `
            SELECT 
                b.id,
                b.pickup_location,
                b.dropoff_location,
                b.pickup_date,
                b.drop_date,
                b.price,
                b.distance,
                b.path,
                b.status,
                b.created_at,
                u.name as customer_name,
                u.phone as customer_phone,
                cc.id as cab_category_id,
                cc.category as cab_category_name,
                cc.price_per_km as cab_category_price_per_km,
                cc.min_no_of_seats as min_seats,
                cc.max_no_of_seats as max_seats,
                cc.category_image as cab_category_image
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.vendor_id IS NULL AND b.status = 'waiting'
            ORDER BY b.created_at DESC
        `;

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [bookings] = await db.execute(query);

        // Count total pending requests
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM bookings 
            WHERE vendor_id IS NULL AND status = 'waiting'
        `);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Pending booking requests retrieved successfully',
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
        console.error('Error getting pending booking requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending booking requests',
            error: error.message
        });
    }
};

// Accept a booking request by assigning driver and vehicle
const acceptBookingRequest = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { booking_id, driver_id, vehicle_id } = req.body;

        // Validate required fields
        if (!booking_id || !driver_id || !vehicle_id) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID, driver ID, and vehicle ID are required'
            });
        }

        // Check if booking exists and vendor_id IS NULL (not yet accepted)
        const [bookings] = await db.execute(`
            SELECT b.*, cc.min_no_of_seats, cc.max_no_of_seats
            FROM bookings b
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.id = ? AND b.vendor_id IS NULL AND b.status = 'waiting'
        `, [booking_id]);

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or already accepted by another vendor'
            });
        }

        const booking = bookings[0];

        // Verify driver belongs to vendor and is active
        const [drivers] = await db.execute(`
            SELECT * FROM drivers 
            WHERE id = ? AND vendor_id = ? AND is_active = 1
        `, [driver_id, vendorId]);

        if (drivers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Driver not found or not active'
            });
        }

        // Verify vehicle belongs to vendor and is active
        const [vehicles] = await db.execute(`
            SELECT * FROM vehicles 
            WHERE id = ? AND vendor_id = ? AND is_active = 1
        `, [vehicle_id, vendorId]);

        if (vehicles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle not found or not active'
            });
        }

        const vehicle = vehicles[0];

        // Verify vehicle matches cab category seat requirements
        if (booking.min_no_of_seats && vehicle.no_of_seats < booking.min_no_of_seats) {
            return res.status(400).json({
                success: false,
                message: `Vehicle does not meet minimum seat requirement (${booking.min_no_of_seats} seats required)`
            });
        }

        if (booking.max_no_of_seats && vehicle.no_of_seats > booking.max_no_of_seats) {
            return res.status(400).json({
                success: false,
                message: `Vehicle exceeds maximum seat requirement (${booking.max_no_of_seats} seats maximum)`
            });
        }

        // Check if vehicle is already booked for the requested time
        const [existingBookings] = await db.execute(`
            SELECT COUNT(*) as count
            FROM bookings
            WHERE vehicle_id = ? AND status IN ('waiting', 'approved', 'preongoing', 'ongoing')
            AND id != ?
            AND (
                (pickup_date <= ? AND drop_date >= ?) OR
                (pickup_date <= ? AND drop_date >= ?) OR
                (pickup_date >= ? AND drop_date <= ?)
            )
        `, [vehicle_id, booking_id, booking.pickup_date, booking.pickup_date,
            booking.drop_date, booking.drop_date, booking.pickup_date, booking.drop_date]);

        if (existingBookings[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is already booked for the requested time period'
            });
        }

        // Check if driver is already assigned for the requested time
        const [existingDriverBookings] = await db.execute(`
            SELECT COUNT(*) as count
            FROM bookings
            WHERE driver_id = ? AND status IN ('waiting', 'approved', 'preongoing', 'ongoing')
            AND id != ?
            AND (
                (pickup_date <= ? AND drop_date >= ?) OR
                (pickup_date <= ? AND drop_date >= ?) OR
                (pickup_date >= ? AND drop_date <= ?)
            )
        `, [driver_id, booking_id, booking.pickup_date, booking.pickup_date,
            booking.drop_date, booking.drop_date, booking.pickup_date, booking.drop_date]);

        if (existingDriverBookings[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Driver is already assigned for the requested time period'
            });
        }

        // Update booking with vendor, driver, and vehicle - use WHERE clause to prevent race condition
        const [updateResult] = await db.execute(`
            UPDATE bookings 
            SET vendor_id = ?, driver_id = ?, vehicle_id = ?, status = 'approved'
            WHERE id = ? AND vendor_id IS NULL AND status = 'waiting'
        `, [vendorId, driver_id, vehicle_id, booking_id]);

        // Check if update was successful (affected rows > 0)
        if (updateResult.affectedRows === 0) {
            return res.status(409).json({
                success: false,
                message: 'Booking was already accepted by another vendor'
            });
        }

        // Update transaction with vendor_id
        await db.execute(`
            UPDATE transactions 
            SET vendor_id = ?
            WHERE booking_id = ?
        `, [vendorId, booking_id]);

        // Get updated booking details
        const [updatedBookings] = await db.execute(`
            SELECT 
                b.*,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                d.name as driver_name,
                d.phone as driver_phone,
                cc.category as cab_category_name
            FROM bookings b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE b.id = ?
        `, [booking_id]);

        res.status(200).json({
            success: true,
            message: 'Booking accepted successfully',
            data: updatedBookings[0]
        });
    } catch (error) {
        console.error('Error accepting booking request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept booking request',
            error: error.message
        });
    }
};

module.exports = {
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
};