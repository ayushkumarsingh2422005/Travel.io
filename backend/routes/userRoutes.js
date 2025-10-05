const express = require('express');
const router = express.Router();
const { 
    getUserProfile, 
    updateUserProfile, 
    updateUserPassword,
    setUserPassword,
    deleteUserAccount,
    searchVehicles,
    getVehicleDetails,
    getVehicleTypes
} = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Vehicle search and details routes
router.get('/vehicles/search', searchVehicles);
router.get('/vehicles/types', getVehicleTypes);
router.get('/vehicles/:vehicleId', getVehicleDetails);

// Apply middleware to all routes
router.use(authMiddleware);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/password', updateUserPassword);
router.post('/set-password', setUserPassword);
router.delete('/account', deleteUserAccount);


module.exports = router;
