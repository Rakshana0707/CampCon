const prisma = require('../config/prisma');
const { ensureInstitutionsSeeded, validateExternalInstitutionSelection } = require('./institution.controller');

// Helper to check if organizer user is authorized to manage the symposium event
const checkSymposiumAuthorization = async (symposiumId, user) => {
    const event = await prisma.event.findUnique({
        where: { id: symposiumId },
        include: { organizerEntity: true }
    });

    if (!event) {
        return { error: 'Symposium not found.', status: 404 };
    }

    if (user.role === 'ADMIN') {
        return { event };
    }

    if (event.organizerId !== user.id) {
        return { error: 'Unauthorized: You are not the creator of this symposium.', status: 403 };
    }

    if (event.organizerEntityId) {
        const assignment = await prisma.organizerAssignment.findUnique({
            where: {
                userId_organizerEntityId: {
                    userId: user.id,
                    organizerEntityId: event.organizerEntityId
                }
            },
            include: { organizerEntity: true }
        });

        if (!assignment || !assignment.organizerEntity.isActive) {
            return { 
                error: 'Unauthorized: Your assignment to this organizing organization has been revoked or the organization is inactive.', 
                status: 403 
            };
        }
    }

    return { event };
};

// 1. Add Activity under a Symposium
const addActivity = async (req, res, next) => {
    try {
        const symposiumId = parseInt(req.params.symposiumId, 10);
        const {
            name,
            description,
            category,
            dayNumber,
            startTime,
            endTime,
            venue,
            maxParticipants,
            requiresSeparateRegistration,
            requiresOverallRegistration,
            regOpensAt,
            regClosesAt,
            eligibilityRules,
            fee,
            orderIndex
        } = req.body;

        const authResult = await checkSymposiumAuthorization(symposiumId, req.user);
        if (authResult.error) {
            return res.status(authResult.status).json({ success: false, error: authResult.error });
        }
        const event = authResult.event;

        // Basic fields
        if (!name || !startTime || !endTime || !venue || !maxParticipants) {
            return res.status(400).json({ 
                success: false, 
                error: 'Activity name, start time, end time, venue, and max participants are required.' 
            });
        }

        const actStartTime = new Date(startTime);
        const actEndTime = new Date(endTime);

        if (isNaN(actStartTime.getTime()) || isNaN(actEndTime.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid activity start or end time format.' });
        }

        if (actEndTime <= actStartTime) {
            return res.status(400).json({ success: false, error: 'Activity end time must be after start time.' });
        }

        // Validate that activity does not fall outside the symposium's overall dates
        const sympStart = new Date(event.date);
        const sympEnd = event.endDate ? new Date(event.endDate) : sympStart;

        // Compare timestamps
        if (actStartTime < sympStart || actEndTime > sympEnd) {
            return res.status(400).json({ 
                success: false, 
                error: `Activity schedule (${actStartTime.toISOString()} - ${actEndTime.toISOString()}) must fall within the symposium overall dates (${sympStart.toISOString()} - ${sympEnd.toISOString()}).` 
            });
        }

        // Validate day number
        const parsedDay = dayNumber ? parseInt(dayNumber, 10) : 1;
        const maxDays = event.numberOfDays || 1;
        if (parsedDay < 1 || parsedDay > maxDays) {
            return res.status(400).json({
                success: false,
                error: `Day number (${parsedDay}) must be between 1 and the symposium duration (${maxDays} days).`
            });
        }

        // Validate capacity
        const parsedCapacity = parseInt(maxParticipants, 10);
        if (parsedCapacity <= 0) {
            return res.status(400).json({ success: false, error: 'Maximum participants must be greater than 0.' });
        }

        // Detect overlapping activities in the same venue
        const overlappingActivity = await prisma.symposiumActivity.findFirst({
            where: {
                eventId: symposiumId,
                venue: venue.trim(),
                isActive: true,
                AND: [
                    { startTime: { lt: actEndTime } },
                    { endTime: { gt: actStartTime } }
                ]
            }
        });

        if (overlappingActivity) {
            return res.status(400).json({
                success: false,
                error: `Venue scheduling conflict: "${overlappingActivity.name}" is already scheduled in "${venue}" from ${new Date(overlappingActivity.startTime).toLocaleTimeString()} to ${new Date(overlappingActivity.endTime).toLocaleTimeString()}.`
            });
        }

        // Optional individual reg dates validation
        let parsedRegOpens = null;
        let parsedRegCloses = null;
        if (regOpensAt) {
            parsedRegOpens = new Date(regOpensAt);
            if (isNaN(parsedRegOpens.getTime())) {
                return res.status(400).json({ success: false, error: 'Invalid activity registration opening time.' });
            }
        }
        if (regClosesAt) {
            parsedRegCloses = new Date(regClosesAt);
            if (isNaN(parsedRegCloses.getTime())) {
                return res.status(400).json({ success: false, error: 'Invalid activity registration closing time.' });
            }
            if (parsedRegOpens && parsedRegCloses < parsedRegOpens) {
                return res.status(400).json({ success: false, error: 'Activity registration closing time cannot be before opening time.' });
            }
            if (parsedRegCloses > actEndTime) {
                return res.status(400).json({ success: false, error: 'Activity registration closing time cannot be after the activity end time.' });
            }
        }

        const newActivity = await prisma.symposiumActivity.create({
            data: {
                eventId: symposiumId,
                name: name.trim(),
                description: description || '',
                category: category || 'Technical',
                dayNumber: parsedDay,
                startTime: actStartTime,
                endTime: actEndTime,
                venue: venue.trim(),
                maxParticipants: parsedCapacity,
                availableSeats: parsedCapacity,
                requiresSeparateRegistration: requiresSeparateRegistration !== undefined ? Boolean(requiresSeparateRegistration) : true,
                requiresOverallRegistration: requiresOverallRegistration !== undefined ? Boolean(requiresOverallRegistration) : true,
                regOpensAt: parsedRegOpens,
                regClosesAt: parsedRegCloses,
                eligibilityRules: eligibilityRules || '',
                fee: fee ? parseFloat(fee) : 0.0,
                orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0,
                isActive: true
            }
        });

        res.status(201).json({ success: true, activity: newActivity });
    } catch (error) {
        next(error);
    }
};

// 2. Update an Activity
const updateActivity = async (req, res, next) => {
    try {
        const activityId = parseInt(req.params.activityId, 10);
        const activity = await prisma.symposiumActivity.findUnique({
            where: { id: activityId },
            include: { event: true }
        });

        if (!activity) {
            return res.status(404).json({ success: false, error: 'Activity not found.' });
        }

        const authResult = await checkSymposiumAuthorization(activity.eventId, req.user);
        if (authResult.error) {
            return res.status(authResult.status).json({ success: false, error: authResult.error });
        }
        const event = authResult.event;

        const {
            name,
            description,
            category,
            dayNumber,
            startTime,
            endTime,
            venue,
            maxParticipants,
            requiresSeparateRegistration,
            requiresOverallRegistration,
            regOpensAt,
            regClosesAt,
            eligibilityRules,
            fee,
            orderIndex,
            isActive
        } = req.body;

        const actStartTime = startTime ? new Date(startTime) : activity.startTime;
        const actEndTime = endTime ? new Date(endTime) : activity.endTime;

        if (actEndTime <= actStartTime) {
            return res.status(400).json({ success: false, error: 'Activity end time must be after start time.' });
        }

        // Validate within symposium boundaries
        const sympStart = new Date(event.date);
        const sympEnd = event.endDate ? new Date(event.endDate) : sympStart;
        if (actStartTime < sympStart || actEndTime > sympEnd) {
            return res.status(400).json({ 
                success: false, 
                error: `Activity schedule must fall within the symposium dates (${sympStart.toISOString()} - ${sympEnd.toISOString()}).` 
            });
        }

        const targetVenue = venue !== undefined ? venue.trim() : activity.venue;

        // Check venue conflicts excluding this activity
        const conflict = await prisma.symposiumActivity.findFirst({
            where: {
                eventId: activity.eventId,
                id: { not: activityId },
                venue: targetVenue,
                isActive: true,
                AND: [
                    { startTime: { lt: actEndTime } },
                    { endTime: { gt: actStartTime } }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({
                success: false,
                error: `Venue scheduling conflict: "${conflict.name}" is already scheduled in "${targetVenue}" during this time window.`
            });
        }

        // Adjust availableSeats if maxParticipants is changed
        let newAvailableSeats = activity.availableSeats;
        if (maxParticipants !== undefined) {
            const parsedMax = parseInt(maxParticipants, 10);
            const regCount = activity.maxParticipants - activity.availableSeats;
            if (parsedMax < regCount) {
                return res.status(400).json({
                    success: false,
                    error: `Cannot reduce max capacity below the number of registered participants (${regCount}).`
                });
            }
            newAvailableSeats = parsedMax - regCount;
        }

        const updatedActivity = await prisma.symposiumActivity.update({
            where: { id: activityId },
            data: {
                name: name !== undefined ? name.trim() : undefined,
                description: description !== undefined ? description : undefined,
                category: category !== undefined ? category : undefined,
                dayNumber: dayNumber !== undefined ? parseInt(dayNumber, 10) : undefined,
                startTime: actStartTime,
                endTime: actEndTime,
                venue: targetVenue,
                maxParticipants: maxParticipants !== undefined ? parseInt(maxParticipants, 10) : undefined,
                availableSeats: newAvailableSeats,
                requiresSeparateRegistration: requiresSeparateRegistration !== undefined ? Boolean(requiresSeparateRegistration) : undefined,
                requiresOverallRegistration: requiresOverallRegistration !== undefined ? Boolean(requiresOverallRegistration) : undefined,
                regOpensAt: regOpensAt !== undefined ? (regOpensAt ? new Date(regOpensAt) : null) : undefined,
                regClosesAt: regClosesAt !== undefined ? (regClosesAt ? new Date(regClosesAt) : null) : undefined,
                eligibilityRules: eligibilityRules !== undefined ? eligibilityRules : undefined,
                fee: fee !== undefined ? parseFloat(fee) : undefined,
                orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : undefined,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined
            }
        });

        res.status(200).json({ success: true, activity: updatedActivity });
    } catch (error) {
        next(error);
    }
};

// 3. Remove (or Soft-Cancel) an Activity
const removeActivity = async (req, res, next) => {
    try {
        const activityId = parseInt(req.params.activityId, 10);
        const activity = await prisma.symposiumActivity.findUnique({
            where: { id: activityId },
            include: { _count: { select: { registrations: true } } }
        });

        if (!activity) {
            return res.status(404).json({ success: false, error: 'Activity not found.' });
        }

        const authResult = await checkSymposiumAuthorization(activity.eventId, req.user);
        if (authResult.error) {
            return res.status(authResult.status).json({ success: false, error: authResult.error });
        }

        // If there are registered participants, soft-cancel to preserve historical registration records
        if (activity._count.registrations > 0) {
            const cancelled = await prisma.symposiumActivity.update({
                where: { id: activityId },
                data: { isActive: false }
            });
            return res.status(200).json({ 
                success: true, 
                message: 'Activity has existing registrations; it has been cancelled and deactivated to preserve historical records.',
                activity: cancelled 
            });
        }

        await prisma.symposiumActivity.delete({ where: { id: activityId } });
        res.status(200).json({ success: true, message: 'Activity deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// 4. Get Activities for a Symposium (Public / Students / Organizers)
const getSymposiumActivities = async (req, res, next) => {
    try {
        const symposiumId = parseInt(req.params.symposiumId, 10);
        const { dayNumber } = req.query;

        const event = await prisma.event.findUnique({
            where: { id: symposiumId }
        });

        if (!event) {
            return res.status(404).json({ success: false, error: 'Symposium not found.' });
        }

        // Intra-College access check
        if (event.eventType === 'INTRA_COLLEGE') {
            const isInternal = req.user && (
                req.user.role === 'ADMIN' ||
                req.user.role === 'ORGANIZER' ||
                req.user.affiliationStatus === 'INTERNAL_VERIFIED'
            );
            if (!isInternal) {
                return res.status(403).json({
                    success: false,
                    error: 'Access restricted: Intra-College symposium activities are exclusively for verified students of our college.'
                });
            }
        }

        let whereClause = {
            eventId: symposiumId,
            isActive: true
        };

        if (dayNumber && dayNumber !== 'All') {
            whereClause.dayNumber = parseInt(dayNumber, 10);
        }

        const activities = await prisma.symposiumActivity.findMany({
            where: whereClause,
            orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }, { startTime: 'asc' }],
            include: {
                _count: { select: { registrations: true } }
            }
        });

        res.status(200).json({ success: true, count: activities.length, activities });
    } catch (error) {
        next(error);
    }
};

// 5. Register for an Individual Activity
const registerForActivity = async (req, res, next) => {
    try {
        await ensureInstitutionsSeeded();

        const activityId = parseInt(req.params.activityId, 10);
        const userId = req.user.id;
        const {
            participantCollege,
            participantState,
            participantDistrict,
            institutionId,
            institutionDetails
        } = req.body || {};

        const activity = await prisma.symposiumActivity.findUnique({
            where: { id: activityId },
            include: { event: true }
        });

        if (!activity || !activity.isActive) {
            return res.status(404).json({ success: false, error: 'Activity not found or has been cancelled.' });
        }

        const parentEvent = activity.event;
        const now = new Date();

        // Check capacity
        if (activity.availableSeats <= 0) {
            return res.status(400).json({ success: false, error: 'Registration is closed. Activity has reached maximum participant capacity.' });
        }

        // Check if activity has ended
        if (now > activity.endTime) {
            return res.status(400).json({ success: false, error: 'Registration is closed. This activity has already concluded.' });
        }

        // Check individual registration deadline if configured
        if (activity.regClosesAt && now > activity.regClosesAt) {
            return res.status(400).json({ success: false, error: 'Registration deadline for this activity has passed.' });
        }

        // Check individual opening date if configured
        if (activity.regOpensAt && now < activity.regOpensAt) {
            return res.status(400).json({ 
                success: false, 
                error: `Registration has not opened yet for this activity. Opens at ${new Date(activity.regOpensAt).toLocaleString()}.` 
            });
        }

        // Admin check: Administrators cannot register as participants
        if (req.user.role === 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Administrators cannot register as event participants.'
            });
        }

        // Conflict of Interest check: Organizers cannot participate in activities organized by their own department/entity
        if (req.user.role === 'ORGANIZER') {
            const isCreator = parentEvent.organizerId === req.user.id || (parentEvent.contactEmail && parentEvent.contactEmail === req.user.email);
            let isAssignedToEntity = false;

            const assignments = await prisma.organizerAssignment.findMany({
                where: { userId: req.user.id },
                include: { organizerEntity: true }
            });

            const assignedNames = [
                req.user.department,
                ...assignments.map(a => a.organizerEntity?.name)
            ].filter(Boolean).map(n => n.toLowerCase().trim());

            const assignedEntityIds = assignments.map(a => a.organizerEntityId);

            if (parentEvent.organizerEntityId && assignedEntityIds.includes(parentEvent.organizerEntityId)) {
                isAssignedToEntity = true;
            }

            if (parentEvent.department && assignedNames.includes(parentEvent.department.toLowerCase().trim())) {
                isAssignedToEntity = true;
            }

            if (isCreator || isAssignedToEntity) {
                return res.status(403).json({
                    success: false,
                    error: 'Conflict of Interest: Organizers cannot participate in activities organized by their own department or organization.'
                });
            }
        }

        let resolvedInstitutionId = req.user.institutionId || null;
        let resolvedCollegeName = req.user.collegeName || 'Coimbatore Institute of Technology';
        let resolvedState = req.user.collegeState || 'Tamil Nadu';
        let resolvedDistrict = req.user.collegeDistrict || 'Coimbatore';

        // Intra-College eligibility
        if (parentEvent.eventType === 'INTRA_COLLEGE') {
            if (req.user.affiliationStatus === 'EXTERNAL') {
                return res.status(403).json({
                    success: false,
                    error: 'Registration rejected: This activity belongs to an Intra-College symposium exclusively for verified students of Coimbatore Institute of Technology.'
                });
            }
            if (req.user.affiliationStatus === 'UNVERIFIED') {
                return res.status(403).json({
                    success: false,
                    error: 'Registration rejected: Your institutional affiliation is unverified.'
                });
            }
        } else if (parentEvent.eventType === 'INTER_COLLEGE') {
            const isInternalVerifiedUser = req.user.affiliationStatus === 'INTERNAL_VERIFIED' || req.user.role === 'ADMIN' || req.user.role === 'ORGANIZER';
            const isExternalStudent = req.user.affiliationStatus === 'EXTERNAL' || !isInternalVerifiedUser;

            if (isExternalStudent) {
                if (!parentEvent.externalParticipationAllowed) {
                    return res.status(403).json({
                        success: false,
                        error: 'External college participation is currently disabled for this symposium.'
                    });
                }

                const targetInstId = institutionId || req.user.institutionId;
                const validation = await validateExternalInstitutionSelection({
                    institutionId: targetInstId,
                    state: participantState || (institutionId ? undefined : req.user.collegeState),
                    district: participantDistrict || (institutionId ? undefined : req.user.collegeDistrict),
                    eventCategory: activity.category || parentEvent.category
                });

                if (!validation.valid) {
                    return res.status(400).json({
                        success: false,
                        error: validation.error
                    });
                }

                resolvedInstitutionId = validation.institution.id;
                resolvedCollegeName = validation.institution.name;
                resolvedState = validation.institution.state;
                resolvedDistrict = validation.institution.district;
            }
        }

        // Check Prerequisite: Does activity require overall symposium registration?
        if (activity.requiresOverallRegistration) {
            const overallReg = await prisma.registration.findUnique({
                where: {
                    userId_eventId: {
                        userId: userId,
                        eventId: parentEvent.id
                    }
                }
            });

            if (!overallReg || overallReg.status === 'REJECTED' || overallReg.status === 'CANCELLED') {
                return res.status(400).json({
                    success: false,
                    error: 'Prerequisite required: You must first register for the overall symposium before registering for this individual activity.'
                });
            }
        }

        // Check for Schedule Clash with other symposium activities the student is enrolled in
        const existingActRegs = await prisma.activityRegistration.findMany({
            where: {
                userId,
                status: { in: ['APPROVED', 'PENDING'] }
            },
            include: { activity: true }
        });

        const actStart = new Date(activity.startTime);
        const actEnd = new Date(activity.endTime);

        for (const ar of existingActRegs) {
            if (ar.activityId === activityId) continue;
            const exAct = ar.activity;
            if (!exAct || !exAct.isActive) continue;

            const exStart = new Date(exAct.startTime);
            const exEnd = new Date(exAct.endTime);

            if (actStart < exEnd && actEnd > exStart) {
                const timeRange = `${exStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${exEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                return res.status(409).json({
                    success: false,
                    error: `Schedule Clash: This activity overlaps with "${exAct.name}" (${timeRange}), which you are already registered for.`
                });
            }
        }

        // Atomic registration transaction with capacity check & duplicate prevention
        const reg = await prisma.$transaction(async (tx) => {
            const existing = await tx.activityRegistration.findUnique({
                where: { userId_activityId: { userId, activityId } }
            });

            if (existing) {
                throw new Error('DUPLICATE_ACTIVITY_REGISTRATION');
            }

            // Decrement available seats
            const currentAct = await tx.symposiumActivity.findUnique({
                where: { id: activityId }
            });

            if (!currentAct || currentAct.availableSeats <= 0) {
                throw new Error('ACTIVITY_CAPACITY_FULL');
            }

            await tx.symposiumActivity.update({
                where: { id: activityId },
                data: {
                    availableSeats: { decrement: 1 }
                }
            });

            return tx.activityRegistration.create({
                data: {
                    activityId,
                    userId,
                    status: 'APPROVED',
                    attendance: 'PENDING',
                    institutionId: resolvedInstitutionId,
                    participantCollege: resolvedCollegeName,
                    participantState: resolvedState,
                    participantDistrict: resolvedDistrict,
                    institutionDetails: institutionDetails ? institutionDetails.trim() : null
                },
                include: {
                    institution: true,
                    activity: {
                        include: { event: true }
                    }
                }
            });
        });

        res.status(201).json({ success: true, registration: reg });
    } catch (error) {
        if (error.message === 'DUPLICATE_ACTIVITY_REGISTRATION') {
            return res.status(400).json({ success: false, error: 'You are already registered for this activity.' });
        }
        if (error.message === 'ACTIVITY_CAPACITY_FULL') {
            return res.status(400).json({ success: false, error: 'This activity has reached maximum participant capacity.' });
        }
        next(error);
    }
};

// 6. Cancel Individual Activity Registration
const cancelActivityRegistration = async (req, res, next) => {
    try {
        const activityId = parseInt(req.params.activityId, 10);
        const userId = req.user.id;

        await prisma.$transaction(async (tx) => {
            const reg = await tx.activityRegistration.findUnique({
                where: { userId_activityId: { userId, activityId } }
            });

            if (!reg) {
                throw new Error('NOT_REGISTERED');
            }

            await tx.activityRegistration.delete({
                where: { id: reg.id }
            });

            // Restore seat capacity
            await tx.symposiumActivity.update({
                where: { id: activityId },
                data: { availableSeats: { increment: 1 } }
            });
        });

        res.status(200).json({ success: true, message: 'Activity registration cancelled successfully.' });
    } catch (error) {
        if (error.message === 'NOT_REGISTERED') {
            return res.status(404).json({ success: false, error: 'You are not registered for this activity.' });
        }
        next(error);
    }
};

// 7. Get Activity Registrations (For authorized organizers)
const getActivityRegistrations = async (req, res, next) => {
    try {
        const activityId = parseInt(req.params.activityId, 10);
        const activity = await prisma.symposiumActivity.findUnique({
            where: { id: activityId },
            include: { event: true }
        });

        if (!activity) {
            return res.status(404).json({ success: false, error: 'Activity not found.' });
        }

        const authResult = await checkSymposiumAuthorization(activity.eventId, req.user);
        if (authResult.error) {
            return res.status(authResult.status).json({ success: false, error: authResult.error });
        }

        const registrations = await prisma.activityRegistration.findMany({
            where: { activityId },
            include: {
                user: { select: { id: true, name: true, email: true, department: true, collegeName: true, rollNumber: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, count: registrations.length, registrations });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addActivity,
    updateActivity,
    removeActivity,
    getSymposiumActivities,
    registerForActivity,
    cancelActivityRegistration,
    getActivityRegistrations
};
