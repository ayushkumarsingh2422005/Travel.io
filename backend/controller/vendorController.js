const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Get vendor profile information
const getVendorProfile = async (req, res) => {
    try {
        const vendorId = req.user.id; // From auth middleware
        
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
        
        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
            // Reset phone verification if phone is changed
            updateFields.push('is_phone_verified = ?');
            updateValues.push(0);
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
        const isProfileCompleted = requiredFields.every(field => field !== null && field !== undefined && field !== '');
        
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

module.exports = {
    getVendorProfile,
    updateVendorProfile,
    updateVendorPassword,
    uploadVendorProfilePic,
    deleteVendorAccount
};
