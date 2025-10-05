const db = require('./config/db');

const addRcFieldsToVehicles = async () => {
    try {
        console.log('Adding RC fields to vehicles table...');
        
        // List of all RC fields that might be missing
        const rcFields = [
            'rc_verification_id VARCHAR(50)',
            'rc_reference_id VARCHAR(50)',
            'rc_status VARCHAR(50)',
            'rc_reg_no VARCHAR(50)',
            'rc_class VARCHAR(100)',
            'rc_chassis VARCHAR(100)',
            'rc_engine VARCHAR(100)',
            'rc_vehicle_manufacturer_name VARCHAR(100)',
            'rc_model VARCHAR(100)',
            'rc_vehicle_colour VARCHAR(50)',
            'rc_type VARCHAR(50)',
            'rc_norms_type VARCHAR(50)',
            'rc_body_type VARCHAR(100)',
            'rc_owner_count VARCHAR(10)',
            'rc_owner VARCHAR(100)',
            'rc_owner_father_name VARCHAR(100)',
            'rc_mobile_number VARCHAR(20)',
            'rc_rc_status VARCHAR(50)',
            'rc_status_as_on DATE',
            'rc_reg_authority VARCHAR(200)',
            'rc_reg_date DATE',
            'rc_vehicle_manufacturing_month_year VARCHAR(20)',
            'rc_expiry_date DATE',
            'rc_vehicle_tax_upto DATE',
            'rc_vehicle_insurance_company_name VARCHAR(200)',
            'rc_vehicle_insurance_upto DATE',
            'rc_vehicle_insurance_policy_number VARCHAR(100)',
            'rc_financer VARCHAR(200)',
            'rc_present_address VARCHAR(255)',
            'rc_permanent_address VARCHAR(255)',
            'rc_vehicle_cubic_capacity VARCHAR(20)',
            'rc_gross_vehicle_weight VARCHAR(20)',
            'rc_unladen_weight VARCHAR(20)',
            'rc_vehicle_category VARCHAR(20)',
            'rc_standard_cap VARCHAR(20)',
            'rc_vehicle_cylinders_no VARCHAR(10)',
            'rc_vehicle_seat_capacity VARCHAR(10)',
            'rc_vehicle_sleeper_capacity VARCHAR(10)',
            'rc_vehicle_standing_capacity VARCHAR(10)',
            'rc_wheelbase VARCHAR(20)',
            'rc_vehicle_number VARCHAR(50)',
            'rc_pucc_number VARCHAR(50)',
            'rc_pucc_upto DATE',
            'rc_blacklist_status VARCHAR(50)',
            'rc_blacklist_details JSON',
            'rc_challan_details JSON',
            'rc_permit_issue_date VARCHAR(20)',
            'rc_permit_number VARCHAR(50)',
            'rc_permit_type VARCHAR(50)',
            'rc_permit_valid_from VARCHAR(20)',
            'rc_permit_valid_upto VARCHAR(20)',
            'rc_non_use_status VARCHAR(50)',
            'rc_non_use_from VARCHAR(20)',
            'rc_non_use_to VARCHAR(20)',
            'rc_national_permit_number VARCHAR(50)',
            'rc_national_permit_upto VARCHAR(20)',
            'rc_national_permit_issued_by VARCHAR(100)',
            'rc_is_commercial TINYINT(1)',
            'rc_noc_details JSON',
            'rc_split_present_address JSON',
            'rc_split_permanent_address JSON'
        ];
        
        // Check which fields already exist
        const [existingColumns] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'vehicles'
        `);
        
        const existingColumnNames = existingColumns.map(col => col.COLUMN_NAME);
        console.log(`Found ${existingColumnNames.length} existing columns in vehicles table`);
        
        // Add missing fields
        let addedCount = 0;
        for (const field of rcFields) {
            const fieldName = field.split(' ')[0];
            if (!existingColumnNames.includes(fieldName)) {
                try {
                    await db.execute(`ALTER TABLE vehicles ADD COLUMN ${field}`);
                    console.log(`✅ Added ${fieldName} column`);
                    addedCount++;
                } catch (error) {
                    console.log(`⚠️  Could not add ${fieldName}: ${error.message}`);
                }
            } else {
                console.log(`✅ ${fieldName} column already exists`);
            }
        }
        
        console.log(`✅ Vehicles table migration completed. Added ${addedCount} new columns.`);
    } catch (error) {
        console.error('❌ Error adding RC fields to vehicles table:', error);
        throw error;
    }
};

module.exports = addRcFieldsToVehicles;
