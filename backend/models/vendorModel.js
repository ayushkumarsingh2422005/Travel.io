const db = require('../config/db');

// Vendor creation table
const createVendorsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS vendors (
            id CHAR(64) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(15) UNIQUE,
            password_hash CHAR(60) NOT NULL,
            gender ENUM('Male', 'Female', 'Other') NOT NULL,
            profile_pic VARCHAR(500),
            otp CHAR(6) UNIQUE,
            otp_expiration DATETIME, 
            is_phone_verified TINYINT(1) DEFAULT 0,
            is_profile_completed TINYINT(1) DEFAULT 0,
            age INT NOT NULL,
            current_address TEXT NOT NULL,
            amount BIGINT DEFAULT 0,
            total_earnings BIGINT DEFAULT 0, 
            document TEXT,
            description TEXT,
            star_rating DECIMAL(3,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 

            INDEX (email),
            INDEX (phone),
            INDEX (otp)
        )
    `);
    console.log('✅ Vendors Table Created');
};

module.exports = createVendorsTable;
