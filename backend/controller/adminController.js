const db = require('../config/db');
const crypto = require('crypto');

// Generate unique payment ID
const generatePaymentId = () => {
    return crypto.createHash('sha256').update(Date.now().toString() + Math.random().toString()).digest('hex');
};

const formatToMySQLDateTime = (dateInput) => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return null;
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
                pb.pickup_date as created_at,
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
            ORDER BY pb.pickup_date DESC
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
                id, vendor_id, booking_id, amount, status, type, created_at
            ) VALUES (?, ?, ?, ?, 'completed', 'withdrawal', CURRENT_TIMESTAMP)
        `, [paymentId, vendor_id, booking_id, amount]);

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

        let bookingDateFilter = '';
        let partnerTxnDateFilter = '';
        if (period === 'week') {
            bookingDateFilter = ' AND pb.pickup_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
            partnerTxnDateFilter = ' AND pt.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        } else if (period === 'month') {
            bookingDateFilter = ' AND pb.pickup_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
            partnerTxnDateFilter = ' AND pt.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        } else if (period === 'year') {
            bookingDateFilter = ' AND pb.pickup_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
            partnerTxnDateFilter = ' AND pt.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
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
            WHERE pb.status = 'completed'${bookingDateFilter}
        `);

        // Get monthly revenue trend (last 12 months)
        const [monthlyTrend] = await db.execute(`
            SELECT 
                DATE_FORMAT(pb.pickup_date, '%Y-%m') as month,
                COUNT(*) as bookings_count,
                COALESCE(SUM(pb.price), 0) as revenue,
                COALESCE(SUM(pb.price * 0.1), 0) as admin_commission,
                COALESCE(SUM(pb.price * 0.9), 0) as vendor_earnings
            FROM prevbookings pb
            WHERE pb.status = 'completed' AND pb.pickup_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(pb.pickup_date, '%Y-%m')
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
            LEFT JOIN prevbookings pb ON v.id = pb.vendor_id AND pb.status = 'completed'${bookingDateFilter}
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
            LEFT JOIN partner_transactions pt ON p.id = pt.partner_id AND pt.status = 'completed'${partnerTxnDateFilter}
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

// ==================== VENDOR MANAGEMENT ====================

// Get all vendors with their details
const getAllVendors = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        let query = `
            SELECT 
                v.id,
                v.name,
                v.email,
                v.phone,
                v.is_active,
                v.is_profile_completed,
                v.is_phone_verified,
                v.is_email_verified,
                v.star_rating,
                v.total_earnings,
                v.amount,
                v.penalty_reason,
                v.penalty_amount,
                v.total_penalties,
                v.suspended_by_admin,
                v.suspension_reason,
                v.suspension_date,
                v.suspension_until,
                v.created_at,
                COUNT(DISTINCT veh.id) as total_vehicles,
                COUNT(DISTINCT d.id) as total_drivers,
                COUNT(DISTINCT pb.id) as total_bookings,
                COUNT(DISTINCT CASE WHEN pb.status = 'completed' THEN pb.id END) as completed_bookings
            FROM vendors v
            LEFT JOIN vehicles veh ON v.id = veh.vendor_id
            LEFT JOIN drivers d ON v.id = d.vendor_id
            LEFT JOIN prevbookings pb ON v.id = pb.vendor_id
            WHERE 1=1
        `;

        const params = [];

        if (status === 'active') {
            query += ' AND v.is_active = 1';
        } else if (status === 'inactive') {
            query += ' AND v.is_active = 0';
        } else if (status === 'suspended') {
            query += ' AND v.suspended_by_admin = 1';
        }

        if (search) {
            query += ' AND (v.name LIKE ? OR v.email LIKE ? OR v.phone LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ' GROUP BY v.id ORDER BY v.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [vendors] = await db.execute(query, params);

        // Count total vendors
        let countQuery = 'SELECT COUNT(DISTINCT v.id) as total FROM vendors v WHERE 1=1';
        const countParams = [];

        if (status === 'active') {
            countQuery += ' AND v.is_active = 1';
        } else if (status === 'inactive') {
            countQuery += ' AND v.is_active = 0';
        } else if (status === 'suspended') {
            countQuery += ' AND v.suspended_by_admin = 1';
        }

        if (search) {
            countQuery += ' AND (v.name LIKE ? OR v.email LIKE ? OR v.phone LIKE ?)';
            const searchParam = `%${search}%`;
            countParams.push(searchParam, searchParam, searchParam);
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Vendors retrieved successfully',
            data: {
                vendors,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting all vendors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vendors',
            error: error.message
        });
    }
};

// Get vendor details with bookings
const getVendorDetails = async (req, res) => {
    try {
        const { vendorId } = req.params;

        // Get vendor details
        const [vendors] = await db.execute(`
            SELECT 
                v.*,
                COUNT(DISTINCT veh.id) as total_vehicles,
                COUNT(DISTINCT d.id) as total_drivers,
                COUNT(DISTINCT pb.id) as total_bookings,
                COUNT(DISTINCT CASE WHEN pb.status = 'completed' THEN pb.id END) as completed_bookings,
                COALESCE(SUM(CASE WHEN pb.status = 'completed' THEN pb.price ELSE 0 END), 0) as total_booking_revenue
            FROM vendors v
            LEFT JOIN vehicles veh ON v.id = veh.vendor_id
            LEFT JOIN drivers d ON v.id = d.vendor_id
            LEFT JOIN prevbookings pb ON v.id = pb.vendor_id
            WHERE v.id = ?
            GROUP BY v.id
        `, [vendorId]);

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        const vendor = vendors[0];

        // Get recent bookings for this vendor
        const [bookings] = await db.execute(`
            SELECT 
                pb.*,
                u.name as customer_name,
                u.email as customer_email,
                u.phone as customer_phone,
                veh.model as vehicle_model,
                veh.registration_no as vehicle_registration,
                d.name as driver_name,
                d.phone as driver_phone
            FROM prevbookings pb
            LEFT JOIN users u ON pb.customer_id = u.id
            LEFT JOIN vehicles veh ON pb.vehicle_id = veh.id
            LEFT JOIN drivers d ON pb.driver_id = d.id
            WHERE pb.vendor_id = ?
            ORDER BY pb.pickup_date DESC
            LIMIT 20
        `, [vendorId]);

        // Get vehicles for this vendor
        const [vehicles] = await db.execute(`
            SELECT id, model, registration_no, is_active, per_km_charge, no_of_seats
            FROM vehicles
            WHERE vendor_id = ?
            ORDER BY model ASC
        `, [vendorId]);

        // Get drivers for this vendor
        const [drivers] = await db.execute(`
            SELECT id, name, phone, dl_number, is_active
            FROM drivers
            WHERE vendor_id = ?
            ORDER BY name ASC
        `, [vendorId]);

        res.status(200).json({
            success: true,
            message: 'Vendor details retrieved successfully',
            data: {
                vendor,
                bookings,
                vehicles,
                drivers
            }
        });
    } catch (error) {
        console.error('Error getting vendor details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vendor details',
            error: error.message
        });
    }
};

// Activate or deactivate vendor
const toggleVendorStatus = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_active must be a boolean value'
            });
        }

        // Verify vendor exists
        const [vendors] = await db.execute(
            'SELECT id, name FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Update vendor status
        await db.execute(
            'UPDATE vendors SET is_active = ? WHERE id = ?',
            [is_active ? 1 : 0, vendorId]
        );

        // If deactivating vendor, also deactivate all their drivers
        if (!is_active) {
            await db.execute(
                'UPDATE drivers SET is_active = 0 WHERE vendor_id = ?',
                [vendorId]
            );
        }

        res.status(200).json({
            success: true,
            message: `Vendor ${is_active ? 'activated' : 'deactivated'} successfully`,
            data: {
                vendor_id: vendorId,
                is_active
            }
        });
    } catch (error) {
        console.error('Error toggling vendor status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vendor status',
            error: error.message
        });
    }
};

// Apply penalty to vendor
const applyVendorPenalty = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { penalty_amount, penalty_reason } = req.body || {};

        const parsedPenaltyAmount = Number(penalty_amount);
        if (!Number.isFinite(parsedPenaltyAmount) || parsedPenaltyAmount <= 0 || !penalty_reason || penalty_reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid penalty amount and reason are required'
            });
        }

        // Verify vendor exists
        const [vendors] = await db.execute(
            'SELECT id, name, amount FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        const vendor = vendors[0];

        // Deduct penalty from vendor's amount
        const newAmount = (vendor.amount || 0) - parsedPenaltyAmount;

        // Update vendor with penalty details (without deducting balance yet)
        await db.execute(`
            UPDATE vendors 
            SET penalty_reason = ?,
                penalty_amount = ?,
                last_penalty_date = NOW(),
                total_penalties = total_penalties + 1
            WHERE id = ?
        `, [penalty_reason.trim(), parsedPenaltyAmount, vendorId]);

        // Create penalty payment record as PENDING
        const paymentId = generatePaymentId();
        await db.execute(`
            INSERT INTO payments (
                id, vendor_id, amount, status, type, description, created_at
            ) VALUES (?, ?, ?, 'pending', 'penalty', ?, NOW())
        `, [paymentId, vendorId, parsedPenaltyAmount, penalty_reason.trim()]);

        res.status(200).json({
            success: true,
            message: 'Penalty applied as pending. It will be deducted after review or dispute resolution.',
            data: {
                vendor_id: vendorId,
                penalty_amount: parsedPenaltyAmount,
                penalty_reason: penalty_reason.trim(),
                payment_id: paymentId
            }
        });
    } catch (error) {
        console.error('Error applying penalty:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply penalty',
            error: error.message
        });
    }
};

// Get all penalty disputes for admin
const getPenaltyDisputes = async (req, res) => {
    try {
        const [disputes] = await db.execute(`
            SELECT 
                pd.id, 
                pd.payment_id, 
                pd.vendor_id, 
                pd.reason, 
                pd.status, 
                pd.admin_comment, 
                pd.created_at,
                v.name as vendor_name, 
                p.amount as penalty_amount,
                p.description as penalty_description
            FROM penalty_disputes pd
            JOIN vendors v ON pd.vendor_id = v.id
            JOIN payments p ON pd.payment_id = p.id
            ORDER BY pd.created_at DESC
        `);
        
        console.log(`Fetched ${disputes.length} disputes`);

        res.status(200).json({
            success: true,
            disputes
        });
    } catch (error) {
        console.error('Error fetching disputes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Resolve or Reject a dispute
const resolvePenaltyDispute = async (req, res) => {
    try {
        const { disputeId, action, adminComment } = req.body; // action: 'resolved' (cut money) or 'rejected' (cancel penalty)

        if (!disputeId || !action) {
            return res.status(400).json({ success: false, message: 'Dispute ID and action are required' });
        }

        // Get dispute details
        const [disputes] = await db.execute(`
            SELECT pd.*, p.amount as penalty_amount, p.description as penalty_description
            FROM penalty_disputes pd
            JOIN payments p ON pd.payment_id = p.id
            WHERE pd.id = ?
        `, [disputeId]);

        if (disputes.length === 0) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }

        const dispute = disputes[0];

        if (dispute.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Dispute is already processed' });
        }

        if (action === 'resolved') {
            // DEDUCT MONEY FROM VENDOR WALLET
            const [vendors] = await db.execute('SELECT amount FROM vendors WHERE id = ?', [dispute.vendor_id]);
            const currentAmount = vendors[0].amount || 0;
            const newAmount = currentAmount - dispute.penalty_amount;

            await db.execute('UPDATE vendors SET amount = ? WHERE id = ?', [newAmount, dispute.vendor_id]);

            // Update payment status
            await db.execute('UPDATE payments SET status = "completed" WHERE id = ?', [dispute.payment_id]);

            // Log wallet transaction
            const txId = crypto.createHash('sha256').update(Date.now().toString() + Math.random().toString()).digest('hex');
            await db.execute(`
                INSERT INTO vendor_wallet_transactions 
                (id, vendor_id, amount, type, description, balance_after) 
                VALUES (?, ?, ?, 'debit', ?, ?)
            `, [txId, dispute.vendor_id, dispute.penalty_amount, `Penalty Resolved: ${dispute.penalty_description}`, newAmount]);

        } else if (action === 'rejected') {
            // CANCEL PENALTY
            await db.execute('UPDATE payments SET status = "failed" WHERE id = ?', [dispute.payment_id]);
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action' });
        }

        // Update dispute record
        await db.execute(`
            UPDATE penalty_disputes 
            SET status = ?, admin_comment = ? 
            WHERE id = ?
        `, [action, adminComment || null, disputeId]);

        res.status(200).json({ success: true, message: `Dispute ${action} successfully` });

    } catch (error) {
        console.error('Error resolving dispute:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Suspend or unsuspend vendor
const suspendVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { suspended, suspension_reason, suspension_until } = req.body || {};

        if (typeof suspended !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'suspended must be a boolean value'
            });
        }

        // Verify vendor exists
        const [vendors] = await db.execute(
            'SELECT id, name FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        if (suspended) {
            if (!suspension_reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Suspension reason is required'
                });
            }

            const suspensionUntilDate = formatToMySQLDateTime(suspension_until);
            if (suspension_until && !suspensionUntilDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid suspension_until datetime format'
                });
            }

            // Suspend vendor
            await db.execute(`
                UPDATE vendors 
                SET suspended_by_admin = 1,
                    suspension_reason = ?,
                    suspension_date = NOW(),
                    suspension_until = ?,
                    is_active = 0
                WHERE id = ?
            `, [suspension_reason.trim(), suspensionUntilDate, vendorId]);

            // Also deactivate all their drivers
            await db.execute(
                'UPDATE drivers SET is_active = 0 WHERE vendor_id = ?',
                [vendorId]
            );
        } else {
            // Unsuspend vendor
            await db.execute(`
                UPDATE vendors 
                SET suspended_by_admin = 0,
                    suspension_reason = NULL,
                    suspension_date = NULL,
                    suspension_until = NULL
                WHERE id = ?
            `, [vendorId]);
        }

        res.status(200).json({
            success: true,
            message: `Vendor ${suspended ? 'suspended' : 'unsuspended'} successfully`,
            data: {
                vendor_id: vendorId,
                suspended
            }
        });
    } catch (error) {
        console.error('Error suspending vendor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vendor suspension status',
            error: error.message
        });
    }
};

// Get vendor bookings
const getVendorBookings = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { page = 1, limit = 20, status, start_date, end_date } = req.query;

        let query = `
            SELECT 
                pb.*,
                u.name as customer_name,
                u.email as customer_email,
                u.phone as customer_phone,
                veh.model as vehicle_model,
                veh.registration_no as vehicle_registration,
                d.name as driver_name,
                d.phone as driver_phone
            FROM prevbookings pb
            LEFT JOIN users u ON pb.customer_id = u.id
            LEFT JOIN vehicles veh ON pb.vehicle_id = veh.id
            LEFT JOIN drivers d ON pb.driver_id = d.id
            WHERE pb.vendor_id = ?
        `;

        const params = [vendorId];

        if (status) {
            query += ' AND pb.status = ?';
            params.push(status);
        }

        if (start_date) {
            query += ' AND pb.pickup_date >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND pb.pickup_date <= ?';
            params.push(end_date);
        }

        query += ' ORDER BY pb.pickup_date DESC';

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

        // Count total bookings
        let countQuery = 'SELECT COUNT(*) as total FROM prevbookings WHERE vendor_id = ?';
        const countParams = [vendorId];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        if (start_date) {
            countQuery += ' AND pickup_date >= ?';
            countParams.push(start_date);
        }

        if (end_date) {
            countQuery += ' AND pickup_date <= ?';
            countParams.push(end_date);
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
            message: 'Failed to retrieve vendor bookings',
            error: error.message
        });
    }
};

// ==================== DRIVER MANAGEMENT ====================

// Get all drivers
const getAllDrivers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, vendor_id, search } = req.query;

        let query = `
            SELECT 
                d.*,
                v.name as vendor_name,
                v.email as vendor_email,
                v.phone as vendor_phone,
                veh.model as vehicle_model,
                veh.registration_no as vehicle_registration,
                COUNT(DISTINCT pb.id) as total_bookings
            FROM drivers d
            LEFT JOIN vendors v ON d.vendor_id = v.id
            LEFT JOIN vehicles veh ON d.vehicle_id = veh.id
            LEFT JOIN prevbookings pb ON d.id = pb.driver_id
            WHERE 1=1
        `;

        const params = [];

        if (status === 'active') {
            query += ' AND d.is_active = 1';
        } else if (status === 'inactive') {
            query += ' AND d.is_active = 0';
        }

        if (vendor_id) {
            query += ' AND d.vendor_id = ?';
            params.push(vendor_id);
        }

        if (search) {
            query += ' AND (d.name LIKE ? OR d.phone LIKE ? OR d.dl_number LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ' GROUP BY d.id ORDER BY d.name ASC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [drivers] = await db.execute(query, params);

        // Count total drivers
        let countQuery = 'SELECT COUNT(*) as total FROM drivers WHERE 1=1';
        const countParams = [];

        if (status === 'active') {
            countQuery += ' AND is_active = 1';
        } else if (status === 'inactive') {
            countQuery += ' AND is_active = 0';
        }

        if (vendor_id) {
            countQuery += ' AND vendor_id = ?';
            countParams.push(vendor_id);
        }

        if (search) {
            countQuery += ' AND (name LIKE ? OR phone LIKE ? OR dl_number LIKE ?)';
            const searchParam = `%${search}%`;
            countParams.push(searchParam, searchParam, searchParam);
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Drivers retrieved successfully',
            data: {
                drivers,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting all drivers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve drivers',
            error: error.message
        });
    }
};

// Activate or deactivate driver
const toggleDriverStatus = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_active must be a boolean value'
            });
        }

        // Verify driver exists
        const [drivers] = await db.execute(
            'SELECT id, name, vendor_id FROM drivers WHERE id = ?',
            [driverId]
        );

        if (drivers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        const driver = drivers[0];

        // Check if vendor is active/suspended
        if (is_active) {
            const [vendors] = await db.execute(
                'SELECT is_active, suspended_by_admin FROM vendors WHERE id = ?',
                [driver.vendor_id]
            );

            if (vendors.length > 0 && (!vendors[0].is_active || vendors[0].suspended_by_admin)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot activate driver because vendor is inactive or suspended'
                });
            }
        }

        // Update driver status
        // If activating, also set approval_status to 'approved'
        let query = 'UPDATE drivers SET is_active = ?';
        const params = [is_active ? 1 : 0];

        if (is_active) {
            query += ', approval_status = ?';
            params.push('approved');
        }

        query += ' WHERE id = ?';
        params.push(driverId);

        await db.execute(query, params);

        res.status(200).json({
            success: true,
            message: `Driver ${is_active ? 'activated and approved' : 'deactivated'} successfully`,
            data: {
                driver_id: driverId,
                is_active,
                approval_status: is_active ? 'approved' : undefined
            }
        });
    } catch (error) {
        console.error('Error toggling driver status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update driver status',
            error: error.message
        });
    }
};

// ==================== USER/CLIENT MANAGEMENT ====================

// Get all users/clients
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, verified } = req.query;

        let query = `
            SELECT 
                u.*,
                COUNT(DISTINCT pb.id) as total_bookings,
                COUNT(DISTINCT CASE WHEN pb.status = 'completed' THEN pb.id END) as completed_bookings,
                COALESCE(SUM(CASE WHEN pb.status = 'completed' THEN pb.price ELSE 0 END), 0) as total_spent
            FROM users u
            LEFT JOIN prevbookings pb ON u.id = pb.customer_id
            WHERE 1=1
        `;

        const params = [];

        if (verified === 'phone') {
            query += ' AND u.is_phone_verified = 1';
        } else if (verified === 'profile') {
            query += ' AND u.is_profile_completed = 1';
        }

        if (search) {
            query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ' GROUP BY u.id ORDER BY u.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [users] = await db.execute(query, params);

        // Count total users
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const countParams = [];

        if (verified === 'phone') {
            countQuery += ' AND is_phone_verified = 1';
        } else if (verified === 'profile') {
            countQuery += ' AND is_profile_completed = 1';
        }

        if (search) {
            countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchParam = `%${search}%`;
            countParams.push(searchParam, searchParam, searchParam);
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            error: error.message
        });
    }
};

// Get user details with bookings
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user details
        const [users] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Get user bookings
        const [bookings] = await db.execute(`
            SELECT 
                pb.*,
                v.name as vendor_name,
                veh.model as vehicle_model,
                veh.registration_no as vehicle_registration,
                d.name as driver_name
            FROM prevbookings pb
            LEFT JOIN vendors v ON pb.vendor_id = v.id
            LEFT JOIN vehicles veh ON pb.vehicle_id = veh.id
            LEFT JOIN drivers d ON pb.driver_id = d.id
            WHERE pb.customer_id = ?
            ORDER BY pb.pickup_date DESC
            LIMIT 50
        `, [userId]);

        res.status(200).json({
            success: true,
            message: 'User details retrieved successfully',
            data: {
                user,
                bookings
            }
        });
    } catch (error) {
        console.error('Error getting user details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user details',
            error: error.message
        });
    }
};

// Update user data (admin)
const updateUserData = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, phone, is_phone_verified, is_profile_completed } = req.body;

        // Verify user exists
        const [users] = await db.execute(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            params.push(email);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (is_phone_verified !== undefined) {
            updates.push('is_phone_verified = ?');
            params.push(is_phone_verified ? 1 : 0);
        }
        if (is_profile_completed !== undefined) {
            updates.push('is_profile_completed = ?');
            params.push(is_profile_completed ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(userId);
        await db.execute(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        res.status(200).json({
            success: true,
            message: 'User data updated successfully'
        });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user data',
            error: error.message
        });
    }
};

// Delete user (admin)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user exists
        const [users] = await db.execute(
            'SELECT id, name FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete user (cascade will handle related records)
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

// ==================== STATISTICS & ANALYTICS ====================

// Get annual bookings statistics
const getAnnualBookingsStats = async (req, res) => {
    try {
        const { year } = req.query;
        const currentYear = year || new Date().getFullYear();

        // Get monthly bookings breakdown for the year
        const [monthlyStats] = await db.execute(`
            SELECT 
                DATE_FORMAT(pickup_date, '%Y-%m') as month,
                DATE_FORMAT(pickup_date, '%M %Y') as month_name,
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) as total_revenue,
                COALESCE(AVG(CASE WHEN status = 'completed' THEN price ELSE NULL END), 0) as avg_booking_value
            FROM prevbookings
            WHERE YEAR(pickup_date) = ?
            GROUP BY DATE_FORMAT(pickup_date, '%Y-%m'), DATE_FORMAT(pickup_date, '%M %Y')
            ORDER BY month ASC
        `, [currentYear]);

        // Get yearly summary
        const [yearlySummary] = await db.execute(`
            SELECT 
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) as total_revenue,
                COALESCE(AVG(CASE WHEN status = 'completed' THEN price ELSE NULL END), 0) as avg_booking_value,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN price * 0.1 ELSE 0 END), 0) as admin_commission
            FROM prevbookings
            WHERE YEAR(pickup_date) = ?
        `, [currentYear]);

        // Get bookings by status
        const [statusBreakdown] = await db.execute(`
            SELECT 
                status,
                COUNT(*) as count,
                COALESCE(SUM(price), 0) as total_revenue
            FROM prevbookings
            WHERE YEAR(pickup_date) = ?
            GROUP BY status
        `, [currentYear]);

        res.status(200).json({
            success: true,
            message: 'Annual bookings statistics retrieved successfully',
            data: {
                year: currentYear,
                yearly_summary: yearlySummary[0],
                monthly_stats: monthlyStats,
                status_breakdown: statusBreakdown
            }
        });
    } catch (error) {
        console.error('Error getting annual bookings stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve annual bookings statistics',
            error: error.message
        });
    }
};

// Get website reach and leads statistics
const getWebsiteReachStats = async (req, res) => {
    try {
        const { period = 'year' } = req.query; // week, month, year

        let dateFilter = '';
        if (period === 'week') {
            dateFilter = ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        } else if (period === 'month') {
            dateFilter = ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        } else if (period === 'year') {
            dateFilter = ' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        }

        // Total users registered
        const [totalUsers] = await db.execute(`
            SELECT COUNT(*) as total FROM users
        `);

        // New users in period
        const [newUsers] = await db.execute(`
            SELECT COUNT(*) as total FROM users WHERE 1=1${dateFilter}
        `);

        // Verified users
        const [verifiedUsers] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_phone_verified = 1 THEN 1 END) as phone_verified,
                COUNT(CASE WHEN is_profile_completed = 1 THEN 1 END) as profile_completed
            FROM users
        `);

        // Total vendors
        const [totalVendors] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_vendors,
                COUNT(CASE WHEN suspended_by_admin = 1 THEN 1 END) as suspended_vendors,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) as new_this_month
            FROM vendors
        `);

        // Total drivers (driver table doesn't track timestamps, so new_this_month is approximated)
        const [totalDrivers] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_drivers,
                0 as new_this_month
            FROM drivers
        `);

        // Total partners
        const [totalPartners] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_phone_verified = 1 THEN 1 END) as verified_partners
            FROM partners
        `);

        // Leads (potential bookings that didn't complete)
        const [leads] = await db.execute(`
            SELECT 
                COUNT(DISTINCT customer_id) as unique_leads,
                COUNT(*) as total_leads
            FROM bookings
            WHERE status = 'waiting' OR status = 'cancelled'
        `);

        // User growth over time (monthly for the last 12 months)
        const [userGrowth] = await db.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                DATE_FORMAT(created_at, '%M %Y') as month_name,
                COUNT(*) as new_users
            FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%M %Y')
            ORDER BY month ASC
        `);

        res.status(200).json({
            success: true,
            message: 'Website reach statistics retrieved successfully',
            data: {
                period,
                total_users: totalUsers[0].total,
                new_users_in_period: newUsers[0].total,
                verified_users: verifiedUsers[0],
                vendors: totalVendors[0],
                drivers: totalDrivers[0],
                partners: totalPartners[0],
                leads: leads[0],
                user_growth: userGrowth
            }
        });
    } catch (error) {
        console.error('Error getting website reach stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve website reach statistics',
            error: error.message
        });
    }
};

