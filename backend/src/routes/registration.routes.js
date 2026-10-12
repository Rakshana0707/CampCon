const express = require('express');
const router = express.Router();
const { 
    registerForEvent, 
    cancelRegistration, 
    getMyRegistrations, 
    getEventRegistrations,
    getRegistrationById
} = require('../controllers/registration.controller');
const { verifyTicketAndMarkAttendance } = require('../controllers/attendance.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Routes mounted at /api/registrations
router.get('/me', authenticateToken, getMyRegistrations);
router.get('/:id', authenticateToken, getRegistrationById);
router.patch('/:ticketId/attendance', authenticateToken, verifyTicketAndMarkAttendance);

// Note: The rest will be mounted at /api/events to keep URLs strictly RESTful
// Example: POST /api/events/:eventId/register

module.exports = router;
