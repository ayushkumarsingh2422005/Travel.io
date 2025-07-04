const db = require('../config/db');
// google_id, email, name, picture
const createUsersTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(15) UNIQUE,
            password_hash CHAR(60),
            profile_pic VARCHAR(500),
            otp CHAR(6) , 
            otpexpirationtime DATETIME,
            is_phone_verified TINYINT(1) DEFAULT 0,
            is_profile_completed TINYINT(1) DEFAULT 0,
            gender ENUM('Male', 'Female', 'Other', 'Select Gender') NOT NULL DEFAULT('Select Gender'),
            age INT NOT NULL DEFAULT -1,
            current_address TEXT,
            amount_spent BIGINT DEFAULT 0, 
            google_id VARCHAR(64) UNIQUE, -- Google account ID
            auth_provider ENUM('local', 'google') DEFAULT 'local', -- Auth method
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (email),  -- Indexing for faster lookups
            INDEX (phone)
        )
    `);
    console.log('✅ Users Table Created');
};

module.exports = createUsersTable;
