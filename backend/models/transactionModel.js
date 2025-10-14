const db = require("../config/db");

const createTransactionTable = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
                customer_id CHAR(64) NOT NULL,
                vendor_id CHAR(64) NOT NULL,
                booking_id CHAR(64),
                partner_id CHAR(64),  
                payment_id CHAR(64) NOT NULL UNIQUE, 
                razorpay_order_id VARCHAR(255),
                razorpay_payment_id VARCHAR(255),
                amount BIGINT NOT NULL,  
                status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
                payment_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
                FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL,

                INDEX (customer_id),
                INDEX (vendor_id),
                INDEX (booking_id),
                INDEX (partner_id),
                INDEX (payment_id),
                INDEX (razorpay_order_id),
                INDEX (status)
            )
        `);
        console.log("✅ Scalable Transactions Table Created with Razorpay Integration");
    } catch (error) {
        console.error("❌ Error creating Transactions table:", error.message);
    }
};

module.exports = createTransactionTable;
