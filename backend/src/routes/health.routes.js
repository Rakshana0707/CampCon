const express = require('express');
const router = express.Router();
const { checkHealth } = require('../controllers/health.controller');

// @route   GET /api/health
// @desc    Verify server status and database connectivity
// @access  Public
router.get('/', checkHealth);

module.exports = router;