// Get comprehensive admin statistics
const getAdminStats = async (req, res) => {
    try {
        // Overall statistics
        const [overallStats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM vendors) as total_vendors,
                (SELECT COUNT(*) FROM vendors WHERE is_active = 1) as active_vendors,
                (SELECT COUNT(*) FROM vendors WHERE suspended_by_admin = 1) as suspended_vendors,
                (SELECT COUNT(*) FROM drivers) as total_drivers,
                (SELECT COUNT(*) FROM drivers WHERE is_active = 1) as active_drivers,
                (SELECT COUNT(*) FROM partners) as total_partners,
                (SELECT COUNT(*) FROM vehicles) as total_vehicles,
                (SELECT COUNT(*) FROM vehicles WHERE is_active = 1) as active_vehicles,
                (SELECT COUNT(*) FROM prevbookings) as total_bookings,
                (SELECT COUNT(*) FROM prevbookings WHERE status = 'completed') as completed_bookings,
                (SELECT COUNT(*) FROM prevbookings WHERE status = 'cancelled') as cancelled_bookings,
                (SELECT COALESCE(SUM(price), 0) FROM prevbookings WHERE status = 'completed') as total_revenue,
                (SELECT COALESCE(SUM(price * 0.1), 0) FROM prevbookings WHERE status = 'completed') as admin_commission
        `);

        // Recent activity (last 7 days)
        const [recentActivity] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as new_users,
                (SELECT COUNT(*) FROM vendors WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as new_vendors,
                (SELECT COUNT(*) FROM prevbookings WHERE pickup_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as new_bookings,
                (SELECT COUNT(*) FROM prevbookings WHERE pickup_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 'completed') as completed_bookings,
                (SELECT COALESCE(SUM(price), 0) FROM prevbookings WHERE pickup_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 'completed') as revenue_7_days
        `);

        // Top performing vendors
        const [topVendors] = await db.execute(`
            SELECT 
                v.id,
                v.name,
                v.email,
                v.star_rating,
                COUNT(DISTINCT pb.id) as total_bookings,
                COUNT(DISTINCT CASE WHEN pb.status = 'completed' THEN pb.id END) as completed_bookings,
                COALESCE(SUM(CASE WHEN pb.status = 'completed' THEN pb.price ELSE 0 END), 0) as total_earnings
            FROM vendors v
            LEFT JOIN prevbookings pb ON v.id = pb.vendor_id
            GROUP BY v.id, v.name, v.email, v.star_rating
            ORDER BY total_earnings DESC
            LIMIT 10
        `);

        res.status(200).json({
            success: true,
            message: 'Admin statistics retrieved successfully',
            data: {
                overall: overallStats[0],
                recent_activity: recentActivity[0],
                top_vendors: topVendors
            }
        });
    } catch (error) {
        console.error('Error getting admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin statistics',
            error: error.message
        });
    }
};

