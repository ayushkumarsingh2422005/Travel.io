const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: Generate JWT
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

const verifytoken=(req,res)=>{
    try{
      const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided.',success:false });
        }
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token.',success:false });
            }
            // Token is valid, you can access decoded data
            res.status(200).json({ message: 'Token is valid',success:true, customer: decoded });
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: 'Token verification failed',success:false, error: err.message });
    }
}

const signup = async (req, res) => {
    try {
        const { name, email, phone, password, gender, age, current_address } = req.body;
        if (!name || !email || !phone || !password || !gender || !age || !current_address) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const id = require('crypto').randomBytes(32).toString('hex');
        await db.execute(
            `INSERT INTO users (id, name, email, phone, password_hash, gender, age, current_address, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'local')`,
            [id, name, email, phone, password_hash, gender, age, current_address]
        );
        const token = generateToken({ id, email });
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Signup failed', error: err.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
        const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND auth_provider = "local"', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
}

const google = async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) return res.status(400).json({ message: 'No Google token provided.' });
        const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const { sub: google_id, email, name, picture } = payload;
        console.log(google_id, email, name, picture);
        let [users] = await db.execute('SELECT * FROM users WHERE google_id = ? OR email = ?', [google_id, email]);
        // console.log(users)
        let user;
        if (users.length > 0) {
            user = users[0];
            // If user exists but not linked to Google, update
            if (!user.google_id) {
                await db.execute('UPDATE users SET google_id = ?, auth_provider = "google" WHERE id = ?', [google_id, user.id]);
            }
        } else {
            try {
                // Create new user
                const id = require('crypto').randomBytes(32).toString('hex');
                console.log('Creating new Google user:', { id, name, email, picture, google_id });
                const [insertResult] = await db.execute(
                    `INSERT INTO users (id, name, email, profile_pic, google_id, auth_provider) VALUES (?, ?, ?, ?, ?, 'google')`,
                    [id, name, email, picture, google_id]
                );
                console.log('Insert result:', insertResult);
                user = { id, email, name, google_id, picture };
            } catch (err) {
                console.error('Error creating Google user:', err);
                return res.status(500).json({ message: 'Failed to create Google user', error: err.message });
            }
        }
        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Google sign-in failed', error: err.message });
    }
}

module.exports = {signup, login, google,verifytoken};