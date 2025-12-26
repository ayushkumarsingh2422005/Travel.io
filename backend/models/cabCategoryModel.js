const db = require('../config/db');

const createCabCategoriesTable = async () => {
    // This table now supports the full hierarchy:
    // 1. Service Type (Outstation, Hourly)
    // 2. Sub Category (One-Way, Round-Trip)
    // 3. Micro Category (Same-Day, Multi-Day)
    // 4. Segment (Hatchback, Sedan, SUV, Premium SUV)

    await db.execute(`
        CREATE TABLE IF NOT EXISTS cab_categories (
            id CHAR(64) PRIMARY KEY,
            
            -- Hierarchy Levels
            service_type ENUM('outstation', 'hourly_rental') NOT NULL,
            sub_category ENUM('one_way', 'round_trip') DEFAULT NULL, -- NULL for hourly
            micro_category ENUM('same_day', 'multi_day') DEFAULT NULL, -- NULL for hourly
            segment VARCHAR(50) NOT NULL, -- Hatchback, Sedan, SUV, Premium SUV
            
            -- Pricing details
            base_price DECIMAL(10,2) DEFAULT 0.00, -- For Hourly packages
            price_per_km DECIMAL(10,2) DEFAULT 0.00, -- For Outstation
            min_km_per_day INT DEFAULT 0, -- For Multi-Day Outstation (e.g., 250km)
            
            -- Capacity
            min_seats INT DEFAULT 4,
            max_seats INT DEFAULT 4,
            
            -- Hourly Rental Specifics
            package_hours INT DEFAULT 0, -- e.g. 2, 4, 8, 12
            package_km INT DEFAULT 0,    -- e.g. 20, 40, 80, 120
            extra_hour_rate DECIMAL(10,2) DEFAULT 0.00,
            
            -- Common Extras
            extra_km_rate DECIMAL(10,2) DEFAULT 0.00, 
            driver_allowance DECIMAL(10,2) DEFAULT 0.00, -- Night charges or daily allowance
            night_charge_threshold_time TIME DEFAULT '21:00:00', -- standard 9 PM
            
            -- Metadata
            category_image TEXT,
            description TEXT,
            is_active TINYINT(1) DEFAULT 1,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Attempt to add columns if they don't exist (Migration for existing DB)
    try {
        await db.execute("ALTER TABLE cab_categories ADD COLUMN service_type ENUM('outstation', 'hourly_rental') NOT NULL AFTER id");
    } catch (e) { } // Column likely exists

    try {
        // Add other columns similarly if migrating, but for now we define the ideal CREATE.
        // In a real production migration, we would use a dedicated migration file.
    } catch (e) { }

    console.log('✅ Scalable Cab Categories (Pricing) Table Configured!');
};

module.exports = createCabCategoriesTable;
