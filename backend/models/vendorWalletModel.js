const db = require('../config/db');

const createVendorWalletTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS vendor_wallet_transactions (
            id CHAR(64) PRIMARY KEY,
            vendor_id CHAR(64) NOT NULL,
            amount BIGINT NOT NULL, -- Positive for credit, negative for debit (stored as positive with type debit)
            type ENUM('credit', 'debit') NOT NULL,
            description VARCHAR(255),
            razorpay_payment_id VARCHAR(255),
            balance_after BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
            INDEX (vendor_id)
        )
    `);
    console.log('✅ Vendor Wallet Transactions Table Created');
};

module.exports = createVendorWalletTable;
