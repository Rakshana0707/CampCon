const prisma = require('../config/prisma');

// 1. Create Event (Organizer or Admin)
const createEvent = async (req, res, next) => {
    try {
        const { 
            title, 
            description, 
            category, 
            department, 
            date, 
            venue, 
            totalSeats, 
            image, 
            requiresApproval, 
            deadline,
            eventType,
            organizerEntityId,
            externalParticipationAllowed,
            eligibleParticipants,
            contactPerson,
            contactEmail
        } = req.body;

        // Basic Validation
        if (!title || !date || !venue || !totalSeats) {
            return res.status(400).json({ success: false, error: 'Missing required event fields (title, date, venue, totalSeats).' });
        }

        // Timeline Validation
        const eventDate = new Date(date);
        const eventDeadline = deadline ? new Date(deadline) : eventDate;

        if (eventDeadline > eventDate) {
            return res.status(400).json({ success: false, error: 'Deadline cannot be after the event date.' });
        }

        // Validate Event Type - Strictly required, no silent fallback
        if (!eventType || !['INTRA_COLLEGE', 'INTER_COLLEGE'].includes(eventType)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Event type is required and must be either INTRA_COLLEGE or INTER_COLLEGE.' 
            });
        }
        const validEventType = eventType;

        // Validate Official Organizing Entity
        let parsedEntityId = null;
        let finalDepartment = department || 'General';

        if (organizerEntityId) {
            parsedEntityId = parseInt(organizerEntityId, 10);
            const entity = await prisma.organizerEntity.findUnique({
                where: { id: parsedEntityId }
            });

            if (!entity) {
                return res.status(404).json({ success: false, error: 'Selected organizer entity not found in official directory.' });
            }

            if (!entity.isActive) {
                return res.status(400).json({ success: false, error: 'Cannot create events for a deactivated organizing entity.' });
            }

            // Authorization Check: Non-admins must be assigned to this entity
            if (req.user.role !== 'ADMIN') {
                const isAssigned = await prisma.organizerAssignment.findUnique({
                    where: {
                        userId_organizerEntityId: {
                            userId: req.user.id,
                            organizerEntityId: parsedEntityId
                        }
                    }
                });

                if (!isAssigned) {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Unauthorized: You are not assigned to organize events for this department or club.' 
                    });
                }
            }

            finalDepartment = entity.name;
        } else if (req.user.role !== 'ADMIN') {
            // For non-admin organizers, an official entity is strictly required!
            // If they have exactly one assignment, auto-select it if not explicitly passed
            const userAssignments = (await prisma.organizerAssignment.findMany({
                where: { userId: req.user.id, organizerEntity: { isActive: true } },
                include: { organizerEntity: true }
            })) || [];

            if (userAssignments.length === 1) {
                parsedEntityId = userAssignments[0].organizerEntityId;
                finalDepartment = userAssignments[0].organizerEntity?.name || 'General';
            } else if (userAssignments.length > 1) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Please select an authorized organizing entity for this event.' 
                });
            } else {
                return res.status(403).json({ 
                    success: false, 
                    error: 'You do not have any active organizer entity assignments. Please contact an administrator.' 
                });
            }
        }

        const newEvent = await prisma.event.create({
            data: {
                title,
                description: description || '',
                category: category || 'General',
                department: finalDepartment,
                date: eventDate,
                venue,
                totalSeats: parseInt(totalSeats, 10),
                availableSeats: parseInt(totalSeats, 10),
                image,
                requiresApproval: requiresApproval || false,
                deadline: eventDeadline,
                eventType: validEventType,
                organizerEntityId: parsedEntityId,
                externalParticipationAllowed: validEventType === 'INTER_COLLEGE' ? 
                    (externalParticipationAllowed !== undefined ? Boolean(externalParticipationAllowed) : true) : 
                    false,
                eligibleParticipants: eligibleParticipants || (validEventType === 'INTRA_COLLEGE' ? 'Our College Students Only' : 'Inter-College Students'),
                contactPerson: contactPerson || null,
                contactEmail: contactEmail || null,
                organizerId: req.user.id,
                status: req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'
            },
            include: {
                organizerEntity: true,
                organizer: { select: { id: true, name: true, email: true } }
            }
        });

        res.status(201).json({ success: true, event: newEvent });
    } catch (error) {
        next(error);
    }
};

