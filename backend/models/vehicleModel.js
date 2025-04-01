const db = require('../config/db');

const createVehiclesTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vendor_id INT NOT NULL,
            model VARCHAR(100) NOT NULL,
            registration_no VARCHAR(50) UNIQUE NOT NULL,
            image TEXT,
            no_of_seats INT NOT NULL,
            is_active BOOLEAN DEFAULT 0,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Vehicles Table Created');
};

module.exports = createVehiclesTable;
