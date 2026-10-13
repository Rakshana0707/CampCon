const express = require('express');
const router = express.Router();
const { checkHealth, triggerSeed } = require('../controllers/health.controller');

// @route   GET /api/health
// @desc    Verify server status and database connectivity
// @access  Public
router.get('/', checkHealth);

// @route   GET /api/health/seed
// @desc    Initialize demo events and users if database is empty
// @access  Public
router.get('/seed', triggerSeed);

module.exports = router;
