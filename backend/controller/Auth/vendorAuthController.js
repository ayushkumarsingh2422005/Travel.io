const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: Generate JWT
function generateToken(vendor) {
    return jwt.sign({ id: vendor.id, email: vendor.email }, JWT_SECRET, { expiresIn: '7d' });
}

const signup = async (req, res) => {
    try {
        const { name, email, phone, password, gender, age, current_address, description } = req.body;
        if (!name || !email || !phone || !password || !gender || !age || !current_address) {
            return res.status(400).json({ message: 'All required fields are missing.' });
        }
        
        const [existing] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        const [existingPhone] = await db.execute('SELECT * FROM vendors WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
            return res.status(409).json({ message: 'Phone number already registered.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const id = require('crypto').randomBytes(32).toString('hex');
        
        await db.execute(
            `INSERT INTO vendors (id, name, email, phone, password_hash, gender, age, current_address, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, phone, password_hash, gender, age, current_address, description || null]
        );
        
        const token = generateToken({ id, email });
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Vendor signup failed', error: err.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
        
        const [vendors] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);
        if (vendors.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });
        
        const vendor = vendors[0];
        const valid = await bcrypt.compare(password, vendor.password_hash);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
        
        const token = generateToken(vendor);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Vendor login failed', error: err.message });
    }
}

const google = async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) return res.status(400).json({ message: 'No Google token provided.' });
        
        const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const { sub: google_id, email, name, picture } = payload;
        
        console.log('Google auth for vendor:', { google_id, email, name, picture });
        
        let [vendors] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);
        let vendor;
        
        if (vendors.length > 0) {
            vendor = vendors[0];
            // If vendor exists but doesn't have profile pic, update it
            if (!vendor.profile_pic && picture) {
                await db.execute('UPDATE vendors SET profile_pic = ? WHERE id = ?', [picture, vendor.id]);
                vendor.profile_pic = picture;
            }
        } else {
            try {
                // Create new vendor with Google info
                const id = require('crypto').randomBytes(32).toString('hex');
                console.log('Creating new Google vendor:', { id, name, email, picture, google_id });
                
                // For Google signup, we'll need additional required fields
                // You might want to redirect to a profile completion page
                await db.execute(
                    `INSERT INTO vendors (id, name, email, profile_pic, password_hash, gender, age, current_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, name, email, picture, '', 'Other', 18, 'Address to be updated']
                );
                
                vendor = { id, email, name, profile_pic: picture };
            } catch (err) {
                console.error('Error creating Google vendor:', err);
                return res.status(500).json({ message: 'Failed to create Google vendor', error: err.message });
            }
        }
        
        const token = generateToken(vendor);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Google sign-in failed', error: err.message });
    }
}

module.exports = { signup, login, google }