// 2. Get All Events (Public/Student - only Approved unless Admin)
const getAllEvents = async (req, res, next) => {
    try {
        const { 
            category, 
            department, 
            timeline, 
            status, 
            eventType, 
            organizerEntityId, 
            search 
        } = req.query;
        let whereClause = {};

        // Role-based visibility
        if (!req.user || req.user.role === 'STUDENT') {
            whereClause.status = 'APPROVED';
        } else if (status && req.user.role === 'ADMIN') {
            whereClause.status = status;
        }

        // Filters
        if (category && category !== 'All') whereClause.category = category;
        if (department && department !== 'All') whereClause.department = department;

        // Eligibility-aware Discovery:
        // Internal college students (or ADMIN / ORGANIZER) can discover INTRA_COLLEGE events.
        // External students, unverified students, and unauthenticated visitors can ONLY discover INTER_COLLEGE events.
        const isInternal = req.user && (
            req.user.role === 'ADMIN' || 
            req.user.role === 'ORGANIZER' || 
            req.user.affiliationStatus === 'INTERNAL_VERIFIED'
        );

        if (!isInternal) {
            // Ineligible external/unverified users must not see intra-college events
            if (eventType === 'INTRA_COLLEGE') {
                return res.status(200).json({ success: true, count: 0, events: [] });
            }
            whereClause.eventType = 'INTER_COLLEGE';
        } else {
            if (eventType && ['INTRA_COLLEGE', 'INTER_COLLEGE'].includes(eventType)) {
                whereClause.eventType = eventType;
            }
        }

        if (organizerEntityId && organizerEntityId !== 'All') {
            whereClause.organizerEntityId = parseInt(organizerEntityId, 10);
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { department: { contains: search } },
                { venue: { contains: search } }
            ];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (timeline === 'Upcoming') {
            whereClause.date = { gte: today };
        } else if (timeline === 'Completed') {
            whereClause.date = { lt: today };
        } else if (timeline === 'Today') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            whereClause.date = { gte: today, lt: tomorrow };
        }

        const events = await prisma.event.findMany({
            where: whereClause,
            include: { 
                organizer: { select: { id: true, name: true, department: true, email: true } },
                organizerEntity: { select: { id: true, name: true, type: true, category: true, contactEmail: true, contactPerson: true } }
            },
            orderBy: { date: 'asc' }
        });

        res.status(200).json({ success: true, count: events.length, events });
    } catch (error) {
        next(error);
    }
};

// 3. Get Event by ID
const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: { 
                organizer: { select: { id: true, name: true, email: true } },
                organizerEntity: { 
                    select: { 
                        id: true, 
                        name: true, 
                        type: true, 
                        category: true, 
                        description: true, 
                        contactEmail: true, 
                        contactPerson: true,
                        isActive: true 
                    } 
                }
            }
        });

        if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

        // Access Control: Direct access to an INTRA_COLLEGE event endpoint must not reveal event details to ineligible external or unverified students
        if (event.eventType === 'INTRA_COLLEGE') {
            const isInternal = req.user && (
                req.user.role === 'ADMIN' || 
                req.user.role === 'ORGANIZER' || 
                req.user.affiliationStatus === 'INTERNAL_VERIFIED'
            );

            if (!isInternal) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Access restricted: This is an Intra-College event exclusively for verified students of our college.' 
                });
            }
        }

        res.status(200).json({ success: true, event });
    } catch (error) {
        next(error);
    }
};

