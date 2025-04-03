const db = require("../config/db");

const createTransactionTable = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
                customer_id CHAR(64) NOT NULL,
                vendor_id CHAR(64) NOT NULL,
                booking_id CHAR(64) NOT NULL,
                partner_id CHAR(64),  
                payment_id CHAR(64) NOT NULL UNIQUE, 
                amount BIGINT NOT NULL,  
                status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,

                INDEX (customer_id),
                INDEX (vendor_id),
                INDEX (booking_id),
                INDEX (partner_id)
            )
        `);
        console.log("✅ Scalable Transactions Table Created with BIGINT for Amount");
    } catch (error) {
        console.error("❌ Error creating Transactions table:", error.message);
    }
};

module.exports = createTransactionTable;
