const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// Helper to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password, role, department, rollNumber } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email is already registered.' });
        }

        // Hash password securely
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Map frontend role format: Only STUDENT is permitted via public registration!
        // Organizers and Admins must be provisioned or invited by an Administrator.
        let dbRole = 'STUDENT';
        if (role) {
            const upRole = role.toUpperCase();
            if (upRole === 'ADMIN' || upRole === 'ORGANIZER') {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Unauthorized: Organizer and Admin accounts cannot be created via public registration. Contact college administration.' 
                });
            }
            if (upRole === 'STUDENT') {
                dbRole = upRole;
            }
        }

        // Determine institutional affiliation
        const { collegeName } = req.body;
        let affiliationStatus = 'UNVERIFIED';
        let finalCollegeName = 'Our College';

        const trimmedCollege = collegeName ? collegeName.trim() : '';
        const lowerEmail = email.toLowerCase().trim();

        if (trimmedCollege && trimmedCollege.toLowerCase() !== 'our college' && trimmedCollege.toLowerCase() !== 'psg' && trimmedCollege !== '') {
            // External college student
            affiliationStatus = 'EXTERNAL';
            finalCollegeName = trimmedCollege;
        } else if (lowerEmail.endsWith('.edu') || lowerEmail.endsWith('.ac.in') || lowerEmail.includes('@campusconnect.')) {
            // Institutional email verified
            affiliationStatus = 'INTERNAL_VERIFIED';
            finalCollegeName = 'Our College';
        } else {
            // Personal email claiming our college affiliation - requires administrative verification
            affiliationStatus = 'UNVERIFIED';
            finalCollegeName = 'Our College';
        }

        // Create the user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: dbRole,
                department,
                rollNumber,
                collegeName: finalCollegeName,
                affiliationStatus,
                isActive: true
            }
        });

        // Generate token and respond
        const token = generateToken(user.id);
        
        // Exclude passwordHash from response
        const { passwordHash: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login an existing user
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Check if user is deactivated
        if (user.isActive === false) {
            return res.status(403).json({ success: false, error: 'Your account has been deactivated. Please contact college administration.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Generate token
        const token = generateToken(user.id);

        const { passwordHash: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current authenticated user profile
 * @route GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        // req.user is already populated and password-stripped by the authenticateToken middleware
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe
};
