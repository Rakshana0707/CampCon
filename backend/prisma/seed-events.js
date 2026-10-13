const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedEvents() {
    console.log('🌱 Starting Idempotent Event & Symposium Activity Seeding...');

    // 1. Locate or create an organizer/admin user
    let organizerUser = await prisma.user.findFirst({
        where: { role: { in: ['ORGANIZER', 'ADMIN'] } }
    });

    if (!organizerUser) {
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
                collegeName: 'Coimbatore Institute of Technology',
                affiliationStatus: 'INTERNAL_VERIFIED',
                isActive: true
            }
        });
        console.log('✅ Created administrator account: admin@college.edu');
    }

    console.log(`Using organizer user: ${organizerUser.name} (${organizerUser.email}, ID: ${organizerUser.id})`);

    // 2. Fetch official CIT Department entities for linking
    const cseDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.E. Computer Science and Engineering' } });
    const eceDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.E. Electronics and Communication Engineering' } });
    const chemDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.Tech. Chemical Engineering' } });
    const mechDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.E. Mechanical Engineering' } });
    const eeeDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.E. Electrical and Electronics Engineering' } });
    const aidsDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.Tech. Artificial Intelligence and Data Science' } });
    const civilDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.E. Civil Engineering' } });
    const itDept = await prisma.organizerEntity.findFirst({ where: { name: 'B.Tech. Information Technology' } });

    // Ensure organizer assignments exist
    if (organizerUser.role === 'ORGANIZER') {
        const entitiesToAssign = [cseDept, eceDept, chemDept, mechDept, eeeDept, aidsDept, civilDept, itDept].filter(Boolean);
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

    // =========================================================================
    // 3. MAJOR DEPARTMENT SYMPOSIUMS & REGULAR EVENTS
    // =========================================================================
    const symposiumDataList = [
        // ---------------------------------------------------------------------
        // 1. CRYPTERA 2K26 (CSE Department)
        // ---------------------------------------------------------------------
        {
            title: 'Cryptera 2K26',
            description: 'Premier national-level technical symposium organized by the Department of Computer Science and Engineering at CIT. A 2-day technological summit featuring competitive algorithmic coding duels, 8-hour product hackathons, binary reverse engineering, PC hardware building, and cybersecurity capture-the-flag championships.',
            category: 'Technical',
            department: cseDept ? cseDept.name : 'B.E. Computer Science and Engineering',
            organizerEntityId: cseDept ? cseDept.id : null,
            venue: 'CSE Seminar Complex, Computing Labs 3 & 4',
            totalSeats: 300,
            date: new Date('2026-11-20T09:30:00.000Z'),
            endDate: new Date('2026-11-21T18:00:00.000Z'),
            deadline: new Date('2026-11-18T18:00:00.000Z'),
            internalRegOpensAt: new Date('2026-10-10T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-15T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            eventFormat: 'SYMPOSIUM',
            numberOfDays: 2,
            externalParticipationAllowed: true,
            eligibleParticipants: 'Students from all engineering institutions, universities, and computing departments across India',
            isDemo: true,
            contactPerson: 'Prof. S. Anand / Cryptera Student Core',
            contactEmail: 'cryptera2k26@college.edu',
            activities: [
                {
                    name: 'ByteCraft: Algorithmic Duel',
                    description: 'Time-pressured competitive coding sprint testing advanced data structures, graph algorithms, and dynamic programming.',
                    category: 'Coding',
                    dayNumber: 1,
                    startTime: new Date('2026-11-20T10:00:00.000Z'),
                    endTime: new Date('2026-11-20T12:30:00.000Z'),
                    venue: 'Computing Lab 4 (Block A)',
                    maxParticipants: 100,
                    availableSeats: 72,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Solo participation. Bring college ID card. HackerRank platform.'
                },
                {
                    name: 'Bug Blitz: Binary & Reverse Engineering',
                    description: 'Decompile binaries, patch zero-day memory leaks, and extract encrypted flags in this fast-paced debugging marathon.',
                    category: 'Cybersecurity',
                    dayNumber: 1,
                    startTime: new Date('2026-11-20T14:00:00.000Z'),
                    endTime: new Date('2026-11-20T16:30:00.000Z'),
                    venue: 'CSE Systems Centre (Room 302)',
                    maxParticipants: 80,
                    availableSeats: 54,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of up to 2. Ghidra and GDB tools provided.'
                },
                {
                    name: 'WebScape: 8-Hour Full-Stack Sprint',
                    description: 'Build an operational AI-integrated web solution addressing a surprise social impact problem statement announced at 9:00 AM.',
                    category: 'Hackathon',
                    dayNumber: 2,
                    startTime: new Date('2026-11-21T09:30:00.000Z'),
                    endTime: new Date('2026-11-21T15:30:00.000Z'),
                    venue: 'Computing Lab 3 & Central Quad',
                    maxParticipants: 120,
                    availableSeats: 88,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of 2 to 4. React, Node, Python, or Go stacks accepted.'
                },
                {
                    name: 'RigCraft: PC Building & Overclocking Showdown',
                    description: 'Speed assembly of custom liquid-cooled PC gaming rigs with benchmark thermal optimization and component diagnostics.',
                    category: 'Hardware',
                    dayNumber: 2,
                    startTime: new Date('2026-11-21T14:00:00.000Z'),
                    endTime: new Date('2026-11-21T16:30:00.000Z'),
                    venue: 'CSE Seminar Hall Ground Foyer',
                    maxParticipants: 50,
                    availableSeats: 35,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Individual competition. Components and test benches provided on-site.'
                }
            ]
        },

        // ---------------------------------------------------------------------
        // 2. NEXERA 2K26 (ECE Department)
        // ---------------------------------------------------------------------
        {
            title: 'Nexera 2K26',
            description: 'Flagship technical symposium organized by the Department of Electronics and Communication Engineering at CIT. Focusing on modern semiconductor VLSI architectures, wireless telecommunications, embedded edge AI agents, and autonomous robotics.',
            category: 'Technical',
            department: eceDept ? eceDept.name : 'B.E. Electronics and Communication Engineering',
            organizerEntityId: eceDept ? eceDept.id : null,
            venue: 'ECE Department Auditorium & VLSI Design Lab',
            totalSeats: 250,
            date: new Date('2026-11-24T09:00:00.000Z'),
            endDate: new Date('2026-11-25T17:30:00.000Z'),
            deadline: new Date('2026-11-21T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-18T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            eventFormat: 'SYMPOSIUM',
            numberOfDays: 2,
            externalParticipationAllowed: true,
            eligibleParticipants: 'ECE, EEE, E&I, VLSI, and Mechatronics undergraduate and postgraduate scholars',
            isDemo: true,
            contactPerson: 'Dr. M. Soundarapandian / Nexera Core',
            contactEmail: 'nexera2k26@college.edu',
            activities: [
                {
                    name: 'Silicon Sprint: CMOS & Circuit Debugging',
                    description: 'Trace analog & digital waveforms on oscilloscopes, rectify clock-domain issues, and optimize transistor routing.',
                    category: 'Hardware',
                    dayNumber: 1,
                    startTime: new Date('2026-11-24T10:00:00.000Z'),
                    endTime: new Date('2026-11-24T12:30:00.000Z'),
                    venue: 'Electronic Devices Lab (Block E)',
                    maxParticipants: 80,
                    availableSeats: 60,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of 2. DSO, multimeters, and breadboard kits supplied.'
                },
                {
                    name: 'EdgeAI Nexus: Embedded Vision on ESP32',
                    description: 'Hands-on project sprint deploying quantized TinyML object recognition models on low-power microcontrollers.',
                    category: 'Workshop',
                    dayNumber: 1,
                    startTime: new Date('2026-11-24T13:30:00.000Z'),
                    endTime: new Date('2026-11-24T16:30:00.000Z'),
                    venue: 'DSP & Embedded Systems Lab',
                    maxParticipants: 70,
                    availableSeats: 48,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Bring personal laptop with Arduino IDE / MicroPython installed.'
                },
                {
                    name: 'RoverStorm: Autonomous Line & Maze Race',
                    description: 'High-octane obstacle navigation trials for micro-controller automated wheeled rovers with ultrasonic sensors.',
                    category: 'Robotics',
                    dayNumber: 2,
                    startTime: new Date('2026-11-25T10:00:00.000Z'),
                    endTime: new Date('2026-11-25T13:00:00.000Z'),
                    venue: 'ECE Quadrangle Robotic Arena',
                    maxParticipants: 60,
                    availableSeats: 45,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Autonomous rovers within 25x25cm dimensions only. Max 3 members.'
                },
                {
                    name: '5G WaveCraft: RF & Antenna Paper Conclave',
                    description: 'Research paper presentations on MIMO beamforming, satellite links, and mmWave communications evaluated by IEEE senior members.',
                    category: 'Research',
                    dayNumber: 2,
                    startTime: new Date('2026-11-25T14:00:00.000Z'),
                    endTime: new Date('2026-11-25T16:30:00.000Z'),
                    venue: 'ECE Conference Hall 2',
                    maxParticipants: 50,
                    availableSeats: 32,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'IEEE double-column paper submission format required.'
                }
            ]
        },

        // ---------------------------------------------------------------------
        // 3. AAVISHKAR 2K26 (Chemical Engineering Department)
        // ---------------------------------------------------------------------
        {
            title: 'Aavishkar 2K26',
            description: 'National technical symposium hosted by the Department of Chemical Engineering at CIT. Featuring process simulation hackathons in DWSIM/Aspen, paper and poster presentations, industrial unit reverse engineering, and sustainable energy workshops.',
            category: 'Technical',
            department: chemDept ? chemDept.name : 'B.Tech. Chemical Engineering',
            organizerEntityId: chemDept ? chemDept.id : null,
            venue: 'Chemical Engineering Auditorium, Pilot Plant & Lab C',
            totalSeats: 200,
            date: new Date('2026-11-15T09:00:00.000Z'),
            endDate: new Date('2026-11-16T17:00:00.000Z'),
            deadline: new Date('2026-11-12T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-20T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            eventFormat: 'SYMPOSIUM',
            numberOfDays: 2,
            externalParticipationAllowed: true,
            eligibleParticipants: 'Chemical Engineering, Biotechnology, Petroleum, Food Tech, and Polymer science scholars',
            isDemo: true,
            contactPerson: 'Dr. K. Raman / Aavishkar Faculty Secretary',
            contactEmail: 'aavishkar2k26@college.edu',
            activities: [
                {
                    name: 'ProcessSim: Refinery Flowsheet Optimization',
                    description: 'Simulate a multi-stage crude distillation column flowsheet in Aspen/DWSIM to achieve maximum thermal recovery and yield.',
                    category: 'Simulation',
                    dayNumber: 1,
                    startTime: new Date('2026-11-15T10:00:00.000Z'),
                    endTime: new Date('2026-11-15T12:30:00.000Z'),
                    venue: 'Chemical Computing CAD Lab',
                    maxParticipants: 60,
                    availableSeats: 44,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of up to 2. Software pre-installed on test workstations.'
                },
                {
                    name: 'Green Genesis: Sustainable Bio-Hydrogen Conclave',
                    description: 'Technical paper presentation track examining carbon capture, bio-catalysis, and circular green fuel syntheses.',
                    category: 'Research',
                    dayNumber: 1,
                    startTime: new Date('2026-11-15T13:30:00.000Z'),
                    endTime: new Date('2026-11-15T16:00:00.000Z'),
                    venue: 'Department Seminar Hall (Block C)',
                    maxParticipants: 50,
                    availableSeats: 30,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Slides limited to 10 minutes presentation + 3 minutes Q&A.'
                },
                {
                    name: 'Chem-E-Car: Reaction Driven Vehicle Derby',
                    description: 'Design a shoe-box size car propelled solely by an exothermic chemical reaction and halted precisely at a target distance.',
                    category: 'Hardware',
                    dayNumber: 2,
                    startTime: new Date('2026-11-16T10:00:00.000Z'),
                    endTime: new Date('2026-11-16T13:00:00.000Z'),
                    venue: 'Pilot Plant Arena Lawn',
                    maxParticipants: 40,
                    availableSeats: 25,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Hazardous chemicals strictly prohibited. Teams of 2 to 4 members.'
                },
                {
                    name: 'Reverse Engineering: Heat Exchanger Unit Teardown',
                    description: 'Hands-on dimensional inspection, fouling assessment, and thermal duty recalculation of an industrial shell & tube exchanger.',
                    category: 'Technical',
                    dayNumber: 2,
                    startTime: new Date('2026-11-16T14:00:00.000Z'),
                    endTime: new Date('2026-11-16T16:30:00.000Z'),
                    venue: 'Unit Operations Lab',
                    maxParticipants: 45,
                    availableSeats: 32,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Safety goggles and lab coats mandatory inside unit area.'
                }
            ]
        },

        // ---------------------------------------------------------------------
        // 4. MECHNOTRON 2K26 (Mechanical Engineering Department)
        // ---------------------------------------------------------------------
        {
            title: 'Mechnotron 2K26',
            description: 'Annual flagship technical symposium celebrating mechanical innovation, CAD modeling marathons, mechanism fabrication, aerodynamic wind-tunnel testing, and smart automotive manufacturing.',
            category: 'Technical',
            department: mechDept ? mechDept.name : 'B.E. Mechanical Engineering',
            organizerEntityId: mechDept ? mechDept.id : null,
            venue: 'Mechanical Block Seminar Complex & Advanced Machine Centre',
            totalSeats: 250,
            date: new Date('2026-12-02T09:00:00.000Z'),
            endDate: new Date('2026-12-03T17:30:00.000Z'),
            deadline: new Date('2026-11-28T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-14T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-22T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            eventFormat: 'SYMPOSIUM',
            numberOfDays: 2,
            externalParticipationAllowed: true,
            eligibleParticipants: 'Mechanical, Production, Automobile, Mechatronics, Aerospace, and Manufacturing students',
            isDemo: true,
            contactPerson: 'Dr. G. Ravichandran / Mechnotron Council',
            contactEmail: 'mechnotron2k26@college.edu',
            activities: [
                {
                    name: 'SpeedCAD: 3D Parametric Modeling Marathon',
                    description: 'Convert complex engineering 2D orthographic blueprints into error-free SolidWorks 3D assemblies against the clock.',
                    category: 'Design',
                    dayNumber: 1,
                    startTime: new Date('2026-12-02T10:00:00.000Z'),
                    endTime: new Date('2026-12-02T12:30:00.000Z'),
                    venue: 'Mechanical CAD Lab 1',
                    maxParticipants: 80,
                    availableSeats: 58,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'SolidWorks 2024 workstations provided. Solo contest.'
                },
                {
                    name: 'Junkyard Wars: Mechanism Fabrication',
                    description: 'Fabricate an operable hydraulic or mechanical lift mechanism using recycled scrap materials and raw metal fasteners.',
                    category: 'Fabrication',
                    dayNumber: 1,
                    startTime: new Date('2026-12-02T13:30:00.000Z'),
                    endTime: new Date('2026-12-02T16:30:00.000Z'),
                    venue: 'Central Machine Shop & Foundry Arena',
                    maxParticipants: 60,
                    availableSeats: 40,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of 3 to 4. Welding safety kit provided.'
                },
                {
                    name: 'AeroGlider: Precision Glide Wind Tunnel Trials',
                    description: 'Design and assemble a high aspect-ratio balsa glider evaluated for minimum drag and longest glide duration.',
                    category: 'Aerodynamics',
                    dayNumber: 2,
                    startTime: new Date('2026-12-03T10:00:00.000Z'),
                    endTime: new Date('2026-12-03T12:30:00.000Z'),
                    venue: 'Fluid Mechanics Wind Tunnel Facility',
                    maxParticipants: 50,
                    availableSeats: 36,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Maximum wingspan 50cm. Hand-launch protocol.'
                },
                {
                    name: 'DesignX: Additive 3D Printing & Generative Design',
                    description: 'Hands-on industrial masterclass utilizing topology optimization in Autodesk Fusion to print lightweight drone frames.',
                    category: 'Workshop',
                    dayNumber: 2,
                    startTime: new Date('2026-12-03T13:30:00.000Z'),
                    endTime: new Date('2026-12-03T16:30:00.000Z'),
                    venue: 'Additive Manufacturing Innovation Hub',
                    maxParticipants: 45,
                    availableSeats: 30,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Open to all interested scholars. Free 3D filament kit provided.'
                }
            ]
        },

        // ---------------------------------------------------------------------
        // 5. ELECT-ERA '26 (EEE Department)
        // ---------------------------------------------------------------------
        {
            title: "ELECT-ERA '26",
            description: "Flagship national-level technical symposium organized by the Department of Electrical and Electronics Engineering at CIT. Spotlighting high-speed Robo Tracer autonomous races, PCB hardware debugging, smart microgrid architectures, and quiz championships.",
            category: 'Technical',
            department: eeeDept ? eeeDept.name : 'B.E. Electrical and Electronics Engineering',
            organizerEntityId: eeeDept ? eeeDept.id : null,
            venue: 'EEE Conference Hall & High-Voltage Robotics Arena',
            totalSeats: 250,
            date: new Date('2026-12-05T09:00:00.000Z'),
            endDate: new Date('2026-12-06T17:30:00.000Z'),
            deadline: new Date('2026-12-01T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-25T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            eventFormat: 'SYMPOSIUM',
            numberOfDays: 2,
            externalParticipationAllowed: true,
            eligibleParticipants: 'EEE, ECE, E&I, Mechatronics, and Renewable Energy students across all colleges',
            isDemo: true,
            contactPerson: 'Dr. V. Narayanan / ELECT-ERA Committee',
            contactEmail: 'electera26@college.edu',
            activities: [
                {
                    name: 'Robo Tracer: High-Speed Line Follower',
                    description: 'Precision autonomous wheeled bot racing over black-line curved tracks with intersections, loops, and elevation bridges.',
                    category: 'Robotics',
                    dayNumber: 1,
                    startTime: new Date('2026-12-05T10:00:00.000Z'),
                    endTime: new Date('2026-12-05T13:00:00.000Z'),
                    venue: 'Robotics Arena (Block D Ground)',
                    maxParticipants: 80,
                    availableSeats: 55,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of up to 3. Maximum bot dimensions 20x20 cm.'
                },
                {
                    name: 'Circuit Doctor: PCB Diagnostics & Signal Tracing',
                    description: 'Troubleshoot simulated fault points on an industrial power inverter PCB with multimeters, logic probes, and thermal cams.',
                    category: 'Hardware',
                    dayNumber: 1,
                    startTime: new Date('2026-12-05T14:00:00.000Z'),
                    endTime: new Date('2026-12-05T16:30:00.000Z'),
                    venue: 'Power Electronics Laboratory',
                    maxParticipants: 60,
                    availableSeats: 42,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Pairs competition. 45-minute timed rounds.'
                },
                {
                    name: 'SmartGrid 2030: Renewable Power Architecture',
                    description: 'Pitch innovative designs for decentralized micro-grids integrating solar PV, battery energy storage, and EV charging.',
                    category: 'Paper Presentation',
                    dayNumber: 2,
                    startTime: new Date('2026-12-06T10:00:00.000Z'),
                    endTime: new Date('2026-12-06T12:30:00.000Z'),
                    venue: 'EEE Seminar Complex Audi 1',
                    maxParticipants: 50,
                    availableSeats: 35,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Powerpoint presentation with IEEE citations.'
                },
                {
                    name: 'VoltZap: Technical & General Electrical Quiz',
                    description: 'High-voltage buzzer quiz covering electrical history, landmark power inventions, component trivia, and circuit physics.',
                    category: 'Quizzing',
                    dayNumber: 2,
                    startTime: new Date('2026-12-06T14:00:00.000Z'),
                    endTime: new Date('2026-12-06T16:30:00.000Z'),
                    venue: 'Main Auditorium Hall B',
                    maxParticipants: 90,
                    availableSeats: 70,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of 2 members. Written preliminary round followed by live buzzer stage.'
                }
            ]
        },

        // ---------------------------------------------------------------------
        // 6. INTELLINA 2K26 (AI & Data Science Department)
        // ---------------------------------------------------------------------
        {
            title: 'Intellina 2K26',
            description: 'Premier artificial intelligence and data science symposium hosted by the Department of AI & Data Science at CIT. Centered around autonomous LLM agents, computer vision, Kaggle-style machine learning challenges, and generative AI project showcases.',
            category: 'Technical',
            department: aidsDept ? aidsDept.name : 'B.Tech. Artificial Intelligence and Data Science',
            organizerEntityId: aidsDept ? aidsDept.id : null,
            venue: 'AI Innovation Centre & High-Performance Compute Cluster Lab',
            totalSeats: 250,
            date: new Date('2026-11-27T09:30:00.000Z'),
            endDate: new Date('2026-11-28T17:30:00.000Z'),
            deadline: new Date('2026-11-24T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-18T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            eventFormat: 'SYMPOSIUM',
            numberOfDays: 2,
            externalParticipationAllowed: true,
            eligibleParticipants: 'Students passionate about Artificial Intelligence, Machine Learning, Data Science, and Computer Vision',
            isDemo: true,
            contactPerson: 'Dr. R. Jayanthi / Intellina Convenors',
            contactEmail: 'intellina2k26@college.edu',
            activities: [
                {
                    name: 'NeuralHack: Autonomous AI Agent Sprint',
                    description: 'Build and deploy a functional multi-agent workflow leveraging local open-weight LLMs (Llama 3 / Mistral) for enterprise tasks.',
                    category: 'Hackathon',
                    dayNumber: 1,
                    startTime: new Date('2026-11-27T10:00:00.000Z'),
                    endTime: new Date('2026-11-27T16:00:00.000Z'),
                    venue: 'GPU Cluster Lab (Block B)',
                    maxParticipants: 100,
                    availableSeats: 70,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of 2-4. Cloud compute GPU credits provided.'
                },
                {
                    name: 'DataQuest: Healthcare Predictive Sprint',
                    description: 'Kaggle-style machine learning competition to predict clinical ICU patient outcomes using structured biometric tabular data.',
                    category: 'Data Science',
                    dayNumber: 1,
                    startTime: new Date('2026-11-27T13:30:00.000Z'),
                    endTime: new Date('2026-11-27T16:30:00.000Z'),
                    venue: 'AI Computing Lab 2',
                    maxParticipants: 80,
                    availableSeats: 56,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Solo or pairs. Evaluated on test set ROC-AUC score.'
                },
                {
                    name: 'VisionCraft: Real-Time Drone Object Detection',
                    description: 'Deploy lightweight YOLO models on live video streams to identify aerial obstacles and track objects with sub-30ms latency.',
                    category: 'Computer Vision',
                    dayNumber: 2,
                    startTime: new Date('2026-11-28T10:00:00.000Z'),
                    endTime: new Date('2026-11-28T12:30:00.000Z'),
                    venue: 'Intelligent Vision Systems Lab',
                    maxParticipants: 60,
                    availableSeats: 45,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Bring personal laptop with PyTorch / OpenCV.'
                },
                {
                    name: 'AI Ethics & Alignment Paper Conclave',
                    description: 'Scholarly presentations and panel defense exploring model hallucinations, algorithmic fairness, and intellectual property.',
                    category: 'Research',
                    dayNumber: 2,
                    startTime: new Date('2026-11-28T14:00:00.000Z'),
                    endTime: new Date('2026-11-28T16:30:00.000Z'),
                    venue: 'Department Seminar Hall 1',
                    maxParticipants: 50,
                    availableSeats: 35,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Peer-reviewed submission. 12-minute oral presentation.'
                }
            ]
        },

        // ---------------------------------------------------------------------
        // 7. INFRASTO 2K26 (Civil Engineering Department)
        // ---------------------------------------------------------------------
        {
            title: 'Infrasto 2K26',
            description: 'Landmark technical symposium presented by the Department of Civil Engineering at CIT. Dedicated to structural design innovations, BIM and smart cities, geotechnical exploration, total station precision surveying, and sustainable construction materials.',
            category: 'Technical',
            department: civilDept ? civilDept.name : 'B.E. Civil Engineering',
            organizerEntityId: civilDept ? civilDept.id : null,
            venue: 'Civil Engineering Auditorium, Structural Lab & Survey Quad',
            totalSeats: 200,
            date: new Date('2026-12-08T09:00:00.000Z'),
            endDate: new Date('2026-12-09T17:00:00.000Z'),
            deadline: new Date('2026-12-04T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-14T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-24T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            eventFormat: 'SYMPOSIUM',
            numberOfDays: 2,
            externalParticipationAllowed: true,
            eligibleParticipants: 'Civil, Environmental, Structural, Architecture, and Construction Engineering students',
            isDemo: true,
            contactPerson: 'Dr. P. Dhanasekar / Infrasto Team',
            contactEmail: 'infrasto2k26@college.edu',
            activities: [
                {
                    name: 'Bridge-O-Mania: Balsa Wood Truss Load Testing',
                    description: 'Construct a miniature balsa truss bridge tested on a hydraulic universal load rig to determine the highest strength-to-weight ratio.',
                    category: 'Structures',
                    dayNumber: 1,
                    startTime: new Date('2026-12-08T10:00:00.000Z'),
                    endTime: new Date('2026-12-08T13:00:00.000Z'),
                    venue: 'Structural Testing Laboratory',
                    maxParticipants: 60,
                    availableSeats: 42,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of up to 3. Standard balsa strips and adhesives distributed.'
                },
                {
                    name: 'BIM Studio: 3D Revit Architectural Blueprinting',
                    description: 'Model a sustainable net-zero transit terminal in Autodesk Revit with parametric MEP and structural coordination.',
                    category: 'Design & BIM',
                    dayNumber: 1,
                    startTime: new Date('2026-12-08T14:00:00.000Z'),
                    endTime: new Date('2026-12-08T16:30:00.000Z'),
                    venue: 'Civil CAD & GIS Centre',
                    maxParticipants: 50,
                    availableSeats: 36,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Autodesk Revit 2024 workstations provided on-site.'
                },
                {
                    name: 'EcoConcrete: Geopolymer Mix Design Derby',
                    description: 'Formulate zero-clinker alkali-activated geopolymer mortar cubes and measure 24-hour compressive strength resistance.',
                    category: 'Materials',
                    dayNumber: 2,
                    startTime: new Date('2026-12-09T10:00:00.000Z'),
                    endTime: new Date('2026-12-09T12:30:00.000Z'),
                    venue: 'Concrete Technology Laboratory',
                    maxParticipants: 40,
                    availableSeats: 28,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Fly-ash, GGBS, and activator chemicals provided. Safety wear required.'
                },
                {
                    name: 'SurveyMaster: Total Station Topographic Derby',
                    description: 'Robotic total station triangulation, horizontal distance leveling, and contour plotting challenge across the central campus quad.',
                    category: 'Surveying',
                    dayNumber: 2,
                    startTime: new Date('2026-12-09T13:30:00.000Z'),
                    endTime: new Date('2026-12-09T16:30:00.000Z'),
                    venue: 'Main Campus Academic Quadrangle',
                    maxParticipants: 50,
                    availableSeats: 35,
                    fee: 0,
                    requiresSeparateRegistration: true,
                    requiresOverallRegistration: true,
                    eligibilityRules: 'Teams of 3. Leica / Topcon Total Station apparatus provided.'
                }
            ]
        },

        // ---------------------------------------------------------------------
        // 8. REGULAR EVENT: Generative AI Workshop (Single Day Workshop)
        // ---------------------------------------------------------------------
        {
            title: 'Generative AI & LLM Systems Hands-on Bootcamp',
            description: 'An intensive single-day technical masterclass exploring prompt engineering, retrieval-augmented generation (RAG) with vector databases, and fine-tuning open-source models for student developers.',
            category: 'Workshop',
            department: itDept ? itDept.name : 'B.Tech. Information Technology',
            organizerEntityId: itDept ? itDept.id : null,
            venue: 'IT Department Seminar Hall & Lab 1',
            totalSeats: 120,
            date: new Date('2026-11-10T09:30:00.000Z'),
            endDate: new Date('2026-11-10T16:30:00.000Z'),
            deadline: new Date('2026-11-08T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: new Date('2026-10-20T00:00:00.000Z'),
            eventType: 'INTER_COLLEGE',
            eventFormat: 'REGULAR',
            numberOfDays: 1,
            externalParticipationAllowed: true,
            eligibleParticipants: 'All college students interested in Artificial Intelligence and Full-Stack Engineering',
            isDemo: true,
            contactPerson: 'Prof. M. Karthik',
            contactEmail: 'genai.bootcamp@college.edu',
            activities: []
        },

        // ---------------------------------------------------------------------
        // 9. REGULAR EVENT: Campus Acoustic Unplugged Night (Single Cultural Evening)
        // ---------------------------------------------------------------------
        {
            title: 'Campus Acoustic Unplugged & Indie Music Night',
            description: 'An enchanting evening of live acoustic melodies, vocal harmonies, violin solos, and indie fusion performed by student musicians across all departments at the open air theatre.',
            category: 'Cultural',
            department: 'Music Club',
            organizerEntityId: null,
            venue: 'Open Air Amphitheatre',
            totalSeats: 350,
            date: new Date('2026-11-14T17:00:00.000Z'),
            endDate: new Date('2026-11-14T21:00:00.000Z'),
            deadline: new Date('2026-11-12T23:59:59.000Z'),
            internalRegOpensAt: new Date('2026-10-12T00:00:00.000Z'),
            externalRegOpensAt: null,
            eventType: 'INTRA_COLLEGE',
            eventFormat: 'REGULAR',
            numberOfDays: 1,
            externalParticipationAllowed: false,
            eligibleParticipants: 'Coimbatore Institute of Technology Students Only',
            isDemo: true,
            contactPerson: 'Music Club Secretary',
            contactEmail: 'music@college.edu',
            activities: []
        }
    ];

    let createdCount = 0;
    let updatedCount = 0;
    let activityCount = 0;

    for (const item of symposiumDataList) {
        const { activities, ...eventData } = item;
        const expiresAt = new Date(eventData.endDate.getTime() + 24 * 60 * 60 * 1000);

        let eventRecord = await prisma.event.findFirst({
            where: { title: eventData.title }
        });

        if (eventRecord) {
            eventRecord = await prisma.event.update({
                where: { id: eventRecord.id },
                data: {
                    description: eventData.description,
                    category: eventData.category,
                    department: eventData.department,
                    organizerEntityId: eventData.organizerEntityId,
                    venue: eventData.venue,
                    totalSeats: eventData.totalSeats,
                    availableSeats: eventData.totalSeats,
                    date: eventData.date,
                    endDate: eventData.endDate,
                    expiresAt: expiresAt,
                    deadline: eventData.deadline,
                    internalRegOpensAt: eventData.internalRegOpensAt,
                    externalRegOpensAt: eventData.externalRegOpensAt,
                    eventType: eventData.eventType,
                    eventFormat: eventData.eventFormat,
                    numberOfDays: eventData.numberOfDays,
                    externalParticipationAllowed: eventData.externalParticipationAllowed,
                    eligibleParticipants: eventData.eligibleParticipants,
                    isDemo: true,
                    status: 'APPROVED',
                    contactPerson: eventData.contactPerson,
                    contactEmail: eventData.contactEmail
                }
            });
            updatedCount++;
            console.log(`Updated existing event: "${eventData.title}" (${eventData.eventFormat})`);
        } else {
            eventRecord = await prisma.event.create({
                data: {
                    ...eventData,
                    availableSeats: eventData.totalSeats,
                    expiresAt: expiresAt,
                    status: 'APPROVED',
                    organizerId: organizerUser.id
                }
            });
            createdCount++;
            console.log(`Created new event: "${eventData.title}" (${eventData.eventFormat})`);
        }

        // Seed activities if it's a symposium
        if (activities && activities.length > 0) {
            for (const act of activities) {
                const existingAct = await prisma.symposiumActivity.findFirst({
                    where: {
                        eventId: eventRecord.id,
                        name: act.name
                    }
                });

                if (existingAct) {
                    await prisma.symposiumActivity.update({
                        where: { id: existingAct.id },
                        data: {
                            description: act.description,
                            category: act.category,
                            dayNumber: act.dayNumber,
                            startTime: act.startTime,
                            endTime: act.endTime,
                            venue: act.venue,
                            maxParticipants: act.maxParticipants,
                            availableSeats: act.availableSeats,
                            fee: act.fee,
                            requiresSeparateRegistration: act.requiresSeparateRegistration,
                            requiresOverallRegistration: act.requiresOverallRegistration,
                            eligibilityRules: act.eligibilityRules,
                            isActive: true
                        }
                    });
                } else {
                    await prisma.symposiumActivity.create({
                        data: {
                            ...act,
                            eventId: eventRecord.id,
                            isActive: true
                        }
                    });
                    activityCount++;
                }
            }
        }
    }

    console.log(`\n🎉 Seed Complete: ${createdCount} created, ${updatedCount} updated, ${activityCount} sub-activities initialized.`);
}

seedEvents()
    .catch((err) => {
        console.error('❌ Error during event seeding:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
