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

    // 2. Verified Student Accounts (4-5 students per department)
    const departmentalStudents = [
        // B.E. Computer Science and Engineering
        { name: 'Aarav Sharma', email: 'student@college.edu', rollNumber: '23CS101', department: 'B.E. Computer Science and Engineering' },
        { name: 'Rohan Kulkarni', email: 'rohan.cs@college.edu', rollNumber: '23CS104', department: 'B.E. Computer Science and Engineering' },
        { name: 'Sneha Parthasarathy', email: 'sneha.cs@college.edu', rollNumber: '23CS112', department: 'B.E. Computer Science and Engineering' },
        { name: 'Ashwin Balaji', email: 'ashwin.cs@college.edu', rollNumber: '23CS128', department: 'B.E. Computer Science and Engineering' },
        { name: 'Divya Dharshini', email: 'divya.cs@college.edu', rollNumber: '23CS145', department: 'B.E. Computer Science and Engineering' },

        // B.Tech. Information Technology
        { name: 'Varun Kumar', email: 'varun.it@college.edu', rollNumber: '22IT012', department: 'B.Tech. Information Technology' },
        { name: 'Vignesh S', email: 'vignesh.it@college.edu', rollNumber: '22IT052', department: 'B.Tech. Information Technology' },
        { name: 'Ananya Krishnan', email: 'ananya.it@college.edu', rollNumber: '22IT060', department: 'B.Tech. Information Technology' },
        { name: 'Karthi Mohan', email: 'karthi.it@college.edu', rollNumber: '22IT073', department: 'B.Tech. Information Technology' },
        { name: 'Meera N', email: 'meera.it@college.edu', rollNumber: '22IT088', department: 'B.Tech. Information Technology' },

        // B.Tech. Chemical Engineering
        { name: 'Abinav Sundar', email: 'abinav.chem@college.edu', rollNumber: '23CH015', department: 'B.Tech. Chemical Engineering' },
        { name: 'Harini Vasudevan', email: 'harini.chem@college.edu', rollNumber: '23CH022', department: 'B.Tech. Chemical Engineering' },
        { name: 'Pranav Narayanan', email: 'pranav.chem@college.edu', rollNumber: '23CH034', department: 'B.Tech. Chemical Engineering' },
        { name: 'Kavitha Selvam', email: 'kavitha.chem@college.edu', rollNumber: '23CH041', department: 'B.Tech. Chemical Engineering' },
        { name: 'Tharun Kumar', email: 'tharun.chem@college.edu', rollNumber: '23CH055', department: 'B.Tech. Chemical Engineering' },

        // B.E. Electrical and Electronics Engineering
        { name: 'Sanjay Raj', email: 'sanjay.eee@college.edu', rollNumber: '23EE012', department: 'B.E. Electrical and Electronics Engineering' },
        { name: 'Preethi Murali', email: 'preethi.eee@college.edu', rollNumber: '23EE025', department: 'B.E. Electrical and Electronics Engineering' },
        { name: 'Ajay Krishna', email: 'ajay.eee@college.edu', rollNumber: '23EE039', department: 'B.E. Electrical and Electronics Engineering' },
        { name: 'Shruthi Ram', email: 'shruthi.eee@college.edu', rollNumber: '23EE048', department: 'B.E. Electrical and Electronics Engineering' },
        { name: 'Manoj Prabakar', email: 'manoj.eee@college.edu', rollNumber: '23EE061', department: 'B.E. Electrical and Electronics Engineering' },

        // B.E. Mechanical Engineering
        { name: 'Deepak V', email: 'deepak.mech@college.edu', rollNumber: '23ME018', department: 'B.E. Mechanical Engineering' },
        { name: 'Nithya Shree', email: 'nithya.mech@college.edu', rollNumber: '23ME029', department: 'B.E. Mechanical Engineering' },
        { name: 'Surya Prakash', email: 'surya.mech@college.edu', rollNumber: '23ME044', department: 'B.E. Mechanical Engineering' },
        { name: 'Madhavan B', email: 'madhavan.mech@college.edu', rollNumber: '23ME058', department: 'B.E. Mechanical Engineering' },
        { name: 'Keerthana R', email: 'keerthana.mech@college.edu', rollNumber: '23ME071', department: 'B.E. Mechanical Engineering' },

        // B.E. Electronics and Communication Engineering
        { name: 'Gautham Siddharth', email: 'gautham.ece@college.edu', rollNumber: '23EC014', department: 'B.E. Electronics and Communication Engineering' },
        { name: 'Pavithra S', email: 'pavithra.ece@college.edu', rollNumber: '23EC027', department: 'B.E. Electronics and Communication Engineering' },
        { name: 'Naveen Chandran', email: 'naveen.ece@college.edu', rollNumber: '23EC042', department: 'B.E. Electronics and Communication Engineering' },
        { name: 'Rithika Mohan', email: 'rithika.ece@college.edu', rollNumber: '23EC059', department: 'B.E. Electronics and Communication Engineering' },
        { name: 'Arvind Swaminathan', email: 'arvind.ece@college.edu', rollNumber: '23EC077', department: 'B.E. Electronics and Communication Engineering' },

        // B.Tech. Artificial Intelligence and Data Science
        { name: 'Harish Kalyan', email: 'harish.aids@college.edu', rollNumber: '23AD008', department: 'B.Tech. Artificial Intelligence and Data Science' },
        { name: 'Pooja Sundar', email: 'pooja.aids@college.edu', rollNumber: '23AD019', department: 'B.Tech. Artificial Intelligence and Data Science' },
        { name: 'Tarun Adithya', email: 'tarun.aids@college.edu', rollNumber: '23AD031', department: 'B.Tech. Artificial Intelligence and Data Science' },
        { name: 'Lavanya K', email: 'lavanya.aids@college.edu', rollNumber: '23AD044', department: 'B.Tech. Artificial Intelligence and Data Science' },
        { name: 'Rohit Menon', email: 'rohit.aids@college.edu', rollNumber: '23AD057', department: 'B.Tech. Artificial Intelligence and Data Science' },

        // B.E. Civil Engineering
        { name: 'Vigneshwaran K', email: 'vignesh.civil@college.edu', rollNumber: '23CE011', department: 'B.E. Civil Engineering' },
        { name: 'Anitha Ramesh', email: 'anitha.civil@college.edu', rollNumber: '23CE024', department: 'B.E. Civil Engineering' },
        { name: 'Balaji S', email: 'balaji.civil@college.edu', rollNumber: '23CE033', department: 'B.E. Civil Engineering' },
        { name: 'Soundarya M', email: 'soundarya.civil@college.edu', rollNumber: '23CE045', department: 'B.E. Civil Engineering' },
        { name: 'Dinesh Kumar', email: 'dinesh.civil@college.edu', rollNumber: '23CE056', department: 'B.E. Civil Engineering' }
    ];

    for (const stud of departmentalStudents) {
        await prisma.user.upsert({
            where: { email: stud.email },
            update: {
                name: stud.name,
                role: 'STUDENT',
                affiliationStatus: 'INTERNAL_VERIFIED',
                collegeName: 'Coimbatore Institute of Technology',
                department: stud.department,
                rollNumber: stud.rollNumber,
                isActive: true,
                passwordHash: passwordHashDefault
            },
            create: {
                name: stud.name,
                email: stud.email,
                passwordHash: passwordHashDefault,
                role: 'STUDENT',
                department: stud.department,
                rollNumber: stud.rollNumber,
                collegeName: 'Coimbatore Institute of Technology',
                affiliationStatus: 'INTERNAL_VERIFIED',
                isActive: true
            }
        });
    }
    console.log(`✅ Seeded ${departmentalStudents.length} verified internal CIT students across 8 departments!`);

    // 3. External Student Accounts (For testing non-CIT restrictions)
    const externalStudents = [
        {
            email: 'external.student@otheruniv.edu',
            name: 'Priya Raman',
            collegeName: 'National Engineering College',
            department: 'B.Tech. Information Technology',
            rollNumber: '22IT045'
        },
        {
            email: 'rahul.external@psgtech.ac.in',
            name: 'Rahul Verma',
            collegeName: 'PSG College of Technology',
            department: 'B.E. Computer Science and Engineering',
            rollNumber: '22CS099'
        }
    ];

    for (const ext of externalStudents) {
        await prisma.user.upsert({
            where: { email: ext.email },
            update: {
                name: ext.name,
                role: 'STUDENT',
                affiliationStatus: 'EXTERNAL',
                collegeName: ext.collegeName,
                department: ext.department,
                rollNumber: ext.rollNumber,
                isActive: true,
                passwordHash: passwordHashDefault
            },
            create: {
                name: ext.name,
                email: ext.email,
                passwordHash: passwordHashDefault,
                role: 'STUDENT',
                department: ext.department,
                rollNumber: ext.rollNumber,
                collegeName: ext.collegeName,
                affiliationStatus: 'EXTERNAL',
                isActive: true
            }
        });
    }
    console.log(`✅ Seeded ${externalStudents.length} external student accounts.`);

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
