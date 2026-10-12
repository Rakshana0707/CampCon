const express = require('express');
const router = express.Router();
const { 
    getPlatformAnalytics, 
    getAllUsers, 
    updateUserRole, 
    deleteUser,
    getAdminOrganizers,
    toggleEntityStatus,
    assignUserToEntity,
    revokeAssignment,
    createOrganizerAccount,
    toggleUserActiveStatus,
    updateUserAffiliation
} = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// Analytics and User Operations
router.get('/analytics', getPlatformAnalytics);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserActiveStatus);
router.patch('/users/:id/affiliation', updateUserAffiliation);
router.delete('/users/:id', deleteUser);

// Official Organizer Directory & Staffing Management
router.get('/organizers', getAdminOrganizers);
router.patch('/organizers/:id/status', toggleEntityStatus);
router.post('/organizers/assign', assignUserToEntity);
router.delete('/organizers/assignments/:id', revokeAssignment);
router.post('/organizers/invite', createOrganizerAccount);

module.exports = router;
