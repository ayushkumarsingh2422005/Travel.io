const db = require('../config/db');

const createPrevBookingsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS prevbookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id INT UNIQUE NOT NULL,
            customer_id INT NOT NULL,
            vehicle_id INT NOT NULL,
            driver_id INT NOT NULL,
            pickup_location VARCHAR(255) NOT NULL,
            dropoff_location VARCHAR(255) NOT NULL,
            pickup_date DATETIME NOT NULL,
            drop_date DATETIME NOT NULL,
            path TEXT NOT NULL,
            distance DECIMAL(10,2) NOT NULL,
            status ENUM('cancelled', 'completed') DEFAULT 'completed',
            FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Previous Bookings Table Created');
};

module.exports = createPrevBookingsTable;
