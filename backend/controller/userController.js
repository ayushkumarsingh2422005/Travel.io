const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get user profile information
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        
        const [users] = await db.execute(
            `SELECT id, name, email, phone, gender, profile_pic, age, current_address, 
                    amount_spent, is_phone_verified, is_profile_completed, auth_provider,
                    created_at, updated_at
             FROM users WHERE id = ?`,
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const user = users[0];
        
        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            user: user
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve user profile', 
            error: error.message 
        });
    }
};

// Update user profile information
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const { 
            name, 
            gender, 
            age, 
            current_address,
        } = req.body;
        
        // Check if user exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        
        if (existingUsers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Build update query dynamically based on provided fields
        const updateFields = [];
        const updateValues = [];
        
        if (name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(name);
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
        
        // Check if profile is completed
        const user = existingUsers[0];
        const isProfileCompleted = (
            (name || user.name) && 
            (gender || user.gender) && gender !== 'Select Gender' &&
            (age || user.age) && age !== -1 &&
            (current_address || user.current_address) &&
            user.is_phone_verified
        );
        
        if (isProfileCompleted) {
            updateFields.push('is_profile_completed = ?');
            updateValues.push(1);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No valid fields provided for update' 
            });
        }
        
        // Add updated_at timestamp
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(userId);
        
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await db.execute(updateQuery, updateValues);
        
        // Fetch updated user data
        const [updatedUsers] = await db.execute(
            `SELECT id, name, email, phone, gender, profile_pic, age, current_address, 
                    amount_spent, is_phone_verified, is_profile_completed, auth_provider,
                    created_at, updated_at
             FROM users WHERE id = ?`,
            [userId]
        );
        
        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            user: updatedUsers[0]
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update user profile', 
            error: error.message 
        });
    }
};

// Update user password
const updateUserPassword = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password and new password are required' 
            });
        }
        
        // Get user's current password hash
        const [users] = await db.execute(
            'SELECT password_hash, auth_provider FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const user = users[0];
        
        // Check if user signed up with Google (no password)
        if (user.auth_provider === 'google' && !user.password_hash) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot change password for Google account. Please set a password first.' 
            });
        }
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }
        
        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await db.execute(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newPasswordHash, userId]
        );
        
        console.log(`Password updated successfully for user: ${userId}`);
        
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating user password:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update password', 
            error: error.message 
        });
    }
};

// Set password for Google users
const setUserPassword = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password is required' 
            });
        }
        
        // Get user info
        const [users] = await db.execute(
            'SELECT auth_provider, password_hash FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const user = users[0];
        
        // Check if user already has a password
        if (user.password_hash) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password already set. Use update password instead.' 
            });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Set password and update auth provider to local
        await db.execute(
            'UPDATE users SET password_hash = ?, auth_provider = "local", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [passwordHash, userId]
        );
        
        console.log(`Password set successfully for user: ${userId}`);
        
        res.status(200).json({
            success: true,
            message: 'Password set successfully'
        });
    } catch (error) {
        console.error('Error setting user password:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to set password', 
            error: error.message 
        });
    }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const { password } = req.body;
        
        // Get user info
        const [users] = await db.execute(
            'SELECT password_hash, auth_provider FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const user = users[0];
        
        // Verify password for local accounts
        if (user.auth_provider === 'local' && user.password_hash) {
            if (!password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Password is required to delete account' 
                });
            }
            
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Incorrect password' 
                });
            }
        }
        
        // Delete user account
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        
        console.log(`User account deleted successfully: ${userId}`);
        
        res.status(200).json({
            success: true,
            message: 'User account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete user account', 
            error: error.message 
        });
    }
};