// 4. Get My Events (Organizer Dashboard)
const getMyEvents = async (req, res, next) => {
    try {
        const events = await prisma.event.findMany({
            where: { organizerId: req.user.id },
            include: {
                organizerEntity: true,
                _count: { select: { registrations: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, events });
    } catch (error) {
        next(error);
    }
};

// 5. Update Event
const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });

        if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

        // Authorization check: Non-admins must be the creator and have active assignment to the organizing entity
        if (req.user.role !== 'ADMIN') {
            if (event.organizerId !== req.user.id) {
                return res.status(403).json({ success: false, error: 'Unauthorized to edit this event.' });
            }

            if (event.organizerEntityId) {
                const currentAssignment = await prisma.organizerAssignment.findUnique({
                    where: {
                        userId_organizerEntityId: {
                            userId: req.user.id,
                            organizerEntityId: event.organizerEntityId
                        }
                    },
                    include: { organizerEntity: true }
                });

                if (!currentAssignment || !currentAssignment.organizerEntity.isActive) {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Unauthorized: Your assignment to this organizing organization has been revoked or the organization is inactive.' 
                    });
                }
            }
        }

        // Validate entity if being changed
        let parsedEntityId = event.organizerEntityId;
        let finalDepartment = event.department;

        if (req.body.organizerEntityId !== undefined && req.body.organizerEntityId !== null) {
            parsedEntityId = parseInt(req.body.organizerEntityId, 10);
            const entity = await prisma.organizerEntity.findUnique({ where: { id: parsedEntityId } });
            if (!entity) {
                return res.status(404).json({ success: false, error: 'Selected organizer entity not found.' });
            }
            if (!entity.isActive) {
                return res.status(400).json({ success: false, error: 'Cannot assign deactivated organizer entity.' });
            }

            if (req.user.role !== 'ADMIN') {
                const isAssigned = await prisma.organizerAssignment.findUnique({
                    where: {
                        userId_organizerEntityId: {
                            userId: req.user.id,
                            organizerEntityId: parsedEntityId
                        }
                    }
                });
                if (!isAssigned) {
                    return res.status(403).json({ success: false, error: 'Unauthorized to assign this organizing entity.' });
                }
            }
            finalDepartment = entity.name;
        }

        // Capacity calculation
        let newAvailableSeats = event.availableSeats;
        if (req.body.totalSeats) {
            const seatDiff = parseInt(req.body.totalSeats) - event.totalSeats;
            newAvailableSeats = event.availableSeats + seatDiff;
            if (newAvailableSeats < 0) {
                return res.status(400).json({ success: false, error: 'Cannot reduce capacity below currently registered users.' });
            }
        }

        let validEventType = event.eventType;
        if (req.body.eventType !== undefined && req.body.eventType !== null) {
            if (!['INTRA_COLLEGE', 'INTER_COLLEGE'].includes(req.body.eventType)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid event type. Must be INTRA_COLLEGE or INTER_COLLEGE.' 
                });
            }
            validEventType = req.body.eventType;
        }

        const updatedEvent = await prisma.event.update({
            where: { id: parseInt(id) },
            data: {
                title: req.body.title || undefined,
                description: req.body.description !== undefined ? req.body.description : undefined,
                category: req.body.category || undefined,
                department: finalDepartment,
                venue: req.body.venue || undefined,
                image: req.body.image !== undefined ? req.body.image : undefined,
                requiresApproval: req.body.requiresApproval !== undefined ? req.body.requiresApproval : undefined,
                totalSeats: req.body.totalSeats ? parseInt(req.body.totalSeats) : undefined,
                availableSeats: newAvailableSeats,
                date: req.body.date ? new Date(req.body.date) : undefined,
                deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
                eventType: validEventType,
                organizerEntityId: parsedEntityId,
                externalParticipationAllowed: validEventType === 'INTER_COLLEGE' ? 
                    (req.body.externalParticipationAllowed !== undefined ? Boolean(req.body.externalParticipationAllowed) : event.externalParticipationAllowed) : 
                    false,
                eligibleParticipants: req.body.eligibleParticipants !== undefined ? req.body.eligibleParticipants : undefined,
                contactPerson: req.body.contactPerson !== undefined ? req.body.contactPerson : undefined,
                contactEmail: req.body.contactEmail !== undefined ? req.body.contactEmail : undefined,
                id: undefined,
                organizerId: undefined
            },
            include: {
                organizerEntity: true,
                organizer: { select: { id: true, name: true, email: true } }
            }
        });

        res.status(200).json({ success: true, event: updatedEvent });
    } catch (error) {
        next(error);
    }
};

// 6. Delete Event
const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });

        if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

        // Authorization check: Non-admins must be the creator and have active assignment to the organizing entity
        if (req.user.role !== 'ADMIN') {
            if (event.organizerId !== req.user.id) {
                return res.status(403).json({ success: false, error: 'Unauthorized to delete this event.' });
            }

            if (event.organizerEntityId) {
                const currentAssignment = await prisma.organizerAssignment.findUnique({
                    where: {
                        userId_organizerEntityId: {
                            userId: req.user.id,
                            organizerEntityId: event.organizerEntityId
                        }
                    },
                    include: { organizerEntity: true }
                });

                if (!currentAssignment || !currentAssignment.organizerEntity.isActive) {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Unauthorized: Your assignment to this organizing organization has been revoked or the organization is inactive.' 
                    });
                }
            }
        }

        await prisma.event.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ success: true, message: 'Event deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// 7. Update Event Status (Admin Only)
const updateEventStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status.' });
        }

        const updatedEvent = await prisma.event.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.status(200).json({ success: true, event: updatedEvent });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    deleteEvent,
    updateEventStatus
};
