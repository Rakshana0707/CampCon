const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, getMyNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);

module.exports = router;
