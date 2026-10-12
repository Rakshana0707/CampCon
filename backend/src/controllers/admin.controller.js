const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// 1. Get Platform Analytics (Expanded with eventType and official organizer counts)
const getPlatformAnalytics = async (req, res, next) => {
    try {
        const roleCounts = await prisma.user.groupBy({
            by: ['role'],
            _count: { id: true }
        });
        
        const eventStatusCounts = await prisma.event.groupBy({
            by: ['status'],
            _count: { id: true }
        });

        const eventTypeCounts = await prisma.event.groupBy({
            by: ['eventType'],
            _count: { id: true }
        });

        const eventCategoryCounts = await prisma.event.groupBy({
            by: ['category'],
            _count: { id: true }
        });

        const eventDeptCounts = await prisma.event.groupBy({
            by: ['department'],
            _count: { id: true }
        });

        const totalRegistrations = await prisma.registration.count({
            where: { status: 'APPROVED' }
        });

        const attendanceStats = await prisma.registration.groupBy({
            by: ['attendance'],
            _count: { id: true },
            where: { status: 'APPROVED' }
        });

        const totalUsers = await prisma.user.count();
        const totalEvents = await prisma.event.count();
        const totalOrganizerEntities = await prisma.organizerEntity.count();
        const activeOrganizerEntities = await prisma.organizerEntity.count({ where: { isActive: true } });

        const trendsRaw = await prisma.$queryRaw`
            SELECT DATE(createdAt) as reg_date, COUNT(*) as count 
            FROM Registration 
            WHERE status = 'APPROVED'
            GROUP BY DATE(createdAt) 
            ORDER BY DATE(createdAt) ASC 
            LIMIT 30;
        `;
        
        const trends = trendsRaw.map(t => ({
            date: t.reg_date,
            count: Number(t.count)
        }));

        res.status(200).json({
            success: true,
            analytics: {
                totalUsers,
                totalEvents,
                totalRegistrations,
                totalOrganizerEntities,
                activeOrganizerEntities,
                roleCounts,
                eventStatusCounts,
                eventTypeCounts,
                eventCategoryCounts,
                eventDeptCounts,
                attendanceStats,
                trends
            }
        });
    } catch (error) {
        next(error);
    }
};

// 2. Get All Users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: { 
                id: true, 
                name: true, 
                email: true, 
                role: true, 
                department: true, 
                rollNumber: true,
                collegeName: true,
                affiliationStatus: true,
                isActive: true,
                createdAt: true,
                organizerAssignments: {
                    include: {
                        organizerEntity: { select: { id: true, name: true, type: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, users });
    } catch (error) {
        next(error);
    }
};

// 3. Update User Role
const updateUserRole = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const { role } = req.body;
        
        if (!['STUDENT', 'ORGANIZER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        next(error);
    }
};

// 4. Delete User
const deleteUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (userId === req.user.id) {
            return res.status(400).json({ success: false, error: 'Cannot delete your own admin account.' });
        }

        await prisma.user.delete({ where: { id: userId } });
        res.status(200).json({ success: true, message: 'User deleted.' });
    } catch (error) {
        next(error);
    }
};

// 5. List All Organizer Entities for Admin with details
const getAdminOrganizers = async (req, res, next) => {
    try {
        const entities = await prisma.organizerEntity.findMany({
            include: {
                assignments: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } }
                    }
                },
                _count: {
                    select: { events: true }
                }
            },
            orderBy: [{ type: 'asc' }, { name: 'asc' }]
        });

        res.status(200).json({ success: true, count: entities.length, entities });
    } catch (error) {
        next(error);
    }
};

// 6. Toggle Entity Active/Inactive Status
const toggleEntityStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, error: 'isActive boolean is required.' });
        }

        const updated = await prisma.organizerEntity.update({
            where: { id },
            data: { isActive }
        });

        res.status(200).json({ success: true, entity: updated });
    } catch (error) {
        next(error);
    }
};

