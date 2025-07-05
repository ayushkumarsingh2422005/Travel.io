const express = require('express');
const router = express.Router();
const { signup, login, google, verifytoken } = require('../../controller/Auth/userAuthController');
const { verify } = require('crypto');

// Email/Password Signup
router.post('/signup', signup);

// Email/Password Login
router.post('/login', login);

// Google Sign-In/Up
router.post('/google', google);

router.get('/verifytoken',verifytoken);

module.exports = router; 