const db = require('../config/db');

const createPenaltyRulesTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS penalties (
            id CHAR(64) PRIMARY KEY,
            offense_name VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            deduction_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
            description TEXT,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Penalty Rules Table Created');
};

const createPenaltyDisputesTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS penalty_disputes (
            id CHAR(64) PRIMARY KEY,
            payment_id CHAR(64) NOT NULL,
            vendor_id CHAR(64) NOT NULL,
            reason TEXT NOT NULL,
            status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
            admin_comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Penalty Disputes Table Created');
};

module.exports = { createPenaltyRulesTable, createPenaltyDisputesTable };
