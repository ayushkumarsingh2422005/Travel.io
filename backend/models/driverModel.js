const db = require('../config/db');

const createDriversTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS drivers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vendor_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            address TEXT NOT NULL,
            license VARCHAR(50) UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT 0,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Drivers Table Created');
};

module.exports = createDriversTable;
