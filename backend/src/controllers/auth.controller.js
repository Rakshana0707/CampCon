const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ensureInstitutionsSeeded, validateExternalInstitutionSelection } = require('./institution.controller');

/**
 * Helper to validate various CIT roll number / register number conventions
 * Accommodates all departments, degrees (B.E., B.Tech, M.Sc Integrated, MCA, MBA),
 * and years across CIT:
 * 1. Anna University Register Number: 11 digits starting with CIT code 7176 (e.g. 71762205042)
 * 2. Department Roll Numbers across all years (e.g. 22IT042, 23CS105, 24MSS015, L22ME001, 23MX101)
 *    - Optional 'L' prefix for Lateral Entry
 *    - 2-digit year (e.g. 19-29)
 *    - Department code: 2 to 5 letters (e.g. IT, CS, EC, EE, ME, CE, CH, BM, AM, AI, DS, MSS, MCS, MDS, MX, MCA, MBA)
 *    - 2 to 4 digits student serial number
 * 3. 7 to 9 digit numeric roll numbers (e.g. 2205042)
 */
const isValidCitRollNumber = (rollNumber) => {
    if (!rollNumber || typeof rollNumber !== 'string') return false;
    const clean = rollNumber.trim().toUpperCase().replace(/[\s\-_.]+/g, '');
    if (!clean) return false;

    // Accepts Anna University 16-digit enrollment numbers (e.g. 2403717672622046),
    // 11-digit numbers, department roll numbers (e.g. 24MSS015, 22IT042), and numeric IDs (3-30 chars)
    return /^[A-Z0-9]{3,30}$/.test(clean);
};

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
        await ensureInstitutionsSeeded();

        const {
            name,
            email,
            password,
            role,
            department,
            rollNumber,
            collegeName,
            affiliationType,
            collegeState,
            collegeDistrict,
            institutionId
        } = req.body;

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
        const trimmedCollege = collegeName ? collegeName.trim() : '';
        const lowerCollege = trimmedCollege.toLowerCase();
        const isInternalCollegeClaim =
            affiliationType !== 'EXTERNAL' &&
            !institutionId &&
            (!trimmedCollege ||
                lowerCollege === 'coimbatore institute of technology' ||
                lowerCollege === 'cit' ||
                lowerCollege === 'our college' ||
                lowerCollege === 'psg');

        let affiliationStatus = 'UNVERIFIED';
        let finalCollegeName = 'Coimbatore Institute of Technology';
        let finalState = 'Tamil Nadu';
        let finalDistrict = 'Coimbatore';
        let finalInstitutionId = null;

        const lowerEmail = email.toLowerCase().trim();

        if (!isInternalCollegeClaim) {
            // External college student: MUST select a valid, active institution from the directory
            const validation = await validateExternalInstitutionSelection({
                institutionId,
                state: collegeState,
                district: collegeDistrict
            });

            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: validation.error
                });
            }

            affiliationStatus = 'EXTERNAL';
            finalInstitutionId = validation.institution.id;
            finalCollegeName = validation.institution.name;
            finalState = validation.institution.state;
            finalDistrict = validation.institution.district;
        } else {
            // Internal college student (Coimbatore Institute of Technology)
            // 1. Validate CIT Roll Number Convention
            if (!rollNumber || !isValidCitRollNumber(rollNumber)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid CIT roll number format. Please provide your official CIT roll number (e.g., 22IT042, 23CS105, 24MSS015, 23MX101) or Anna University register number (e.g., 71762205042).'
                });
            }

            const citInst = await prisma.institution.findFirst({
                where: { code: 'TN-CBE-CIT' }
            });
            if (citInst) {
                finalInstitutionId = citInst.id;
            }

            // 2. Strict Email Verification for Internal Status
            const isCitDomain = lowerEmail.endsWith('@cit.edu.in') || lowerEmail.endsWith('.cit.edu.in');
            const isAcademicDevEmail = lowerEmail.endsWith('.edu') || lowerEmail.endsWith('.ac.in') || lowerEmail.includes('@campusconnect.');

            if (isCitDomain || isAcademicDevEmail) {
                affiliationStatus = 'INTERNAL_VERIFIED';
            } else {
                // If using personal email (@gmail.com, etc.), account is created but marked UNVERIFIED
                affiliationStatus = 'UNVERIFIED';
            }
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
                collegeState: finalState,
                collegeDistrict: finalDistrict,
                institutionId: finalInstitutionId,
                affiliationStatus,
                isActive: true
            },
            include: {
                institution: {
                    select: { id: true, code: true, name: true, state: true, district: true, institutionType: true, isActive: true, status: true }
                }
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
        await ensureInstitutionsSeeded();

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                institution: {
                    select: { id: true, code: true, name: true, state: true, district: true, institutionType: true, isActive: true, status: true }
                },
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
