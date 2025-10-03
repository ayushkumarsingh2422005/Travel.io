const express = require('express');
const router = express.Router();
const { 
    getUserProfile, 
    updateUserProfile, 
    updateUserPassword,
    setUserPassword,
    deleteUserAccount
} = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply middleware to all routes
router.use(authMiddleware);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/password', updateUserPassword);
router.post('/set-password', setUserPassword);
router.delete('/account', deleteUserAccount);

module.exports = router;
