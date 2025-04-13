const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

// POST request to /signup
router.post('/signup', signup);

// POST request to /login
router.post('/login', login);

module.exports = router;
