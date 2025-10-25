const db = require('../config/db');
const crypto = require('crypto');

// Generate unique payment ID
const generatePaymentId = () => {
    return crypto.createHash('sha256').update(Date.now().toString() + Math.random().toString()).digest('hex');
};

// Get admin dashboard statistics
const getAdminDashboard = async (req, res) => {
    try {
        // Get total revenue from all completed bookings
        const [totalRevenue] = await db.execute(`
            SELECT COALESCE(SUM(price), 0) as total
            FROM prevbookings 
            WHERE status = 'completed'
        `);
        
        // Get admin commission (10% of total revenue)
        const adminCommission = Math.round(totalRevenue[0].total * 0.1);
        
        // Get total vendor payments made
        const [totalVendorPayments] = await db.execute(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments 
            WHERE vendor_id IS NOT NULL AND status = 'completed'
        `);
        
        // Get total partner payments made
        const [totalPartnerPayments] = await db.execute(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments 
            WHERE partner_id IS NOT NULL AND status = 'completed'
        `);
        
        // Get pending vendor payments
        const [pendingVendorPayments] = await db.execute(`
            SELECT COALESCE(SUM(pb.price), 0) as total
            FROM prevbookings pb
            WHERE pb.status = 'completed' AND pb.vendor_id IS NOT NULL
            AND pb.id NOT IN (
                SELECT DISTINCT booking_id 
                FROM payments 
                WHERE vendor_id IS NOT NULL AND status = 'completed'
            )
        `);
        
        // Get pending partner payments
        const [pendingPartnerPayments] = await db.execute(`
            SELECT COALESCE(SUM(pt.commission_amount), 0) as total
            FROM partner_transactions pt
            WHERE pt.status = 'pending'
        `);
        
        // Get total bookings count
        const [totalBookings] = await db.execute(`
            SELECT COUNT(*) as count
            FROM prevbookings
        `);
        
        // Get completed bookings count
        const [completedBookings] = await db.execute(`
            SELECT COUNT(*) as count
            FROM prevbookings 
            WHERE status = 'completed'
        `);
        
        // Get active vendors count
        const [activeVendors] = await db.execute(`
            SELECT COUNT(*) as count
            FROM vendors
        `);
        
        // Get active partners count
        const [activePartners] = await db.execute(`
            SELECT COUNT(*) as count
            FROM partners
        `);
        
        // Calculate remaining amount to be paid
        const remainingAmount = pendingVendorPayments[0].total + pendingPartnerPayments[0].total;
        
        res.status(200).json({
            success: true,
            message: 'Admin dashboard data retrieved successfully',
            data: {
                total_revenue: totalRevenue[0].total,
                admin_commission: adminCommission,
                total_vendor_payments: totalVendorPayments[0].total,
                total_partner_payments: totalPartnerPayments[0].total,
                pending_vendor_payments: pendingVendorPayments[0].total,
                pending_partner_payments: pendingPartnerPayments[0].total,
                remaining_amount_to_pay: remainingAmount,
                total_bookings: totalBookings[0].count,
                completed_bookings: completedBookings[0].count,
                active_vendors: activeVendors[0].count,
                active_partners: activePartners[0].count
            }
        });
    } catch (error) {
        console.error('Error getting admin dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin dashboard data',
            error: error.message
        });
    }
};

// Get all pending vendor payments
const getPendingVendorPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const query = `
            SELECT 
                pb.id as booking_id,
                pb.pickup_location,
                pb.dropoff_location,
                pb.pickup_date,
                pb.price as amount,
                pb.created_at,
                v.id as vendor_id,
                v.name as vendor_name,
                v.email as vendor_email,
                v.phone as vendor_phone,
                u.name as customer_name,
                veh.model as vehicle_model
            FROM prevbookings pb
            LEFT JOIN vendors v ON pb.vendor_id = v.id
            LEFT JOIN users u ON pb.customer_id = u.id
            LEFT JOIN vehicles veh ON pb.vehicle_id = veh.id
            WHERE pb.status = 'completed' AND pb.vendor_id IS NOT NULL
            AND pb.id NOT IN (
                SELECT DISTINCT booking_id 
                FROM payments 
                WHERE vendor_id IS NOT NULL AND status = 'completed'
            )
            ORDER BY pb.created_at DESC
        `;
        
        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        const paginatedQuery = query + ` LIMIT ${pageLimit} OFFSET ${offset}`;
        
        const [payments] = await db.execute(paginatedQuery);
        
        // Count total pending payments
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM prevbookings pb
            WHERE pb.status = 'completed' AND pb.vendor_id IS NOT NULL
            AND pb.id NOT IN (
                SELECT DISTINCT booking_id 
                FROM payments 
                WHERE vendor_id IS NOT NULL AND status = 'completed'
            )
        `);
        const total = countResult[0].total;
        
        res.status(200).json({
            success: true,
            message: 'Pending vendor payments retrieved successfully',
            data: {
                payments,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting pending vendor payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending vendor payments',
            error: error.message
        });
    }
};

// Get all pending partner payments
const getPendingPartnerPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const query = `
            SELECT 
                pt.id as transaction_id,
                pt.commission_amount as amount,
                pt.created_at,
                p.id as partner_id,
                p.name as partner_name,
                p.email as partner_email,
                p.phone as partner_phone,
                p.company_name,
                pb.id as booking_id,
                pb.pickup_location,
                pb.dropoff_location,
                pb.pickup_date,
                pb.price as booking_amount,
                u.name as customer_name,
                v.model as vehicle_model
            FROM partner_transactions pt
            LEFT JOIN partners p ON pt.partner_id = p.id
            LEFT JOIN prevbookings pb ON pt.booking_id = pb.id
            LEFT JOIN users u ON pb.customer_id = u.id
            LEFT JOIN vehicles v ON pb.vehicle_id = v.id
            WHERE pt.status = 'pending'
            ORDER BY pt.created_at DESC
        `;
        
        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        const paginatedQuery = query + ` LIMIT ${pageLimit} OFFSET ${offset}`;
        
        const [payments] = await db.execute(paginatedQuery);
        
        // Count total pending payments
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM partner_transactions 
            WHERE status = 'pending'
        `);
        const total = countResult[0].total;
        
        res.status(200).json({
            success: true,
            message: 'Pending partner payments retrieved successfully',
            data: {
                payments,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting pending partner payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending partner payments',
            error: error.message
        });
    }
};

