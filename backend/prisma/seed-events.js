const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedEvents() {
    console.log('🌱 Starting Idempotent Event Seeding...');

    // 1. Locate or create an organizer/admin user
    let organizerUser = await prisma.user.findFirst({
        where: { role: { in: ['ORGANIZER', 'ADMIN'] } }
    });

    if (!organizerUser) {
        // Find any user first
        organizerUser = await prisma.user.findFirst();
    }

    if (!organizerUser) {
        console.log('Creating initial verified administrator account for events...');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        organizerUser = await prisma.user.create({
            data: {
                name: 'CampusConnect Administrator',
                email: 'admin@college.edu',
                passwordHash: hashedPassword,
                role: 'ADMIN',
                department: 'Administration',
                collegeName: 'Our College',
                affiliationStatus: 'INTERNAL_VERIFIED',
                isActive: true
            }
        });
        console.log('✅ Created administrator account: admin@college.edu');
    }

    console.log(`Using organizer user: ${organizerUser.name} (${organizerUser.email}, ID: ${organizerUser.id})`);

    // 2. Fetch official entities for linking
    const chemDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.Tech. Chemical Engineering' } });
    const cseDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.E. Computer Science and Engineering' } });
    const eeeDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.E. Electrical and Electronics Engineering' } });
    const itDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.Tech. Information Technology' } });

    // Also ensure organizer assignment exists if organizer is not admin
    if (organizerUser.role === 'ORGANIZER') {
        const entitiesToAssign = [chemDept, cseDept, eeeDept, itDept].filter(Boolean);
        for (const ent of entitiesToAssign) {
            await prisma.organizerAssignment.upsert({
                where: {
                    userId_organizerEntityId: {
                        userId: organizerUser.id,
                        organizerEntityId: ent.id
                    }
                },
                update: {},
                create: {
                    userId: organizerUser.id,
                    organizerEntityId: ent.id
                }
            });
        }
    }

    const demoEvents = [
        {
            title: 'CHEMOVISTA 2K26',
            description: 'National-level technical hackathon and symposium organized by the Department of Chemical Engineering. Features process simulation competitions, sustainable design hackathons, technical paper presentations, and industrial problem-solving challenges.',
            category: 'Technical',
            department: chemDept ? chemDept.name : 'B.Tech. Chemical Engineering',
            organizerEntityId: chemDept ? chemDept.id : null,
            venue: 'Chemical Engineering Auditorium & Computer Lab, Block C',
            totalSeats: 150,
            date: new Date('2026-11-15T09:00:00.000Z'),
            endDate: new Date('2026-11-16T17:00:00.000Z'),
            deadline: new Date('2026-11-10T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-20T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            externalParticipationAllowed: true,
            eligibleParticipants: 'Engineering and Science students across India (Inter-College & Intra-College)',
            isDemo: true,
            contactPerson: 'Dr. K. Raman / Student Coordinators',
            contactEmail: 'chemovista2k26@college.edu'
        },
        {
            title: 'Cryptera 2K26',
            description: 'Premier technical symposium organized by the Department of Computer Science and Engineering. Features competitive coding marathons, web/app hackathons, cybersecurity CTF challenges, AI project showcases, and exciting non-technical trivia events.',
            category: 'Technical',
            department: cseDept ? cseDept.name : 'B.E. Computer Science and Engineering',
            organizerEntityId: cseDept ? cseDept.id : null,
            venue: 'CSE Seminar Hall & Computing Lab 4',
            totalSeats: 200,
            date: new Date('2026-11-20T09:30:00.000Z'),
            endDate: new Date('2026-11-21T18:00:00.000Z'),
            deadline: new Date('2026-11-18T18:00:00.000Z'),
            internalRegOpensAt: new Date('2026-10-10T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-22T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            externalParticipationAllowed: true,
            eligibleParticipants: 'All college students interested in computing, algorithms, and software development',
            isDemo: true,
            contactPerson: 'Prof. S. Anand / Cryptera Core Team',
            contactEmail: 'cryptera2k26@college.edu'
        },
        {
            title: "ELECT-ERA '26",
            description: 'Flagship technical symposium organized by the Department of Electrical and Electronics Engineering. Showcasing power electronics innovations, IoT embedded systems, smart grid design, circuit debugging, and robotics combat.',
            category: 'Technical',
            department: eeeDept ? eeeDept.name : 'B.E. Electrical and Electronics Engineering',
            organizerEntityId: eeeDept ? eeeDept.id : null,
            venue: 'EEE Conference Hall & Robotics Arena',
            totalSeats: 120,
            date: new Date('2026-12-05T09:00:00.000Z'),
            endDate: new Date('2026-12-05T17:30:00.000Z'),
            deadline: new Date('2026-12-01T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-11-01T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            externalParticipationAllowed: true,
            eligibleParticipants: 'Engineering students from EEE, ECE, E&I, and Mechatronics disciplines',
            isDemo: true,
            contactPerson: 'Dr. V. Narayanan',
            contactEmail: 'electera26@college.edu'
        },
        {
            title: "NEXERA '26",
            description: "Multidepartmental celebration fest featuring campus-wide treasure hunts, general and tech quizzes, esports gaming, and recreational sports championships. [Flagged for Review: Multidepartmental organizing entity pending official assignment]",
            category: 'Cultural',
            department: 'Multidepartmental [Under Review]',
            organizerEntityId: null, // Flagged for review rather than inventing an entity
            venue: 'Campus Open Air Amphitheatre & Sports Arena',
            totalSeats: 250,
            date: new Date('2026-11-28T10:00:00.000Z'),
            endDate: new Date('2026-11-29T18:00:00.000Z'),
            deadline: new Date('2026-11-25T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: null,
            eventType: 'INTRA_COLLEGE',
            externalParticipationAllowed: false,
            eligibleParticipants: 'Our College Students Only across all branches and years',
            isDemo: true,
            contactPerson: 'Student Union Executive Council',
            contactEmail: 'nexera26@college.edu'
        },
        {
            title: 'Astranova 2026',
            description: 'Vibrant technical and cultural fest organized by the Department of Information Technology. Highlights include cloud computing workshops, UI/UX design derbies, cultural music competitions, and tech fashion walks.',
            category: 'Cultural',
            department: itDept ? itDept.name : 'B.Tech. Information Technology',
            organizerEntityId: itDept ? itDept.id : null,
            venue: 'IT Department Seminar Complex & Central Lawn',
            totalSeats: 180,
            date: new Date('2026-12-10T09:00:00.000Z'),
            endDate: new Date('2026-12-11T17:00:00.000Z'),
            deadline: new Date('2026-12-08T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-14T00:00:00.000Z'),
            externalRegOpensAt: null,
            eventType: 'INTRA_COLLEGE',
            externalParticipationAllowed: false,
            eligibleParticipants: 'Verified students of our college',
            isDemo: true,
            contactPerson: 'Prof. M. Karthik / Astranova Convenors',
            contactEmail: 'astranova2026@college.edu'
        },
        {
            title: 'IIChE SCHEMCON 2026',
            description: 'Annual Students Chemical Engineering Congress hosted at CIT under the auspices of the Indian Institute of Chemical Engineers (IIChE). In-depth research paper tracks, safety design conclaves, and industry keynote lectures.',
            category: 'Technical',
            department: chemDept ? chemDept.name : 'B.Tech. Chemical Engineering',
            organizerEntityId: chemDept ? chemDept.id : null,
            venue: 'CIT Main Auditorium & Convention Hall',
            totalSeats: 300,
            date: new Date('2026-12-18T09:00:00.000Z'),
            endDate: new Date('2026-12-19T18:00:00.000Z'),
            deadline: new Date('2026-12-12T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-25T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            externalParticipationAllowed: true,
            eligibleParticipants: 'Chemical Engineering students, research scholars, and faculty from all recognized colleges',
            isDemo: true,
            contactPerson: 'IIChE Student Chapter Secretary',
            contactEmail: 'schemcon2026@college.edu'
        },
        {
            title: 'International Centre for Global Engagement Inauguration',
            description: 'Inauguration of the International Centre for Global Engagement hosted at CIT. A landmark institutional event featuring international academic partnerships, study abroad opportunities, and global research collaborations. [Flagged for Review: Institutional Centre entity not in standard department/club directory]',
            category: 'Workshop',
            department: 'CIT Institutional [Under Review]',
            organizerEntityId: null, // Flagged for review rather than inventing an organization
            venue: 'CIT Convention Centre',
            totalSeats: 500,
            date: new Date('2026-11-05T10:00:00.000Z'),
            endDate: new Date('2026-11-05T14:00:00.000Z'),
            deadline: new Date('2026-11-03T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: null,
            eventType: 'INTRA_COLLEGE',
            externalParticipationAllowed: false,
            eligibleParticipants: 'All college students and faculty members',
            isDemo: true,
            contactPerson: 'Dean - International Relations',
            contactEmail: 'icge@college.edu'
        }
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const eventData of demoEvents) {
        const expiresAt = new Date(eventData.endDate.getTime() + 24 * 60 * 60 * 1000);

        const existing = await prisma.event.findFirst({
            where: { title: eventData.title }
        });

        if (existing) {
            await prisma.event.update({
                where: { id: existing.id },
                data: {
                    description: eventData.description,
                    category: eventData.category,
                    department: eventData.department,
                    organizerEntityId: eventData.organizerEntityId,
                    venue: eventData.venue,
                    totalSeats: eventData.totalSeats,
                    availableSeats: existing.availableSeats || eventData.totalSeats,
                    date: eventData.date,
                    endDate: eventData.endDate,
                    expiresAt: expiresAt,
                    deadline: eventData.deadline,
                    internalRegOpensAt: eventData.internalRegOpensAt,
                    externalRegOpensAt: eventData.externalRegOpensAt,
                    eventType: eventData.eventType,
                    externalParticipationAllowed: eventData.externalParticipationAllowed,
                    eligibleParticipants: eventData.eligibleParticipants,
                    isDemo: true,
                    status: 'APPROVED',
                    contactPerson: eventData.contactPerson,
                    contactEmail: eventData.contactEmail
                }
            });
            updatedCount++;
            console.log(`Updated existing event: "${eventData.title}"`);
        } else {
            await prisma.event.create({
                data: {
                    ...eventData,
                    availableSeats: eventData.totalSeats,
                    expiresAt: expiresAt,
                    status: 'APPROVED',
                    organizerId: organizerUser.id
                }
            });
            createdCount++;
            console.log(`Created new event: "${eventData.title}"`);
        }
    }

    console.log(`\n🎉 Event Seeding Complete: ${createdCount} created, ${updatedCount} updated.`);
}

seedEvents()
    .catch((err) => {
        console.error('❌ Error during event seeding:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
