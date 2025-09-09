-- Migration script to add RC fields to existing vehicles table
-- Run this to add all missing RC fields

-- Add rc_data column if it doesn't exist
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_data LONGTEXT;

-- Add all RC fields
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_verification_id VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_reference_id VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_status VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_reg_no VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_class VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_chassis VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_engine VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_manufacturer_name VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_model VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_colour VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_type VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_norms_type VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_body_type VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_owner_count VARCHAR(10);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_owner VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_owner_father_name VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_mobile_number VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_rc_status VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_status_as_on DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_reg_authority VARCHAR(200);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_reg_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_manufacturing_month_year VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_expiry_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_tax_upto DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_insurance_company_name VARCHAR(200);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_insurance_upto DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_insurance_policy_number VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_financer VARCHAR(200);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_present_address VARCHAR(255);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_permanent_address VARCHAR(255);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_cubic_capacity VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_gross_vehicle_weight VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_unladen_weight VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_category VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_standard_cap VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_cylinders_no VARCHAR(10);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_seat_capacity VARCHAR(10);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_sleeper_capacity VARCHAR(10);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_standing_capacity VARCHAR(10);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_wheelbase VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_vehicle_number VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_pucc_number VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_pucc_upto DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_blacklist_status VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_blacklist_details JSON;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_challan_details JSON;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_permit_issue_date VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_permit_number VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_permit_type VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_permit_valid_from VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_permit_valid_upto VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_non_use_status VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_non_use_from VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_non_use_to VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_national_permit_number VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_national_permit_upto VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_national_permit_issued_by VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_is_commercial TINYINT(1) DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_noc_details JSON;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_split_present_address JSON;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS rc_split_permanent_address JSON;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rc_verification_id ON vehicles(rc_verification_id);
CREATE INDEX IF NOT EXISTS idx_rc_status ON vehicles(rc_status);
CREATE INDEX IF NOT EXISTS idx_rc_reg_no ON vehicles(rc_reg_no);
CREATE INDEX IF NOT EXISTS idx_rc_owner ON vehicles(rc_owner);
CREATE INDEX IF NOT EXISTS idx_rc_rc_status ON vehicles(rc_rc_status);
CREATE INDEX IF NOT EXISTS idx_rc_is_commercial ON vehicles(rc_is_commercial);
CREATE INDEX IF NOT EXISTS idx_rc_expiry_date ON vehicles(rc_expiry_date);
CREATE INDEX IF NOT EXISTS idx_rc_vehicle_insurance_upto ON vehicles(rc_vehicle_insurance_upto);
CREATE INDEX IF NOT EXISTS idx_rc_vehicle_tax_upto ON vehicles(rc_vehicle_tax_upto);
CREATE INDEX IF NOT EXISTS idx_rc_pucc_upto ON vehicles(rc_pucc_upto);

-- Add timestamps if they don't exist
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Show success message
SELECT 'RC fields migration completed successfully!' as message;
