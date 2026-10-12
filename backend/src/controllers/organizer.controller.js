const prisma = require('../config/prisma');

// 1. List all approved official organizer entities (Public)
const getAllOrganizers = async (req, res, next) => {
    try {
        const { type, search, category, activeOnly } = req.query;
        let whereClause = {};

        // By default, public directory shows only active entities unless explicitly requested otherwise
        if (activeOnly !== 'false') {
            whereClause.isActive = true;
        }

        if (type && ['DEPARTMENT', 'CLUB'].includes(type.toUpperCase())) {
            whereClause.type = type.toUpperCase();
        }

        if (category && category !== 'All') {
            whereClause.category = category;
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ];
        }

        const organizers = await prisma.organizerEntity.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: {
                        events: true,
                        assignments: true
                    }
                }
            },
            orderBy: [{ type: 'asc' }, { name: 'asc' }]
        });

        res.status(200).json({ success: true, count: organizers.length, organizers });
    } catch (error) {
        next(error);
    }
};

// 2. Get specific organizer profile with upcoming and past events (Public)
const getOrganizerById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Invalid organizer ID.' });
        }

        const organizer = await prisma.organizerEntity.findUnique({
            where: { id },
            include: {
                events: {
                    where: { status: 'APPROVED' },
                    include: {
                        organizer: { select: { name: true, email: true } }
                    },
                    orderBy: { date: 'asc' }
                },
                assignments: {
                    include: {
                        user: { select: { id: true, name: true, email: true, role: true } }
                    }
                }
            }
        });

        if (!organizer) {
            return res.status(404).json({ success: false, error: 'Organizer not found in the official directory.' });
        }

        const today = new Date();
        const upcomingEvents = organizer.events.filter(e => new Date(e.date) >= today);
        const pastEvents = organizer.events.filter(e => new Date(e.date) < today);

        res.status(200).json({
            success: true,
            organizer: {
                ...organizer,
                upcomingEvents,
                pastEvents
            }
        });
    } catch (error) {
        next(error);
    }
};

// 3. Get entities assigned to currently logged-in user (Organizer or Admin)
const getMyAssignedEntities = async (req, res, next) => {
    try {
        if (req.user.role === 'ADMIN') {
            // Admins can organize on behalf of any active entity
            const allActive = await prisma.organizerEntity.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            });
            return res.status(200).json({ success: true, entities: allActive, isAdmin: true });
        }

        // Return only active entities assigned to this organizer
        const assignments = await prisma.organizerAssignment.findMany({
            where: {
                userId: req.user.id,
                organizerEntity: { isActive: true }
            },
            include: {
                organizerEntity: true
            }
        });

        const entities = assignments.map(a => a.organizerEntity);
        res.status(200).json({ success: true, entities, isAdmin: false });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllOrganizers,
    getOrganizerById,
    getMyAssignedEntities
};
