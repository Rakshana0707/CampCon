const express = require('express');
const router = express.Router();
const { getMyCertificates, verifyCertificate } = require('../controllers/certificate.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/me', authenticateToken, getMyCertificates);
router.get('/verify/:certificateId', verifyCertificate); // Publicly accessible verification

module.exports = router;
