const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Generate unique payment ID
const generatePaymentId = () => {
    return crypto.createHash('sha256').update(Date.now().toString() + Math.random().toString()).digest('hex');
};

// Create payment order for booking
const createPaymentOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        let {
            cab_category_id,
            partner_id,
            pickup_location,
            dropoff_location,
            pickup_date,
            drop_date,
            path,
            distance,
            amount // Total booking price from frontend
        } = req.body;

        if (!drop_date) {
            drop_date = pickup_date;
        }

        // Validate required fields
        if (!cab_category_id || !pickup_location || !dropoff_location || !drop_date || !pickup_date || !path || !distance || amount === undefined || amount === null) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: cab_category_id, pickup_location, dropoff_location, pickup_date, drop_date, path, distance, amount'
            });
        }

        // Get cab category details 
        const [cabCategories] = await db.execute(`
            SELECT * FROM cab_categories
            WHERE id = ? AND is_active = 1
        `, [cab_category_id]);

        if (cabCategories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cab category not found or not available'
            });
        }

        const cabCategory = cabCategories[0];

        // Calculate platform charges, GST, total upfront payment, and remaining amount
        const totalBookingPrice = parseFloat(amount);
        const platformChargesRate = 0.10; // 10%
        const gstRate = 0.05; // 5%

        const platformCharges = totalBookingPrice * platformChargesRate;
        const gstAmount = platformCharges * gstRate;

        // Rounding to match frontend display
        const totalUpfrontPayment = Math.round(platformCharges + gstAmount);

        // Remaining amount logic matched to frontend: Total - PlatformCharges (Driver gets remaining 90%)
        // GST is additional tax on platform fee, collected in upfront payment.
        const remainingAmount = Math.round(totalBookingPrice - platformCharges);

        const amountInPaise = Math.round(totalUpfrontPayment * 100); // Razorpay expects amount in paise, rounded to nearest integer

        // Generate unique payment ID
        const paymentId = generatePaymentId();

        // Create Razorpay order
        const orderOptions = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `booking_${paymentId.substring(0, 32)}`,
            notes: {
                customer_id: userId,
                cab_category_id: cab_category_id,
                partner_id: partner_id || null,
                pickup_location,
                dropoff_location,
                pickup_date,
                drop_date,
                path,
                distance: distance.toString(),
                amount: totalUpfrontPayment  // amount paid in rupees
            }
        };

        const razorpayOrder = await razorpay.orders.create(orderOptions);

        // Store payment order details in database
        await db.execute(`
            INSERT INTO transactions (
                id, customer_id, vendor_id, booking_id, partner_id, payment_id,
                amount, status, razorpay_order_id, payment_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
        `, [
            paymentId,
            userId,
            null, // vendor_id will be set when vendor accepts the booking
            null, // booking_id will be set after successful payment
            partner_id || null,
            razorpayOrder.id, // Reverting this to razorpayOrder.id as payment_id cannot be null
            totalUpfrontPayment,
            razorpayOrder.id,
            JSON.stringify({
                cab_category_id,
                pickup_location,
                dropoff_location,
                pickup_date,
                drop_date,
                path,
                distance,
                amount: remainingAmount,  // remining amount to be paid to vendor
                cab_category_name: cabCategory.segment,
                add_ons: req.body.add_ons || [] // captured from request
            })
        ]);

        await db.execute(`
            UPDATE transactions
            SET id = ?
            WHERE payment_id = ?
        `, [paymentId, razorpayOrder.id]);

        res.status(200).json({
            success: true,
            message: 'Payment order created successfully',
            data: {
                order_id: razorpayOrder.id,
                amount: totalUpfrontPayment, // currently paid amount to the Travel.io
                currency: 'INR',
                payment_id: paymentId,
                cab_category_details: {
                    id: cabCategory.id,
                    category: cabCategory.segment,
                    price_per_km: cabCategory.price_per_km,
                    min_seats: cabCategory.min_seats,
                    max_seats: cabCategory.max_seats
                },
                booking_details: {
                    pickup_location,
                    dropoff_location,
                    pickup_date,
                    drop_date,
                    distance,
                    remainingAmount // remaining amount to vendor 
                }
            }
        });

    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

