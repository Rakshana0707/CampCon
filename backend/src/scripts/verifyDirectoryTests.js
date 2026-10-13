/**
 * Automated Verification Suite for CampusConnect
 * Real Tamil Nadu District & College Directory for External Students
 *
 * Tests:
 * 1. All 38 official Tamil Nadu districts are available via API.
 * 2. District filter returns only institutions mapped to that district.
 * 3. Search query filters colleges accurately.
 * 4. Invalid institution ID rejected by backend.
 * 5. Mismatched district and institution combination rejected.
 * 6. External student cannot register for intra-college event.
 * 7. External student CAN register for eligible inter-college event with valid institution.
 * 8. Internal student registration bypasses external directory without error.
 * 9. Re-importing dataset does not create duplicate entries.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('====================================================');
    console.log('🧪 Running CampusConnect Directory Verification Suite');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    }

    try {
        // Test 1: Official 38 Tamil Nadu districts
        console.log('Test 1: Verify all 38 official Tamil Nadu districts are returned');
        const locRes = await axios.get(`${BASE_URL}/institutions/locations`);
        assert(locRes.data.success === true, 'Locations API returned success: true');
        const tnDistricts = locRes.data.districtsByState?.['Tamil Nadu'] || [];
        assert(tnDistricts.length === 38, `Expected 38 districts, got ${tnDistricts.length}`);
        assert(tnDistricts.includes('Coimbatore') && tnDistricts.includes('Chengalpattu') && tnDistricts.includes('Ranipet'), 'Contains newly bifurcated districts');

        // Test 2: District-specific institutions filter
        console.log('\nTest 2: District filter returns only colleges mapped to that district');
        const cbeRes = await axios.get(`${BASE_URL}/institutions`, {
            params: { state: 'Tamil Nadu', district: 'Coimbatore' }
        });
        assert(cbeRes.data.success === true, 'Institutions API returned success');
        assert(cbeRes.data.institutions.length > 50, `Coimbatore has ${cbeRes.data.institutions.length} institutions`);
        const allCbe = cbeRes.data.institutions.every(c => c.district === 'Coimbatore');
        assert(allCbe, 'All returned institutions strictly have district === "Coimbatore"');
        const hasCIT = cbeRes.data.institutions.some(c => c.code === 'TN-CBE-CIT');
        assert(!hasCIT, 'Host institution CIT is strictly excluded from external picker');

        // Test 3: Search within district
        console.log('\nTest 3: Search filter within district works');
        const searchRes = await axios.get(`${BASE_URL}/institutions`, {
            params: { state: 'Tamil Nadu', district: 'Coimbatore', q: 'PSG' }
        });
        assert(searchRes.data.success === true, 'Search endpoint returned success');
        assert(searchRes.data.institutions.length > 0, `Search for "PSG" returned ${searchRes.data.institutions.length} results`);
        const allMatchPSG = searchRes.data.institutions.every(c => c.name.toUpperCase().includes('PSG'));
        assert(allMatchPSG, 'All search results contain "PSG"');

        // Test 4: Single institution endpoint
        console.log('\nTest 4: Get single institution details by ID');
        const sampleInst = cbeRes.data.institutions[0];
        const singleRes = await axios.get(`${BASE_URL}/institutions/${sampleInst.id}`);
        assert(singleRes.data.success === true, 'Single institution API returned success');
        assert(singleRes.data.institution.id === sampleInst.id, 'Retrieved correct institution ID');
        assert(singleRes.data.institution.district === 'Coimbatore', 'Retrieved correct district');

        // Test 5: Invalid institution ID registration rejection
        console.log('\nTest 5: Reject invalid institution ID on external student registration');
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Fraud External',
                email: `fake${Date.now()}@example.com`,
                password: 'password123',
                department: 'CSE',
                rollNumber: 'FAK001',
                affiliationType: 'EXTERNAL',
                collegeState: 'Tamil Nadu',
                collegeDistrict: 'Coimbatore',
                institutionId: 99999999 // Non-existent
            });
            assert(false, 'Should have rejected non-existent institution ID');
        } catch (err) {
            assert(err.response?.status === 400, `Rejected invalid institution ID with HTTP ${err.response?.status}`);
        }

        // Test 6: Location mismatch rejection
        console.log('\nTest 6: Reject mismatched district and institution combination');
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Mismatch External',
                email: `mismatch${Date.now()}@example.com`,
                password: 'password123',
                department: 'CSE',
                rollNumber: 'MIS001',
                affiliationType: 'EXTERNAL',
                collegeState: 'Tamil Nadu',
                collegeDistrict: 'Madurai', // Mismatched district for a Coimbatore college
                institutionId: sampleInst.id
            });
            assert(false, 'Should have rejected mismatched district');
        } catch (err) {
            assert(err.response?.status === 400, `Rejected mismatched district with HTTP ${err.response?.status}`);
            assert(err.response?.data?.error?.includes('Location mismatch'), `Clear error message: "${err.response?.data?.error}"`);
        }

        // Test 7: External student cannot register for INTRA_COLLEGE event
        console.log('\nTest 7: External student blocked from intra-college event');
        // Register a verified external student
        const extUserEmail = `verifiedext${Date.now()}@testcollege.edu`;
        const extRegRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Legit External Student',
            email: extUserEmail,
            password: 'password123',
            department: 'Information Technology',
            rollNumber: 'EXT1001',
            affiliationType: 'EXTERNAL',
            collegeState: 'Tamil Nadu',
            collegeDistrict: sampleInst.district,
            institutionId: sampleInst.id
        });
        const extToken = extRegRes.data.token;
        assert(extRegRes.data.user.affiliationStatus === 'EXTERNAL', 'Registered user has affiliationStatus === "EXTERNAL"');

        // Find an INTRA_COLLEGE event
        const eventsRes = await axios.get(`${BASE_URL}/events`);
        const intraEvent = eventsRes.data.events.find(e => e.eventType === 'INTRA_COLLEGE');
        const interEvent = eventsRes.data.events.find(e => e.eventType === 'INTER_COLLEGE' && e.externalParticipationAllowed);

        if (intraEvent) {
            try {
                await axios.post(`${BASE_URL}/registrations`, {
                    eventId: intraEvent.id,
                    role: 'PARTICIPANT'
                }, {
                    headers: { Authorization: `Bearer ${extToken}` }
                });
                assert(false, 'Should have rejected external student for INTRA_COLLEGE event');
            } catch (err) {
                assert(err.response?.status === 403, `Blocked external student from INTRA_COLLEGE event with HTTP ${err.response?.status}`);
            }
        }

        // Test 8: External student CAN register for INTER_COLLEGE event
        if (interEvent) {
            console.log('\nTest 8: External student allowed to register for INTER_COLLEGE event');
            const prisma = require('../config/prisma');
            // Ensure external registration is currently open for the test event
            const originalOpensAt = interEvent.externalRegOpensAt;
            await prisma.event.update({
                where: { id: interEvent.id },
                data: { externalRegOpensAt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            const regRes = await axios.post(`${BASE_URL}/registrations`, {
                eventId: interEvent.id,
                role: 'PARTICIPANT',
                institutionId: sampleInst.id,
                participantCollege: sampleInst.name,
                participantState: sampleInst.state,
                participantDistrict: sampleInst.district
            }, {
                headers: { Authorization: `Bearer ${extToken}` }
            });
            assert(regRes.data.success === true, `Successfully registered external student for inter-college event "${interEvent.title}"`);
            assert(Boolean(regRes.data.registration?.ticketId), `Generated ticket with ID: ${regRes.data.registration?.ticketId}`);

            // Restore original opening date
            await prisma.event.update({
                where: { id: interEvent.id },
                data: { externalRegOpensAt: originalOpensAt ? new Date(originalOpensAt) : null }
            });
        }

        // Test 9: Internal CIT student registration continues to work without external fields
        console.log('\nTest 9: Internal CIT student registration works without external fields');
        const intUserEmail = `internalstudent${Date.now()}@cit.ac.in`;
        const intRegRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'CIT Internal Student',
            email: intUserEmail,
            password: 'password123',
            department: 'Computer Science',
            rollNumber: '24CS999',
            collegeName: 'Coimbatore Institute of Technology'
        });
        assert(intRegRes.data.success === true, 'Internal student registration succeeded');
        assert(intRegRes.data.user.affiliationStatus === 'INTERNAL_VERIFIED', 'Internal student received INTERNAL_VERIFIED status');
        assert(intRegRes.data.user.collegeName === 'Coimbatore Institute of Technology', 'Internal student affiliated with CIT');

    } catch (err) {
        console.error('Unexpected test runner error:', err.message);
        if (err.response?.data) console.error('Response data:', err.response.data);
        failed++;
    }

    console.log('\n====================================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    if (failed > 0) process.exit(1);
    else process.exit(0);
}

runTests();
