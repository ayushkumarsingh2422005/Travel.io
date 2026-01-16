const express = require('express');
const router = express.Router();
const {
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicles,
    getVehicle,
    verifyVehicleRC,
    createVehicleWithRC
} = require('../controller/vehicleController');
const { getCabCategories } = require('../controller/cabCategoryController');

// Middleware to protect routes
// Import Upload Middleware
const upload = require('../middleware/uploadMiddleware');

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

// Vehicle CRUD routes
router.post('/', upload.single('image'), addVehicle);
router.post('/with-rc', upload.single('image'), createVehicleWithRC); // Create vehicle with RC verification
router.get('/', getVehicles);
router.get('/cab-categories', getCabCategories);
router.get('/:id', getVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Vehicle RC verification route
router.post('/verify-rc', verifyVehicleRC);

module.exports = router;
