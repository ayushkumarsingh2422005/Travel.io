const express = require('express');
const router = express.Router();
const { login, verifytoken } = require('../../controller/Auth/adminAuthController');

// Admin Email/Password Login
router.post('/login', login);
router.get('/verifytoken', verifytoken);

module.exports = router; 