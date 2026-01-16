const db = require('../config/db');
const crypto = require('crypto');

// Generate unique ID
const generateUniqueId = () => crypto.randomBytes(32).toString('hex');

// Add a new Cab Category (Pricing Rule)
const addCabCategory = async (req, res) => {
    try {
        console.log('Add Category Body:', req.body);
        console.log('Add Category File:', req.file);

        let {
            service_type, sub_category, micro_category, segment, category, // Frontend sends 'category' sometimes
            base_price, price_per_km, min_km_per_day,
            min_seats, max_seats, min_no_of_seats, max_no_of_seats, // Frontend sends no_of_seats
            package_hours, package_km,
            extra_hour_rate, extra_km_rate, driver_allowance, driver_charges, // Frontend sends driver_charges
            description, notes, is_active // Frontend sends notes
        } = req.body;

        // Map Frontend Fields to Backend Schema
        if (service_type === 'hourly') service_type = 'hourly_rental';
        if (!segment && category) segment = category;
        if (!min_seats && min_no_of_seats) min_seats = min_no_of_seats;
        if (!max_seats && max_no_of_seats) max_seats = max_no_of_seats;
        if (!driver_allowance && driver_charges) driver_allowance = driver_charges;
        
        // Map notes to description if description is empty
        if (!description && notes) description = notes;
        
        // Append Category Name to description if it differs from segment
        if (category && segment && category !== segment) {
             description = (description ? description + '. ' : '') + 'Category Name: ' + category;
        }

        // Handle Image Upload
        let category_image = null;
        if (req.file) {
            category_image = `/uploads/${req.file.filename}`;
        }

        // Basic validation
        if (!service_type || !segment) {
            return res.status(400).json({ success: false, message: 'Service type and segment/category are required' });
        }

        const id = generateUniqueId();

        await db.execute(
            `INSERT INTO cab_categories (
                id, service_type, sub_category, micro_category, segment,
                base_price, price_per_km, min_km_per_day,
                min_seats, max_seats,
                package_hours, package_km,
                extra_hour_rate, extra_km_rate, driver_allowance,
                category_image, description, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, service_type, sub_category || null, micro_category || null, segment,
                base_price || 0, price_per_km || 0, min_km_per_day || 0,
                min_seats || 4, max_seats || 4,
                package_hours || 0, package_km || 0,
                extra_hour_rate || 0, extra_km_rate || 0, driver_allowance || 0,
                category_image || null, description || null, is_active === undefined ? 1 : is_active
            ]
        );

        res.status(201).json({ success: true, message: 'Pricing Rule created', cab_category: { id, ...req.body } });
    } catch (error) {
        console.error('Error adding cab category:', error);
        res.status(500).json({ success: false, message: 'Failed to add cab category', error: error.message });
    }
};

// Update cab category
const updateCabCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check availability
        const [existing] = await db.execute('SELECT * FROM cab_categories WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ success: false, message: 'Category not found' });

        // Build dynamic query
        const allowedFields = [
            'service_type', 'sub_category', 'micro_category', 'segment',
            'base_price', 'price_per_km', 'min_km_per_day',
            'min_seats', 'max_seats',
            'package_hours', 'package_km', 'extra_hour_rate', 'extra_km_rate', 'driver_allowance',
            'category_image', 'description', 'is_active'
        ];

        let updateClauses = [];
        let params = [];

        for (const key of allowedFields) {
            if (updates[key] !== undefined) {
                updateClauses.push(`${key} = ?`);
                params.push(updates[key]);
            }
        }

        if (updateClauses.length === 0) return res.status(400).json({ success: false, message: 'No updates provided' });

        params.push(id);
        await db.execute(`UPDATE cab_categories SET ${updateClauses.join(', ')} WHERE id = ?`, params);

        res.status(200).json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating cab category:', error);
        res.status(500).json({ success: false, message: 'Failed to update cab category', error: error.message });
    }
};

// Delete a cab category
const deleteCabCategory = async (req, res) => {
    try {
        const { id } = req.params;
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
        // Optional filtering by service type if query params provided
        // e.g. /cab-categories?service_type=outstation
        let query = 'SELECT * FROM cab_categories';
        let params = [];

        if (req.query.service_type) {
            query += ' WHERE service_type = ?';
            params.push(req.query.service_type);
        }

        const [categories] = await db.execute(query, params);
        res.status(200).json({ success: true, count: categories.length, cab_categories: categories });
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
        res.status(200).json({ success: true, cab_category: categories[0] });
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