// Search available vehicles for users
const searchVehicles = async (req, res) => {
    try {
        const {
            min_seats,
            max_seats,
            min_price_per_km,
            max_price_per_km,
            location,
            sort_by = 'per_km_charge',
            sort_order = 'ASC',
            page = 1,
            limit = 10,
            category // Add category to query parameters
        } = req.query;

        // Allowed sort fields and orders
        const allowedSortFields = ['per_km_charge', 'no_of_seats', 'model'];
        const allowedSortOrders = ['ASC', 'DESC'];

        // Build base query
        let query = `
            SELECT
                v.id,
                v.model,
                v.registration_no,
                v.image,
                v.no_of_seats,
                v.per_km_charge,
                v.is_active,
                v.rc_vehicle_manufacturer_name,
                v.rc_vehicle_colour,
                v.rc_type,
                v.rc_body_type,
                v.rc_vehicle_category,
                v.rc_vehicle_seat_capacity,
                v.rc_vehicle_sleeper_capacity,
                v.rc_vehicle_standing_capacity,
                v.rc_vehicle_cubic_capacity,
                v.rc_vehicle_manufacturing_month_year,
                v.rc_vehicle_insurance_upto,
                v.rc_vehicle_tax_upto,
                v.rc_expiry_date,
                v.rc_blacklist_status,
                v.rc_challan_details,
                v.rc_permit_valid_upto,
                v.rc_national_permit_upto,
                v.rc_is_commercial,
                ven.name as vendor_name,
                ven.star_rating as vendor_rating,
                ven.current_address as vendor_location
            FROM vehicles v
            INNER JOIN vendors ven ON v.vendor_id = ven.id
            WHERE v.is_active = 1
        `;

        const params = [];

        if (min_seats) {
            query += ' AND v.no_of_seats >= ?';
            params.push(Number(min_seats));
        }
        if (max_seats) {
            query += ' AND v.no_of_seats <= ?';
            params.push(Number(max_seats));
        }
        if (min_price_per_km) {
            query += ' AND v.per_km_charge >= ?';
            params.push(Number(min_price_per_km));
        }
        if (max_price_per_km) {
            query += ' AND v.per_km_charge <= ?';
            params.push(Number(max_price_per_km));
        }
        if (location) {
            query += ' AND (ven.current_address LIKE ? OR v.rc_present_address LIKE ?)';
            const loc = `%${location}%`;
            params.push(loc, loc);
        }
        if (category) {
            query += ' AND v.rc_vehicle_category = ?';
            params.push(category);
        }

        // Sorting
        let sortField = 'v.per_km_charge';
        if (allowedSortFields.includes(sort_by)) {
            if (sort_by === 'model') sortField = 'v.model';
            else if (sort_by === 'no_of_seats') sortField = 'v.no_of_seats';
            else sortField = 'v.per_km_charge';
        }
        let sortOrder = allowedSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'ASC';
        query += ` ORDER BY ${sortField} ${sortOrder}`;

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        // Query vehicles (no LIMIT/OFFSET in params, use string interpolation)
        const [vehicles] = await db.execute(query, params);

        // Parse JSON fields if any
        vehicles.forEach(vehicle => {
            if (vehicle.rc_challan_details && typeof vehicle.rc_challan_details === 'string') {
                try {
                    vehicle.rc_challan_details = JSON.parse(vehicle.rc_challan_details);
                } catch {
                    vehicle.rc_challan_details = null;
                }
            }
        });

        // Count query for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM vehicles v
            INNER JOIN vendors ven ON v.vendor_id = ven.id
            WHERE v.is_active = 1
        `;
        const countParams = [];
        if (min_seats) {
            countQuery += ' AND v.no_of_seats >= ?';
            countParams.push(Number(min_seats));
        }
        if (max_seats) {
            countQuery += ' AND v.no_of_seats <= ?';
            countParams.push(Number(max_seats));
        }
        if (min_price_per_km) {
            countQuery += ' AND v.per_km_charge >= ?';
            countParams.push(Number(min_price_per_km));
        }
        if (max_price_per_km) {
            countQuery += ' AND v.per_km_charge <= ?';
            countParams.push(Number(max_price_per_km));
        }
        if (location) {
            countQuery += ' AND (ven.current_address LIKE ? OR v.rc_present_address LIKE ?)';
            const loc = `%${location}%`;
            countParams.push(loc, loc);
        }
        if (category) {
            countQuery += ' AND v.rc_vehicle_category = ?';
            countParams.push(category);
        }
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0]?.total || 0;

        res.status(200).json({
            success: true,
            message: 'Vehicles retrieved successfully',
            data: {
                vehicles,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to search vehicles',
            error: error.message
        });
    }
};

// Get vehicle details for users
const getVehicleDetails = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        
        if (!vehicleId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vehicle ID is required' 
            });
        }
        
        // Get vehicle details with vendor information
        const [vehicles] = await db.execute(`
            SELECT 
                v.*,
                ven.name as vendor_name,
                ven.email as vendor_email,
                ven.phone as vendor_phone,
                ven.star_rating as vendor_rating,
                ven.current_address as vendor_location,
                ven.profile_pic as vendor_profile_pic,
                ven.is_phone_verified as vendor_phone_verified,
                ven.is_email_verified as vendor_email_verified
            FROM vehicles v
            INNER JOIN vendors ven ON v.vendor_id = ven.id
            WHERE v.id = ? AND v.is_active = 1
        `, [vehicleId]);
        
        if (vehicles.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Vehicle not found or not available' 
            });
        }
        
        const vehicle = vehicles[0];
        
        // Parse JSON fields
        const jsonFields = ['rc_blacklist_details', 'rc_challan_details', 'rc_noc_details', 'rc_split_present_address', 'rc_split_permanent_address'];
        jsonFields.forEach(field => {
            if (vehicle[field] && typeof vehicle[field] === 'string' && vehicle[field] !== 'null' && vehicle[field] !== '"[object Object]"') {
                try {
                    vehicle[field] = JSON.parse(vehicle[field]);
                } catch (error) {
                    console.error(`Error parsing ${field} for vehicle:`, vehicle.id, error);
                    vehicle[field] = null;
                }
            } else if (vehicle[field] === '"[object Object]"' || vehicle[field] === 'null') {
                vehicle[field] = null;
            }
        });
        
        // Get vehicle availability status (check for active bookings)
        const [activeBookings] = await db.execute(`
            SELECT COUNT(*) as active_count
            FROM bookings 
            WHERE vehicle_id = ? AND status IN ('approved', 'ongoing', 'preongoing')
        `, [vehicleId]);
        
        const isAvailable = activeBookings[0].active_count === 0;
        
        res.status(200).json({
            success: true,
            message: 'Vehicle details retrieved successfully',
            data: {
                ...vehicle,
                is_available: isAvailable,
                availability_status: isAvailable ? 'Available' : 'Currently Booked'
            }
        });
    } catch (error) {
        console.error('Error getting vehicle details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get vehicle details', 
            error: error.message 
        });
    }
};

// Get vehicle types/categories for filtering
const getVehicleTypes = async (req, res) => {
    try {
        const [types] = await db.execute(`
            SELECT DISTINCT 
                rc_type as type,
                rc_body_type as body_type,
                rc_vehicle_category as category,
                COUNT(*) as count
            FROM vehicles 
            WHERE is_active = 1 AND rc_type IS NOT NULL
            GROUP BY rc_type, rc_body_type, rc_vehicle_category
            ORDER BY count DESC
        `);
        
        res.status(200).json({
            success: true,
            message: 'Vehicle types retrieved successfully',
            data: types
        });
    } catch (error) {
        console.error('Error getting vehicle types:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get vehicle types', 
            error: error.message 
        });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    setUserPassword,
    deleteUserAccount,
    searchVehicles,
    getVehicleDetails,
    getVehicleTypes
};
