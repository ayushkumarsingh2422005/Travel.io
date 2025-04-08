const db = require('../config/db');

const createVehiclesTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            vendor_id CHAR(64) NOT NULL,
            model VARCHAR(100) NOT NULL,
            registration_no VARCHAR(50) UNIQUE NOT NULL,
            image TEXT,
            no_of_seats INT NOT NULL,
            is_active TINYINT(1) DEFAULT 0, 

            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,

            INDEX (vendor_id),
            INDEX (registration_no)
        )
    `);
    console.log('✅ Scalable Vehicles Table Created');
};

module.exports = createVehiclesTable;
