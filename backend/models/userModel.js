const db = require('../config/db');

const createUsersTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            password_hash CHAR(60) NOT NULL,
            profile_pic VARCHAR(500),
            otp CHAR(6) , 
            otpexpirationtime DATETIME,
            is_phone_verified TINYINT(1) DEFAULT 0,
            is_profile_completed TINYINT(1) DEFAULT 0,
            gender ENUM('Male', 'Female', 'Other') NOT NULL,
            age INT NOT NULL,
            current_address TEXT NOT NULL,
            amount_spent BIGINT DEFAULT 0, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (email),  -- Indexing for faster lookups
            INDEX (phone)
        )
    `);
    console.log('✅ Users Table Created');
};

module.exports = createUsersTable;
