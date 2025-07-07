const express = require('express');
const router = express.Router();
const { login } = require('../../controller/Auth/adminAuthController');

// Admin Email/Password Login
router.post('/login', login);

module.exports = router; 