const express = require('express');
const router = express.Router();
const { signup, login, google } = require('../../controller/Auth/vendorAuthController');

// Email/Password Signup
router.post('/signup', signup);

// Email/Password Login
router.post('/login', login);

// Google Sign-In/Up
router.post('/google', google);

module.exports = router; 