// ==================== VEHICLE MANAGEMENT ====================

// Get all vehicles with filtering and pagination
const getAllVehicles = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, vendorId, search } = req.query;

        let query = `
            SELECT 
                v.id,
                v.vendor_id,
                v.model,
                v.registration_no,
                v.no_of_seats,
                v.per_km_charge,
                v.is_active,
                v.approval_status,
                v.category_id,
                v.rc_status,
                v.rc_reg_date,
                v.rc_expiry_date,
                v.rc_vehicle_insurance_upto,
                vendor.name as vendor_name,
                vendor.email as vendor_email,
                vendor.phone as vendor_phone,
                cat.segment as category_name
            FROM vehicles v
            LEFT JOIN vendors vendor ON v.vendor_id = vendor.id
            LEFT JOIN cab_categories cat ON v.category_id = cat.id
            WHERE 1=1
        `;

        const params = [];

        if (status === 'active') {
            query += ' AND v.is_active = 1';
        } else if (status === 'inactive') {
            query += ' AND v.is_active = 0';
        }

        if (vendorId) {
            query += ' AND v.vendor_id = ?';
            params.push(vendorId);
        }

        if (search) {
            query += ' AND (v.model LIKE ? OR v.registration_no LIKE ? OR vendor.name LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ' ORDER BY v.id DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [vehicles] = await db.execute(query, params);

        // Count total
        let countQuery = 'SELECT COUNT(*) as total FROM vehicles v WHERE 1=1';
        const countParams = [];

        if (status === 'active') {
            countQuery += ' AND v.is_active = 1';
        } else if (status === 'inactive') {
            countQuery += ' AND v.is_active = 0';
        }

        if (vendorId) {
            countQuery += ' AND v.vendor_id = ?';
            countParams.push(vendorId);
        }

        if (search) {
            countQuery += ' AND (v.model LIKE ? OR v.registration_no LIKE ?)';
            const searchParam = `%${search}%`;
            countParams.push(searchParam, searchParam);
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

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
        console.error('Error getting all vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vehicles',
            error: error.message
        });
    }
};

