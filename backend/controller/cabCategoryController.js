const db = require('../config/db');
const crypto = require('crypto');

// Generate unique ID
const generateUniqueId = () => crypto.randomBytes(32).toString('hex');

// Add a new Cab Category
const addCabCategory = async (req, res) => {
    try {
        const {
            category, price_per_km, min_no_of_seats, max_no_of_seats,
            fuel_charges, driver_charges, night_charges,
            included_vehicle_types, base_discount, category_image, notes, is_active
        } = req.body;

        // Validate required fields
        if (!category || !price_per_km) {
            return res.status(400).json({ success: false, message: 'Missing required fields: category, price_per_km are required' });
        }

        // Check if category already exists
        const [existing] = await db.execute('SELECT * FROM cab_categories WHERE category = ?', [category]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Category already exists' });
        }

        const id = generateUniqueId();
        // Insert
        await db.execute(
            `INSERT INTO cab_categories (id, category, price_per_km, min_no_of_seats, max_no_of_seats, fuel_charges, driver_charges, night_charges, included_vehicle_types, base_discount, category_image, notes, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            [id, category, price_per_km, min_no_of_seats || 0, max_no_of_seats || 0,
                fuel_charges || 0, driver_charges || 0, night_charges || 0,
                included_vehicle_types ? JSON.stringify(included_vehicle_types) : null,
                base_discount || 0, category_image || null, notes || null, is_active === undefined ? 1 : is_active]
        );

        res.status(201).json({ success: true, message: 'Cab category created', cab_category: { id, ...req.body, is_active: is_active === undefined ? 1 : is_active } });
    } catch (error) {
        console.error('Error adding cab category:', error);
        res.status(500).json({ success: false, message: 'Failed to add cab category', error: error.message });
    }
};

// Update cab category
const updateCabCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category, price_per_km, min_no_of_seats, max_no_of_seats,
            fuel_charges, driver_charges, night_charges,
            included_vehicle_types, base_discount, category_image, notes, is_active
        } = req.body;

        // Check if exists
        const [records] = await db.execute('SELECT * FROM cab_categories WHERE id = ?', [id]);
        if (records.length === 0) {
            return res.status(404).json({ success: false, message: 'Cab category not found' });
        }

        let updateFields = [];
        let queryParams = [];
        if (category) { updateFields.push('category = ?'); queryParams.push(category); }
        if (price_per_km !== undefined) { updateFields.push('price_per_km = ?'); queryParams.push(price_per_km); }
        if (min_no_of_seats !== undefined) { updateFields.push('min_no_of_seats = ?'); queryParams.push(min_no_of_seats); }
        if (max_no_of_seats !== undefined) { updateFields.push('max_no_of_seats = ?'); queryParams.push(max_no_of_seats); }
        if (fuel_charges !== undefined) { updateFields.push('fuel_charges = ?'); queryParams.push(fuel_charges); }
        if (driver_charges !== undefined) { updateFields.push('driver_charges = ?'); queryParams.push(driver_charges); }
        if (night_charges !== undefined) { updateFields.push('night_charges = ?'); queryParams.push(night_charges); }
        if (included_vehicle_types !== undefined) { updateFields.push('included_vehicle_types = ?'); queryParams.push(JSON.stringify(included_vehicle_types)); }
        if (base_discount !== undefined) { updateFields.push('base_discount = ?'); queryParams.push(base_discount); }
        if (category_image !== undefined) { updateFields.push('category_image = ?'); queryParams.push(category_image); }
        if (notes !== undefined) { updateFields.push('notes = ?'); queryParams.push(notes); }
        if (is_active !== undefined) { updateFields.push('is_active = ?'); queryParams.push(is_active); }
        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update provided' });
        }
        queryParams.push(id);

        await db.execute(
            `UPDATE cab_categories SET ${updateFields.join(', ')} WHERE id = ?`,
            queryParams
        );

        const [updated] = await db.execute('SELECT * FROM cab_categories WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Cab category updated successfully', cab_category: updated[0] });
    } catch (error) {
        console.error('Error updating cab category:', error);
        res.status(500).json({ success: false, message: 'Failed to update cab category', error: error.message });
    }
};

// Delete a cab category
const deleteCabCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if exists
        const [records] = await db.execute('SELECT * FROM cab_categories WHERE id = ?', [id]);
        if (records.length === 0) {
            return res.status(404).json({ success: false, message: 'Cab category not found' });
        }
        await db.execute('DELETE FROM cab_categories WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Cab category deleted successfully' });
    } catch (error) {
        console.error('Error deleting cab category:', error);
        res.status(500).json({ success: false, message: 'Failed to delete cab category', error: error.message });
    }
};

// Get all cab categories
const getCabCategories = async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM cab_categories');
        // Parse included_vehicle_types JSON
        const parsed = categories.map(cat => {
            if (cat.included_vehicle_types) {
                try { cat.included_vehicle_types = JSON.parse(cat.included_vehicle_types); } catch { cat.included_vehicle_types = null; }
            }
            return cat;
        });
        res.status(200).json({ success: true, count: parsed.length, cab_categories: parsed });
    } catch (error) {
        console.error('Error fetching cab categories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cab categories', error: error.message });
    }
};
// Get single cab category
const getCabCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const [categories] = await db.execute('SELECT * FROM cab_categories WHERE id = ?', [id]);
        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Cab category not found' });
        }
        let cat = categories[0];
        if (cat.included_vehicle_types) {
            try { cat.included_vehicle_types = JSON.parse(cat.included_vehicle_types); } catch { cat.included_vehicle_types = null; }
        }
        res.status(200).json({ success: true, cab_category: cat });
    } catch (error) {
        console.error('Error fetching cab category:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cab category', error: error.message });
    }
};

module.exports = {
    addCabCategory,
    updateCabCategory,
    deleteCabCategory,
    getCabCategories,
    getCabCategory
};
