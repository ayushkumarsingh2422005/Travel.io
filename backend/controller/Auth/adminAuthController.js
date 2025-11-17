const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword';



// Helper: Generate JWT for admin
function generateToken() {
    return jwt.sign({ role: 'admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '7d' });
}

const login = async (req, res) => {
    console.log(req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required.' });
        }
        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = generateToken();
        res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Admin login failed', error: err.message });
    }
};

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

module.exports = { login, verifytoken }; 