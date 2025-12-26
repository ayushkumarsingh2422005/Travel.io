const db = require('../config/db');

const createAddOnTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS add_ons (
            id CHAR(64) PRIMARY KEY,
            name VARCHAR(100) NOT NULL, -- e.g., 'Assured Luggage Carrier', 'Pet Allowance'
            price DECIMAL(10,2) DEFAULT 0.00,
            price_type ENUM('fixed', 'percentage') DEFAULT 'fixed', -- Percentage of booking amount vs fixed amount
            description TEXT,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Add-Ons Table Created');
};

module.exports = createAddOnTable;
