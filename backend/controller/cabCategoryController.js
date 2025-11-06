const db = require('../config/db');
const crypto = require('crypto');

// Helper function to generate a unique ID
const generateUniqueId = () => crypto.randomBytes(32).toString('hex');

// Add a new cab category
const addCabCategory = async (req, res) => {
    try {
        const { name, base_per_km_price } = req.body;

        if (!name || base_per_km_price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Category name and base per km price are required'
            });
        }

        const [existingCategory] = await db.execute(
            'SELECT * FROM cab_categories WHERE name = ?',
            [name]
        );

        if (existingCategory.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cab category with this name already exists'
            });
        }

        const id = generateUniqueId();
        await db.execute(
            'INSERT INTO cab_categories (id, name, base_per_km_price) VALUES (?, ?, ?)',
            [id, name, base_per_km_price]
        );

        res.status(201).json({
            success: true,
            message: 'Cab category added successfully',
            category: { id, name, base_per_km_price }
        });
    } catch (error) {
        console.error('Error adding cab category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add cab category',
            error: error.message
        });
    }
};

// Get all cab categories
const getCabCategories = async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM cab_categories');
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error('Error fetching cab categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cab categories',
            error: error.message
        });
    }
};

// Get a single cab category by ID
const getCabCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const [categories] = await db.execute(
            'SELECT * FROM cab_categories WHERE id = ?',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cab category not found'
            });
        }

        res.status(200).json({
            success: true,
            category: categories[0]
        });
    } catch (error) {
        console.error('Error fetching cab category by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cab category',
            error: error.message
        });
    }
};

// Update a cab category
const updateCabCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, base_per_km_price } = req.body;

        if (!name && base_per_km_price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update provided'
            });
        }

        const [existingCategory] = await db.execute(
            'SELECT * FROM cab_categories WHERE id = ?',
            [id]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cab category not found'
            });
        }

        let updateFields = [];
        let queryParams = [];

        if (name) {
            // Check for duplicate name if changing
            if (name !== existingCategory[0].name) {
                const [duplicateName] = await db.execute(
                    'SELECT * FROM cab_categories WHERE name = ? AND id != ?',
                    [name, id]
                );
                if (duplicateName.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: 'Cab category with this name already exists'
                    });
                }
            }
            updateFields.push('name = ?');
            queryParams.push(name);
        }

        if (base_per_km_price !== undefined) {
            updateFields.push('base_per_km_price = ?');
            queryParams.push(base_per_km_price);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update provided'
            });
        }

        queryParams.push(id);
        await db.execute(
            `UPDATE cab_categories SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            queryParams
        );

        const [updatedCategory] = await db.execute(
            'SELECT * FROM cab_categories WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Cab category updated successfully',
            category: updatedCategory[0]
        });
    } catch (error) {
        console.error('Error updating cab category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cab category',
            error: error.message
        });
    }
};

// Delete a cab category
const deleteCabCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [existingCategory] = await db.execute(
            'SELECT * FROM cab_categories WHERE id = ?',
            [id]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cab category not found'
            });
        }

        // Check if any vehicles are associated with this category
        const [associatedVehicles] = await db.execute(
            'SELECT COUNT(*) as count FROM vehicles WHERE rc_vehicle_category = ?',
            [existingCategory[0].name] // Assuming rc_vehicle_category stores the name
        );

        if (associatedVehicles[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category: vehicles are associated with it. Please reassign or delete associated vehicles first.'
            });
        }

        await db.execute('DELETE FROM cab_categories WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Cab category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cab category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete cab category',
            error: error.message
        });
    }
};

module.exports = {
    addCabCategory,
    getCabCategories,
    getCabCategoryById,
    updateCabCategory,
    deleteCabCategory
};
