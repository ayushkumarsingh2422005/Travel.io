const db = require('../config/db');

const createCabCategoriesTable = async () => {
    // MySQL ALTER TABLE example for schema evolution:
    // ALTER TABLE cab_categories
    //     ADD COLUMN category VARCHAR(50), ...;
    //
    await db.execute(`
        CREATE TABLE IF NOT EXISTS cab_categories (
            id CHAR(64) PRIMARY KEY,   -- Hashed ID (SHA-256)
            category VARCHAR(100) NOT NULL,   -- e.g., Hatchback, Tempo Traveller, etc
            price_per_km DECIMAL(10,2) NOT NULL,
            min_no_of_seats INT DEFAULT 0,
            max_no_of_seats INT DEFAULT 0,
            fuel_charges DECIMAL(10,2) DEFAULT 0.00,
            driver_charges DECIMAL(10,2) DEFAULT 0.00,
            night_charges DECIMAL(10,2) DEFAULT 0.00,
            included_vehicle_types JSON,        -- vehicle types included in this category (flexible)
            base_discount DECIMAL(5,2) DEFAULT 0.00, -- percent discount if any
            category_image TEXT,
            notes TEXT,
            is_active TINYINT(1) DEFAULT 1
        )
    `);
    console.log('✅ Scalable Cab Categories Table Created!');
};

// Sample/Reference fields:
// id: string;
// category: string; // hatchback, sedan, etc
// price_per_km: number;
// min_kms: number;
// max_kms: number;
// fuel_charges: number;
// driver_charges: number;
// night_charges: number;
// included_car_types: string[];
// base_discount: number (percent);
// category_image?: string;
// seats?: number;
// extra_hour_charges?: number;
// included_hours?: number;
// notes?: string;
// is_active: boolean;

module.exports = createCabCategoriesTable;