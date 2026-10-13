import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Symposium Management & Two-Tier Registration', () => {
    let organizerToken;
    let otherOrganizerToken;
    let internalStudentToken;
    let externalStudentToken;

    beforeEach(() => {
        vi.resetAllMocks();

        organizerToken = jwt.sign({ id: 1, role: 'ORGANIZER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        otherOrganizerToken = jwt.sign({ id: 9, role: 'ORGANIZER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        internalStudentToken = jwt.sign({ id: 2, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        externalStudentToken = jwt.sign({ id: 4, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        prismaMock.user.findUnique.mockImplementation(async (args) => {
            if (args.where.id === 1) {
                return {
                    id: 1,
                    role: 'ORGANIZER',
                    name: 'Dept Organizer',
                    organizerAssignments: [{ organizerEntityId: 10, organizerEntity: { id: 10, name: 'Chemical Engineering', isActive: true } }]
                };
            }
            if (args.where.id === 9) {
                return {
                    id: 9,
                    role: 'ORGANIZER',
                    name: 'Other Organizer',
                    organizerAssignments: [{ organizerEntityId: 99, organizerEntity: { id: 99, name: 'Other Dept', isActive: true } }]
                };
            }
            if (args.where.id === 2) {
                return {
                    id: 2,
                    role: 'STUDENT',
                    name: 'Internal Student',
                    affiliationStatus: 'INTERNAL_VERIFIED',
                    collegeName: 'CIT',
                    organizerAssignments: []
                };
            }
            if (args.where.id === 4) {
                return {
                    id: 4,
                    role: 'STUDENT',
                    name: 'External Student',
                    affiliationStatus: 'EXTERNAL',
                    collegeName: 'External University',
                    organizerAssignments: []
                };
            }
            return null;
        });

        prismaMock.organizerAssignment.findMany.mockImplementation(async (args) => {
            if (args?.where?.userId === 1) {
                return [{ organizerEntityId: 10, organizerEntity: { id: 10, name: 'Chemical Engineering', isActive: true } }];
            }
            return [];
        });

        prismaMock.organizerAssignment.findUnique.mockImplementation(async (args) => {
            if (args?.where?.userId_organizerEntityId?.userId === 1 && args?.where?.userId_organizerEntityId?.organizerEntityId === 10) {
                return { userId: 1, organizerEntityId: 10, organizerEntity: { id: 10, name: 'Chemical Engineering', isActive: true } };
            }
            return null;
        });

        prismaMock.organizerEntity.findUnique.mockResolvedValue({
            id: 10,
            name: 'Chemical Engineering',
            isActive: true
        });
    });

    describe('1. Symposium Creation & Duration Validation', () => {
        it('should create a multi-day symposium and calculate numberOfDays correctly', async () => {
            const symposiumPayload = {
                title: 'CHEMOVISTA 2K26 Multi-Day Symposium',
                category: 'Technical',
                eventFormat: 'SYMPOSIUM',
                date: '2026-10-20 09:00:00',
                endDate: '2026-10-22 18:00:00',
                numberOfDays: 3,
                venue: 'Main Auditorium',
                totalSeats: 500,
                eventType: 'INTER_COLLEGE',
                organizerEntityId: 10,
                deadline: '2026-10-19 23:59:59'
            };

            prismaMock.event.create.mockResolvedValue({
                id: 100,
                ...symposiumPayload,
                status: 'APPROVED',
                availableSeats: 500
            });

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send(symposiumPayload);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.event.eventFormat).toBe('SYMPOSIUM');
            expect(res.body.event.numberOfDays).toBe(3);
        });

        it('should reject symposium creation if specified numberOfDays does not match calendar schedule', async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    title: 'Invalid Days Symposium',
                    eventFormat: 'SYMPOSIUM',
                    date: '2026-10-20 09:00:00',
                    endDate: '2026-10-22 18:00:00',
                    numberOfDays: 5, // Actually 3 calendar days
                    venue: 'Main Auditorium',
                    totalSeats: 200,
                    eventType: 'INTRA_COLLEGE',
                    organizerEntityId: 10
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('does not match the schedule dates');
        });
    });

    describe('2. Symposium Child Activities & Boundaries', () => {
        it('should allow authorized organizer to add a child activity within symposium schedule', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 100,
                title: 'Cryptera 2K26',
                eventFormat: 'SYMPOSIUM',
                organizerId: 1,
                date: new Date('2026-10-20T09:00:00Z'),
                endDate: new Date('2026-10-22T18:00:00Z'),
                numberOfDays: 3
            });

            prismaMock.symposiumActivity.findFirst.mockResolvedValue(null); // No venue conflict
            prismaMock.symposiumActivity.create.mockResolvedValue({
                id: 501,
                eventId: 100,
                name: 'Algorithmic Coding Sprint',
                category: 'Technical',
                dayNumber: 1,
                startTime: new Date('2026-10-20T10:00:00Z'),
                endTime: new Date('2026-10-20T13:00:00Z'),
                venue: 'Lab 204',
                maxParticipants: 60,
                availableSeats: 60,
                requiresOverallRegistration: true,
                isActive: true
            });

            const res = await request(app)
                .post('/api/events/100/activities')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    name: 'Algorithmic Coding Sprint',
                    category: 'Technical',
                    dayNumber: 1,
                    startTime: '2026-10-20T10:00:00Z',
                    endTime: '2026-10-20T13:00:00Z',
                    venue: 'Lab 204',
                    maxParticipants: 60,
                    requiresOverallRegistration: true
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.activity.name).toBe('Algorithmic Coding Sprint');
        });

        it('should reject child activity if its schedule falls outside the parent symposium dates', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 100,
                title: 'Cryptera 2K26',
                eventFormat: 'SYMPOSIUM',
                organizerId: 1,
                date: new Date('2026-10-20T09:00:00Z'),
                endDate: new Date('2026-10-22T18:00:00Z'),
                numberOfDays: 3
            });

            const res = await request(app)
                .post('/api/events/100/activities')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    name: 'Late Activity',
                    dayNumber: 4, // Exceeds 3 days
                    startTime: '2026-10-25T10:00:00Z',
                    endTime: '2026-10-25T13:00:00Z',
                    venue: 'Lab 204',
                    maxParticipants: 30
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('must fall within the symposium overall dates');
        });

        it('should detect venue overlaps and prevent scheduling conflicts', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 100,
                title: 'Cryptera 2K26',
                eventFormat: 'SYMPOSIUM',
                organizerId: 1,
                date: new Date('2026-10-20T09:00:00Z'),
                endDate: new Date('2026-10-22T18:00:00Z'),
                numberOfDays: 3
            });

            // Simulate overlapping activity in same venue
            prismaMock.symposiumActivity.findFirst.mockResolvedValue({
                id: 501,
                name: 'Existing Workshop',
                venue: 'Lab 204',
                startTime: new Date('2026-10-20T10:00:00Z'),
                endTime: new Date('2026-10-20T13:00:00Z')
            });

            const res = await request(app)
                .post('/api/events/100/activities')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    name: 'Conflicting Coding Sprint',
                    dayNumber: 1,
                    startTime: '2026-10-20T11:00:00Z',
                    endTime: '2026-10-20T12:30:00Z',
                    venue: 'Lab 204',
                    maxParticipants: 30
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Venue scheduling conflict');
        });

        it('should block unauthorized organizers from modifying symposium activities', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 100,
                title: 'Cryptera 2K26',
                eventFormat: 'SYMPOSIUM',
                organizerId: 1 // Owned by user 1
            });

            const res = await request(app)
                .post('/api/events/100/activities')
                .set('Authorization', `Bearer ${otherOrganizerToken}`)
                .send({
                    name: 'Unauthorized Activity',
                    dayNumber: 1,
                    startTime: '2026-10-20T10:00:00Z',
                    endTime: '2026-10-20T13:00:00Z',
                    venue: 'Lab 204',
                    maxParticipants: 30
                });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('3. Two-Tier Activity Registration & Prerequisites', () => {
        it('should enforce requiresOverallRegistration prerequisite before allowing activity registration', async () => {
            prismaMock.symposiumActivity.findUnique.mockResolvedValue({
                id: 501,
                eventId: 100,
                name: 'Algorithmic Coding Sprint',
                isActive: true,
                requiresOverallRegistration: true,
                availableSeats: 50,
                event: {
                    id: 100,
                    status: 'APPROVED',
                    eventType: 'INTRA_COLLEGE',
                    externalParticipationAllowed: false
                }
            });

            // Student NOT registered for overall symposium
            prismaMock.registration.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/activities/501/register')
                .set('Authorization', `Bearer ${internalStudentToken}`)
                .send();

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('You must first register for the overall symposium');
        });

        it('should allow activity registration when student has overall symposium registration', async () => {
            prismaMock.symposiumActivity.findUnique.mockResolvedValue({
                id: 501,
                eventId: 100,
                name: 'Algorithmic Coding Sprint',
                isActive: true,
                requiresOverallRegistration: true,
                availableSeats: 50,
                event: {
                    id: 100,
                    status: 'APPROVED',
                    eventType: 'INTRA_COLLEGE',
                    externalParticipationAllowed: false
                }
            });

            // Student IS registered for overall symposium
            prismaMock.registration.findUnique.mockResolvedValue({
                id: 88,
                userId: 2,
                eventId: 100,
                status: 'APPROVED'
            });

            prismaMock.activityRegistration.findUnique.mockResolvedValue(null); // Not duplicate

            prismaMock.$transaction.mockImplementation(async (callback) => {
                return callback({
                    activityRegistration: {
                        findUnique: vi.fn().mockResolvedValue(null),
                        create: vi.fn().mockResolvedValue({
                            id: 901,
                            ticketId: 'ACT-501-12345',
                            activityId: 501,
                            userId: 2,
                            status: 'CONFIRMED'
                        })
                    },
                    symposiumActivity: {
                        findUnique: vi.fn().mockResolvedValue({
                            id: 501,
                            availableSeats: 50
                        }),
                        update: vi.fn().mockResolvedValue({})
                    }
                });
            });

            const res = await request(app)
                .post('/api/activities/501/register')
                .set('Authorization', `Bearer ${internalStudentToken}`)
                .send();

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.registration.ticketId).toContain('ACT-501');
        });

        it('should reject activity registration if activity capacity is reached', async () => {
            prismaMock.symposiumActivity.findUnique.mockResolvedValue({
                id: 501,
                eventId: 100,
                name: 'Algorithmic Coding Sprint',
                isActive: true,
                requiresOverallRegistration: false,
                availableSeats: 0, // Capacity full
                event: {
                    id: 100,
                    status: 'APPROVED',
                    eventType: 'INTRA_COLLEGE'
                }
            });

            const res = await request(app)
                .post('/api/activities/501/register')
                .set('Authorization', `Bearer ${internalStudentToken}`)
                .send();

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('reached maximum participant capacity');
        });

        it('should enforce intra-college eligibility on child activities when parent is intra-college', async () => {
            prismaMock.symposiumActivity.findUnique.mockResolvedValue({
                id: 501,
                eventId: 100,
                name: 'Intra College Workshop',
                isActive: true,
                availableSeats: 50,
                event: {
                    id: 100,
                    status: 'APPROVED',
                    eventType: 'INTRA_COLLEGE',
                    externalParticipationAllowed: false
                }
            });

            const res = await request(app)
                .post('/api/activities/501/register')
                .set('Authorization', `Bearer ${externalStudentToken}`)
                .send();

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Intra-College symposium');
        });
    });
});
