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

// Vehicle CRUD routes
router.post('/', addVehicle);
router.post('/with-rc', createVehicleWithRC); // Create vehicle with RC verification
router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Vehicle RC verification route
router.post('/verify-rc', verifyVehicleRC);

module.exports = router;
