const db = require('../config/db');

const createPaymentsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            vendor_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
            bank_details TEXT NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Payments Table Created');
};

module.exports = createPaymentsTable;
