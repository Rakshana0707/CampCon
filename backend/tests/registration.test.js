import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Registration Endpoints', () => {
    let studentToken;
    let authHeader;

    beforeEach(() => {
        vi.resetAllMocks();
        studentToken = jwt.sign({ id: 1, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        authHeader = `Bearer ${studentToken}`;
        
        // Mock user for auth middleware
        prismaMock.user.findUnique.mockImplementation(async (args) => {
            if (args.where.id === 1) return { id: 1, role: 'STUDENT', name: 'Stu' };
            return null;
        });
    });

    describe('POST /api/events/:eventId/register', () => {
        it('should register successfully for an event with capacity', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 1,
                status: 'APPROVED',
                deadline: new Date(Date.now() + 86400000), // Tomorrow
                availableSeats: 10
            });
            
            // Transaction mock
            prismaMock.$transaction.mockResolvedValue({
                id: 1, ticketId: 'TICKET-123', status: 'APPROVED'
            });

            const res = await request(app)
                .post('/api/events/1/register')
                .set('Authorization', authHeader);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.registration.ticketId).toBe('TICKET-123');
        });

        it('should prevent duplicate registrations', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 1,
                status: 'APPROVED',
                deadline: new Date(Date.now() + 86400000),
                availableSeats: 10
            });

            prismaMock.$transaction.mockRejectedValue(new Error('DUPLICATE'));

            const res = await request(app)
                .post('/api/events/1/register')
                .set('Authorization', authHeader);

            expect(res.status).toBe(400);
            expect((res.body.error || res.body.message)).toMatch(/already registered/i);
        });

        it('should enforce event capacity', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 1,
                status: 'APPROVED',
                deadline: new Date(Date.now() + 86400000),
                availableSeats: 10 
            });

            prismaMock.$transaction.mockRejectedValue(new Error('CAPACITY_FULL'));

            const res = await request(app)
                .post('/api/events/1/register')
                .set('Authorization', authHeader);

            expect(res.status).toBe(400);
            expect((res.body.error || res.body.message)).toMatch(/sold out|capacity/i);
        });
        
        it('should reject registration after deadline', async () => {
            prismaMock.event.findUnique.mockResolvedValue({
                id: 1,
                status: 'APPROVED',
                deadline: new Date(Date.now() - 86400000), // Yesterday
                availableSeats: 10
            });

            const res = await request(app)
                .post('/api/events/1/register')
                .set('Authorization', authHeader);

            expect(res.status).toBe(400);
            expect((res.body.error || res.body.message)).toMatch(/deadline/i);
        });
    });

    describe('DELETE /api/events/:eventId/register', () => {
        it('should cancel a registration successfully', async () => {
            prismaMock.$transaction.mockResolvedValue(true);

            const res = await request(app)
                .delete('/api/events/10/register')
                .set('Authorization', authHeader);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect((res.body.error || res.body.message)).toMatch(/cancelled/i);
        });

        it('should return 404 if not found', async () => {
            prismaMock.$transaction.mockRejectedValue(new Error('NOT_FOUND'));

            const res = await request(app)
                .delete('/api/events/10/register')
                .set('Authorization', authHeader);

            expect(res.status).toBe(404);
            expect((res.body.error || res.body.message)).toMatch(/not found|Invalid email or password/i);
        });
    });
});
