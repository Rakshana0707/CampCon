const express = require('express');
const router = express.Router();
const { 
    registerForEvent, 
    cancelRegistration, 
    getMyRegistrations, 
    getEventRegistrations,
    getRegistrationById,
    updateRegistrationStatus,
    assignVolunteer,
    removeVolunteer,
    getStudentsList
} = require('../controllers/registration.controller');
const { verifyTicketAndMarkAttendance } = require('../controllers/attendance.controller');
const { authenticateToken, requireOrganizer } = require('../middleware/auth.middleware');

// Routes mounted at /api/registrations
router.get('/me', authenticateToken, getMyRegistrations);
router.get('/students', authenticateToken, requireOrganizer, getStudentsList);
router.post('/volunteer', authenticateToken, requireOrganizer, assignVolunteer);
router.delete('/volunteer/:id', authenticateToken, requireOrganizer, removeVolunteer);
router.delete('/volunteer', authenticateToken, requireOrganizer, removeVolunteer);
router.post('/', authenticateToken, registerForEvent);
router.patch('/:id/status', authenticateToken, requireOrganizer, updateRegistrationStatus);
router.delete('/:eventId', authenticateToken, cancelRegistration);
router.get('/:id', authenticateToken, getRegistrationById);
router.patch('/:ticketId/attendance', authenticateToken, verifyTicketAndMarkAttendance);

module.exports = router;

