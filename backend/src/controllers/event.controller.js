const prisma = require('../config/prisma');

const createEvent = async (req, res, next) => {
    try {
        const { 
            title, 
            description, 
            category, 
            department, 
            date, 
            endDate,
            venue, 
            totalSeats, 
            image, 
            requiresApproval, 
            deadline,
            internalRegOpensAt,
            externalRegOpensAt,
            isDemo,
            eventType,
            eventFormat,
            numberOfDays,
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
        const eventStartDate = new Date(date);
        const eventEndDate = endDate ? new Date(endDate) : eventStartDate;
        
        if (eventEndDate < eventStartDate) {
            return res.status(400).json({ success: false, error: 'Event end date/time cannot be before start date/time.' });
        }

        const validEventFormat = eventFormat === 'SYMPOSIUM' ? 'SYMPOSIUM' : 'REGULAR';
        
        // Calculate duration in days if Symposium
        let parsedDays = numberOfDays ? parseInt(numberOfDays, 10) : 1;
        if (validEventFormat === 'SYMPOSIUM') {
            const msPerDay = 24 * 60 * 60 * 1000;
            const startDayUtc = Date.UTC(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
            const endDayUtc = Date.UTC(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
            const diffDays = Math.max(1, Math.round((endDayUtc - startDayUtc) / msPerDay) + 1);

            if (numberOfDays && parsedDays !== diffDays) {
                return res.status(400).json({
                    success: false,
                    error: `Configured duration (${parsedDays} days) does not match the schedule dates (${diffDays} days).`
                });
            }
            parsedDays = diffDays;
        }

        const eventDeadline = deadline ? new Date(deadline) : eventStartDate;
        if (eventDeadline > eventEndDate) {
            return res.status(400).json({ success: false, error: 'Registration deadline cannot be after the event end date.' });
        }

        // Validate Event Type - Strictly required, no silent fallback
        if (!eventType || !['INTRA_COLLEGE', 'INTER_COLLEGE'].includes(eventType)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Event type is required and must be either INTRA_COLLEGE or INTER_COLLEGE.' 
            });
        }
        const validEventType = eventType;

        // Registration Opening Dates Validation
        let parsedInternalOpens = internalRegOpensAt ? new Date(internalRegOpensAt) : new Date();
        if (internalRegOpensAt) {
            if (isNaN(parsedInternalOpens.getTime())) {
                return res.status(400).json({ success: false, error: 'Invalid internal registration opening date/time.' });
            }
            if (parsedInternalOpens > eventDeadline) {
                return res.status(400).json({ success: false, error: 'Internal registration opening date cannot be after the closing deadline.' });
            }
        }

        let parsedExternalOpens = null;
        if (validEventType === 'INTER_COLLEGE') {
            if (externalRegOpensAt) {
                parsedExternalOpens = new Date(externalRegOpensAt);
                if (isNaN(parsedExternalOpens.getTime())) {
                    return res.status(400).json({ success: false, error: 'Invalid external registration opening date/time.' });
                }
                if (parsedExternalOpens > eventDeadline) {
                    return res.status(400).json({ success: false, error: 'External registration opening date cannot be after the closing deadline.' });
                }
            } else {
                parsedExternalOpens = parsedInternalOpens;
            }
        }

        // Calculate expiresAt: 24 hours after scheduled end time
        const expiresAt = new Date(eventEndDate.getTime() + 24 * 60 * 60 * 1000);

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
                date: eventStartDate,
                endDate: eventEndDate,
                expiresAt,
                venue,
                totalSeats: parseInt(totalSeats, 10),
                availableSeats: parseInt(totalSeats, 10),
                image,
                requiresApproval: requiresApproval || false,
                deadline: eventDeadline,
                internalRegOpensAt: parsedInternalOpens,
                externalRegOpensAt: parsedExternalOpens,
                isDemo: Boolean(isDemo),
                eventType: validEventType,
                eventFormat: validEventFormat,
                numberOfDays: parsedDays,
                organizerEntityId: parsedEntityId,
                externalParticipationAllowed: validEventType === 'INTER_COLLEGE' ? 
                    (externalParticipationAllowed !== undefined ? Boolean(externalParticipationAllowed) : true) : 
                    false,
                eligibleParticipants: eligibleParticipants || (validEventType === 'INTRA_COLLEGE' ? 'Coimbatore Institute of Technology Students Only' : 'Inter-College Students'),
                contactPerson: contactPerson || null,
                contactEmail: contactEmail || null,
                organizerId: req.user.id,
                status: req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'
            },
            include: {
                organizerEntity: true,
                activities: { orderBy: [{ dayNumber: 'asc' }, { startTime: 'asc' }] },
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
            search,
            regStatus,
            includeExpired
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

        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Timeline & Automatic Expiration:
        // By default, active discovery listings exclude events that have expired (past endDate + 24h grace period).
        if (timeline === 'Upcoming') {
            whereClause.date = { gt: now };
            whereClause.expiresAt = { gt: now };
        } else if (timeline === 'Ongoing') {
            whereClause.date = { lte: now };
            whereClause.endDate = { gte: now };
        } else if (timeline === 'Completed') {
            whereClause.OR = [
                { endDate: { lt: now } },
                { endDate: null, date: { lt: today } }
            ];
        } else if (timeline === 'Today') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            whereClause.date = { gte: today, lt: tomorrow };
        } else {
            // Default active listings: exclude expired events
            if (includeExpired !== 'true') {
                whereClause.OR = [
                    { expiresAt: { gt: now } },
                    { expiresAt: null, date: { gte: today } }
                ];
            }
        }

        // Registration status filters
        if (regStatus === 'open') {
            // For internal or general users, internalRegOpensAt <= now and deadline >= now
            whereClause.AND = [
                ...(whereClause.AND || []),
                {
                    OR: [
                        { internalRegOpensAt: null },
                        { internalRegOpensAt: { lte: now } }
                    ]
                },
                {
                    OR: [
                        { deadline: null },
                        { deadline: { gte: now } }
                    ]
                },
                {
                    OR: [
                        { endDate: null },
                        { endDate: { gte: now } }
                    ]
                },
                { availableSeats: { gt: 0 } }
            ];
        } else if (regStatus === 'upcoming') {
            // Registration not yet opened
            whereClause.internalRegOpensAt = { gt: now };
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
                },
                activities: {
                    where: { isActive: true },
                    orderBy: [{ dayNumber: 'asc' }, { startTime: 'asc' }],
                    include: {
                        _count: { select: { registrations: true } }
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
                activities: {
                    where: { isActive: true },
                    orderBy: [{ dayNumber: 'asc' }, { startTime: 'asc' }],
                    include: { _count: { select: { registrations: true } } }
                },
                _count: { select: { registrations: true, activities: true } }
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

        // Handle dates and lifecycle
        const eventStartDate = req.body.date ? new Date(req.body.date) : event.date;
        let eventEndDate = req.body.endDate ? new Date(req.body.endDate) : (event.endDate || eventStartDate);
        if (eventEndDate < eventStartDate) {
            return res.status(400).json({ success: false, error: 'End date/time cannot be before start date/time.' });
        }

        let eventDeadline = event.deadline;
        if (req.body.deadline !== undefined) {
            if (req.body.deadline) {
                eventDeadline = new Date(req.body.deadline);
                if (eventDeadline > eventEndDate) {
                    return res.status(400).json({ success: false, error: 'Registration deadline cannot be after the event end date.' });
                }
            } else {
                eventDeadline = null;
            }
        }

        let parsedInternalOpens = event.internalRegOpensAt;
        if (req.body.internalRegOpensAt !== undefined) {
            if (req.body.internalRegOpensAt) {
                parsedInternalOpens = new Date(req.body.internalRegOpensAt);
                if (eventDeadline && parsedInternalOpens > eventDeadline) {
                    return res.status(400).json({ success: false, error: 'Internal registration opening date cannot be after the registration deadline.' });
                }
            } else {
                parsedInternalOpens = null;
            }
        }

        let parsedExternalOpens = event.externalRegOpensAt;
        if (validEventType === 'INTRA_COLLEGE') {
            parsedExternalOpens = null;
        } else if (req.body.externalRegOpensAt !== undefined) {
            if (req.body.externalRegOpensAt) {
                parsedExternalOpens = new Date(req.body.externalRegOpensAt);
                if (eventDeadline && parsedExternalOpens > eventDeadline) {
                    return res.status(400).json({ success: false, error: 'External registration opening date cannot be after the registration deadline.' });
                }
            } else {
                parsedExternalOpens = null;
            }
        }

        // Recalculate expiresAt: 24 hours after eventEndDate
        const expiresAt = new Date(eventEndDate.getTime() + 24 * 60 * 60 * 1000);

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
                date: eventStartDate,
                endDate: eventEndDate,
                expiresAt,
                deadline: eventDeadline,
                internalRegOpensAt: parsedInternalOpens,
                externalRegOpensAt: parsedExternalOpens,
                eventType: validEventType,
                eventFormat: req.body.eventFormat !== undefined ? req.body.eventFormat : undefined,
                numberOfDays: req.body.numberOfDays !== undefined ? parseInt(req.body.numberOfDays, 10) : undefined,
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
