const db = require('../config/db');

const createVendorBankTable = async () => {
    try {
        console.log("Checking if vendor_bank_details table exists...");

        await db.query(`
            CREATE TABLE IF NOT EXISTS vendor_bank_details (
                id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
                vendor_id CHAR(64) ,
                partner_id CHAR(64) ,
                bank_name VARCHAR(255) NOT NULL,
                ifsc_code VARCHAR(64) NOT NULL,
                account_number VARCHAR(64) NOT NULL UNIQUE,
                account_holder_name VARCHAR(255) NOT NULL,
                deputy_name VARCHAR(255),
                branch VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
                FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,

                INDEX (vendor_id),
                INDEX (partner_id),
                INDEX (ifsc_code),
                INDEX (account_number)
            )
        `);

        console.log("✅ Scalable `vendor_bank_details` Table Created.");
    } catch (error) {
        console.error("❌ Error creating `vendor_bank_details` table:", error);
    }
};

module.exports = createVendorBankTable;