// Activate or deactivate vehicle (and approve)
const toggleVehicleStatus = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_active must be a boolean value'
            });
        }

        // Verify vehicle exists
        const [vehicles] = await db.execute(
            'SELECT id, model, vendor_id FROM vehicles WHERE id = ?',
            [vehicleId]
        );

        if (vehicles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        const vehicle = vehicles[0];

        // Check if vendor is active/suspended
        if (is_active) {
            const [vendors] = await db.execute(
                'SELECT is_active, suspended_by_admin FROM vendors WHERE id = ?',
                [vehicle.vendor_id]
            );

            if (vendors.length > 0 && (!vendors[0].is_active || vendors[0].suspended_by_admin)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot activate vehicle because vendor is inactive or suspended'
                });
            }
        }

        // Update vehicle status and approval_status if activating
        let query = 'UPDATE vehicles SET is_active = ?';
        const params = [is_active ? 1 : 0];

        if (is_active) {
            query += ', approval_status = ?';
            params.push('approved');
        }

        query += ' WHERE id = ?';
        params.push(vehicleId);

        await db.execute(query, params);

        res.status(200).json({
            success: true,
            message: `Vehicle ${is_active ? 'activated and approved' : 'deactivated'} successfully`,
            data: {
                vehicle_id: vehicleId,
                is_active,
                approval_status: is_active ? 'approved' : undefined
            }
        });
    } catch (error) {
        console.error('Error toggling vehicle status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vehicle status',
            error: error.message
        });
    }
};

