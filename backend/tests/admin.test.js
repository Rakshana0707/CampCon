import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Admin Endpoints & RBAC', () => {
    let adminToken;
    let studentToken;

    beforeEach(() => {
        vi.resetAllMocks();
        adminToken = jwt.sign({ id: 1, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        studentToken = jwt.sign({ id: 2, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        
        // Mock user for auth middleware
        prismaMock.user.findUnique.mockImplementation(async (args) => {
            if (args.where.id === 1) return { id: 1, role: 'ADMIN', name: 'Adm' };
            if (args.where.id === 2) return { id: 2, role: 'STUDENT', name: 'Stu' };
            return null;
        });
    });

    describe('GET /api/admin/analytics', () => {
        it('should return analytics for Admin', async () => {
            prismaMock.user.groupBy.mockResolvedValue([
                { role: 'STUDENT', _count: { _all: 50 } },
                { role: 'ORGANIZER', _count: { _all: 5 } }
            ]);
            prismaMock.event.groupBy.mockResolvedValue([
                { status: 'APPROVED', _count: { _all: 20 } },
                { status: 'PENDING', _count: { _all: 2 } }
            ]);
            prismaMock.registration.count.mockResolvedValue(100);
            prismaMock.attendance.count.mockResolvedValue(75);

            prismaMock.$queryRaw.mockResolvedValue([]);
            const res = await request(app)
                .get('/api/admin/analytics')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.analytics.roleCounts).toBeDefined();
            expect(res.body.analytics.totalRegistrations).toBe(100);
        });

        it('should deny access to Student', async () => {
            const res = await request(app)
                .get('/api/admin/analytics')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.status).toBe(403);
            expect((res.body.error || res.body.message)).toMatch(/insufficient|forbidden/i);
        });
        
        it('should deny access if no token provided', async () => {
            const res = await request(app)
                .get('/api/admin/analytics');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/admin/users', () => {
        it('should return list of users for Admin', async () => {
            prismaMock.user.findMany.mockResolvedValue([
                { id: 2, name: 'Student 1', role: 'STUDENT' }
            ]);

            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray((res.body.data || res.body.users || res.body.event || res.body.events || res.body.notifications || res.body.certificates || res.body.stats || res.body.dashboardData))).toBe(true);
        });

        it('should deny access to Student', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.status).toBe(403);
        });
    });
});
