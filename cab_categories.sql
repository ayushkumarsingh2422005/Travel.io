-- SQL Script to Populate Cab Categories (FIXED)
-- Corrected: 'micro_category' is set to NULL for Hourly Rentals (as per schema).

-- ==========================================================
-- 1. ONE-WAY TRIP
-- ==========================================================

-- Sedan (One-Way)
INSERT INTO cab_categories (
    id, service_type, sub_category, micro_category, segment, 
    base_price, price_per_km, min_km_per_day, 
    min_seats, max_seats, 
    driver_allowance, description, is_active
) VALUES (
    UUID(), 'outstation', 'one_way', 'same_day', 'Sedan (Dzire/Etios)', 
    0, 14.00, 0, 
    4, 4, 
    0, 'Comfortable sedan for one-way drops.', 1
);

-- SUV (One-Way)
INSERT INTO cab_categories (
    id, service_type, sub_category, micro_category, segment, 
    base_price, price_per_km, min_km_per_day, 
    min_seats, max_seats, 
    driver_allowance, description, is_active
) VALUES (
    UUID(), 'outstation', 'one_way', 'same_day', 'SUV (Innova/Ertiga)', 
    0, 18.00, 0, 
    6, 7, 
    0, 'Spacious SUV for one-way drops.', 1
);


-- ==========================================================
-- 2. ROUND TRIP
-- ==========================================================

-- Sedan (Round Trip)
INSERT INTO cab_categories (
    id, service_type, sub_category, micro_category, segment, 
    base_price, price_per_km, min_km_per_day, 
    min_seats, max_seats, 
    driver_allowance, description, is_active
) VALUES (
    UUID(), 'outstation', 'round_trip', 'multi_day', 'Sedan (Dzire/Etios)', 
    0, 13.00, 250, 
    4, 4, 
    250.00, 'Round trip sedan. Min 250km/day billing.', 1
);

-- SUV (Round Trip)
INSERT INTO cab_categories (
    id, service_type, sub_category, micro_category, segment, 
    base_price, price_per_km, min_km_per_day, 
    min_seats, max_seats, 
    driver_allowance, description, is_active
) VALUES (
    UUID(), 'outstation', 'round_trip', 'multi_day', 'SUV (Innova/Ertiga)', 
    0, 17.00, 250, 
    6, 7, 
    300.00, 'Round trip SUV. Min 250km/day billing.', 1
);


-- ==========================================================
-- 3. HOURLY CAR RENTAL
-- micro_category is NULL (packages defined by package_hours/km)
-- ==========================================================

-- Sedan (8 hrs / 80 km)
INSERT INTO cab_categories (
    id, service_type, sub_category, micro_category, segment, 
    base_price, price_per_km, min_km_per_day, 
    min_seats, max_seats, 
    package_hours, package_km, extra_hour_rate, extra_km_rate,
    driver_allowance, description, is_active
) VALUES (
    UUID(), 'hourly_rental', NULL, NULL, 'Sedan (Dzire/Etios)', 
    2200.00, 0, 0, 
    4, 4, 
    8, 80, 250.00, 14.00,
    0, '8 Hours / 80 KM package via flexible hourly rental.', 1
);

-- SUV (8 hrs / 80 km)
INSERT INTO cab_categories (
    id, service_type, sub_category, micro_category, segment, 
    base_price, price_per_km, min_km_per_day, 
    min_seats, max_seats, 
    package_hours, package_km, extra_hour_rate, extra_km_rate,
    driver_allowance, description, is_active
) VALUES (
    UUID(), 'hourly_rental', NULL, NULL, 'SUV (Innova/Ertiga)', 
    3000.00, 0, 0, 
    6, 7, 
    8, 80, 350.00, 18.00,
    0, '8 Hours / 80 KM package via flexible hourly rental.', 1
);

-- Sedan (4 hrs / 40 km)
INSERT INTO cab_categories (
    id, service_type, sub_category, micro_category, segment, 
    base_price, price_per_km, min_km_per_day, 
    min_seats, max_seats, 
    package_hours, package_km, extra_hour_rate, extra_km_rate,
    driver_allowance, description, is_active
) VALUES (
    UUID(), 'hourly_rental', NULL, NULL, 'Sedan (Dzire/Etios)', 
    1200.00, 0, 0, 
    4, 4, 
    4, 40, 250.00, 14.00,
    0, '4 Hours / 40 KM package via flexible hourly rental.', 1
);
