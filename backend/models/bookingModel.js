const db = require('../config/db');


// Create bookings table if it doesn't exist.
const createBookingsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS bookings (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            customer_id CHAR(64) ,
            vehicle_id CHAR(64) default null,
            driver_id CHAR(64) default null,
            vendor_id CHAR(64) default null,
            partner_id CHAR(64) default null,
            cab_category_id CHAR(64) not null,
            pickup_location VARCHAR(255) NOT NULL,
            dropoff_location VARCHAR(255) NOT NULL,
            pickup_date DATETIME NOT NULL,
            drop_date DATETIME NOT NULL,
            price BIGINT NOT NULL, 
            path TEXT NOT NULL,
            distance BIGINT NOT NULL, 
            status ENUM('waiting', 'approved', 'preongoing', 'ongoing', 'completed', 'cancelled') DEFAULT 'waiting',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  o

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


// -- Migration Script: Update table structure
// -- Replace `rides` with your actual table name

// ALTER TABLE rides
//     MODIFY vehicle_id CHAR(64) DEFAULT NULL,
//     MODIFY driver_id CHAR(64) DEFAULT NULL,
//     MODIFY vendor_id CHAR(64) DEFAULT NULL,
//     MODIFY partner_id CHAR(64) DEFAULT NULL,
//     ADD COLUMN cab_category_id CHAR(64) NOT NULL;