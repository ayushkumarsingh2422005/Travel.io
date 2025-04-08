const db = require("../config/db");

// Vendor or partner creates a payment request from the admin and admin approves it
const createPaymentsTable = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS payments (
                id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
                vendor_id CHAR(64) ,
                partner_id CHAR(64) ,
                amount BIGINT NOT NULL,  
                status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                type ENUM('withdrawal', 'penalty') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
                FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
              

                INDEX (vendor_id), 
                INDEX (status) 
            )
        `);
        console.log("✅ Scalable Payments Table Created");
    } catch (error) {
        console.error("❌ Error creating Payments table:", error.message);
    }
};

module.exports = createPaymentsTable;
