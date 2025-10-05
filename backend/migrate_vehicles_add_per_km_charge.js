const db = require('./config/db');

const addPerKmChargeToVehicles = async () => {
    try {
        console.log('Adding per_km_charge field to vehicles table...');
        
        // Check if the field already exists
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'vehicles' 
            AND COLUMN_NAME = 'per_km_charge'
        `);
        
        if (columns.length === 0) {
            await db.execute(`
                ALTER TABLE vehicles 
                ADD COLUMN per_km_charge DECIMAL(10,2) DEFAULT 0.00
            `);
            console.log('✅ Added per_km_charge column to vehicles table');
        } else {
            console.log('✅ per_km_charge column already exists in vehicles table');
        }
        
        console.log('✅ Vehicles table migration completed successfully');
    } catch (error) {
        console.error('❌ Error adding per_km_charge to vehicles table:', error);
        throw error;
    }
};

module.exports = addPerKmChargeToVehicles;
