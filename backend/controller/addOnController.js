const db = require('../config/db');
const crypto = require('crypto');

// Generate unique ID
const generateUniqueId = () => crypto.randomBytes(32).toString('hex');

// Add a new Add-On
const addAddOn = async (req, res) => {
    try {
        const { name, price, price_type, description } = req.body;
        if (!name || !price) {
            return res.status(400).json({ success: false, message: 'Name and price are required' });
        }
        const id = generateUniqueId();
        await db.execute(
            `INSERT INTO add_ons (id, name, price, price_type, description) VALUES (?, ?, ?, ?, ?)`,
            [id, name, price, price_type || 'fixed', description || null]
        );
        res.status(201).json({ success: true, message: 'Add-on created', data: { id, ...req.body } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create add-on' });
    }
};

// Get all Add-Ons
const getAddOns = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM add_ons WHERE is_active = 1');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch add-ons' });
    }
};

module.exports = { addAddOn, getAddOns };
