const prisma = require('../config/prisma');

const verifyTicketAndMarkAttendance = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const scannedById = req.user.id; // User scanning the ticket (Organizer)

        // 1. Validate Ticket exists
        const registration = await prisma.registration.findUnique({
            where: { ticketId },
            include: { event: true, user: true }
        });

        if (!registration) {
            return res.status(404).json({ success: false, error: 'Invalid Ticket ID.' });
        }

        // 1b. Validate ticket belongs to the event being scanned (when the scanner supplies it)
        const scanEventId = req.body?.eventId ?? req.query?.eventId;
        if (scanEventId !== undefined && scanEventId !== null && scanEventId !== '') {
            if (parseInt(scanEventId, 10) !== registration.eventId) {
                return res.status(400).json({ success: false, error: 'This ticket is not valid for this event.' });
            }
        }

        // 2. Validate Authorization
        let isAuthorized = false;
        
        if (req.user.role === 'ADMIN' || registration.event.organizerId === scannedById) {
            isAuthorized = true;
        } else {
            // Check if the scanner is an approved Volunteer for this specific event
            const volunteerCheck = await prisma.registration.findUnique({
                where: { userId_eventId: { userId: scannedById, eventId: registration.eventId } }
            });
            if (volunteerCheck && volunteerCheck.role === 'VOLUNTEER' && volunteerCheck.status === 'APPROVED') {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'You are not authorized to scan tickets for this event.' });
        }

        // 3. Validate Ticket State
        if (registration.status !== 'APPROVED') {
            return res.status(400).json({ success: false, error: `Ticket is invalid. Registration status is ${registration.status}.` });
        }

        // 3b. Validate Attendance Window (Event must not have expired past its grace period)
        const now = new Date();
        if (registration.event.expiresAt && now > registration.event.expiresAt) {
            return res.status(400).json({ 
                success: false, 
                error: 'Attendance window has closed for this event. Ticket can no longer be scanned.' 
            });
        }

        // 4. Validate Duplicate Attendance
        if (registration.attendance === 'PRESENT') {
            return res.status(400).json({ success: false, error: 'Ticket has already been scanned. Attendance is already recorded.' });
        }

        // 5. Transaction: Mark Registration, Log Attendance, Mint Certificate, Send Notification
        await prisma.$transaction(async (tx) => {
            const certTypeToAssign = registration.certificateType === 'NONE' ? 'PARTICIPATION' : registration.certificateType;

            // Update Registration Status
            await tx.registration.update({
                where: { id: registration.id },
                data: { attendance: 'PRESENT', certificateType: certTypeToAssign }
            });

            // Create immutable Attendance log
            await tx.attendance.create({
                data: {
                    registrationId: registration.id,
                    eventId: registration.eventId,
                    scannedById: scannedById
                }
            });

            // Auto-Mint Certificate
            await tx.certificate.create({
                data: {
                    registrationId: registration.id,
                    userId: registration.userId,
                    eventId: registration.eventId
                }
            });

            // Dispatch Inbox Notification to Student
            await tx.notification.create({
                data: {
                    userId: registration.userId,
                    message: `Attendance verified for ${registration.event.title}. Your certificate is officially unlocked and ready for download!`
                }
            });
        });

        res.status(200).json({
            success: true,
            message: 'Attendance successfully verified!',
            studentName: registration.user.name,
            eventName: registration.event.title
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyTicketAndMarkAttendance
};
