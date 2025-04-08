const db = require("../config/db");

//partner table and partner_transaction table 
const createPartnerTables = async () => {
    try {
      

    
            await db.execute(`
                CREATE TABLE IF NOT EXISTS partners (
                    id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(15) UNIQUE NOT NULL,
                    password_hash CHAR(60) NOT NULL,  
                    profile_pic VARCHAR(500),
                    otp CHAR(6),
                    otp_expiration DATETIME,
                    is_phone_verified TINYINT(1) DEFAULT 0,
                    is_profile_completed TINYINT(1) DEFAULT 0,

                    company_name VARCHAR(255) NOT NULL,
                    wallet_balance BIGINT DEFAULT 0,  
                    total_earnings BIGINT DEFAULT 0,  
                    commission_rate DECIMAL(5,2) DEFAULT 5.00,  
                    
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
                    INDEX (email),  
                    INDEX (phone)
                )
            `);
       
        
        console.log("✅ Scalable Partners Table Created");

        // Create the 'partner_transactions' table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS partner_transactions (
                id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
                partner_id CHAR(64) NOT NULL,
                booking_id CHAR(64) ,
                commission_amount BIGINT DEFAULT 0,  
                status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,

                INDEX (partner_id),  
                INDEX (booking_id)
            )
        `);

        console.log("✅ Scalable Partner Transactions Table Created");

    } catch (error) {
        console.error("❌ Error creating Partner Tables:", error);
    }
};

module.exports = createPartnerTables;
