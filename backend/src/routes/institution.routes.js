const express = require('express');
const router = express.Router();
const {
    getLocations,
    getDistricts,
    getInstitutions,
    getInstitutionById,
    requestInstitutionAddition
} = require('../controllers/institution.controller');

// Public endpoints for Tamil Nadu Districts and Institution selection
router.get('/locations', getLocations);
router.get('/districts', getDistricts);
router.get('/:id', getInstitutionById);
router.get('/', getInstitutions);
router.post('/request', requestInstitutionAddition);

module.exports = router;
