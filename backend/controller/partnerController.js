const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Get partner profile information
const getPartnerProfile = async (req, res) => {
    try {
        const partnerId = req.user.id; // From auth middleware
        
        const [partners] = await db.execute(`
            SELECT id, name, email, phone, profile_pic, company_name, 
                   wallet_balance, total_earnings, commission_rate,
                   is_phone_verified, is_profile_completed,
                   created_at, updated_at
            FROM partners WHERE id = ?
        `, [partnerId]);
        
        if (partners.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Partner not found' 
            });
        }
        
        const partner = partners[0];
        
        res.status(200).json({
            success: true,
            message: 'Partner profile retrieved successfully',
            partner: partner
        });
    } catch (error) {
        console.error('Error getting partner profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve partner profile', 
            error: error.message 
        });
    }
};

// Update partner profile information
const updatePartnerProfile = async (req, res) => {
    try {
        const partnerId = req.user.id; // From auth middleware
        const { 
            name, 
            phone, 
            company_name,
            profile_pic
        } = req.body;
        
        // Check if partner exists
        const [existingPartners] = await db.execute(
            'SELECT * FROM partners WHERE id = ?',
            [partnerId]
        );
        
        if (existingPartners.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Partner not found' 
            });
        }
        
        const partner = existingPartners[0];
        
        // Check if phone number is being changed and if it's already taken
        if (phone && phone !== partner.phone) {
            const [phoneCheck] = await db.execute(
                'SELECT * FROM partners WHERE phone = ? AND id != ?',
                [phone, partnerId]
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
        
        if (company_name !== undefined) {
            updateFields.push('company_name = ?');
            updateValues.push(company_name);
        }
        
        if (profile_pic !== undefined) {
            updateFields.push('profile_pic = ?');
            updateValues.push(profile_pic);
        }
        
        // Check if profile is completed
        const requiredFields = [name || partner.name, phone || partner.phone, company_name || partner.company_name];
        const isProfileCompleted = requiredFields.every(field => field !== null && field !== undefined && field !== '');
        
        updateFields.push('is_profile_completed = ?');
        updateValues.push(isProfileCompleted ? 1 : 0);
        
        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No valid fields to update' 
            });
        }
        
        updateValues.push(partnerId);
        
        const updateQuery = `UPDATE partners SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await db.execute(updateQuery, updateValues);
        
        // Get updated partner data
        const [updatedPartners] = await db.execute(`
            SELECT id, name, email, phone, profile_pic, company_name, 
                   wallet_balance, total_earnings, commission_rate,
                   is_phone_verified, is_profile_completed,
                   created_at, updated_at
            FROM partners WHERE id = ?
        `, [partnerId]);
        
        res.status(200).json({
            success: true,
            message: 'Partner profile updated successfully',
            partner: updatedPartners[0]
        });
    } catch (error) {
        console.error('Error updating partner profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update partner profile', 
            error: error.message 
        });
    }
};

// Get partner dashboard statistics
const getPartnerDashboard = async (req, res) => {
    try {
        const partnerId = req.user.id;
        
        // Get total referrals (completed rides where partner was involved)
        const [totalReferrals] = await db.execute(`
            SELECT COUNT(*) as count
            FROM prevbookings 
            WHERE partner_id = ? AND status = 'completed'
        `, [partnerId]);
        
        // Get total commission earned
        const [totalCommission] = await db.execute(`
            SELECT COALESCE(SUM(commission_amount), 0) as total
            FROM partner_transactions 
            WHERE partner_id = ? AND status = 'completed'
        `, [partnerId]);
        
        // Get pending commission (completed rides not yet paid by admin)
        const [pendingCommission] = await db.execute(`
            SELECT COALESCE(SUM(commission_amount), 0) as total
            FROM partner_transactions 
            WHERE partner_id = ? AND status = 'pending'
        `, [partnerId]);
        
        // Get paid commission by admin
        const [paidCommission] = await db.execute(`
            SELECT COALESCE(SUM(commission_amount), 0) as total
            FROM partner_transactions 
            WHERE partner_id = ? AND status = 'completed'
        `, [partnerId]);
        
        // Get recent referrals (last 5)
        const [recentReferrals] = await db.execute(`
            SELECT 
                pb.id,
                pb.pickup_location,
                pb.dropoff_location,
                pb.pickup_date,
                pb.price,
                pb.status,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model,
                ven.name as vendor_name,
                pt.commission_amount,
                pt.status as commission_status
            FROM prevbookings pb
            LEFT JOIN users u ON pb.customer_id = u.id
            LEFT JOIN vehicles v ON pb.vehicle_id = v.id
            LEFT JOIN vendors ven ON pb.vendor_id = ven.id
            LEFT JOIN partner_transactions pt ON pb.id = pt.booking_id
            WHERE pb.partner_id = ? AND pb.status = 'completed'
            ORDER BY pb.created_at DESC
            LIMIT 5
        `, [partnerId]);
        
        res.status(200).json({
            success: true,
            message: 'Partner dashboard data retrieved successfully',
            data: {
                total_referrals: totalReferrals[0].count,
                total_commission: totalCommission[0].total,
                pending_commission: pendingCommission[0].total,
                paid_commission: paidCommission[0].total,
                recent_referrals: recentReferrals
            }
        });
    } catch (error) {
        console.error('Error getting partner dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve partner dashboard data',
            error: error.message
        });
    }
};

// Get partner's commission history
const getPartnerCommissionHistory = async (req, res) => {
    try {
        const partnerId = req.user.id;
        const { page = 1, limit = 10, status, start_date, end_date } = req.query;
        
        let query = `
            SELECT 
                pt.id,
                pt.commission_amount,
                pt.status,
                pt.created_at,
                pb.id as booking_id,
                pb.pickup_location,
                pb.dropoff_location,
                pb.pickup_date,
                pb.price as booking_amount,
                u.name as customer_name,
                u.phone as customer_phone,
                v.model as vehicle_model,
                ven.name as vendor_name
            FROM partner_transactions pt
            LEFT JOIN prevbookings pb ON pt.booking_id = pb.id
            LEFT JOIN users u ON pb.customer_id = u.id
            LEFT JOIN vehicles v ON pb.vehicle_id = v.id
            LEFT JOIN vendors ven ON pb.vendor_id = ven.id
            WHERE pt.partner_id = ?
        `;
        
        const params = [partnerId];
        
        if (status) {
            query += ' AND pt.status = ?';
            params.push(status);
        }
        
        if (start_date) {
            query += ' AND pt.created_at >= ?';
            params.push(start_date);
        }
        if (end_date) {
            query += ' AND pt.created_at <= ?';
            params.push(end_date);
        }
        
        query += ' ORDER BY pt.created_at DESC';
        
        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;
        
        const [commissions] = await db.execute(query, params);
        
        // Count total commissions for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM partner_transactions 
            WHERE partner_id = ?
        `;
        const countParams = [partnerId];
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
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
            message: 'Commission history retrieved successfully',
            data: {
                commissions,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting partner commission history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve commission history',
            error: error.message
        });
    }
};

