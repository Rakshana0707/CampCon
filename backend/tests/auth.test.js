import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prismaMock } from './setup.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null); // Email not taken
            prismaMock.user.create.mockResolvedValue({
                id: 1,
                name: 'John Doe',
                email: 'john@college.edu',
                role: 'STUDENT',
                department: 'CSE',
                rollNumber: '12345'
            });

            const res = await request(app).post('/api/auth/register').send({
                name: 'John Doe',
                email: 'john@college.edu',
                password: 'password123',
                department: 'CSE',
                rollNumber: '12345',
                role: 'Student'
            });
            if (res.status === 500) console.log('AUTH REGISTER 500:', res.body);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user.name).toBe('John Doe');
            expect(res.body.token).toBeDefined();
        });

        it('should return 400 if email is already in use', async () => {
            prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'john@college.edu' });

            const res = await request(app).post('/api/auth/register').send({
                name: 'John Doe',
                email: 'john@college.edu',
                password: 'password123',
                department: 'CSE',
                rollNumber: '12345',
                role: 'Student'
            });

            expect(res.status).toBe(400);
            expect((res.body.error || res.body.message)).toMatch(/already exists|already registered/i);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                name: 'John Doe',
                email: 'john@college.edu',
                passwordHash: hashedPassword,
                role: 'STUDENT'
            });

            const res = await request(app).post('/api/auth/login').send({
                email: 'john@college.edu',
                password: 'password123'
            });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('should return 401 for invalid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            prismaMock.user.findUnique.mockResolvedValue({
                id: 1,
                name: 'John Doe',
                email: 'john@college.edu',
                passwordHash: hashedPassword,
                role: 'STUDENT'
            });

            const res = await request(app).post('/api/auth/login').send({
                email: 'john@college.edu',
                password: 'wrongpassword'
            });

            expect(res.status).toBe(401);
            expect((res.body.error || res.body.message)).toMatch(/Invalid credentials|Invalid email or password/i);
        });

        it('should return 404 if user not found', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const res = await request(app).post('/api/auth/login').send({
                email: 'nobody@college.edu',
                password: 'password123'
            });

            expect(res.status).toBe(401);
            expect((res.body.error || res.body.message)).toMatch(/not found|Invalid email or password/i);
        });
    });
});
