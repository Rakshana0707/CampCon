const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedStandardUsers() {
    console.log("🌱 Seeding standard user accounts...");

    const passwordHashDefault = await bcrypt.hash("password123", 10);
    const passwordHashAdmin = await bcrypt.hash("Admin@123", 10);

    // 1. Admin Account (ensure both Admin@123 and password123 can be used or set Admin@123)
    await prisma.user.upsert({
        where: { email: 'admin@college.edu' },
        update: {
            name: 'CampusConnect Administrator',
            role: 'ADMIN',
            affiliationStatus: 'INTERNAL_VERIFIED',
            isActive: true,
            passwordHash: passwordHashAdmin
        },
        create: {
            name: 'CampusConnect Administrator',
            email: 'admin@college.edu',
            passwordHash: passwordHashAdmin,
            role: 'ADMIN',
            department: 'Administration',
            collegeName: 'Our College',
            affiliationStatus: 'INTERNAL_VERIFIED',
            isActive: true
        }
    });
    console.log("✅ Admin account ready: admin@college.edu");

    // 2. Verified Student Account (Internal Verified)
    await prisma.user.upsert({
        where: { email: 'student@college.edu' },
        update: {
            name: 'Aarav Sharma',
            role: 'STUDENT',
            affiliationStatus: 'INTERNAL_VERIFIED',
            collegeName: 'Our College',
            department: 'B.E. Computer Science and Engineering',
            rollNumber: '23CS101',
            isActive: true,
            passwordHash: passwordHashDefault
        },
        create: {
            name: 'Aarav Sharma',
            email: 'student@college.edu',
            passwordHash: passwordHashDefault,
            role: 'STUDENT',
            department: 'B.E. Computer Science and Engineering',
            rollNumber: '23CS101',
            collegeName: 'Our College',
            affiliationStatus: 'INTERNAL_VERIFIED',
            isActive: true
        }
    });
    console.log("✅ Student account ready: student@college.edu");

    // 3. External Student Account
    await prisma.user.upsert({
        where: { email: 'external.student@otheruniv.edu' },
        update: {
            name: 'Priya Raman',
            role: 'STUDENT',
            affiliationStatus: 'EXTERNAL',
            collegeName: 'National Engineering College',
            department: 'B.Tech. Information Technology',
            rollNumber: '22IT045',
            isActive: true,
            passwordHash: passwordHashDefault
        },
        create: {
            name: 'Priya Raman',
            email: 'external.student@otheruniv.edu',
            passwordHash: passwordHashDefault,
            role: 'STUDENT',
            department: 'B.Tech. Information Technology',
            rollNumber: '22IT045',
            collegeName: 'National Engineering College',
            affiliationStatus: 'EXTERNAL',
            isActive: true
        }
    });
    console.log("✅ External Student account ready: external.student@otheruniv.edu");

    // 4. Approved Organizer Account
    const approvedOrganizer = await prisma.user.upsert({
        where: { email: 'organizer@college.edu' },
        update: {
            name: 'Dr. K. Rajesh',
            role: 'ORGANIZER',
            affiliationStatus: 'INTERNAL_VERIFIED',
            department: 'B.Tech. Chemical Engineering',
            collegeName: 'Our College',
            isActive: true,
            passwordHash: passwordHashDefault
        },
        create: {
            name: 'Dr. K. Rajesh',
            email: 'organizer@college.edu',
            passwordHash: passwordHashDefault,
            role: 'ORGANIZER',
            department: 'B.Tech. Chemical Engineering',
            collegeName: 'Our College',
            affiliationStatus: 'INTERNAL_VERIFIED',
            isActive: true
        }
    });
    console.log("✅ Organizer account ready: organizer@college.edu");

    // Assign organizations to approved organizer
    const chemDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.Tech. Chemical Engineering' } });
    const cseDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.E. Computer Science and Engineering' } });
    const gdscClub = await prisma.organizerEntity.findFirst({ where: { name: 'GDS Club' } });

    const entitiesToAssign = [chemDept, cseDept, gdscClub].filter(Boolean);
    for (const ent of entitiesToAssign) {
        await prisma.organizerAssignment.upsert({
            where: {
                userId_organizerEntityId: {
                    userId: approvedOrganizer.id,
                    organizerEntityId: ent.id
                }
            },
            update: {},
            create: {
                userId: approvedOrganizer.id,
                organizerEntityId: ent.id
            }
        });
    }
    console.log(`✅ Assigned ${entitiesToAssign.length} organizations to organizer@college.edu`);

    // 5. Inactive / Pending Organizer Account (for testing rejection / pending state)
    await prisma.user.upsert({
        where: { email: 'vikram@college.edu' },
        update: {
            name: 'Vikram Sundaram',
            role: 'ORGANIZER',
            affiliationStatus: 'INTERNAL_VERIFIED',
            department: 'B.E. Mechanical Engineering',
            collegeName: 'Our College',
            isActive: false, // Inactive / pending activation
            passwordHash: passwordHashDefault
        },
        create: {
            name: 'Vikram Sundaram',
            email: 'vikram@college.edu',
            passwordHash: passwordHashDefault,
            role: 'ORGANIZER',
            department: 'B.E. Mechanical Engineering',
            collegeName: 'Our College',
            affiliationStatus: 'INTERNAL_VERIFIED',
            isActive: false
        }
    });
    console.log("✅ Inactive Organizer account ready: vikram@college.edu");

    console.log("\n🎉 All standard user accounts seeded successfully!");
}

seedStandardUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
