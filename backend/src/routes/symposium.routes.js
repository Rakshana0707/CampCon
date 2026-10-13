const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken, requireOrganizer, optionalAuth } = require('../middleware/auth.middleware');
const symposiumController = require('../controllers/symposium.controller');

// Activities under a symposium: /api/events/:symposiumId/activities
router.post(
  '/events/:symposiumId/activities',
  authenticateToken,
  requireOrganizer,
  symposiumController.addActivity
);

router.get(
  '/events/:symposiumId/activities',
  optionalAuth,
  symposiumController.getSymposiumActivities
);

// Individual activity operations
router.put(
  '/activities/:activityId',
  authenticateToken,
  requireOrganizer,
  symposiumController.updateActivity
);

router.delete(
  '/activities/:activityId',
  authenticateToken,
  requireOrganizer,
  symposiumController.removeActivity
);

// Two-tier activity registration
router.post(
  '/activities/:activityId/register',
  authenticateToken,
  symposiumController.registerForActivity
);

router.delete(
  '/activities/:activityId/register',
  authenticateToken,
  symposiumController.cancelActivityRegistration
);

router.get(
  '/activities/:activityId/registrations',
  authenticateToken,
  requireOrganizer,
  symposiumController.getActivityRegistrations
);

module.exports = router;
