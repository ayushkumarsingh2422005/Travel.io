const db = require('../config/db');

const createUsersTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            gender ENUM('Male', 'Female', 'Other') NOT NULL,
            age INT NOT NULL,
            current_address TEXT NOT NULL,
            amount_spent DECIMAL(10,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Users Table Created');
};

module.exports = createUsersTable;
