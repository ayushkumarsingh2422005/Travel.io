const db = require('../config/db');

const createPrevBookingsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS prevbookings (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            customer_id CHAR(64) NULL, 
            vehicle_id CHAR(64) NULL,  
            driver_id CHAR(64) NULL,  
            vendor_id CHAR(64),
            partner_id CHAR(64),
            pickup_location VARCHAR(255) NOT NULL,
            dropoff_location VARCHAR(255) NOT NULL,
            pickup_date DATETIME NOT NULL,
            drop_date DATETIME NOT NULL,
            price BIGINT DEFAULT 0,  
            path TEXT ,
            distance DECIMAL(10,2) ,
            status ENUM('cancelled', 'completed') DEFAULT 'completed',

            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
            FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL, 
            FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
            FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,

            INDEX (customer_id), 
            INDEX (vehicle_id),   
            INDEX (vendor_id),   
            INDEX (partner_id)  
           
        )
    `);
    console.log('✅ Scalable Previous Bookings Table Created');
};

module.exports = createPrevBookingsTable;
