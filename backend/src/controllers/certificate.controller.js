const prisma = require('../config/prisma');

// Retrieve all certificates issued to the authenticated student
const getMyCertificates = async (req, res, next) => {
    try {
        const certificates = await prisma.certificate.findMany({
            where: { userId: req.user.id },
            include: {
                event: {
                    select: { title: true, date: true, venue: true, organizerId: true, organizer: { select: { name: true } } }
                },
                registration: {
                    select: { certificateType: true }
                }
            },
            orderBy: { issuedAt: 'desc' }
        });

        res.status(200).json({ success: true, certificates });
    } catch (error) {
        next(error);
    }
};

// Publicly verify certificate authenticity
const verifyCertificate = async (req, res, next) => {
    try {
        const { certificateId } = req.params;

        const certificate = await prisma.certificate.findUnique({
            where: { certificateId },
            include: {
                user: { select: { name: true, email: true, department: true } },
                event: { select: { title: true, date: true, organizer: { select: { name: true } } } },
                registration: { select: { certificateType: true, role: true } }
            }
        });

        if (!certificate) {
            return res.status(404).json({ success: false, isValid: false, error: 'Certificate not found in the registry.' });
        }

        res.status(200).json({
            success: true,
            isValid: true,
            certificate
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyCertificates,
    verifyCertificate
};
