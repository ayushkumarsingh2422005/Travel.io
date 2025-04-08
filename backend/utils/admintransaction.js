const db = require("../config/db");
const crypto = require("crypto");

const verifyWebhookSignature = (req, secret) => {
    const receivedSignature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

    return receivedSignature === expectedSignature;
};

const handlePaymentWebhook = async (req, res) => {
    const secret = "your_razorpay_webhook_secret"; // Replace with actual secret

    if (!verifyWebhookSignature(req, secret)) {
        return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    const paymentId = req.body.payload.payment.entity.id;
    const status = req.body.payload.payment.entity.status;

    if (event === "payment.captured" && status === "captured") {
        await updatePaymentStatus(paymentId, "completed");
    }

    res.status(200).json({ success: true });
};



const updatePaymentStatus = async (paymentId, newStatus) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Update payment status only (Trigger will handle wallet updates)
        await connection.execute(
            "UPDATE payments SET status = ? WHERE id = ?",
            [newStatus, paymentId]
        );

        await connection.commit();
        console.log("✅ Payment updated successfully");
    } catch (error) {
        await connection.rollback();
        console.error("❌ Transaction failed:", error.message);
    } finally {
        connection.release();
    }
};

module.exports = { handlePaymentWebhook };
