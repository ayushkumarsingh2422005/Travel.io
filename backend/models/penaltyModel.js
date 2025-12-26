const db = require('../config/db');

const createPenaltyTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS penalties (
            id CHAR(64) PRIMARY KEY,
            offense_name VARCHAR(255) NOT NULL, -- e.g. 'Late Pickup', 'Booking Abandoned'
            amount DECIMAL(10,2) NOT NULL,
            deduction_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
            description TEXT,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Penalty Table Created');
};

module.exports = createPenaltyTable;