// 7. Assign an existing user to an Organizer Entity (Promotes user to ORGANIZER if needed)
const assignUserToEntity = async (req, res, next) => {
    try {
        const { userId, organizerEntityId } = req.body;

        if (!userId || !organizerEntityId) {
            return res.status(400).json({ success: false, error: 'User ID and Organizer Entity ID are required.' });
        }

        // Verify entity exists and is active
        const entity = await prisma.organizerEntity.findUnique({ where: { id: parseInt(organizerEntityId) } });
        if (!entity) {
            return res.status(404).json({ success: false, error: 'Organizer Entity not found.' });
        }
        if (!entity.isActive) {
            return res.status(400).json({ success: false, error: 'Cannot assign organizers to a deactivated entity.' });
        }

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        // Check if already assigned
        const existing = await prisma.organizerAssignment.findUnique({
            where: {
                userId_organizerEntityId: {
                    userId: user.id,
                    organizerEntityId: entity.id
                }
            }
        });

        if (existing) {
            return res.status(400).json({ success: false, error: 'User is already assigned to this organizer entity.' });
        }

        // Execute Assignment and promote to ORGANIZER role if currently STUDENT
        const [assignment] = await prisma.$transaction([
            prisma.organizerAssignment.create({
                data: {
                    userId: user.id,
                    organizerEntityId: entity.id
                },
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    organizerEntity: true
                }
            }),
            prisma.user.update({
                where: { id: user.id },
                data: {
                    role: user.role === 'ADMIN' ? 'ADMIN' : 'ORGANIZER'
                }
            })
        ]);

        res.status(201).json({ success: true, assignment });
    } catch (error) {
        next(error);
    }
};

// 8. Revoke an Organizer Assignment
const revokeAssignment = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        const assignment = await prisma.organizerAssignment.findUnique({ where: { id } });
        if (!assignment) {
            return res.status(404).json({ success: false, error: 'Assignment not found.' });
        }

        await prisma.organizerAssignment.delete({ where: { id } });

        // Check if user has any other active organizer assignments
        const remainingAssignments = await prisma.organizerAssignment.count({
            where: { userId: assignment.userId }
        });

        // If no other assignments and role is ORGANIZER, revert to STUDENT
        if (remainingAssignments === 0) {
            const user = await prisma.user.findUnique({ where: { id: assignment.userId } });
            if (user && user.role === 'ORGANIZER') {
                await prisma.user.update({
                    where: { id: assignment.userId },
                    data: { role: 'STUDENT' }
                });
            }
        }

        res.status(200).json({ success: true, message: 'Organizer assignment revoked.' });
    } catch (error) {
        next(error);
    }
};

// 9. Create and Invite a new Organizer Account for an entity
const createOrganizerAccount = async (req, res, next) => {
    try {
        const { name, email, password, organizerEntityId, department } = req.body;

        if (!name || !email || !password || !organizerEntityId) {
            return res.status(400).json({ success: false, error: 'Name, email, password, and organizerEntityId are required.' });
        }

        const entity = await prisma.organizerEntity.findUnique({ where: { id: parseInt(organizerEntityId) } });
        if (!entity) {
            return res.status(404).json({ success: false, error: 'Organizer Entity not found.' });
        }
        if (!entity.isActive) {
            return res.status(400).json({ success: false, error: 'Cannot create accounts for a deactivated entity.' });
        }

        // Check existing user
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ success: false, error: 'A user with this email already exists. Use the assignment option instead.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'ORGANIZER',
                department: department || entity.name,
                organizerAssignments: {
                    create: {
                        organizerEntityId: entity.id
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                organizerAssignments: {
                    include: { organizerEntity: true }
                }
            }
        });

        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        next(error);
    }
};

// 10. Toggle User Account Active/Deactivated Status
const toggleUserActiveStatus = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, error: 'isActive boolean is required.' });
        }

        if (userId === req.user.id && !isActive) {
            return res.status(400).json({ success: false, error: 'Cannot deactivate your own administrator account.' });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isActive },
            select: { id: true, name: true, email: true, role: true, isActive: true, affiliationStatus: true }
        });

        res.status(200).json({ success: true, user: updated });
    } catch (error) {
        next(error);
    }
};

// 11. Update Student Institutional Affiliation Status (Admin Verification)
const updateUserAffiliation = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const { affiliationStatus, collegeName } = req.body;

        if (!['INTERNAL_VERIFIED', 'EXTERNAL', 'UNVERIFIED'].includes(affiliationStatus)) {
            return res.status(400).json({ success: false, error: 'Invalid affiliationStatus. Must be INTERNAL_VERIFIED, EXTERNAL, or UNVERIFIED.' });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { 
                affiliationStatus,
                collegeName: collegeName ? collegeName.trim() : undefined
            },
            select: { id: true, name: true, email: true, role: true, affiliationStatus: true, collegeName: true }
        });

        res.status(200).json({ success: true, user: updated });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
