import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Notifications & Certificates Endpoints', () => {
    let studentToken;

    beforeEach(() => {
        vi.resetAllMocks();
        studentToken = jwt.sign({ id: 2, role: 'STUDENT' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        
        // Mock user for auth middleware
        prismaMock.user.findUnique.mockImplementation(async (args) => {
            if (args.where.id === 2) return { id: 2, role: 'STUDENT', name: 'Stu' };
            return null;
        });
    });

    describe('GET /api/notifications', () => {
        it('should return notifications only for the logged in user or global', async () => {
            prismaMock.notification.findMany.mockResolvedValue([
                { id: 1, message: 'Global notification', userId: null },
                { id: 2, message: 'Your registration is approved', userId: 2 }
            ]);

            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect((res.body.data || res.body.users || res.body.event || res.body.events || res.body.notifications || res.body.certificates || res.body.stats || res.body.dashboardData).length).toBe(2);
            // Verify prisma query included OR conditions for userId = null or userId = 2
            expect(prismaMock.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { OR: [{ userId: 2 }, { userId: null }] }
            }));
        });
        
        it('should return 401 if unauthorized', async () => {
            const res = await request(app).get('/api/notifications');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/certificates/me', () => {
        it('should return certificates for the student', async () => {
            prismaMock.certificate.findMany.mockResolvedValue([
                { id: 1, certificateId: 'CERT-123', userId: 2, eventId: 1 }
            ]);

            const res = await request(app)
                .get('/api/certificates/me')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.certificates.length).toBe(1);
        });

        it('should return 401 if unauthorized', async () => {
            const res = await request(app).get('/api/certificates/me');
            expect(res.status).toBe(401);
        });
    });
});
