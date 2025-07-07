const express = require('express');
const router = express.Router();
const { signup, login, google } = require('../../controller/Auth/vendorAuthController');
const { verify } = require('crypto');
const { verifytoken } = require('../../controller/Auth/userAuthController');

// Email/Password Signup
router.post('/signup', signup);

// Email/Password Login
router.post('/login', login);

// Google Sign-In/Up
router.post('/google', google);

// Token verification endpoint
router.get('/verifytoken',verifytoken);

module.exports = router; 