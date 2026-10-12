const prisma = require('../config/prisma');

// Retrieve all notifications for the authenticated user
const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { userId: req.user.id }, // Personalized alerts
                    { userId: null } // Global broadcasts
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        next(error);
    }
};

// Mark a specific notification as Read
const markAsRead = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found.' });
        }

        if (notification.userId !== req.user.id && notification.userId !== null) {
            return res.status(403).json({ success: false, error: 'Unauthorized.' });
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyNotifications,
    markAsRead
};
