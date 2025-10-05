const db = require('../config/db');

const createVehiclesTable = async () => {
    // MySQL ALTER TABLE command to add all RC fields (if table already exists):
    // ALTER TABLE vehicles
    //     ADD COLUMN rc_verification_id VARCHAR(50),
    //     ADD COLUMN rc_reference_id VARCHAR(50),
    //     ADD COLUMN rc_status VARCHAR(50),
    //     ADD COLUMN rc_reg_no VARCHAR(50),
    //     ADD COLUMN rc_class VARCHAR(100),
    //     ADD COLUMN rc_chassis VARCHAR(100),
    //     ADD COLUMN rc_engine VARCHAR(100),
    //     ADD COLUMN rc_vehicle_manufacturer_name VARCHAR(100),
    //     ADD COLUMN rc_model VARCHAR(100),
    //     ADD COLUMN rc_vehicle_colour VARCHAR(50),
    //     ADD COLUMN rc_type VARCHAR(50),
    //     ADD COLUMN rc_norms_type VARCHAR(50),
    //     ADD COLUMN rc_body_type VARCHAR(100),
    //     ADD COLUMN rc_owner_count VARCHAR(10),
    //     ADD COLUMN rc_owner VARCHAR(100),
    //     ADD COLUMN rc_owner_father_name VARCHAR(100),
    //     ADD COLUMN rc_mobile_number VARCHAR(20),
    //     ADD COLUMN rc_rc_status VARCHAR(50),
    //     ADD COLUMN rc_status_as_on DATE,
    //     ADD COLUMN rc_reg_authority VARCHAR(200),
    //     ADD COLUMN rc_reg_date DATE,
    //     ADD COLUMN rc_vehicle_manufacturing_month_year VARCHAR(20),
    //     ADD COLUMN rc_expiry_date DATE,
    //     ADD COLUMN rc_vehicle_tax_upto DATE,
    //     ADD COLUMN rc_vehicle_insurance_company_name VARCHAR(200),
    //     ADD COLUMN rc_vehicle_insurance_upto DATE,
    //     ADD COLUMN rc_vehicle_insurance_policy_number VARCHAR(100),
    //     ADD COLUMN rc_financer VARCHAR(200),
    //     ADD COLUMN rc_present_address VARCHAR(255),
    //     ADD COLUMN rc_permanent_address VARCHAR(255),
    //     ADD COLUMN rc_vehicle_cubic_capacity VARCHAR(20),
    //     ADD COLUMN rc_gross_vehicle_weight VARCHAR(20),
    //     ADD COLUMN rc_unladen_weight VARCHAR(20),
    //     ADD COLUMN rc_vehicle_category VARCHAR(20),
    //     ADD COLUMN rc_standard_cap VARCHAR(20),
    //     ADD COLUMN rc_vehicle_cylinders_no VARCHAR(10),
    //     ADD COLUMN rc_vehicle_seat_capacity VARCHAR(10),
    //     ADD COLUMN rc_vehicle_sleeper_capacity VARCHAR(10),
    //     ADD COLUMN rc_vehicle_standing_capacity VARCHAR(10),
    //     ADD COLUMN rc_wheelbase VARCHAR(20),
    //     ADD COLUMN rc_vehicle_number VARCHAR(50),
    //     ADD COLUMN rc_pucc_number VARCHAR(50),
    //     ADD COLUMN rc_pucc_upto DATE,
    //     ADD COLUMN rc_blacklist_status VARCHAR(50),
    //     ADD COLUMN rc_blacklist_details JSON,
    //     ADD COLUMN rc_challan_details JSON,
    //     ADD COLUMN rc_permit_issue_date VARCHAR(20),
    //     ADD COLUMN rc_permit_number VARCHAR(50),
    //     ADD COLUMN rc_permit_type VARCHAR(50),
    //     ADD COLUMN rc_permit_valid_from VARCHAR(20),
    //     ADD COLUMN rc_permit_valid_upto VARCHAR(20),
    //     ADD COLUMN rc_non_use_status VARCHAR(50),
    //     ADD COLUMN rc_non_use_from VARCHAR(20),
    //     ADD COLUMN rc_non_use_to VARCHAR(20),
    //     ADD COLUMN rc_national_permit_number VARCHAR(50),
    //     ADD COLUMN rc_national_permit_upto VARCHAR(20),
    //     ADD COLUMN rc_national_permit_issued_by VARCHAR(100),
    //     ADD COLUMN rc_is_commercial TINYINT(1),
    //     ADD COLUMN rc_noc_details JSON,
    //     ADD COLUMN rc_split_present_address JSON,
    //     ADD COLUMN rc_split_permanent_address JSON;
    

    await db.execute(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id CHAR(64) PRIMARY KEY,  -- Hashed ID (SHA-256)
            vendor_id CHAR(64) NOT NULL,
            model VARCHAR(100) NOT NULL,
            registration_no VARCHAR(50) UNIQUE NOT NULL,
            image TEXT,
            no_of_seats INT NOT NULL,
            per_km_charge DECIMAL(10,2) DEFAULT 0.00,
            is_active TINYINT(1) DEFAULT 0,

            -- RC Details fields
            rc_verification_id VARCHAR(50),
            rc_reference_id VARCHAR(50),
            rc_status VARCHAR(50),
            rc_reg_no VARCHAR(50),
            rc_class VARCHAR(100),
            rc_chassis VARCHAR(100),
            rc_engine VARCHAR(100),
            rc_vehicle_manufacturer_name VARCHAR(100),
            rc_model VARCHAR(100),
            rc_vehicle_colour VARCHAR(50),
            rc_type VARCHAR(50),
            rc_norms_type VARCHAR(50),
            rc_body_type VARCHAR(100),
            rc_owner_count VARCHAR(10),
            rc_owner VARCHAR(100),
            rc_owner_father_name VARCHAR(100),
            rc_mobile_number VARCHAR(20),
            rc_rc_status VARCHAR(50),
            rc_status_as_on DATE,
            rc_reg_authority VARCHAR(200),
            rc_reg_date DATE,
            rc_vehicle_manufacturing_month_year VARCHAR(20),
            rc_expiry_date DATE,
            rc_vehicle_tax_upto DATE,
            rc_vehicle_insurance_company_name VARCHAR(200),
            rc_vehicle_insurance_upto DATE,
            rc_vehicle_insurance_policy_number VARCHAR(100),
            rc_financer VARCHAR(200),
            rc_present_address VARCHAR(255),
            rc_permanent_address VARCHAR(255),
            rc_vehicle_cubic_capacity VARCHAR(20),
            rc_gross_vehicle_weight VARCHAR(20),
            rc_unladen_weight VARCHAR(20),
            rc_vehicle_category VARCHAR(20),
            rc_standard_cap VARCHAR(20),
            rc_vehicle_cylinders_no VARCHAR(10),
            rc_vehicle_seat_capacity VARCHAR(10),
            rc_vehicle_sleeper_capacity VARCHAR(10),
            rc_vehicle_standing_capacity VARCHAR(10),
            rc_wheelbase VARCHAR(20),
            rc_vehicle_number VARCHAR(50),
            rc_pucc_number VARCHAR(50),
            rc_pucc_upto DATE,
            rc_blacklist_status VARCHAR(50),
            rc_blacklist_details JSON,
            rc_challan_details JSON,
            rc_permit_issue_date VARCHAR(20),
            rc_permit_number VARCHAR(50),
            rc_permit_type VARCHAR(50),
            rc_permit_valid_from VARCHAR(20),
            rc_permit_valid_upto VARCHAR(20),
            rc_non_use_status VARCHAR(50),
            rc_non_use_from VARCHAR(20),
            rc_non_use_to VARCHAR(20),
            rc_national_permit_number VARCHAR(50),
            rc_national_permit_upto VARCHAR(20),
            rc_national_permit_issued_by VARCHAR(100),
            rc_is_commercial TINYINT(1),
            rc_noc_details JSON,
            rc_split_present_address JSON,
            rc_split_permanent_address JSON,

            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,

            INDEX (vendor_id),
            INDEX (registration_no)
        )
    `);
    console.log('✅ Scalable Vehicles Table Created');
};

module.exports = createVehiclesTable;


// 
/*
  id: number;
  brand: string;
  fuelType: string;
  carType: string;
  rcNumber: string;
  permit: string;
  status: string;
  chassis?: string;
  engine?: string;
  insuranceExpiry?: string;
  permitExpiry?: string | null;
  fitnessExpiry?: string;
  owner?: string;
  makeYear?: number;
  lastUpdated?: string;
  */