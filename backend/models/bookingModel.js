const db = require('../config/db');

const createBookingsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            vehicle_id INT NOT NULL,
            driver_id INT ,
            pickup_location VARCHAR(255) NOT NULL,
            dropoff_location VARCHAR(255) NOT NULL,
            pickup_date DATETIME NOT NULL,
            drop_date DATETIME NOT NULL,
            path TEXT NOT NULL,
            distance DECIMAL(10,2) NOT NULL,
            status ENUM('waiting','approved','ongoing', 'completed', 'cancelled') DEFAULT 'ongoing',
            FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
            FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
        )
    `);
    console.log('✅ Bookings Table Created');
};

module.exports = createBookingsTable;
