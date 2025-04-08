const db = require("../config/db");
const crypto = require("crypto");

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

// Webhook Controller
exports.razorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const body = JSON.stringify(req.body);

        // Verify Razorpay Webhook Signature
        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_SECRET)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        // Extract payment details
        const payment = req.body.payload.payment.entity;
        const { amount, id: payment_id } = payment;
        const { customer_id, vendor_id } = req.body.payload.payment.entity.notes;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert transaction record (trigger will handle the rest)
            await connection.query(
                `INSERT INTO transactions (payment_id, amount, customer_id, vendor_id) VALUES (?, ?, ?, ?)`,
                [payment_id, amount, customer_id, vendor_id]
            );

            await connection.commit();
            connection.release();

            return res.json({ success: true });
        } catch (err) {
            await connection.rollback();
            connection.release();
            console.error("Error inserting transaction:", err);
            return res.status(500).json({ error: "Database insert failed" });
        }
    } catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
