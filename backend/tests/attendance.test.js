import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Attendance Endpoints', () => {
    let organizerToken;
    let studentToken;

    beforeEach(() => {
        vi.resetAllMocks();
        organizerToken = jwt.sign({ id: 1, role: 'ORGANIZER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        studentToken = jwt.sign({ id: 2, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        
        // Mock user for auth middleware
        prismaMock.user.findUnique.mockImplementation(async (args) => {
            if (args.where.id === 1) return { id: 1, role: 'ORGANIZER', name: 'Org' };
            if (args.where.id === 2) return { id: 2, role: 'STUDENT', name: 'Stu' };
            return null;
        });
    });

    describe('PATCH /api/registrations/:ticketId/attendance', () => {
        it('should allow organizer to verify a valid ticket', async () => {
            prismaMock.registration.findUnique.mockResolvedValue({
                id: 1,
                ticketId: 'VALID-TICKET-123',
                eventId: 1,
                userId: 2,
                status: 'APPROVED',
                attendance: 'PENDING',
                user: { name: 'Student', email: 'stu@college.edu' },
                event: { organizerId: 1 } // Belongs to the organizer
            });

            prismaMock.$transaction.mockResolvedValue([
                { id: 1, attendance: 'PRESENT' },
                { id: 1, registrationId: 1 }
            ]);

            const res = await request(app)
                .patch('/api/registrations/VALID-TICKET-123/attendance')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ eventId: 1 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect((res.body.error || res.body.message)).toMatch(/verified/i);
        });

        it('should reject already used ticket', async () => {
            prismaMock.registration.findUnique.mockResolvedValue({
                id: 1,
                ticketId: 'VALID-TICKET-123',
                eventId: 1,
                status: 'APPROVED',
                attendance: 'PRESENT', // Already scanned
                user: { name: 'Student', email: 'stu@college.edu' },
                event: { organizerId: 1 }
            });

            const res = await request(app)
                .patch('/api/registrations/VALID-TICKET-123/attendance')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ eventId: 1 });

            expect(res.status).toBe(400);
            expect((res.body.error || res.body.message)).toMatch(/already been verified|already been scanned/i);
        });

        it('should reject ticket for wrong event', async () => {
            prismaMock.registration.findUnique.mockResolvedValue({
                id: 1,
                ticketId: 'VALID-TICKET-123',
                eventId: 2, // Different event
                status: 'APPROVED',
                attendance: 'PENDING',
                user: { name: 'Student', email: 'stu@college.edu' },
                event: { organizerId: 1 }
            });

            const res = await request(app)
                .patch('/api/registrations/VALID-TICKET-123/attendance')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ eventId: 1 });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/not valid for this event/i);
            expect(prismaMock.$transaction).not.toHaveBeenCalled();
        });

        it('should deny verification access to students', async () => {
            prismaMock.registration.findUnique.mockResolvedValue({
                id: 1,
                ticketId: 'VALID-TICKET-123',
                eventId: 1,
                status: 'APPROVED',
                attendance: 'PENDING',
                user: { name: 'Student', email: 'stu@college.edu' },
                event: { organizerId: 1 }
            });
            const res = await request(app)
                .patch('/api/registrations/VALID-TICKET-123/attendance')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ eventId: 1 });

            expect(res.status).toBe(403);
            expect((res.body.error || res.body.message)).toMatch(/insufficient|forbidden|not authorized/i);
        });
    });
});
