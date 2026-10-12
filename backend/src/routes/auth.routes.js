const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Rate limiting configuration for authentication endpoints
const authLimiter = rateLimit({
    windowMs: process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes by default
    max: process.env.AUTH_RATE_LIMIT_MAX || 10, // Limit each IP to 10 requests per `window`
    message: {
        success: false,
        error: 'Too many authentication attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;
