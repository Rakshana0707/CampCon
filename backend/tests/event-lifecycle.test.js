import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Event Lifecycle, Automatic Expiration, & Registration Scheduling', () => {
    let organizerToken;
    let internalStudentToken;
    let externalStudentToken;
    let adminToken;

    beforeEach(() => {
        vi.resetAllMocks();
        organizerToken = jwt.sign({ id: 1, role: 'ORGANIZER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        internalStudentToken = jwt.sign({ id: 2, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        externalStudentToken = jwt.sign({ id: 3, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        adminToken = jwt.sign({ id: 4, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        prismaMock.user.findUnique.mockImplementation(async (args) => {
            if (args.where.id === 1) return { 
                id: 1, role: 'ORGANIZER', name: 'Organizer 1', affiliationStatus: 'INTERNAL_VERIFIED',
                organizerAssignments: [{ organizerEntityId: 1, organizerEntity: { id: 1, name: 'CSE', isActive: true } }]
            };
            if (args.where.id === 2) return { 
                id: 2, role: 'STUDENT', name: 'Internal Student', affiliationStatus: 'INTERNAL_VERIFIED', collegeName: 'Our College'
            };
            if (args.where.id === 3) return { 
                id: 3, role: 'STUDENT', name: 'External Student', affiliationStatus: 'EXTERNAL', collegeName: 'Other University'
            };
            if (args.where.id === 4) return { 
                id: 4, role: 'ADMIN', name: 'Admin', affiliationStatus: 'INTERNAL_VERIFIED'
            };
            return null;
        });

        prismaMock.organizerAssignment.findMany.mockResolvedValue([
            { userId: 1, organizerEntityId: 1, organizerEntity: { id: 1, name: 'CSE', isActive: true } }
        ]);
        prismaMock.organizerAssignment.findUnique.mockResolvedValue({
            userId: 1, organizerEntityId: 1, organizerEntity: { id: 1, name: 'CSE', isActive: true }
        });
        prismaMock.organizerEntity.findUnique.mockResolvedValue({
            id: 1, name: 'CSE', isActive: true
        });
    });

    describe('1. Create Event: Date Validation & expiresAt Calculation', () => {
        it('calculates expiresAt as exactly 24 hours after event endDate', async () => {
            let createdEventData = null;
            prismaMock.event.create.mockImplementation(async (args) => {
                createdEventData = args.data;
                return { id: 10, ...args.data };
            });

            const startDate = '2026-11-20T10:00:00.000Z';
            const endDate = '2026-11-21T18:00:00.000Z';

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    title: 'Cryptera 2K26',
                    eventType: 'INTER_COLLEGE',
                    date: startDate,
                    endDate: endDate,
                    deadline: '2026-11-19T23:59:59.000Z',
                    venue: 'Computing Lab 4',
                    totalSeats: 150
                });

            expect(res.status).toBe(201);
            expect(createdEventData).toBeDefined();
            const expectedExpiresAt = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000);
            expect(new Date(createdEventData.expiresAt).getTime()).toBe(expectedExpiresAt.getTime());
        });

        it('rejects event creation if endDate is earlier than startDate', async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    title: 'Invalid Dates Event',
                    eventType: 'INTRA_COLLEGE',
                    date: '2026-11-25T10:00:00.000Z',
                    endDate: '2026-11-20T10:00:00.000Z', // Earlier than start date!
                    deadline: '2026-11-19T10:00:00.000Z',
                    venue: 'Hall',
                    totalSeats: 50
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/End date\/time cannot be before start date\/time/i);
        });

        it('rejects event creation if deadline is after endDate', async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    title: 'Late Deadline Event',
                    eventType: 'INTRA_COLLEGE',
                    date: '2026-11-20T10:00:00.000Z',
                    endDate: '2026-11-21T18:00:00.000Z',
                    deadline: '2026-11-22T10:00:00.000Z', // After end date!
                    venue: 'Hall',
                    totalSeats: 50
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Registration deadline cannot be after the event end date/i);
        });
    });

    describe('2. Registration Opening Schedule Enforcement', () => {
        it('rejects registration for internal student if current time is before internalRegOpensAt', async () => {
            const futureOpensAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in future
            prismaMock.event.findUnique.mockResolvedValue({
                id: 50,
                title: 'Future Reg Event',
                status: 'APPROVED',
                eventType: 'INTRA_COLLEGE',
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
                internalRegOpensAt: futureOpensAt,
                availableSeats: 50
            });

            const res = await request(app)
                .post('/api/events/50/register')
                .set('Authorization', `Bearer ${internalStudentToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Registration has not opened yet for college students/i);
        });

        it('rejects registration for external participant if current time is before externalRegOpensAt', async () => {
            const futureExternalOpensAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            prismaMock.event.findUnique.mockResolvedValue({
                id: 51,
                title: 'Inter College Future Reg Event',
                status: 'APPROVED',
                eventType: 'INTER_COLLEGE',
                externalParticipationAllowed: true,
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
                internalRegOpensAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // open for internal
                externalRegOpensAt: futureExternalOpensAt, // not yet open for external
                availableSeats: 50
            });

            const res = await request(app)
                .post('/api/events/51/register')
                .set('Authorization', `Bearer ${externalStudentToken}`)
                .send({ participantCollege: 'National Institute', institutionDetails: 'Dept of IT' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Registration has not opened yet for external participants/i);
        });

        it('rejects registration if the event has already concluded (past endDate)', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 52,
                title: 'Concluded Event',
                status: 'APPROVED',
                eventType: 'INTRA_COLLEGE',
                date: new Date(Date.now() - 48 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // ended yesterday
                deadline: new Date(Date.now() - 50 * 60 * 60 * 1000),
                availableSeats: 50
            });

            const res = await request(app)
                .post('/api/events/52/register')
                .set('Authorization', `Bearer ${internalStudentToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Registration is closed|already ended/i);
        });
    });

    describe('3. Attendance Scanning Window Enforcement', () => {
        it('rejects ticket scanning if event has passed its expiresAt window (24h grace period concluded)', async () => {
            const expiredEventTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // expired 2 hours ago
            prismaMock.registration.findUnique.mockResolvedValue({
                id: 88,
                ticketId: 'EXPIRED-TICKET-999',
                status: 'APPROVED',
                attendance: 'PENDING',
                userId: 2,
                eventId: 60,
                user: { name: 'Test Student' },
                event: {
                    id: 60,
                    title: 'Expired Conference',
                    organizerId: 1,
                    expiresAt: expiredEventTime
                }
            });

            const res = await request(app)
                .patch('/api/registrations/EXPIRED-TICKET-999/attendance')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Attendance window has closed for this event/i);
        });
    });
});
