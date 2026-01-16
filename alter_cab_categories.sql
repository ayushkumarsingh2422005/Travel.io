-- Alter table to allow flexible categories (Fix for Data Truncated error)
-- Changing ENUM columns to VARCHAR to support new category types like '8hr_80km', 'one_way' as a service type, etc.

ALTER TABLE cab_categories MODIFY COLUMN service_type VARCHAR(50) NOT NULL;
ALTER TABLE cab_categories MODIFY COLUMN sub_category VARCHAR(50) DEFAULT NULL;
ALTER TABLE cab_categories MODIFY COLUMN micro_category VARCHAR(50) DEFAULT NULL;

-- Explanation:
-- The previous schema restricted 'micro_category' to ENUM('same_day', 'multi_day').
-- Your hourly rental data uses '8hr_80km', which is not in that list.
-- Changing to VARCHAR allows any text value.
