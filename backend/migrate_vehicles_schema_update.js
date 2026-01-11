const db = require('./config/db');

const updateVehiclesSchema = async () => {
    try {
        // Check/Add approval_status
        const [statusCol] = await db.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'approval_status';
        `);

        if (statusCol.length === 0) {
            await db.execute(`
                ALTER TABLE vehicles 
                ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending';
            `);
            console.log('✅ Added approval_status column to vehicles');
        }

        // Check/Add category_id (link to cab_categories)
        const [categoryCol] = await db.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'category_id';
        `);

        if (categoryCol.length === 0) {
            await db.execute(`
                ALTER TABLE vehicles 
                ADD COLUMN category_id VARCHAR(64) DEFAULT NULL,
                ADD INDEX idx_category (category_id);
            `);
            console.log('✅ Added category_id column to vehicles');
        }

    } catch (error) {
        console.error('Error updating vehicles schema:', error);
    }
};

module.exports = updateVehiclesSchema;
