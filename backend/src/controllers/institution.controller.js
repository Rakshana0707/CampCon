const prisma = require('../config/prisma');
const { TN_OFFICIAL_DISTRICTS_38 } = require('../data/tamilnadu.districts');

let isSeededInProcess = false;

/**
 * Idempotently verify that the Tamil Nadu directory is seeded.
 * If empty or lower than expected, triggers import.
 */
const ensureInstitutionsSeeded = async () => {
    if (isSeededInProcess) return;
    try {
        const count = await prisma.institution.count();
        if (count < 100) {
            const { importTamilNaduDirectory } = require('../scripts/importInstitutions');
            await importTamilNaduDirectory({ verbose: false });
        }

        // Link existing internal users to CIT
        const citRecord = await prisma.institution.findFirst({
            where: {
                OR: [
                    { code: 'TN-CBE-CIT' },
                    { name: { contains: 'Coimbatore Institute of Technology' }, district: 'Coimbatore' }
                ]
            }
        });
        if (citRecord) {
            await prisma.user.updateMany({
                where: {
                    institutionId: null,
                    affiliationStatus: 'INTERNAL_VERIFIED'
                },
                data: {
                    institutionId: citRecord.id,
                    collegeName: citRecord.name,
                    collegeState: citRecord.state,
                    collegeDistrict: citRecord.district
                }
            });
        }

        isSeededInProcess = true;
    } catch (error) {
        console.error('Warning: Failed to ensure institutions seeded:', error.message);
    }
};

/**
 * 1. Get States and Districts Map
 * Strictly limited to Tamil Nadu with all 38 official districts
 * @route GET /api/institutions/locations
 */
