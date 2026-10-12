import { vi, beforeEach } from 'vitest';
// Test-only environment; never touches production config or database.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'secret';
const prismaMock = require('./prismaMockObject.js');

prismaMock.user = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn(), groupBy: vi.fn(), count: vi.fn() };
prismaMock.event = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn(), groupBy: vi.fn(), count: vi.fn() };
prismaMock.registration = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn(), groupBy: vi.fn() };
prismaMock.attendance = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn(), count: vi.fn() };
prismaMock.certificate = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn() };
prismaMock.notification = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn() };
prismaMock.bookmark = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn() };
prismaMock.organizerEntity = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn(), count: vi.fn() };
prismaMock.organizerAssignment = { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), delete: vi.fn(), count: vi.fn() };
prismaMock.$transaction = vi.fn();
prismaMock.$queryRaw = vi.fn();

export { prismaMock };

beforeEach(() => {
    // Default implementation for auth middleware to always pass if not explicitly mocked
    prismaMock.user.findUnique.mockImplementation(async (args) => {
        if (args?.where?.id) {
            return { id: args.where.id, role: 'ADMIN', name: 'Test User' };
        }
        return null;
    });
    
    // Default for events api test
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.findUnique.mockResolvedValue({ id: 1, title: 'Test Event' });
    prismaMock.organizerAssignment.findMany.mockResolvedValue([
        {
            userId: 1,
            organizerEntityId: 1,
            organizerEntity: { id: 1, name: 'B.E. Computer Science and Engineering', isActive: true }
        }
    ]);
    prismaMock.organizerAssignment.findUnique.mockResolvedValue(null);
    prismaMock.organizerEntity.findMany.mockResolvedValue([]);
    prismaMock.organizerEntity.findUnique.mockResolvedValue(null);
    prismaMock.$queryRaw.mockResolvedValue([]);
});
