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

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    setUserPassword,
    deleteUserAccount
};
