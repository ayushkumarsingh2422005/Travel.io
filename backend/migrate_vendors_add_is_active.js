const db = require('./config/db');

const addIsActiveToVendors = async () => {
    try {
        // Check if is_active column already exists
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'vendors' 
            AND COLUMN_NAME = 'is_active'
        `);

        if (columns.length === 0) {
            // Add is_active column
            await db.execute(`
                ALTER TABLE vendors 
                ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER is_pan_verified,
                ADD INDEX (is_active)
            `);
            console.log('✅ Added is_active column to vendors table');
        } else {
            console.log('ℹ️ is_active column already exists in vendors table');
        }

        // Check if penalty_reason column already exists
        const [penaltyColumns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'vendors' 
            AND COLUMN_NAME = 'penalty_reason'
        `);

        if (penaltyColumns.length === 0) {
            // Add penalty tracking fields
            await db.execute(`
                ALTER TABLE vendors 
                ADD COLUMN penalty_reason TEXT,
                ADD COLUMN penalty_amount BIGINT DEFAULT 0,
                ADD COLUMN last_penalty_date DATETIME,
                ADD COLUMN total_penalties INT DEFAULT 0
            `);
            console.log('✅ Added penalty tracking columns to vendors table');
        } else {
            console.log('ℹ️ penalty tracking columns already exist in vendors table');
        }

        // Check if suspended_by_admin column already exists
        const [suspendedColumns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'vendors' 
            AND COLUMN_NAME = 'suspended_by_admin'
        `);

        if (suspendedColumns.length === 0) {
            // Add suspension tracking
            await db.execute(`
                ALTER TABLE vendors 
                ADD COLUMN suspended_by_admin TINYINT(1) DEFAULT 0,
                ADD COLUMN suspension_reason TEXT,
                ADD COLUMN suspension_date DATETIME,
                ADD COLUMN suspension_until DATETIME
            `);
            console.log('✅ Added suspension tracking columns to vendors table');
        } else {
            console.log('ℹ️ suspension tracking columns already exist in vendors table');
        }

    } catch (error) {
        console.error('❌ Error adding columns to vendors table:', error);
        throw error;
    }
};

module.exports = addIsActiveToVendors;

