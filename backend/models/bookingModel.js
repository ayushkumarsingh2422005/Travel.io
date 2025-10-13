const db = require('../config/db');


// Create bookings table if it doesn't exist.
const createBookingsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS bookings (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            customer_id CHAR(64) ,
            vehicle_id CHAR(64) ,
            driver_id CHAR(64) default null,
            vendor_id CHAR(64),
            partner_id CHAR(64) default null,
            pickup_location VARCHAR(255) NOT NULL,
            dropoff_location VARCHAR(255) NOT NULL,
            pickup_date DATETIME NOT NULL,
            drop_date DATETIME NOT NULL,
            price BIGINT NOT NULL, 
            path TEXT NOT NULL,
            distance BIGINT NOT NULL, 
            status ENUM('waiting', 'approved', 'preongoing', 'ongoing', 'completed', 'cancelled') DEFAULT 'waiting',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  

            FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
            FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
            FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL,

            INDEX (customer_id), 
            INDEX (vehicle_id),
            INDEX (driver_id),
            INDEX (vendor_id),
            INDEX (partner_id)
        )
    `);
    console.log('✅ Scalable Bookings Table Created!');
};

module.exports = createBookingsTable;
