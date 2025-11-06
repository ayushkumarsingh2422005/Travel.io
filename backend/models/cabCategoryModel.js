const db = require('../config/db');

const createCabCategoriesTable = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS cab_categories (
                id CHAR(64) PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                base_per_km_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Cab Categories Table Created');
    } catch (error) {
        console.error('❌ Error creating cab_categories table:', error);
        throw error;
    }
};

module.exports = createCabCategoriesTable;
