const db = require('../config/db');

const createDriversTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS drivers (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            vendor_id CHAR(64) NOT NULL,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            address TEXT NOT NULL,
            license VARCHAR(50) UNIQUE NOT NULL,
            is_active TINYINT(1) DEFAULT 0, 
            vehicle_id CHAR(64),
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,

            INDEX (phone), 
            INDEX (license)
        )
    `);
    console.log('✅ Scalable Drivers Table Created!');
};

module.exports = createDriversTable;
