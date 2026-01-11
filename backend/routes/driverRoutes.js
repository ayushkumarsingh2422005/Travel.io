const express = require('express');
const router = express.Router();
const { 
    addDriver, 
    updateDriver, 
    deleteDriver, 
    getDrivers, 
    getDriver, 
    verifyDriverLicense 
} = require('../controller/driverController');

// Import Upload Middleware
const upload = require('../middleware/uploadMiddleware');

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
        req.user = decoded;
        // console.log(req.body);
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Apply middleware to all routes
router.use(authMiddleware);

// Driver CRUD routes
router.post('/', upload.single('image'), addDriver);
router.get('/', getDrivers);
router.get('/:id', getDriver);
router.put('/:id', upload.single('image'), updateDriver);
router.delete('/:id', deleteDriver);

// Driver license verification route
router.post('/verify-license', verifyDriverLicense);

module.exports = router; 