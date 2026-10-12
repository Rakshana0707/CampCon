const express = require('express');
const router = express.Router();
const { 
    getAllOrganizers, 
    getOrganizerById, 
    getMyAssignedEntities 
} = require('../controllers/organizer.controller');
const { authenticateToken, requireOrganizer } = require('../middleware/auth.middleware');

// Public directory routes
router.get('/', getAllOrganizers);
router.get('/my-entities', authenticateToken, requireOrganizer, getMyAssignedEntities);
router.get('/:id', getOrganizerById);

module.exports = router;
