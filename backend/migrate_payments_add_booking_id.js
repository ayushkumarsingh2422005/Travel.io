const db = require('./config/db');

const addBookingIdToPayments = async () => {
    try {
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'payments' 
            AND COLUMN_NAME = 'booking_id'
        `);

        if (columns.length === 0) {
            await db.execute(`
                ALTER TABLE payments 
                ADD COLUMN booking_id CHAR(64) NULL AFTER partner_id,
                ADD INDEX (booking_id)
            `);

            await db.execute(`
                ALTER TABLE payments 
                ADD CONSTRAINT fk_payments_booking 
                FOREIGN KEY (booking_id) REFERENCES prevbookings(id) ON DELETE SET NULL
            `);

            console.log('✅ Added booking_id column to payments table');
        } else {
            console.log('ℹ️ booking_id column already exists in payments table');
        }
    } catch (error) {
        console.error('❌ Error adding booking_id to payments table:', error.message);
    }
};

module.exports = addBookingIdToPayments;