const getLocations = async (req, res, next) => {
    try {
        await ensureInstitutionsSeeded();

        // Query active districts from the District table
        const dbDistricts = await prisma.district.findMany({
            where: { state: 'Tamil Nadu', isActive: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, state: true }
        });

        const districtNames = dbDistricts.length > 0
            ? dbDistricts.map(d => d.name)
            : [...TN_OFFICIAL_DISTRICTS_38].sort((a, b) => a.localeCompare(b));

        const districtsByState = {
            'Tamil Nadu': districtNames
        };

        res.status(200).json({
            success: true,
            states: ['Tamil Nadu'],
            districtsByState,
            districts: dbDistricts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 1b. Get Tamil Nadu Districts List
 * @route GET /api/institutions/districts
 */
const getDistricts = async (req, res, next) => {
    try {
        await ensureInstitutionsSeeded();

        const districts = await prisma.district.findMany({
            where: { state: 'Tamil Nadu', isActive: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, state: true }
        });

        res.status(200).json({
            success: true,
            count: districts.length,
            districts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 2. Get Active Approved Institutions (Filtered by District with search support)
 * @route GET /api/institutions
 */
const getInstitutions = async (req, res, next) => {
    try {
        await ensureInstitutionsSeeded();

        const { state, district, search, q, includeHost, page, limit } = req.query;

        const whereClause = {
            isActive: true,
            status: 'APPROVED',
            state: 'Tamil Nadu' // Strictly Tamil Nadu directory
        };

        if (district) {
            whereClause.district = district.trim();
        }

        const searchQuery = (search || q || '').trim();
        if (searchQuery) {
            whereClause.name = { contains: searchQuery };
        }

        // External student registration excludes host college (CIT)
        if (includeHost !== 'true') {
            whereClause.NOT = {
                code: 'TN-CBE-CIT'
            };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10);
        const take = limitNum && limitNum > 0 ? limitNum : undefined;
        const skip = take ? (pageNum - 1) * take : undefined;

        const [totalCount, institutions] = await Promise.all([
            prisma.institution.count({ where: whereClause }),
            prisma.institution.findMany({
                where: whereClause,
                orderBy: { name: 'asc' },
                skip,
                take,
                select: {
                    id: true,
                    code: true,
                    name: true,
                    state: true,
                    district: true,
                    institutionType: true,
                    address: true,
                    university: true,
                    sourceDataset: true,
                    isVerifiedSample: true
                }
            })
        ]);

        res.status(200).json({
            success: true,
            count: institutions.length,
            total: totalCount,
            page: pageNum,
            institutions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 2b. Get Single Institution Details
 * @route GET /api/institutions/:id
 */
const getInstitutionById = async (req, res, next) => {
    try {
        await ensureInstitutionsSeeded();
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Invalid institution ID format.' });
        }

        const institution = await prisma.institution.findUnique({
            where: { id },
            select: {
                id: true,
                code: true,
                name: true,
                state: true,
                district: true,
                institutionType: true,
                address: true,
                university: true,
                sourceDataset: true,
                isActive: true,
                status: true
            }
        });

        if (!institution) {
            return res.status(404).json({ success: false, error: 'Institution not found.' });
        }

        res.status(200).json({
            success: true,
            institution
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 3. Request Addition of an Unlisted College ("My college isn't listed")
 * Creates a PENDING_VERIFICATION record that requires Administrator approval.
 * Does NOT make the institution active/selectable until verified by Admin.
 * @route POST /api/institutions/request
 */
const requestInstitutionAddition = async (req, res, next) => {
    try {
        await ensureInstitutionsSeeded();

        const { name, state, district, institutionType, requestedByEmail } = req.body || {};

        if (!name || !name.trim() || !state || !state.trim() || !district || !district.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Institution name, state, and district are required to submit a verification request.'
            });
        }

        const cleanName = name.trim();
        const cleanState = state.trim();
        const cleanDistrict = district.trim();

        // Check if already exists in directory
        const existing = await prisma.institution.findUnique({
            where: {
                name_district_state: {
                    name: cleanName,
                    district: cleanDistrict,
                    state: cleanState
                }
            }
        });

        if (existing) {
            if (existing.status === 'APPROVED' && existing.isActive) {
                return res.status(400).json({
                    success: false,
                    error: 'This institution is already listed and active in the directory for the selected district.',
                    institution: existing
                });
            }
            return res.status(200).json({
                success: true,
                message: 'A verification request for this institution is already pending administrator review.',
                institutionRequest: existing
            });
        }

        const createdRequest = await prisma.institution.create({
            data: {
                name: cleanName,
                state: cleanState,
                district: cleanDistrict,
                institutionType: institutionType ? institutionType.trim() : 'College / Institution',
                isActive: false,
                status: 'PENDING_VERIFICATION',
                isVerifiedSample: false,
                requestedByEmail: requestedByEmail ? requestedByEmail.trim() : null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Institution addition request submitted for administrator verification. It will appear in the official directory once approved.',
            institutionRequest: createdRequest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 4. Admin: List All Institutions (Approved, Pending Verification, Inactive)
 * @route GET /api/admin/institutions
 */
const getAdminInstitutions = async (req, res, next) => {
    try {
        await ensureInstitutionsSeeded();

        const institutions = await prisma.institution.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        registrations: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { state: 'asc' },
                { district: 'asc' },
                { name: 'asc' }
            ]
        });

        res.status(200).json({
            success: true,
            count: institutions.length,
            institutions,
            districtsByState: STATE_DISTRICTS
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 5. Admin: Create a New Verified Institution
 * @route POST /api/admin/institutions
 */
const createAdminInstitution = async (req, res, next) => {
    try {
        const { name, code, state, district, institutionType, isActive } = req.body || {};

        if (!name || !name.trim() || !state || !state.trim() || !district || !district.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Institution name, state, and district are required.'
            });
        }

        const cleanName = name.trim();
        const cleanState = state.trim();
        const cleanDistrict = district.trim();

        const existing = await prisma.institution.findUnique({
            where: {
                name_district_state: {
                    name: cleanName,
                    district: cleanDistrict,
                    state: cleanState
                }
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'An institution with this name already exists in the specified district and state.'
            });
        }

        const institution = await prisma.institution.create({
            data: {
                name: cleanName,
                code: code && code.trim() ? code.trim().toUpperCase() : null,
                state: cleanState,
                district: cleanDistrict,
                institutionType: institutionType ? institutionType.trim() : 'Engineering & Technology',
                isActive: isActive !== undefined ? Boolean(isActive) : true,
                status: 'APPROVED',
                isVerifiedSample: false
            }
        });

        res.status(201).json({
            success: true,
            institution
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 6. Admin: Edit an Existing Institution
 * @route PUT /api/admin/institutions/:id
 */
const updateAdminInstitution = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, code, state, district, institutionType, isActive, status } = req.body || {};

        const existing = await prisma.institution.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Institution not found.' });
        }

        const updated = await prisma.institution.update({
            where: { id },
            data: {
                name: name ? name.trim() : existing.name,
                code: code !== undefined ? (code && code.trim() ? code.trim().toUpperCase() : null) : existing.code,
                state: state ? state.trim() : existing.state,
                district: district ? district.trim() : existing.district,
                institutionType: institutionType ? institutionType.trim() : existing.institutionType,
                isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
                status: status && ['APPROVED', 'PENDING_VERIFICATION', 'REJECTED'].includes(status) ? status : existing.status,
                isVerifiedSample: false
            }
        });

        res.status(200).json({
            success: true,
            institution: updated
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 7. Admin: Toggle Active Status or Approve/Reject Pending Institution Request
 * @route PATCH /api/admin/institutions/:id/status
 */
const updateInstitutionStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { isActive, status } = req.body || {};

        const existing = await prisma.institution.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Institution not found.' });
        }

        const nextStatus = status && ['APPROVED', 'PENDING_VERIFICATION', 'REJECTED'].includes(status)
            ? status
            : existing.status;

        const nextActive = typeof isActive === 'boolean'
            ? isActive
            : (nextStatus === 'APPROVED' ? true : false);

        const updated = await prisma.institution.update({
            where: { id },
            data: {
                isActive: nextActive,
                status: nextStatus
            }
        });

        // If an admin just approved a PENDING_VERIFICATION institution, promote any linked UNVERIFIED external users
        if (existing.status === 'PENDING_VERIFICATION' && nextStatus === 'APPROVED' && nextActive) {
            await prisma.user.updateMany({
                where: {
                    institutionId: id,
                    affiliationStatus: 'UNVERIFIED'
                },
                data: {
                    affiliationStatus: 'EXTERNAL',
                    collegeName: updated.name,
                    collegeState: updated.state,
                    collegeDistrict: updated.district
                }
            });
        }

        res.status(200).json({
            success: true,
            institution: updated
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Categorize an institution based on its name and type
 * Returns: 'ENGINEERING', 'ARTS_SCIENCE', 'MANAGEMENT', 'UNIVERSITY', or 'POLYTECHNIC'
 */
const getInstitutionCategory = (institution) => {
    if (!institution) return 'OTHER';
    const name = (institution.name || '').toUpperCase();
    const type = (institution.institutionType || '').toUpperCase();

    if (name.includes('POLYTECHNIC') || type.includes('DIPLOMA') || type.includes('POLYTECHNIC')) {
        return 'POLYTECHNIC';
    }
    if (
        name.includes('INDIAN INSTITUTE OF TECHNOLOGY') || name.includes('IIT ') ||
        name.includes('NATIONAL INSTITUTE OF TECHNOLOGY') || name.includes('NIT ') ||
        name.includes('ANNA UNIVERSITY') || name.includes('UNIVERSITY') ||
        type.includes('UNIVERSITY') || type.includes('INSTITUTE OF NATIONAL IMPORTANCE')
    ) {
        return 'UNIVERSITY';
    }
    if (
        name.includes('MANAGEMENT') || name.includes('BUSINESS') ||
        name.includes(' B-SCHOOL') || type.includes('MANAGEMENT')
    ) {
        return 'MANAGEMENT';
    }
    if (
        name.includes('ARTS') || name.includes('SCIENCE') ||
        name.includes('HUMANITIES') || type.includes('ARTS')
    ) {
        return 'ARTS_SCIENCE';
    }
    return 'ENGINEERING';
};

/**
 * Helper to validate an external institution selection on the backend
 * Used by auth.controller.js, registration.controller.js, and symposium.controller.js
 *
 * Enforces:
 * - Polytechnic & Diploma colleges are completely disallowed
 * - For Technical events: only Engineering colleges are allowed to register (Arts, Science, Management, and Universities disallowed)
 * - For Cultural events: Arts, Science, Management, and Universities are permitted
 */
const validateExternalInstitutionSelection = async ({ institutionId, state, district, eventCategory }) => {
    await ensureInstitutionsSeeded();

    if (!institutionId) {
        return {
            valid: false,
            error: 'Please select a valid institution from the official district college directory.'
        };
    }

    const parsedId = parseInt(institutionId, 10);
    if (isNaN(parsedId)) {
        return {
            valid: false,
            error: 'Invalid institution ID format.'
        };
    }

    const institution = await prisma.institution.findUnique({
        where: { id: parsedId }
    });

    if (!institution) {
        return {
            valid: false,
            error: 'Selected institution does not exist in the official directory.'
        };
    }

    if (!institution.isActive || institution.status !== 'APPROVED') {
        return {
            valid: false,
            error: 'Selected institution is currently inactive or pending administrator verification.'
        };
    }

    // 1. Polytechnic & Diploma institutions are rejected
    const category = getInstitutionCategory(institution);
    if (category === 'POLYTECHNIC') {
        return {
            valid: false,
            error: 'Polytechnic & Diploma colleges are not eligible to register for collegiate events.'
        };
    }

    if (institution.code === 'TN-CBE-CIT' || institution.name.toLowerCase() === 'coimbatore institute of technology') {
        return {
            valid: false,
            error: 'Coimbatore Institute of Technology is our host institution. Please select Internal Student affiliation instead of External.'
        };
    }

    if (state && institution.state.toLowerCase() !== state.trim().toLowerCase()) {
        return {
            valid: false,
            error: `Location mismatch: "${institution.name}" does not belong to state "${state}".`
        };
    }

    if (district && institution.district.toLowerCase() !== district.trim().toLowerCase()) {
        return {
            valid: false,
            error: `Location mismatch: "${institution.name}" belongs to ${institution.district} district, not "${district}".`
        };
    }

    // 2. Event category-based eligibility check for external students:
    // For technical events: do NOT allow Arts, Science & Humanities, Management / B-Schools, or Universities.
    // Inter-college culturals alone allow them.
    if (eventCategory) {
        const catUpper = eventCategory.trim().toUpperCase();
        const isTechnicalEvent = catUpper === 'TECHNICAL' || catUpper === 'HACKATHON' || catUpper === 'CODING';
        const isCulturalEvent = catUpper === 'CULTURAL' || catUpper === 'CULTURALS' || catUpper === 'ARTS';

        if (isTechnicalEvent) {
            if (category === 'ARTS_SCIENCE') {
                return {
                    valid: false,
                    error: `Eligibility restriction: Students from Arts, Science & Humanities colleges are not eligible to participate in Technical events. They are permitted to register for Inter-College Cultural events only.`
                };
            }
            if (category === 'MANAGEMENT') {
                return {
                    valid: false,
                    error: `Eligibility restriction: Students from Management & Business Schools (MBA / PGDM) are not eligible to participate in Technical events. They are permitted to register for Inter-College Cultural events only.`
                };
            }
            if (category === 'UNIVERSITY') {
                return {
                    valid: false,
                    error: `Eligibility restriction: Students from Universities & Institutes of National Importance are not eligible to participate in this Technical event. They are permitted to register for Inter-College Cultural events only.`
                };
            }
        }
    }

    return {
        valid: true,
        institution,
        category
    };
};

module.exports = {
    ensureInstitutionsSeeded,
    getLocations,
    getDistricts,
    getInstitutions,
    getInstitutionById,
    requestInstitutionAddition,
    getAdminInstitutions,
    createAdminInstitution,
    updateAdminInstitution,
    updateInstitutionStatus,
    getInstitutionCategory,
    validateExternalInstitutionSelection
};