// Get partner's earnings summary
const getPartnerEarnings = async (req, res) => {
    try {
        const partnerId = req.user.id;
        const { period = 'all' } = req.query; // all, month, week
        
        let dateFilter = '';
        const params = [partnerId];
        
        if (period === 'month') {
            dateFilter = ' AND pt.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        } else if (period === 'week') {
            dateFilter = ' AND pt.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        }
        
        // Get total commission for the period
        const [totalCommission] = await db.execute(`
            SELECT COALESCE(SUM(commission_amount), 0) as total
            FROM partner_transactions 
            WHERE partner_id = ? AND status = 'completed'${dateFilter}
        `, params);
        
        // Get pending commission for the period
        const [pendingCommission] = await db.execute(`
            SELECT COALESCE(SUM(commission_amount), 0) as total
            FROM partner_transactions 
            WHERE partner_id = ? AND status = 'pending'${dateFilter}
        `, params);
        
        // Get commission breakdown by month (last 6 months)
        const [monthlyBreakdown] = await db.execute(`
            SELECT 
                DATE_FORMAT(pt.created_at, '%Y-%m') as month,
                COUNT(*) as referrals_count,
                COALESCE(SUM(pt.commission_amount), 0) as total_commission
            FROM partner_transactions pt
            WHERE pt.partner_id = ? AND pt.status = 'completed'
            AND pt.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(pt.created_at, '%Y-%m')
            ORDER BY month DESC
        `, [partnerId]);
        
        res.status(200).json({
            success: true,
            message: 'Partner earnings retrieved successfully',
            data: {
                period,
                total_commission: totalCommission[0].total,
                pending_commission: pendingCommission[0].total,
                monthly_breakdown: monthlyBreakdown
            }
        });
    } catch (error) {
        console.error('Error getting partner earnings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve partner earnings',
            error: error.message
        });
    }
};

// Get partner's referral statistics
const getPartnerReferralStats = async (req, res) => {
    try {
        const partnerId = req.user.id;
        
        // Get total referrals by status
        const [referralStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_referrals,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_referrals,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_referrals,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) as total_booking_value,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN (price * 0.05) ELSE 0 END), 0) as total_commission_earned
            FROM prevbookings 
            WHERE partner_id = ?
        `, [partnerId]);
        
        // Get referrals by month (last 12 months)
        const [monthlyReferrals] = await db.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as referrals_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) as booking_value,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN (price * 0.05) ELSE 0 END), 0) as commission_earned
            FROM prevbookings 
            WHERE partner_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `, [partnerId]);
        
        res.status(200).json({
            success: true,
            message: 'Partner referral statistics retrieved successfully',
            data: {
                overview: referralStats[0],
                monthly_breakdown: monthlyReferrals
            }
        });
    } catch (error) {
        console.error('Error getting partner referral stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve referral statistics',
            error: error.message
        });
    }
};

module.exports = {
    getPartnerProfile,
    updatePartnerProfile,
    getPartnerDashboard,
    getPartnerCommissionHistory,
    getPartnerEarnings,
    getPartnerReferralStats
};
