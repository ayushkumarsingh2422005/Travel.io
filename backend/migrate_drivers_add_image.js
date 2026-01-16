const db = require('./config/db');

const addImageToDrivers = async () => {
    try {
        // Check if image column exists
        const [rows] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'drivers' 
            AND COLUMN_NAME = 'image';
        `);

        if (rows.length === 0) {
            await db.execute(`
                ALTER TABLE drivers 
                ADD COLUMN image VARCHAR(255) DEFAULT NULL;
            `);
            console.log('✅ Added image column to drivers table');
        } else {
            console.log('ℹ️ Image column already exists in drivers table');
        }
    } catch (error) {
        console.error('Error adding image column to drivers table:', error);
    }
};

module.exports = addImageToDrivers;
