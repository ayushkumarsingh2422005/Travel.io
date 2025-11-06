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
const { 
    getCabCategories, 
    getCabCategory 
} = require('../controller/cabCategoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Public cab category routes (no auth required)
router.get('/cab-categories', getCabCategories);
router.get('/cab-categories/:id', getCabCategory);

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
