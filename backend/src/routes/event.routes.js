const express = require('express');
const router = express.Router();
const { 
    createEvent, getAllEvents, getEventById, 
    getMyEvents, updateEvent, deleteEvent, updateEventStatus 
} = require('../controllers/event.controller');
const { authenticateToken, optionalAuth, requireOrganizer, requireAdmin } = require('../middleware/auth.middleware');

const { registerForEvent, cancelRegistration, getEventRegistrations } = require('../controllers/registration.controller');

router.get('/', optionalAuth, getAllEvents);
router.get('/:id', optionalAuth, getEventById);

// Student Registration routes (Nested under Events)
router.post('/:eventId/register', authenticateToken, registerForEvent);
router.delete('/:eventId/register', authenticateToken, cancelRegistration);

// Organizer routes
router.get('/organizer/me', authenticateToken, requireOrganizer, getMyEvents);
router.get('/:eventId/registrations', authenticateToken, requireOrganizer, getEventRegistrations);
router.post('/', authenticateToken, requireOrganizer, createEvent);
router.put('/:id', authenticateToken, requireOrganizer, updateEvent);
router.delete('/:id', authenticateToken, requireOrganizer, deleteEvent);

// Admin routes
router.patch('/:id/status', authenticateToken, requireAdmin, updateEventStatus);

module.exports = router;
