const db = require('../config/db');
const crypto = require('crypto');

// Get all active add-ons
const getAddOns = async (req, res) => {
    try {
        const [addOns] = await db.execute(`
            SELECT * FROM add_ons 
            WHERE is_active = 1 
            ORDER BY display_order ASC, name ASC
        `);

        res.status(200).json({
            success: true,
            data: addOns
        });
    } catch (error) {
        console.error('Error fetching add-ons:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch add-ons',
            error: error.message
        });
    }
};

// Add new add-on (Admin only)
const addAddOn = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            pricing_type,
            percentage_value,
            category,
            icon_url
        } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name and category are required'
            });
        }

        if (pricing_type === 'fixed' && (!price || price <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Price is required for fixed pricing type'
            });
        }

        if (pricing_type === 'percentage' && (!percentage_value || percentage_value <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Percentage value is required for percentage pricing type'
            });
        }

        const id = crypto.createHash('sha256').update(name + Date.now().toString() + Math.random().toString()).digest('hex');

        await db.execute(`
            INSERT INTO add_ons 
            (id, name, description, price, pricing_type, percentage_value, category, icon_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            name,
            description || null,
            price || 0,
            pricing_type || 'fixed',
            percentage_value || null,
            category,
            icon_url || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Add-on created successfully',
            data: { id }
        });
    } catch (error) {
        console.error('Error creating add-on:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create add-on',
            error: error.message
        });
    }
};

// Update add-on (Admin only)
const updateAddOn = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            pricing_type,
            percentage_value,
            category,
            icon_url,
            is_active,
            display_order
        } = req.body;

        const [existing] = await db.execute('SELECT id FROM add_ons WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Add-on not found'
            });
        }

        await db.execute(`
            UPDATE add_ons 
            SET name = COALESCE(?, name),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                pricing_type = COALESCE(?, pricing_type),
                percentage_value = COALESCE(?, percentage_value),
                category = COALESCE(?, category),
                icon_url = COALESCE(?, icon_url),
                is_active = COALESCE(?, is_active),
                display_order = COALESCE(?, display_order)
            WHERE id = ?
        `, [
            name,
            description,
            price,
            pricing_type,
            percentage_value,
            category,
            icon_url,
            is_active,
            display_order,
            id
        ]);

        res.status(200).json({
            success: true,
            message: 'Add-on updated successfully'
        });
    } catch (error) {
        console.error('Error updating add-on:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update add-on',
            error: error.message
        });
    }
};

// Delete add-on (Admin only)
const deleteAddOn = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.execute('SELECT id FROM add_ons WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Add-on not found'
            });
        }

        await db.execute('DELETE FROM add_ons WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Add-on deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting add-on:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete add-on',
            error: error.message
        });
    }
};

module.exports = {
    getAddOns,
    addAddOn,
    updateAddOn,
    deleteAddOn
};
