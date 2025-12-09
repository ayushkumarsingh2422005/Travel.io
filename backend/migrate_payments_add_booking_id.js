const db = require('./config/db');

const migratePaymentsAddBookingId = async () => {
    try {
        console.log('🔄 Checking if booking_id column exists in payments table...');

        // Check if column exists
        const [columns] = await db.execute(`
            SHOW COLUMNS FROM payments LIKE 'booking_id'
        `);

        if (columns.length === 0) {
            console.log('⚠️ booking_id column missing. Adding it now...');

            // Add column
            await db.execute(`
                ALTER TABLE payments 
                ADD COLUMN booking_id CHAR(64) AFTER partner_id,
                ADD INDEX (booking_id),
                ADD CONSTRAINT fk_payments_booking_id FOREIGN KEY (booking_id) REFERENCES prevbookings(id) ON DELETE SET NULL
            `);

            console.log('✅ booking_id column added successfully to payments table');
        } else {
            console.log('✅ booking_id column already exists in payments table');
        }

    } catch (error) {
        console.error('❌ Error executing migration:', error.message);
    }
};

module.exports = migratePaymentsAddBookingId;