// Get all bookings (active and history)
const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search, date } = req.query;

        let query = `
            SELECT 
                b.id, b.status, b.price, b.pickup_location, b.dropoff_location, b.pickup_date,
                u.name as customer_name,
                d.name as driver_name,
                v.model as vehicle_model,
                cc.segment as cab_category
            FROM (
                SELECT id, customer_id, driver_id, vehicle_id, cab_category_id, pickup_location, dropoff_location, pickup_date, price, status 
                FROM bookings
                UNION ALL
                SELECT id, customer_id, driver_id, vehicle_id, NULL as cab_category_id, pickup_location, dropoff_location, pickup_date, price, status 
                FROM prevbookings
            ) AS b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (date) {
            query += ' AND DATE(b.pickup_date) = ?';
            params.push(date);
        }

        if (search) {
            query += ' AND (u.name LIKE ? OR d.name LIKE ? OR b.pickup_location LIKE ? OR b.dropoff_location LIKE ? OR b.id LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }

        query += ' ORDER BY b.pickup_date DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [bookings] = await db.execute(query, params);

        // Count total
        let countQuery = `
            SELECT COUNT(*) as total
            FROM (
                SELECT id, customer_id, driver_id, pickup_location, dropoff_location, pickup_date, status FROM bookings
                UNION ALL
                SELECT id, customer_id, driver_id, pickup_location, dropoff_location, pickup_date, status FROM prevbookings
            ) AS b
            LEFT JOIN users u ON b.customer_id = u.id
            LEFT JOIN drivers d ON b.driver_id = d.id
            WHERE 1=1
        `;
        const countParams = [];

        if (status) {
            countQuery += ' AND b.status = ?';
            countParams.push(status);
        }
        if (date) {
            countQuery += ' AND DATE(b.pickup_date) = ?';
            countParams.push(date);
        }
        if (search) {
             countQuery += ' AND (u.name LIKE ? OR d.name LIKE ? OR b.pickup_location LIKE ? OR b.dropoff_location LIKE ? OR b.id LIKE ?)';
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
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
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
    }
};

module.exports = {
    getAdminDashboard,
    getPendingVendorPayments,
    getPendingPartnerPayments,
    payVendor,
    payPartner,
    getAllPayments,
    getFinancialAnalytics,
    // Vendor Management
    getAllVendors,
    getVendorDetails,
    toggleVendorStatus,
    applyVendorPenalty,
    getPenaltyDisputes,
    resolvePenaltyDispute,
    suspendVendor,
    getVendorBookings,
    // Driver Management
    getAllDrivers,
    toggleDriverStatus,
    // Vehicle Management
    getAllVehicles,
    toggleVehicleStatus,
    // User/Client Management
    getAllUsers,
    getUserDetails,
    updateUserData,
    deleteUser,
    // Statistics
    getAnnualBookingsStats,
    getWebsiteReachStats,
    getAdminStats,
    // Bookings
    getAllBookings
};
