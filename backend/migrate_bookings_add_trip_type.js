const db = require('./config/db');

/**
 * Migration: Add trip type and pricing fields to bookings AND prevbookings tables
 */
const migrateTables = async () => {
    console.log('Starting migration for bookings and prevbookings tables...');
    
    const tables = ['bookings', 'prevbookings'];

    for (const table of tables) {
        console.log(`\n📊 Migrating table: ${table}`);
        
        // Add trip_type
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN trip_type ENUM('one_way', 'round_trip') DEFAULT NULL AFTER price
            `);
            console.log(`✅ Added trip_type to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  trip_type already exists in ${table}`);
            } else {
                console.error(`❌ Error adding trip_type to ${table}:`, e.message);
            }
        }

        // Add micro_category
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN micro_category ENUM('same_day', 'multi_day') DEFAULT NULL AFTER trip_type
            `);
            console.log(`✅ Added micro_category to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  micro_category already exists in ${table}`);
            } else {
                console.error(`❌ Error adding micro_category to ${table}:`, e.message);
            }
        }

        // Add service_category
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN service_category ENUM('outstation', 'hourly_rental') DEFAULT NULL AFTER micro_category
            `);
            console.log(`✅ Added service_category to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  service_category already exists in ${table}`);
            } else {
                console.error(`❌ Error adding service_category to ${table}:`, e.message);
            }
        }

        // Add package_hours
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN package_hours INT DEFAULT NULL AFTER service_category
            `);
            console.log(`✅ Added package_hours to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  package_hours already exists in ${table}`);
            } else {
                console.error(`❌ Error adding package_hours to ${table}:`, e.message);
            }
        }

        // Add package_km
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN package_km INT DEFAULT NULL AFTER package_hours
            `);
            console.log(`✅ Added package_km to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  package_km already exists in ${table}`);
            } else {
                console.error(`❌ Error adding package_km to ${table}:`, e.message);
            }
        }

        // Add base_fare
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN base_fare DECIMAL(10,2) DEFAULT 0.00 AFTER package_km
            `);
            console.log(`✅ Added base_fare to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  base_fare already exists in ${table}`);
            } else {
                console.error(`❌ Error adding base_fare to ${table}:`, e.message);
            }
        }

        // Add toll_charges
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN toll_charges DECIMAL(10,2) DEFAULT 0.00 AFTER base_fare
            `);
            console.log(`✅ Added toll_charges to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  toll_charges already exists in ${table}`);
            } else {
                console.error(`❌ Error adding toll_charges to ${table}:`, e.message);
            }
        }

        // Add state_tax
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN state_tax DECIMAL(10,2) DEFAULT 0.00 AFTER toll_charges
            `);
            console.log(`✅ Added state_tax to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  state_tax already exists in ${table}`);
            } else {
                console.error(`❌ Error adding state_tax to ${table}:`, e.message);
            }
        }

        // Add parking_charges
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN parking_charges DECIMAL(10,2) DEFAULT 0.00 AFTER state_tax
            `);
            console.log(`✅ Added parking_charges to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  parking_charges already exists in ${table}`);
            } else {
                console.error(`❌ Error adding parking_charges to ${table}:`, e.message);
            }
        }

        // Add driver_night_charges
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN driver_night_charges DECIMAL(10,2) DEFAULT 0.00 AFTER parking_charges
            `);
            console.log(`✅ Added driver_night_charges to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  driver_night_charges already exists in ${table}`);
            } else {
                console.error(`❌ Error adding driver_night_charges to ${table}:`, e.message);
            }
        }

        // Add addon_charges
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN addon_charges DECIMAL(10,2) DEFAULT 0.00 AFTER driver_night_charges
            `);
            console.log(`✅ Added addon_charges to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  addon_charges already exists in ${table}`);
            } else {
                console.error(`❌ Error adding addon_charges to ${table}:`, e.message);
            }
        }

        // Add admin_commission
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN admin_commission DECIMAL(10,2) DEFAULT 0.00 AFTER addon_charges
            `);
            console.log(`✅ Added admin_commission to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  admin_commission already exists in ${table}`);
            } else {
                console.error(`❌ Error adding admin_commission to ${table}:`, e.message);
            }
        }

        // Add driver_payout
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN driver_payout DECIMAL(10,2) DEFAULT 0.00 AFTER admin_commission
            `);
            console.log(`✅ Added driver_payout to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  driver_payout already exists in ${table}`);
            } else {
                console.error(`❌ Error adding driver_payout to ${table}:`, e.message);
            }
        }

        // Add actual_hours
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN actual_hours DECIMAL(4,2) DEFAULT NULL AFTER driver_payout
            `);
            console.log(`✅ Added actual_hours to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  actual_hours already exists in ${table}`);
            } else {
                console.error(`❌ Error adding actual_hours to ${table}:`, e.message);
            }
        }

        // Add actual_km
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN actual_km DECIMAL(10,2) DEFAULT NULL AFTER actual_hours
            `);
            console.log(`✅ Added actual_km to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  actual_km already exists in ${table}`);
            } else {
                console.error(`❌ Error adding actual_km to ${table}:`, e.message);
            }
        }

        // Add extra_charges
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN extra_charges DECIMAL(10,2) DEFAULT 0.00 AFTER actual_km
            `);
            console.log(`✅ Added extra_charges to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  extra_charges already exists in ${table}`);
            } else {
                console.error(`❌ Error adding extra_charges to ${table}:`, e.message);
            }
        }

        // Add add_ons_details (JSON field) - MOST IMPORTANT for add-ons
        try {
            await db.execute(`
                ALTER TABLE ${table} 
                ADD COLUMN add_ons_details JSON DEFAULT NULL AFTER extra_charges
            `);
            console.log(`✅ Added add_ons_details to ${table}`);
        } catch (e) {
            if (e.message && e.message.includes('Duplicate column')) {
                console.log(`⚠️  add_ons_details already exists in ${table}`);
            } else {
                console.error(`❌ Error adding add_ons_details to ${table}:`, e.message);
            }
        }

        console.log(`\n✅ Migration completed for ${table} table!\n`);
    }

    console.log('\n🎉 All migrations completed successfully!\n');
};

// Export for use in index.js
module.exports = migrateTables;

// Only run directly if this file is executed standalone
if (require.main === module) {
    migrateTables()
        .then(() => {
            console.log('Migration script completed. Exiting...');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Migration failed:', err);
            process.exit(1);
        });
}
