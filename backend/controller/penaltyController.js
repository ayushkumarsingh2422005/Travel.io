const db = require('../config/db');
const crypto = require('crypto');

// Generate unique ID
const generateUniqueId = () => crypto.randomBytes(32).toString('hex');

// Add a new Penalty
const addPenalty = async (req, res) => {
    try {
        const { offense_name, amount, deduction_type, description } = req.body;
        if (!offense_name || !amount) {
            return res.status(400).json({ success: false, message: 'Offense name and amount are required' });
        }
        const id = generateUniqueId();
        await db.execute(
            `INSERT INTO penalties (id, offense_name, amount, deduction_type, description) VALUES (?, ?, ?, ?, ?)`,
            [id, offense_name, amount, deduction_type || 'fixed', description || null]
        );
        res.status(201).json({ success: true, message: 'Penalty rule created', data: { id, ...req.body } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create penalty' });
    }
};

// Get all Penalties
const getPenalties = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM penalties WHERE is_active = 1');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch penalties' });
    }
};

module.exports = { addPenalty, getPenalties };