// Pay vendor for completed booking
const payVendor = async (req, res) => {
    try {
        const { booking_id, vendor_id, amount, payment_method = 'bank_transfer', notes } = req.body;
        
        if (!booking_id || !vendor_id || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID, vendor ID, and amount are required'
            });
        }
        
        // Verify the booking exists and is completed
        const [bookings] = await db.execute(`
            SELECT * FROM prevbookings 
            WHERE id = ? AND vendor_id = ? AND status = 'completed'
        `, [booking_id, vendor_id]);
        
        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Completed booking not found for this vendor'
            });
        }
        
        const booking = bookings[0];
        
        // Check if already paid
        const [existingPayments] = await db.execute(`
            SELECT * FROM payments 
            WHERE booking_id = ? AND vendor_id = ? AND status = 'completed'
        `, [booking_id, vendor_id]);
        
        if (existingPayments.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'This booking has already been paid'
            });
        }
        
        // Create payment record
        const paymentId = generatePaymentId();
        await db.execute(`
            INSERT INTO payments (
                id, vendor_id, amount, status, type, created_at
            ) VALUES (?, ?, ?, 'completed', 'withdrawal', CURRENT_TIMESTAMP)
        `, [paymentId, vendor_id, amount]);
        
        // Update vendor's total earnings
        await db.execute(`
            UPDATE vendors 
            SET total_earnings = total_earnings + ?, amount = amount + ?
            WHERE id = ?
        `, [amount, amount, vendor_id]);
        
        res.status(200).json({
            success: true,
            message: 'Vendor payment completed successfully',
            data: {
                payment_id: paymentId,
                booking_id,
                vendor_id,
                amount,
                payment_method,
                notes
            }
        });
    } catch (error) {
        console.error('Error paying vendor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process vendor payment',
            error: error.message
        });
    }
};

// Pay partner commission
const payPartner = async (req, res) => {
    try {
        const { transaction_id, partner_id, amount, payment_method = 'bank_transfer', notes } = req.body;
        
        if (!transaction_id || !partner_id || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID, partner ID, and amount are required'
            });
        }
        
        // Verify the transaction exists and is pending
        const [transactions] = await db.execute(`
            SELECT * FROM partner_transactions 
            WHERE id = ? AND partner_id = ? AND status = 'pending'
        `, [transaction_id, partner_id]);
        
        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pending partner transaction not found'
            });
        }
        
        const transaction = transactions[0];
        
        // Update transaction status to completed
        await db.execute(`
            UPDATE partner_transactions 
            SET status = 'completed' 
            WHERE id = ?
        `, [transaction_id]);
        
        // Create payment record
        const paymentId = generatePaymentId();
        await db.execute(`
            INSERT INTO payments (
                id, partner_id, amount, status, type, created_at
            ) VALUES (?, ?, ?, 'completed', 'withdrawal', CURRENT_TIMESTAMP)
        `, [paymentId, partner_id, amount]);
        
        // Update partner's total earnings and wallet balance
        await db.execute(`
            UPDATE partners 
            SET total_earnings = total_earnings + ?, wallet_balance = wallet_balance + ?
            WHERE id = ?
        `, [amount, amount, partner_id]);
        
        res.status(200).json({
            success: true,
            message: 'Partner payment completed successfully',
            data: {
                payment_id: paymentId,
                transaction_id,
                partner_id,
                amount,
                payment_method,
                notes
            }
        });
    } catch (error) {
        console.error('Error paying partner:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process partner payment',
            error: error.message
        });
    }
};

