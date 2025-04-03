const db = require('../config/db');

const createPromocodeTable = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS promocodes (
                id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
                code VARCHAR(50) NOT NULL UNIQUE,  -- Unique promocode
                discount_type ENUM('percentage', 'fixed') NOT NULL,
                discount_value DECIMAL(10,2) NOT NULL,
                min_order_value DECIMAL(10,2) DEFAULT 0,  
                usage_limit INT DEFAULT 1, 
                expiry_date DATETIME NOT NULL,
                is_active TINYINT(1) DEFAULT 1,  
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                INDEX (code), 
                INDEX (expiry_date), 
                INDEX (is_active)  
            )
        `);
        console.log('✅ Scalable Promocodes Table Created');
    } catch (error) {
        console.error('❌ Error creating Promocodes table:', error.message);
    }
};

module.exports = createPromocodeTable;
