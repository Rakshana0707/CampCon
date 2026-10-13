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

    // 4. Approved Department & Club Organizers with Domain Isolation
    const organizerProfiles = [
        {
            email: 'organizer@college.edu',
            name: 'Dr. K. Rajesh',
            department: 'B.Tech. Chemical Engineering',
            entityName: 'B.Tech. Chemical Engineering'
        },
        {
            email: 'cse.organizer@college.edu',
            name: 'Prof. S. Anand',
            department: 'B.E. Computer Science and Engineering',
            entityName: 'B.E. Computer Science and Engineering'
        },
        {
            email: 'eee.organizer@college.edu',
            name: 'Dr. V. Narayanan',
            department: 'B.E. Electrical and Electronics Engineering',
            entityName: 'B.E. Electrical and Electronics Engineering'
        },
        {
            email: 'music.organizer@college.edu',
            name: 'Karthik R',
            department: 'Music Club',
            entityName: 'Music Club'
        },
        {
            email: 'cyber.organizer@college.edu',
            name: 'Aditya Mohan',
            department: 'Cyber Club',
            entityName: 'Cyber Club'
        },
        {
            email: 'dramatix.organizer@college.edu',
            name: 'Sanjana V',
            department: 'Dramatix',
            entityName: 'Dramatix'
        }
    ];

    for (const org of organizerProfiles) {
        const user = await prisma.user.upsert({
            where: { email: org.email },
            update: {
                name: org.name,
                role: 'ORGANIZER',
                affiliationStatus: 'INTERNAL_VERIFIED',
                department: org.department,
                collegeName: 'Our College',
                isActive: true,
                passwordHash: passwordHashDefault
            },
            create: {
                name: org.name,
                email: org.email,
                passwordHash: passwordHashDefault,
                role: 'ORGANIZER',
                department: org.department,
                collegeName: 'Our College',
                affiliationStatus: 'INTERNAL_VERIFIED',
                isActive: true
            }
        });

        // Ensure organizer entity exists or find it
        let ent = await prisma.organizerEntity.findFirst({ where: { name: org.entityName } });
        if (!ent) {
            const isClub = org.entityName.includes('Club') || org.entityName === 'Dramatix';
            ent = await prisma.organizerEntity.create({
                data: {
                    name: org.entityName,
                    type: isClub ? 'CLUB' : 'DEPARTMENT',
                    category: isClub ? 'Cultural & Arts' : 'Undergraduate Programmes',
                    isActive: true
                }
            });
        }

        // Clean out any conflicting assignments and set exact domain assignment
        await prisma.organizerAssignment.deleteMany({ where: { userId: user.id } });
        await prisma.organizerAssignment.create({
            data: {
                userId: user.id,
                organizerEntityId: ent.id
            }
        });
        console.log(`✅ Dedicated Organizer ready: ${org.email} (${org.name} - ${org.entityName})`);
    }

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
