const db = require('../config/db');
const crypto = require('crypto');

/**
 * Create add-ons table for managing booking add-ons
 * These are admin-configurable options that customers can select during booking
 */
const createAddOnsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS add_ons (
            id CHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            pricing_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
            percentage_value DECIMAL(5,2) DEFAULT NULL,
            category ENUM('luggage', 'car_model', 'cancellation', 'pet', 'other') NOT NULL,
            icon_url VARCHAR(500),
            is_active TINYINT(1) DEFAULT 1,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Add-Ons Table Created');

    // Insert default add-ons
    try {
        const defaultAddOns = [
            {
                id: crypto.createHash('sha256').update('luggage_carrier' + Date.now()).digest('hex'),
                name: 'Assured Luggage Space (Carrier)',
                description: 'Get a dedicated carrier for your luggage',
                price: 300.00,
                pricing_type: 'fixed',
                percentage_value: null,
                category: 'luggage',
                display_order: 1
            },
            {
                id: crypto.createHash('sha256').update('car_model_new' + Date.now()).digest('hex'),
                name: 'Confirmed Car Model (Within 3 Years)',
                description: 'Get a car model not older than 3 years',
                price: 0.00,
                pricing_type: 'percentage',
                percentage_value: 5.00,
                category: 'car_model',
                display_order: 2
            },
            {
                id: crypto.createHash('sha256').update('cancellation_6h' + Date.now()).digest('hex'),
                name: 'Cancellation Before 6 Hours',
                description: '100% refund for cancellation before 6 hours of departure',
                price: 250.00,
                pricing_type: 'fixed',
                percentage_value: null,
                category: 'cancellation',
                display_order: 3
            },
            {
                id: crypto.createHash('sha256').update('pet_allowed' + Date.now()).digest('hex'),
                name: 'Pet Allowance',
                description: 'Travel with your pet',
                price: 500.00,
                pricing_type: 'fixed',
                percentage_value: null,
                category: 'pet',
                display_order: 4
            }
        ];

        for (const addon of defaultAddOns) {
            await db.execute(`
                INSERT IGNORE INTO add_ons 
                (id, name, description, price, pricing_type, percentage_value, category, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                addon.id,
                addon.name,
                addon.description,
                addon.price,
                addon.pricing_type,
                addon.percentage_value,
                addon.category,
                addon.display_order
            ]);
        }

        console.log('✅ Default add-ons inserted');
    } catch (e) {
        console.log('⚠️  Default add-ons may already exist');
    }
};

module.exports = createAddOnsTable;
