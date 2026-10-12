import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Event Endpoints', () => {
    let organizerToken;
    let studentToken;

    beforeEach(() => {
        vi.resetAllMocks();
        organizerToken = jwt.sign({ id: 1, role: 'ORGANIZER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        studentToken = jwt.sign({ id: 2, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        
        // Mock user for auth middleware
        prismaMock.user.findUnique.mockImplementation(async (args) => {
            if (args.where.id === 1) return { 
                id: 1, 
                role: 'ORGANIZER', 
                name: 'Org',
                organizerAssignments: [{ organizerEntityId: 1, organizerEntity: { id: 1, name: 'CSE', isActive: true } }]
            };
            if (args.where.id === 2) return { id: 2, role: 'STUDENT', name: 'Stu', organizerAssignments: [] };
            if (args.where.id === 3) return { id: 3, role: 'ADMIN', name: 'Adm', organizerAssignments: [] };
            return null;
        });

        prismaMock.organizerAssignment.findMany.mockResolvedValue([
            {
                userId: 1,
                organizerEntityId: 1,
                organizerEntity: { id: 1, name: 'CSE', isActive: true }
            }
        ]);
        prismaMock.organizerAssignment.findUnique.mockResolvedValue({
            userId: 1,
            organizerEntityId: 1,
            organizerEntity: { id: 1, name: 'CSE', isActive: true }
        });
        prismaMock.organizerEntity.findUnique.mockResolvedValue({
            id: 1,
            name: 'CSE',
            isActive: true
        });
    });

    describe('POST /api/events', () => {
        it('should allow organizer to create an event', async () => {
            const newEvent = {
                id: 1,
                title: 'New Hackathon',
                status: 'APPROVED',
                totalSeats: 100,
                availableSeats: 100
            };
            
            prismaMock.event.create.mockResolvedValue(newEvent);

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({
                    title: 'New Hackathon',
                    description: 'A great hackathon',
                    category: 'Tech',
                    department: 'CSE',
                    date: '2026-11-10',
                    venue: 'Hall A',
                    totalSeats: 100,
                    deadline: '2026-11-09'
                });

            if (res.status === 403) console.log('RESPONSE:', res.body);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect((res.body.data || res.body.users || res.body.event || res.body.events || res.body.notifications || res.body.certificates || res.body.stats || res.body.dashboardData).title).toBe('New Hackathon');
        });

        it('should deny event creation to students', async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    title: 'New Hackathon',
                    description: 'A great hackathon',
                    category: 'Tech',
                    department: 'CSE',
                    date: '2026-11-10',
                    venue: 'Hall A',
                    totalSeats: 100,
                    deadline: '2026-11-09'
                });

            expect(res.status).toBe(403);
            expect((res.body.error || res.body.message)).toMatch(/insufficient|forbidden/i);
        });
    });

    describe('PATCH /api/events/:id/status', () => {
        let adminToken;
        beforeEach(() => {
            adminToken = jwt.sign({ id: 3, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        });

        it('should allow admin to moderate (approve) an event', async () => {
            prismaMock.event.update.mockResolvedValue({
                id: 1,
                title: 'New Hackathon',
                status: 'APPROVED'
            });

            const res = await request(app)
                .patch('/api/events/1/status')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'APPROVED' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect((res.body.data || res.body.users || res.body.event || res.body.events || res.body.notifications || res.body.certificates || res.body.stats || res.body.dashboardData).status).toBe('APPROVED');
        });

        it('should deny organizer from moderating their own event status directly', async () => {
            // Note: The route might be protected by authorize('ADMIN')
            const res = await request(app)
                .patch('/api/events/1/status')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send({ status: 'APPROVED' });

            expect(res.status).toBe(403);
        });
    });
});
