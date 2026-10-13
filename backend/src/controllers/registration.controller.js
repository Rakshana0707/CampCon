const prisma = require('../config/prisma');
const { ensureInstitutionsSeeded, validateExternalInstitutionSelection } = require('./institution.controller');

// 1. Register for an Event (Student)
const registerForEvent = async (req, res, next) => {
    try {
        await ensureInstitutionsSeeded();

        const eventId = parseInt(req.params.eventId || req.body.eventId);
        const userId = req.user.id;

        // Verify Event Status and Deadlines
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        
        if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });
        if (event.status !== 'APPROVED') return res.status(400).json({ success: false, error: 'Registration is closed. Event is not approved.' });
        
        const now = new Date();
        if (event.endDate && now > event.endDate) {
            return res.status(400).json({ success: false, error: 'Registration is closed. The event has already ended.' });
        }

        if (event.deadline && now > event.deadline) {
            return res.status(400).json({ success: false, error: 'Registration deadline has passed.' });
        }

        // Admin check: Administrators cannot register as participants
        if (req.user.role === 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Administrators cannot register as event participants.'
            });
        }

        // Conflict of Interest check: Organizers cannot participate in events organized by their own department/entity
        if (req.user.role === 'ORGANIZER') {
            const isCreator = event.organizerId === req.user.id || (event.contactEmail && event.contactEmail === req.user.email);
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

            if (event.organizerEntityId && assignedEntityIds.includes(event.organizerEntityId)) {
                isAssignedToEntity = true;
            }

            if (event.department && assignedNames.includes(event.department.toLowerCase().trim())) {
                isAssignedToEntity = true;
            }

            if (isCreator || isAssignedToEntity) {
                return res.status(403).json({
                    success: false,
                    error: 'Conflict of Interest: Organizers cannot participate in events organized by their own department or organization.'
                });
            }
        }

        const {
            participantCollege,
            participantState,
            participantDistrict,
            institutionId,
            institutionDetails
        } = req.body || {};

        const lowerPartCollege = participantCollege ? participantCollege.trim().toLowerCase() : '';
        const isInternalCollegeInput =
            !institutionId &&
            (!lowerPartCollege ||
                lowerPartCollege === 'coimbatore institute of technology' ||
                lowerPartCollege === 'cit' ||
                lowerPartCollege === 'our college' ||
                lowerPartCollege === 'psg');

        const isInternalVerifiedUser = req.user.affiliationStatus === 'INTERNAL_VERIFIED' || req.user.role === 'ADMIN' || req.user.role === 'ORGANIZER';

        // Prevent internal verified students from passing external institution fields to spoof external college affiliation
        if (isInternalVerifiedUser && (institutionId || !isInternalCollegeInput)) {
            if (institutionId && req.user.institutionId && parseInt(institutionId, 10) !== req.user.institutionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Internal verified students cannot submit external college institution fields.'
                });
            }
            if (!institutionId && !isInternalCollegeInput) {
                return res.status(400).json({
                    success: false,
                    error: 'Internal verified students cannot submit external college affiliation.'
                });
            }
        }

        const isInternalStudent = isInternalVerifiedUser && isInternalCollegeInput;

        // Registration Opening Schedule Check
        if (isInternalStudent) {
            if (event.internalRegOpensAt && now < event.internalRegOpensAt) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Registration has not opened yet for college students. Opens at ${event.internalRegOpensAt.toLocaleString()}.` 
                });
            }
        } else {
            const externalOpening = event.externalRegOpensAt || event.internalRegOpensAt;
            if (externalOpening && now < externalOpening) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Registration has not opened yet for external participants. Opens at ${externalOpening.toLocaleString()}.` 
                });
            }
        }

        let resolvedInstitutionId = req.user.institutionId || null;
        let resolvedCollegeName = req.user.collegeName || 'Coimbatore Institute of Technology';
        let resolvedState = req.user.collegeState || 'Tamil Nadu';
        let resolvedDistrict = req.user.collegeDistrict || 'Coimbatore';

        // Eligibility & Event Type Rules
        if (event.eventType === 'INTRA_COLLEGE') {
            // Strictly for internal verified students of Coimbatore Institute of Technology
            if (req.user.role === 'STUDENT' || req.user.role === 'ORGANIZER') {
                if (req.user.affiliationStatus === 'EXTERNAL') {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Registration rejected: This is an Intra-College event exclusively for verified students of Coimbatore Institute of Technology. External college students cannot register.' 
                    });
                }
                if (req.user.affiliationStatus === 'UNVERIFIED') {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Registration rejected: Your institutional affiliation is unverified. Please complete institutional verification with college administration or use your college email to verify eligibility.' 
                    });
                }
                // Reject if external college or external institutionId supplied in payload
                if (!isInternalCollegeInput || (institutionId && req.user.institutionId && parseInt(institutionId, 10) !== req.user.institutionId)) {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Registration rejected: External college affiliation specified for an Intra-College event.' 
                    });
                }
            }
        } else if (event.eventType === 'INTER_COLLEGE') {
            // Inter-College events accept internal verified students AND external students
            const isExternalStudent = req.user.affiliationStatus === 'EXTERNAL' || !isInternalVerifiedUser;

            if (isExternalStudent) {
                if (!event.externalParticipationAllowed) {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'External college participation is currently disabled for this inter-college event.' 
                    });
                }

                // Determine target institution ID (from request body or verified student profile)
                const targetInstId = institutionId || req.user.institutionId;
                const validation = await validateExternalInstitutionSelection({
                    institutionId: targetInstId,
                    state: participantState || (institutionId ? undefined : req.user.collegeState),
                    district: participantDistrict || (institutionId ? undefined : req.user.collegeDistrict),
                    eventCategory: event.category
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

        // Schedule Clash Detection: Prevent registering for overlapping events
        const existingUserRegistrations = await prisma.registration.findMany({
            where: {
                userId,
                status: { in: ['APPROVED', 'PENDING'] }
            },
            include: { event: true }
        });

        const newStart = new Date(event.date);
        // Default to a 2-hour duration if endDate is missing or identical to start date
        const newEnd = (event.endDate && new Date(event.endDate) > newStart)
            ? new Date(event.endDate)
            : new Date(newStart.getTime() + 2 * 60 * 60 * 1000);

        for (const reg of existingUserRegistrations) {
            if (reg.eventId === eventId) continue; // Duplicate check handled below
            const exEvent = reg.event;
            if (!exEvent) continue;

            const exStart = new Date(exEvent.date);
            const exEnd = (exEvent.endDate && new Date(exEvent.endDate) > exStart)
                ? new Date(exEvent.endDate)
                : new Date(exStart.getTime() + 2 * 60 * 60 * 1000);

            if (newStart < exEnd && newEnd > exStart) {
                const conflictDateStr = exStart.toLocaleDateString();
                const conflictTimeStr = `${exStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${exEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                return res.status(409).json({
                    success: false,
                    error: `Schedule Clash: This event overlaps with "${exEvent.title}" (${conflictDateStr}, ${conflictTimeStr}), which you are already registered for.`
                });
            }
        }

        // Use Prisma Transaction to guarantee atomic capacity decrements
        const registration = await prisma.$transaction(async (tx) => {
            // Check for duplicate active registration
            const existing = await tx.registration.findUnique({
                where: { userId_eventId: { userId, eventId } }
            });

            if (existing) {
                throw new Error('DUPLICATE');
            }

            // Atomic Capacity Decrement (Optimistic Concurrency)
            const { count } = await tx.event.updateMany({
                where: { 
                    id: eventId,
                    availableSeats: { gt: 0 } 
                },
                data: {
                    availableSeats: { decrement: 1 }
                }
            });

            if (count === 0) {
                // If count is 0, the where clause failed because availableSeats is 0
                throw new Error('CAPACITY_FULL');
            }

            const regStatus = event.requiresApproval ? 'PENDING' : 'APPROVED';

            return tx.registration.create({
                data: {
                    userId,
                    eventId,
                    status: regStatus,
                    role: 'PARTICIPANT',
                    institutionId: resolvedInstitutionId,
                    participantCollege: resolvedCollegeName,
                    participantState: resolvedState,
                    participantDistrict: resolvedDistrict,
                    institutionDetails: institutionDetails ? institutionDetails.trim() : null
                },
                include: { 
                    institution: true,
                    event: {
                        include: { organizerEntity: true }
                    } 
                }
            });
        });

        res.status(201).json({ success: true, registration });
    } catch (error) {
        if (error.message === 'DUPLICATE') return res.status(400).json({ success: false, error: 'You are already registered for this event.' });
        if (error.message === 'CAPACITY_FULL') return res.status(400).json({ success: false, error: 'Event has reached maximum capacity.' });
        next(error);
    }
};

// 2. Cancel Registration (Student)
const cancelRegistration = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const userId = req.user.id;

        await prisma.$transaction(async (tx) => {
            const reg = await tx.registration.findUnique({
                where: { userId_eventId: { userId, eventId } }
            });

            if (!reg) throw new Error('NOT_FOUND');
            if (reg.status === 'REJECTED') throw new Error('INVALID_STATE');

            // Delete the registration so the user can re-register later if needed
            await tx.registration.delete({
                where: { userId_eventId: { userId, eventId } }
            });

            // Refund the seat only if the registration was officially Approved or Pending
            if (reg.status === 'APPROVED' || reg.status === 'PENDING') {
                await tx.event.update({
                    where: { id: eventId },
                    data: { availableSeats: { increment: 1 } }
                });
            }
        });

        res.status(200).json({ success: true, message: 'Registration cancelled successfully.' });
    } catch (error) {
        if (error.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: 'Registration not found.' });
        if (error.message === 'INVALID_STATE') return res.status(400).json({ success: false, error: 'Cannot cancel a rejected registration.' });
        next(error);
    }
};

// 3. Get Student's Own Registrations
const getMyRegistrations = async (req, res, next) => {
    try {
        const registrations = await prisma.registration.findMany({
            where: { userId: req.user.id },
            include: { event: true, certificate: true },
            orderBy: { createdAt: 'desc' }
        });

        const activityRegistrations = await prisma.activityRegistration.findMany({
            where: { userId: req.user.id },
            include: {
                activity: {
                    include: { event: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, registrations, activityRegistrations });
    } catch (error) {
        next(error);
    }
};

// 4. Get Event Registrations (Organizer)
const getEventRegistrations = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId);
        
        // Ensure the organizer actually owns this event (or is Admin)
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });
        if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Unauthorized to view these registrations.' });
        }

        const registrations = await prisma.registration.findMany({
            where: { eventId },
            include: { user: { select: { name: true, email: true, department: true, rollNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, registrations });
    } catch (error) {
        next(error);
    }
};

// 5. Retrieve Specific Registration Details
const getRegistrationById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const registration = await prisma.registration.findUnique({
            where: { id },
            include: { 
                event: true, 
                user: { select: { name: true, email: true, department: true } } 
            }
        });

        if (!registration) return res.status(404).json({ success: false, error: 'Registration not found.' });

        // Ensure user is authorized (must be the ticket owner, event organizer, or admin)
        if (registration.userId !== req.user.id && req.user.role !== 'ADMIN') {
            const event = await prisma.event.findUnique({ where: { id: registration.eventId } });
            if (event.organizerId !== req.user.id) {
                return res.status(403).json({ success: false, error: 'Unauthorized to view this ticket.' });
            }
        }

        res.status(200).json({ success: true, registration });
    } catch (error) {
        next(error);
    }
};

// 6. Update Registration Status (Approve / Reject by Organizer or Admin)
const updateRegistrationStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Status must be APPROVED or REJECTED.' });
        }

        const existingReg = await prisma.registration.findUnique({
            where: { id },
            include: { event: true }
        });

        if (!existingReg) {
            return res.status(404).json({ success: false, error: 'Registration not found.' });
        }

        // Verify ownership or Admin
        if (existingReg.event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Unauthorized to manage this registration.' });
        }

        if (existingReg.status === status) {
            return res.status(200).json({ success: true, registration: existingReg });
        }

        const updatedReg = await prisma.$transaction(async (tx) => {
            // If rejecting a registration that previously held a seat (PENDING or APPROVED), refund the seat
            if (status === 'REJECTED' && (existingReg.status === 'PENDING' || existingReg.status === 'APPROVED')) {
                await tx.event.update({
                    where: { id: existingReg.eventId },
                    data: { availableSeats: { increment: 1 } }
                });
            } else if (status === 'APPROVED' && existingReg.status === 'REJECTED') {
                // Re-approving a previously rejected registration consumes a seat
                const { count } = await tx.event.updateMany({
                    where: { id: existingReg.eventId, availableSeats: { gt: 0 } },
                    data: { availableSeats: { decrement: 1 } }
                });
                if (count === 0) throw new Error('CAPACITY_FULL');
            }

            const reg = await tx.registration.update({
                where: { id },
                data: { status },
                include: { user: { select: { name: true, email: true, department: true, rollNumber: true } }, event: true }
            });

            await tx.notification.create({
                data: {
                    userId: existingReg.userId,
                    message: status === 'APPROVED'
                        ? `Your registration for "${existingReg.event.title}" has been approved! Your entry ticket is now active.`
                        : `Your registration request for "${existingReg.event.title}" was declined by the organizer.`
                }
            });

            return reg;
        });

        res.status(200).json({ success: true, registration: updatedReg });
    } catch (error) {
        if (error.message === 'CAPACITY_FULL') {
            return res.status(400).json({ success: false, error: 'Cannot approve: Event is at full capacity.' });
        }
        next(error);
    }
};

// 7. Assign Student as Volunteer (Organizer or Admin)
const assignVolunteer = async (req, res, next) => {
    try {
        const eventId = parseInt(req.body.eventId || req.params.eventId, 10);
        const studentId = parseInt(req.body.studentId || req.body.userId, 10);

        if (!eventId || !studentId) {
            return res.status(400).json({ success: false, error: 'Both eventId and studentId are required.' });
        }

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

        if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Unauthorized to assign volunteers for this event.' });
        }

        const student = await prisma.user.findUnique({ where: { id: studentId } });
        if (!student) return res.status(404).json({ success: false, error: 'Student not found.' });

        const registration = await prisma.$transaction(async (tx) => {
            const existing = await tx.registration.findUnique({
                where: { userId_eventId: { userId: studentId, eventId } }
            });

            if (existing) {
                // Upgrade existing registration to VOLUNTEER and APPROVED
                const updated = await tx.registration.update({
                    where: { id: existing.id },
                    data: {
                        role: 'VOLUNTEER',
                        status: 'APPROVED',
                        certificateType: 'VOLUNTEER'
                    },
                    include: { user: { select: { name: true, email: true, department: true, rollNumber: true } }, event: true }
                });

                await tx.notification.create({
                    data: {
                        userId: studentId,
                        message: `You have been assigned as an official Volunteer for "${event.title}"!`
                    }
                });

                return updated;
            }

            // Otherwise create new volunteer registration and decrement available seat
            const { count } = await tx.event.updateMany({
                where: { id: eventId, availableSeats: { gt: 0 } },
                data: { availableSeats: { decrement: 1 } }
            });

            if (count === 0) throw new Error('CAPACITY_FULL');

            const created = await tx.registration.create({
                data: {
                    userId: studentId,
                    eventId,
                    role: 'VOLUNTEER',
                    status: 'APPROVED',
                    certificateType: 'VOLUNTEER',
                    participantCollege: student.collegeName || 'Coimbatore Institute of Technology',
                    institutionDetails: student.department || null
                },
                include: { user: { select: { name: true, email: true, department: true, rollNumber: true } }, event: true }
            });

            await tx.notification.create({
                data: {
                    userId: studentId,
                    message: `You have been assigned as an official Volunteer for "${event.title}"!`
                }
            });

            return created;
        });

        res.status(201).json({ success: true, registration });
    } catch (error) {
        if (error.message === 'CAPACITY_FULL') {
            return res.status(400).json({ success: false, error: 'Cannot assign volunteer: Event has reached maximum capacity.' });
        }
        next(error);
    }
};

// 8. Get Student List for Volunteer Selection (Organizer / Admin)
const getStudentsList = async (req, res, next) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT', isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                rollNumber: true,
                collegeName: true,
                affiliationStatus: true
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, students });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerForEvent,
    cancelRegistration,
    getMyRegistrations,
    getEventRegistrations,
    getRegistrationById,
    updateRegistrationStatus,
    assignVolunteer,
    getStudentsList
};

