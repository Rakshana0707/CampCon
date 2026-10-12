const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Middleware to verify JWT tokens and attach the user to the request object.
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        // Bearer Token format check
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
        }

        // Verify the token securely
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure user still exists in the database and load authorized organizer entities
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { 
                id: true, 
                email: true, 
                role: true, 
                name: true, 
                department: true,
                collegeName: true,
                affiliationStatus: true,
                isActive: true,
                organizerAssignments: {
                    select: {
                        organizerEntityId: true,
                        organizerEntity: {
                            select: { id: true, name: true, type: true, category: true, isActive: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid token. User no longer exists.' });
        }

        if (user.isActive === false) {
            return res.status(403).json({ success: false, error: 'Account has been deactivated. Please contact college administration.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    }
};

/**
 * Middleware for optional authentication.
 * Attaches req.user if valid token present, otherwise proceeds without error.
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            req.user = undefined;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                department: true,
                collegeName: true,
                affiliationStatus: true,
                isActive: true,
                organizerAssignments: {
                    select: {
                        organizerEntityId: true,
                        organizerEntity: {
                            select: { id: true, name: true, type: true, category: true, isActive: true }
                        }
                    }
                }
            }
        });

        if (user && user.isActive !== false) {
            req.user = user;
        } else {
            req.user = undefined;
        }
        next();
    } catch (err) {
        // Token invalid or expired - proceed as unauthenticated guest
        req.user = undefined;
        next();
    }
};

/**
 * Middleware to restrict access to ADMIN only.
 * Must be used AFTER authenticateToken.
 */
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, error: 'Access forbidden. Admin privileges required.' });
    }
};

/**
 * Middleware to restrict access to ORGANIZER or ADMIN.
 * Must be used AFTER authenticateToken.
 */
const requireOrganizer = (req, res, next) => {
    if (req.user && (req.user.role === 'ORGANIZER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({ success: false, error: 'Access forbidden. Organizer privileges required.' });
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    requireOrganizer
};
