const db = require('./config/db');

const addDescriptionToPayments = async () => {
    try {
        // Check if description column exists
        const [rows] = await db.execute(`
            SELECT COUNT(*) AS count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'payments' 
            AND COLUMN_NAME = 'description'
        `);

        if (rows[0].count === 0) {
            await db.execute(`
                ALTER TABLE payments 
                ADD COLUMN description TEXT
            `);
            console.log("✅ Added 'description' column to payments table");
        } else {
            // console.log("ℹ️ 'description' column already exists in payments table");
        }
    } catch (error) {
        console.error("❌ Error adding description to payments:", error.message);
    }
};

module.exports = addDescriptionToPayments;