// Get all payments made by admin
const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, start_date, end_date } = req.query;
        
        let query = `
            SELECT 
                p.id,
                p.vendor_id,
                p.partner_id,
                p.amount,
                p.status,
                p.type,
                p.created_at,
                v.name as vendor_name,
                v.email as vendor_email,
                pt.name as partner_name,
                pt.email as partner_email,
                pt.company_name
            FROM payments p
            LEFT JOIN vendors v ON p.vendor_id = v.id
            LEFT JOIN partners pt ON p.partner_id = pt.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (type) {
            query += ' AND p.type = ?';
            params.push(type);
        }
        
        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }
        
        if (start_date) {
            query += ' AND p.created_at >= ?';
            params.push(start_date);
        }
        
        if (end_date) {
            query += ' AND p.created_at <= ?';
            params.push(end_date);
        }
        
        query += ' ORDER BY p.created_at DESC';
        
        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;
        
        const [payments] = await db.execute(query, params);
        
        // Count total payments
        let countQuery = 'SELECT COUNT(*) as total FROM payments WHERE 1=1';
        const countParams = [];
        
        if (type) {
            countQuery += ' AND type = ?';
            countParams.push(type);
        }
        
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
            message: 'All payments retrieved successfully',
            data: {
                payments,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting all payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve payments',
            error: error.message
        });
    }
};

// Get financial analytics
const getFinancialAnalytics = async (req, res) => {
    try {
        const { period = 'month' } = req.query; // month, week, year
        
        let dateFilter = '';
        if (period === 'week') {
            dateFilter = ' AND pb.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        } else if (period === 'month') {
            dateFilter = ' AND pb.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        } else if (period === 'year') {
            dateFilter = ' AND pb.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        }
        
        // Get revenue breakdown
        const [revenueBreakdown] = await db.execute(`
            SELECT 
                COALESCE(SUM(pb.price), 0) as total_revenue,
                COALESCE(SUM(pb.price * 0.1), 0) as admin_commission,
                COALESCE(SUM(pb.price * 0.9), 0) as vendor_earnings,
                COALESCE(SUM(pt.commission_amount), 0) as partner_commissions
            FROM prevbookings pb
            LEFT JOIN partner_transactions pt ON pb.id = pt.booking_id
            WHERE pb.status = 'completed'${dateFilter}
        `);
        
        // Get monthly revenue trend (last 12 months)
        const [monthlyTrend] = await db.execute(`
            SELECT 
                DATE_FORMAT(pb.created_at, '%Y-%m') as month,
                COUNT(*) as bookings_count,
                COALESCE(SUM(pb.price), 0) as revenue,
                COALESCE(SUM(pb.price * 0.1), 0) as admin_commission,
                COALESCE(SUM(pb.price * 0.9), 0) as vendor_earnings
            FROM prevbookings pb
            WHERE pb.status = 'completed' AND pb.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(pb.created_at, '%Y-%m')
            ORDER BY month DESC
        `);
        
        // Get top vendors by earnings
        const [topVendors] = await db.execute(`
            SELECT 
                v.id,
                v.name,
                v.email,
                COUNT(pb.id) as completed_rides,
                COALESCE(SUM(pb.price), 0) as total_earnings,
                COALESCE(SUM(pb.price * 0.9), 0) as vendor_share
            FROM vendors v
            LEFT JOIN prevbookings pb ON v.id = pb.vendor_id AND pb.status = 'completed'${dateFilter}
            GROUP BY v.id, v.name, v.email
            ORDER BY total_earnings DESC
            LIMIT 10
        `);
        
        // Get top partners by commission
        const [topPartners] = await db.execute(`
            SELECT 
                p.id,
                p.name,
                p.email,
                p.company_name,
                COUNT(pt.id) as referrals_count,
                COALESCE(SUM(pt.commission_amount), 0) as total_commission
            FROM partners p
            LEFT JOIN partner_transactions pt ON p.id = pt.partner_id AND pt.status = 'completed'${dateFilter}
            GROUP BY p.id, p.name, p.email, p.company_name
            ORDER BY total_commission DESC
            LIMIT 10
        `);
        
        res.status(200).json({
            success: true,
            message: 'Financial analytics retrieved successfully',
            data: {
                period,
                revenue_breakdown: revenueBreakdown[0],
                monthly_trend: monthlyTrend,
                top_vendors: topVendors,
                top_partners: topPartners
            }
        });
    } catch (error) {
        console.error('Error getting financial analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve financial analytics',
            error: error.message
        });
    }
};

module.exports = {
    getAdminDashboard,
    getPendingVendorPayments,
    getPendingPartnerPayments,
    payVendor,
    payPartner,
    getAllPayments,
    getFinancialAnalytics
};
