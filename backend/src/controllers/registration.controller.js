const prisma = require('../config/prisma');

// 1. Register for an Event (Student)
const registerForEvent = async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const userId = req.user.id;

        // Verify Event Status and Deadlines
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        
        if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });
        if (event.status !== 'APPROVED') return res.status(400).json({ success: false, error: 'Registration is closed. Event is not approved.' });
        
        const now = new Date();
        if (event.deadline && now > event.deadline) {
            return res.status(400).json({ success: false, error: 'Registration deadline has passed.' });
        }

        const { participantCollege, institutionDetails } = req.body || {};

        // Eligibility & Event Type Rules
        if (event.eventType === 'INTRA_COLLEGE') {
            // Strictly for internal verified students of our college
            if (req.user.role === 'STUDENT') {
                if (req.user.affiliationStatus === 'EXTERNAL') {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Registration rejected: This is an Intra-College event exclusively for verified students of our college. External college students cannot register.' 
                    });
                }
                if (req.user.affiliationStatus === 'UNVERIFIED') {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Registration rejected: Your institutional affiliation is unverified. Please complete institutional verification with college administration or use your college email to verify eligibility.' 
                    });
                }
                // Reject if external college name explicitly supplied in payload
                if (participantCollege && participantCollege.trim().toLowerCase() !== 'our college' && participantCollege.trim().toLowerCase() !== 'psg' && participantCollege.trim() !== '') {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'Registration rejected: External college affiliation specified for an Intra-College event.' 
                    });
                }
            }
        } else if (event.eventType === 'INTER_COLLEGE') {
            // Inter-College events accept internal verified students AND external students
            const isExternalStudent = req.user.affiliationStatus === 'EXTERNAL' || 
                (participantCollege && participantCollege.trim().toLowerCase() !== 'our college' && participantCollege.trim().toLowerCase() !== 'psg' && participantCollege.trim() !== '');

            if (isExternalStudent) {
                if (!event.externalParticipationAllowed) {
                    return res.status(403).json({ 
                        success: false, 
                        error: 'External college participation is currently disabled for this inter-college event.' 
                    });
                }

                // External participants must provide their institution details
                const finalExtCollege = participantCollege || (req.user.collegeName !== 'Our College' ? req.user.collegeName : null);
                if (!finalExtCollege || finalExtCollege.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        error: 'External participants must provide their institution / college name.'
                    });
                }
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
                    participantCollege: participantCollege ? participantCollege.trim() : (req.user.collegeName || 'Our College'),
                    institutionDetails: institutionDetails ? institutionDetails.trim() : null
                },
                include: { 
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
        res.status(200).json({ success: true, registrations });
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

module.exports = {
    registerForEvent,
    cancelRegistration,
    getMyRegistrations,
    getEventRegistrations,
    getRegistrationById
};
