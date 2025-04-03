const db = require("../config/db");

const createRatingsTable = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS ratings (
                id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
                driver_id CHAR(64) NOT NULL,
                vehicle_id CHAR(64) NOT NULL,
                user_id CHAR(64) NOT NULL,
                rating TINYINT(1) CHECK (rating BETWEEN 1 AND 5) NOT NULL,
                review VARCHAR(1000), 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

                INDEX (driver_id), 
                INDEX (vehicle_id),  
                INDEX (user_id) 
            )
        `);
        
        console.log("✅ Scalable Ratings Table Created");
    } catch (error) {
        console.error("❌ Error creating Ratings table:", error.message);
    }
};

module.exports = createRatingsTable;