// Verify payment and create booking
const verifyPaymentAndCreateBooking = async (req, res) => {
    console.log('--- verifyPaymentAndCreateBooking: START ---');
    try {
        const userId = req.user.id;
        const { payment_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        console.log('verifyPaymentAndCreateBooking: Request Body:', { payment_id, razorpay_order_id, razorpay_payment_id, razorpay_signature });

        if (!payment_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.log('verifyPaymentAndCreateBooking: Missing payment verification details.');
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification details'
            });
        }

        // Get transaction details
        const [transactions] = await db.execute(`
            SELECT * FROM transactions 
            WHERE id = ? AND customer_id = ? AND status = 'pending'
        `, [payment_id, userId]);
        console.log('verifyPaymentAndCreateBooking: Fetched transaction:', transactions[0]);

        if (transactions.length === 0) {
            console.log('verifyPaymentAndCreateBooking: Transaction not found or already processed.');
            return res.status(404).json({
                success: false,
                message: 'Payment order not found or already processed'
            });
        }

        const transaction = transactions[0];
        const paymentData = JSON.parse(transaction.payment_data);
        console.log('verifyPaymentAndCreateBooking: Payment Data:', paymentData);

        // Verify Razorpay signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        console.log('verifyPaymentAndCreateBooking: Verifying signature...');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        console.log('verifyPaymentAndCreateBooking: Expected Signature:', expectedSignature);
        console.log('verifyPaymentAndCreateBooking: Received Signature:', razorpay_signature);


        if (expectedSignature !== razorpay_signature) {
            console.log('verifyPaymentAndCreateBooking: Invalid payment signature!');
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
        console.log('verifyPaymentAndCreateBooking: Signature verified successfully.');

        // Start database transaction
        console.log('verifyPaymentAndCreateBooking: Starting database transaction...');
        // await db.beginTransaction();
        console.log('verifyPaymentAndCreateBooking: Database transaction started.');

        try {
            // Update transaction status
            await db.execute(`
                UPDATE transactions 
                SET status = 'success', razorpay_payment_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [razorpay_payment_id, payment_id]);
            console.log('verifyPaymentAndCreateBooking: Transaction status updated to success.');

            // Create booking with NULL vendor, driver, and vehicle (to be assigned by vendor)
            const bookingId = generatePaymentId(); // Reuse the function for booking ID
            const bookingOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit OTP

            // Convert ISO datetime to MySQL datetime format
            const convertToMySQLDateTime = (isoDateString) => {
                if (!isoDateString) return null;
                const date = new Date(isoDateString);
                return date.toISOString().slice(0, 19).replace('T', ' ');
            };

            const mysqlPickupDate = convertToMySQLDateTime(paymentData.pickup_date);
            const mysqlDropDate = convertToMySQLDateTime(paymentData.drop_date);

            console.log('verifyPaymentAndCreateBooking: Creating booking with ID:', bookingId);
            await db.execute(`
                INSERT INTO bookings (
                     id, customer_id, vehicle_id, driver_id, vendor_id, partner_id, cab_category_id,
                    pickup_location, dropoff_location, pickup_date, drop_date,
                    price, path, distance, status, booking_otp, add_ons_details
                ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?, ?)
            `, [
                bookingId,
                userId,
                null, // vehicle_id - will be assigned when vendor accepts
                null, // driver_id - will be assigned when vendor accepts
                null, // vendor_id - will be assigned when vendor accepts
                transaction.partner_id,
                paymentData.cab_category_id,
                paymentData.pickup_location,
                paymentData.dropoff_location,
                mysqlPickupDate,
                mysqlDropDate,
                paymentData.amount, // the remaining amount to be paid to vendor
                paymentData.path,
                paymentData.distance,
                bookingOtp,
                JSON.stringify(paymentData.add_ons || [])
            ]);
            console.log('verifyPaymentAndCreateBooking: Booking created successfully with NULL vendor/driver/vehicle.');

            // Update transaction with booking_id
            await db.execute(`
                UPDATE transactions 
                SET booking_id = ? 
                WHERE id = ?
            `, [bookingId, payment_id]);
            console.log('verifyPaymentAndCreateBooking: Transaction updated with booking_id.');


            // updates will be needed in the partner thing later on below

            // If partner is involved, create partner transaction
            if (transaction.partner_id) {
                console.log('verifyPaymentAndCreateBooking: Partner ID found, creating partner transaction.');
                const commissionRate = 5.00; // 5% commission
                const commissionAmount = Math.round((transaction.amount * commissionRate) / 100);

                await db.execute(`
                    INSERT INTO partner_transactions (
                        id, partner_id, booking_id, commission_amount, status
                    ) VALUES (?, ?, ?, ?, 'pending')
                `, [generatePaymentId(), transaction.partner_id, bookingId, commissionAmount]);
                console.log('verifyPaymentAndCreateBooking: Partner transaction created.');
            }

            // await db.commit();
            console.log('verifyPaymentAndCreateBooking: Database transaction committed.');

            // Get the created booking with related data
            const [newBookings] = await db.execute(`
                SELECT 
                    b.*,
                    u.name as customer_name,
                    u.phone as customer_phone,
                    v.model as vehicle_model,
                    v.registration_no as vehicle_registration,
                    v.no_of_seats,
                    ven.name as vendor_name,
                    ven.phone as vendor_phone,
                    p.name as partner_name,
                    cc.segment as cab_category_name,
                    cc.price_per_km as cab_category_price_per_km
                FROM bookings b
                LEFT JOIN users u ON b.customer_id = u.id
                LEFT JOIN vehicles v ON b.vehicle_id = v.id
                LEFT JOIN vendors ven ON b.vendor_id = ven.id
                LEFT JOIN users p ON b.partner_id = p.id
                LEFT JOIN cab_categories cc ON b.cab_category_id = cc.id
                WHERE b.id = ?
            `, [bookingId]);
            console.log('verifyPaymentAndCreateBooking: Fetched new booking details:', newBookings[0]);

            res.status(201).json({
                success: true,
                message: 'Payment verified and booking created successfully',
                data: {
                    booking: newBookings[0],
                    payment: {
                        payment_id: payment_id,
                        razorpay_payment_id: razorpay_payment_id,
                        amount: transaction.amount,
                        status: 'success'
                    }
                }
            });
            console.log('--- verifyPaymentAndCreateBooking: END (Success) ---');

        } catch (error) {
            // await db.rollback();
            console.error('verifyPaymentAndCreateBooking: Database transaction rolled back due to error:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
        console.log('--- verifyPaymentAndCreateBooking: END (Failure) ---');
    }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { payment_id } = req.params;

        const [transactions] = await db.execute(`
            SELECT 
                t.*,
                b.id as booking_id,
                b.status as booking_status,
                v.model as vehicle_model,
                ven.name as vendor_name
            FROM transactions t
            LEFT JOIN bookings b ON t.booking_id = b.id
            LEFT JOIN vehicles v ON t.payment_data LIKE CONCAT('%"vehicle_id":"', v.id, '"%')
            LEFT JOIN vendors ven ON t.vendor_id = ven.id
            WHERE t.id = ? AND t.customer_id = ?
        `, [payment_id, userId]);

        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const transaction = transactions[0];
        const paymentData = transaction.payment_data ? JSON.parse(transaction.payment_data) : null;

        res.status(200).json({
            success: true,
            message: 'Payment status retrieved successfully',
            data: {
                payment_id: transaction.id,
                status: transaction.status,
                amount: transaction.amount,
                razorpay_order_id: transaction.razorpay_order_id,
                razorpay_payment_id: transaction.razorpay_payment_id,
                booking_id: transaction.booking_id,
                booking_status: transaction.booking_status,
                vehicle_model: transaction.vehicle_model,
                vendor_name: transaction.vendor_name,
                booking_details: paymentData,
                created_at: transaction.created_at
            }
        });

    } catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: error.message
        });
    }
};

// Get user's payment history
const getUserPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        let query = `
            SELECT 
                t.*,
                b.id as booking_id,
                b.status as booking_status,
                b.pickup_location,
                b.dropoff_location,
                b.pickup_date,
                b.drop_date,
                v.model as vehicle_model,
                v.registration_no as vehicle_registration,
                ven.name as vendor_name
            FROM transactions t
            LEFT JOIN bookings b ON t.booking_id = b.id
            LEFT JOIN vehicles v ON t.payment_data LIKE CONCAT('%"vehicle_id":"', v.id, '"%')
            LEFT JOIN vendors ven ON t.vendor_id = ven.id
            WHERE t.customer_id = ?
        `;

        const params = [userId];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        query += ' ORDER BY t.created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const pageLimit = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * pageLimit;
        query += ` LIMIT ${pageLimit} OFFSET ${offset}`;

        const [transactions] = await db.execute(query, params);

        // Count total transactions for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE customer_id = ?';
        const countParams = [userId];
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            message: 'Payment history retrieved successfully',
            data: {
                transactions,
                pagination: {
                    current_page: pageNum,
                    per_page: pageLimit,
                    total,
                    total_pages: Math.ceil(total / pageLimit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment history',
            error: error.message
        });
    }
};

// Razorpay webhook handler
const handleRazorpayWebhook = async (req, res) => {
    console.log('--- handleRazorpayWebhook: START ---');
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);
        console.log('handleRazorpayWebhook: Received webhook. Event:', req.body.event);
        console.log('handleRazorpayWebhook: Signature:', signature);
        console.log('handleRazorpayWebhook: Body:', body);

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');
        console.log('handleRazorpayWebhook: Expected Signature:', expectedSignature);


        if (signature !== expectedSignature) {
            console.log('handleRazorpayWebhook: Invalid signature!');
            return res.status(400).json({ error: 'Invalid signature' });
        }
        console.log('handleRazorpayWebhook: Signature verified successfully.');

        const event = req.body.event;
        const payment = req.body.payload.payment.entity;

        if (event === 'payment.captured') {
            console.log('handleRazorpayWebhook: Payment captured event. Updating transaction status.');
            // Update transaction status
            await db.execute(`
                UPDATE transactions 
                SET status = 'success', razorpay_payment_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE razorpay_order_id = ?
            `, [payment.id, payment.order_id]);
            console.log('handleRazorpayWebhook: Transaction status updated to success for order:', payment.order_id);
        } else if (event === 'payment.failed') {
            console.log('handleRazorpayWebhook: Payment failed event. Updating transaction status.');
            // Update transaction status to failed
            await db.execute(`
                UPDATE transactions 
                SET status = 'failed', updated_at = CURRENT_TIMESTAMP
                WHERE razorpay_order_id = ?
            `, [payment.order_id]);
            console.log('handleRazorpayWebhook: Transaction status updated to failed for order:', payment.order_id);
        } else {
            console.log('handleRazorpayWebhook: Unhandled event type:', event);
        }

        res.status(200).json({ success: true });
        console.log('--- handleRazorpayWebhook: END (Success) ---');

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
        console.log('--- handleRazorpayWebhook: END (Failure) ---');
    }
};

module.exports = {
    createPaymentOrder,
    verifyPaymentAndCreateBooking,
    getPaymentStatus,
    getUserPaymentHistory,
    handleRazorpayWebhook
};