-- SQL Script to Revert Schema to ENUMs
-- Use this if you want to reverse the 'alter_cab_categories.sql' changes and return to strict ENUM validation.

-- 1. Ensure no invalid data exists before reverting (Update invalid values to NULL or valid ENUMs)
UPDATE cab_categories SET service_type = 'outstation' WHERE service_type NOT IN ('outstation', 'hourly_rental');
UPDATE cab_categories SET sub_category = NULL WHERE sub_category NOT IN ('one_way', 'round_trip');
UPDATE cab_categories SET micro_category = NULL WHERE micro_category NOT IN ('same_day', 'multi_day');

-- 2. Modify columns back to ENUM
ALTER TABLE cab_categories MODIFY COLUMN service_type ENUM('outstation', 'hourly_rental') NOT NULL;
ALTER TABLE cab_categories MODIFY COLUMN sub_category ENUM('one_way', 'round_trip') DEFAULT NULL;
ALTER TABLE cab_categories MODIFY COLUMN micro_category ENUM('same_day', 'multi_day') DEFAULT NULL;

SELECT 'Schema reverted to ENUMs successfully.' as Message;
