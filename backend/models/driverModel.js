const db = require('../config/db');

const createDriversTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS drivers (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            vendor_id CHAR(64) NOT NULL,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            address TEXT NOT NULL,
            dl_number VARCHAR(50) UNIQUE NOT NULL,
            dl_data TEXT,
            is_active TINYINT(1) DEFAULT 0, 
            vehicle_id CHAR(64) DEFAULT NULL,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,

            INDEX (phone), 
            INDEX (dl_number),
            INDEX (is_active)
        )
    `);
    console.log('✅ Scalable Drivers Table Created!');
};

module.exports = createDriversTable;

// DL varification
// DL No, DOB 
// DL Expiry Date ( baad me dalenge )
// DL Issue Date ( baad me dalenge )
// approved_by ( baad me dalenge ) -> default false

// autofill - name, address, expirey date, 

// ui me 1 phone ka field dena hai
// dl image hatana h form se