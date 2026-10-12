import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

describe('CampusConnect — Organization Accounts, College Eligibility, & Event Scope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockAdminUser = {
        id: 99,
        email: 'admin@college.edu',
        role: 'ADMIN',
        name: 'System Admin',
        affiliationStatus: 'INTERNAL_VERIFIED',
        isActive: true,
        organizerAssignments: []
    };

    const mockOrganizerUser = {
        id: 10,
        email: 'cse_head@college.edu',
        role: 'ORGANIZER',
        name: 'CSE Coordinator',
        affiliationStatus: 'INTERNAL_VERIFIED',
        isActive: true,
        organizerAssignments: [
            {
                organizerEntityId: 1,
                organizerEntity: { id: 1, name: 'B.E. Computer Science and Engineering', type: 'DEPARTMENT', isActive: true }
            }
        ]
    };

    const mockInternalStudentUser = {
        id: 20,
        email: 'internal.student@college.edu',
        role: 'STUDENT',
        name: 'Internal Student',
        collegeName: 'Our College',
        affiliationStatus: 'INTERNAL_VERIFIED',
        isActive: true,
        organizerAssignments: []
    };

    const mockExternalStudentUser = {
        id: 30,
        email: 'guest.student@external.edu',
        role: 'STUDENT',
        name: 'External Student',
        collegeName: 'Coimbatore Institute of Technology',
        affiliationStatus: 'EXTERNAL',
        isActive: true,
        organizerAssignments: []
    };

    const mockUnverifiedStudentUser = {
        id: 40,
        email: 'unverified@gmail.com',
        role: 'STUDENT',
        name: 'Unverified Student',
        collegeName: 'Our College',
        affiliationStatus: 'UNVERIFIED',
        isActive: true,
        organizerAssignments: []
    };

    const adminToken = jwt.sign({ id: 99 }, process.env.JWT_SECRET || 'secret');
    const organizerToken = jwt.sign({ id: 10 }, process.env.JWT_SECRET || 'secret');
    const internalStudentToken = jwt.sign({ id: 20 }, process.env.JWT_SECRET || 'secret');
    const externalStudentToken = jwt.sign({ id: 30 }, process.env.JWT_SECRET || 'secret');
    const unverifiedStudentToken = jwt.sign({ id: 40 }, process.env.JWT_SECRET || 'secret');

    // ==========================================
    // MODULE: ORGANIZER ACCOUNTS & PROVISIONING
    // ==========================================
    describe('Organizer Accounts & Organization Linkage', () => {
        // Scenario 1
        it('1. Public users cannot register as organizers', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const res = await request(app).post('/api/auth/register').send({
                name: 'Unauthorized Org',
                email: 'rogue@college.edu',
                password: 'password123',
                role: 'ORGANIZER'
            });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/Organizer and Admin accounts cannot be created via public registration/i);
        });

        // Scenario 2
        it('2. An organizer can create an event for an assigned organization', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockOrganizerUser);
            prismaMock.organizerEntity.findUnique.mockResolvedValue({ id: 1, name: 'B.E. Computer Science and Engineering', isActive: true });
            prismaMock.organizerAssignment.findUnique.mockResolvedValue({ userId: 10, organizerEntityId: 1 });

            prismaMock.event.create.mockResolvedValue({
                id: 101,
                title: 'National Hackathon',
                category: 'Technical',
                department: 'B.E. Computer Science and Engineering',
                date: new Date('2026-11-20'),
                venue: 'Seminar Hall 1',
                totalSeats: 100,
                availableSeats: 100,
                eventType: 'INTER_COLLEGE',
                organizerEntityId: 1,
                externalParticipationAllowed: true,
                organizerId: 10
            });

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    title: 'National Hackathon',
                    category: 'Technical',
                    organizerEntityId: 1,
                    date: '2026-11-20',
                    venue: 'Seminar Hall 1',
                    totalSeats: 100,
                    eventType: 'INTER_COLLEGE'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.event.organizerEntityId).toBe(1);
        });

        // Scenario 3
        it('3. An organizer cannot create an event for an unrelated organization', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockOrganizerUser);
            prismaMock.organizerEntity.findUnique.mockResolvedValue({ id: 2, name: 'Robotics Club', isActive: true });
            // Not assigned to entity 2
            prismaMock.organizerAssignment.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    title: 'Robo Wars',
                    category: 'Technical',
                    organizerEntityId: 2,
                    date: '2026-11-20',
                    venue: 'Lab 4',
                    totalSeats: 50,
                    eventType: 'INTRA_COLLEGE'
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/Unauthorized: You are not assigned to organize events for this department or club/i);
        });

        // Scenario 4
        it('4. Revoked assignments prevent unauthorized future management', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockOrganizerUser);
            prismaMock.event.findUnique.mockResolvedValue({
                id: 101,
                title: 'Existing Symposium',
                organizerId: 10,
                organizerEntityId: 1,
                availableSeats: 50,
                totalSeats: 50
            });
            // Revocation: User no longer has active assignment for entity 1
            prismaMock.organizerAssignment.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/events/101')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ title: 'Tampered Symposium Title' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/assignment to this organizing organization has been revoked/i);
        });

        // Scenario 5
        it('5. Historical events remain associated with the correct organization', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockInternalStudentUser);
            prismaMock.event.findMany.mockResolvedValue([
                {
                    id: 999,
                    title: 'Historical Tech Con 2025',
                    department: 'B.E. Computer Science and Engineering',
                    eventType: 'INTRA_COLLEGE',
                    organizerEntityId: 1,
                    organizerEntity: { id: 1, name: 'B.E. Computer Science and Engineering', type: 'DEPARTMENT' },
                    organizer: { id: 10, name: 'Former Coordinator' }
                }
            ]);

            const res = await request(app)
                .get('/api/events')
                .set('Authorization', `Bearer ${internalStudentToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.events[0].organizerEntity.name).toBe('B.E. Computer Science and Engineering');
            expect(res.body.events[0].department).toBe('B.E. Computer Science and Engineering');
        });
    });

    // ==========================================
    // MODULE: INTRA-COLLEGE ELIGIBILITY
    // ==========================================
    describe('Intra-College Event Discovery and Registration Eligibility', () => {
        // Scenario 6
        it('6. A verified internal student can discover an intra-college event', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockInternalStudentUser);
            prismaMock.event.findMany.mockResolvedValue([
                { id: 201, title: 'Intra Coding Championship', eventType: 'INTRA_COLLEGE', status: 'APPROVED' }
            ]);

            const res = await request(app)
                .get('/api/events?eventType=INTRA_COLLEGE')
                .set('Authorization', `Bearer ${internalStudentToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.events.length).toBe(1);
            expect(res.body.events[0].eventType).toBe('INTRA_COLLEGE');
        });

        // Scenario 7
        it('7. An external student cannot discover an intra-college event through restricted listings', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockExternalStudentUser);

            // Ineligible external student querying intra-college events gets empty list (count 0)
            const res = await request(app)
                .get('/api/events?eventType=INTRA_COLLEGE')
                .set('Authorization', `Bearer ${externalStudentToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(0);
            expect(res.body.events).toEqual([]);
        });

        // Scenario 8
        it('8. An external student cannot retrieve restricted event details through a protected API endpoint', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockExternalStudentUser);
            prismaMock.event.findUnique.mockResolvedValue({
                id: 201,
                title: 'Intra Coding Championship',
                eventType: 'INTRA_COLLEGE',
                status: 'APPROVED'
            });

            const res = await request(app)
                .get('/api/events/201')
                .set('Authorization', `Bearer ${externalStudentToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/Intra-College event exclusively for verified students of our college/i);
        });

        // Scenario 9
        it('9. An external student cannot register for an intra-college event using a direct API request', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockExternalStudentUser);
            prismaMock.event.findUnique.mockResolvedValue({
                id: 201,
                title: 'Intra Coding Championship',
                eventType: 'INTRA_COLLEGE',
                status: 'APPROVED',
                availableSeats: 50,
                deadline: new Date('2026-12-01')
            });

            const res = await request(app)
                .post('/api/events/201/register')
                .set('Authorization', `Bearer ${externalStudentToken}`)
                .send({ participantCollege: 'External Engineering College' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/exclusively for verified students of our college/i);
        });

        // Scenario 10
        it('10. An unverified student cannot register until eligibility is established', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockUnverifiedStudentUser);
            prismaMock.event.findUnique.mockResolvedValue({
                id: 201,
                title: 'Intra Coding Championship',
                eventType: 'INTRA_COLLEGE',
                status: 'APPROVED',
                availableSeats: 50,
                deadline: new Date('2026-12-01')
            });

            const res = await request(app)
                .post('/api/events/201/register')
                .set('Authorization', `Bearer ${unverifiedStudentToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/institutional affiliation is unverified/i);
        });
    });

    // ==========================================
    // MODULE: INTER-COLLEGE ELIGIBILITY
    // ==========================================
    describe('Inter-College Event Discovery and Shared Registration Rules', () => {
        const mockInterEvent = {
            id: 301,
            title: 'Global Tech Con 2026',
            eventType: 'INTER_COLLEGE',
            externalParticipationAllowed: true,
            status: 'APPROVED',
            availableSeats: 100,
            totalSeats: 100,
            deadline: new Date('2026-12-01')
        };

        // Scenario 11
        it('11. A verified internal student can discover and register for an inter-college event', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockInternalStudentUser);
            prismaMock.event.findUnique.mockResolvedValue(mockInterEvent);

            prismaMock.$transaction.mockImplementation(async (cb) => {
                const tx = {
                    registration: {
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({
                            id: 501,
                            ticketId: 'INTERNAL-TICKET-77',
                            userId: 20,
                            eventId: 301,
                            participantCollege: 'Our College',
                            status: 'APPROVED'
                        })
                    },
                    event: {
                        updateMany: vi.fn().mockResolvedValue({ count: 1 })
                    }
                };
                return cb(tx);
            });

            const res = await request(app)
                .post('/api/events/301/register')
                .set('Authorization', `Bearer ${internalStudentToken}`);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.registration.ticketId).toBe('INTERNAL-TICKET-77');
        });

        // Scenario 12
        it('12. An eligible external student can discover and register for the same inter-college event', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockExternalStudentUser);
            prismaMock.event.findUnique.mockResolvedValue(mockInterEvent);

            prismaMock.$transaction.mockImplementation(async (cb) => {
                const tx = {
                    registration: {
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({
                            id: 502,
                            ticketId: 'EXTERNAL-TICKET-88',
                            userId: 30,
                            eventId: 301,
                            participantCollege: 'Coimbatore Institute of Technology',
                            institutionDetails: 'Dept of CSE',
                            status: 'APPROVED'
                        })
                    },
                    event: {
                        updateMany: vi.fn().mockResolvedValue({ count: 1 })
                    }
                };
                return cb(tx);
            });

            const res = await request(app)
                .post('/api/events/301/register')
                .set('Authorization', `Bearer ${externalStudentToken}`)
                .send({
                    participantCollege: 'Coimbatore Institute of Technology',
                    institutionDetails: 'Dept of CSE'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.registration.participantCollege).toBe('Coimbatore Institute of Technology');
        });

        // Scenario 13
        it('13. External participant institution details are validated where required', async () => {
            // External student user whose collegeName in profile is also missing/empty
            prismaMock.user.findUnique.mockResolvedValue({
                ...mockExternalStudentUser,
                collegeName: 'Our College' // Attempts to register as external without providing college
            });
            prismaMock.event.findUnique.mockResolvedValue(mockInterEvent);

            const res = await request(app)
                .post('/api/events/301/register')
                .set('Authorization', `Bearer ${externalStudentToken}`)
                .send({
                    participantCollege: '' // Missing institution details
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/External participants must provide their institution \/ college name/i);
        });

        // Scenario 14
        it('14. Capacity, deadlines, approval status, and duplicate-registration rules still apply to both internal and external participants', async () => {
            prismaMock.user.findUnique.mockResolvedValue(mockExternalStudentUser);

            // 14a. Expired deadline
            prismaMock.event.findUnique.mockResolvedValue({
                ...mockInterEvent,
                deadline: new Date('2020-01-01')
            });

            const resDeadline = await request(app)
                .post('/api/events/301/register')
                .set('Authorization', `Bearer ${externalStudentToken}`)
                .send({ participantCollege: 'CIT' });

            expect(resDeadline.status).toBe(400);
            expect(resDeadline.body.error).toMatch(/Registration deadline has passed/i);

            // 14b. Capacity full
            prismaMock.event.findUnique.mockResolvedValue({
                ...mockInterEvent,
                deadline: new Date('2026-12-01')
            });
            prismaMock.$transaction.mockImplementation(async (cb) => {
                const tx = {
                    registration: { findUnique: vi.fn().mockResolvedValue(null) },
                    event: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) } // 0 means no seats available
                };
                return cb(tx);
            });

            const resCapacity = await request(app)
                .post('/api/events/301/register')
                .set('Authorization', `Bearer ${externalStudentToken}`)
                .send({ participantCollege: 'CIT' });

            expect(resCapacity.status).toBe(400);
            expect(resCapacity.body.error).toMatch(/maximum capacity/i);

            // 14c. Duplicate registration
            prismaMock.$transaction.mockImplementation(async (cb) => {
                const tx = {
                    registration: { findUnique: vi.fn().mockResolvedValue({ id: 999 }) } // Existing registration found
                };
                return cb(tx);
            });

            const resDuplicate = await request(app)
                .post('/api/events/301/register')
                .set('Authorization', `Bearer ${externalStudentToken}`)
                .send({ participantCollege: 'CIT' });

            expect(resDuplicate.status).toBe(400);
            expect(resDuplicate.body.error).toMatch(/already registered/i);
        });
    });
});
