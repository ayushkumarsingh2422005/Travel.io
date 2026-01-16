const db = require('./config/db');

const updateDriversSchema = async () => {
    try {
        // Check/Add approval_status
        const [statusCol] = await db.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'drivers' AND COLUMN_NAME = 'approval_status';
        `);

        if (statusCol.length === 0) {
            await db.execute(`
                ALTER TABLE drivers 
                ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending';
            `);
            console.log('✅ Added approval_status column to drivers');
        }

        // Check/Add languages
        const [langCol] = await db.execute(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'drivers' AND COLUMN_NAME = 'languages';
        `);

        if (langCol.length === 0) {
            await db.execute(`
                ALTER TABLE drivers 
                ADD COLUMN languages TEXT DEFAULT NULL;
            `);
            console.log('✅ Added languages column to drivers');
        }

    } catch (error) {
        console.error('Error updating drivers schema:', error);
    }
};

module.exports = updateDriversSchema;
