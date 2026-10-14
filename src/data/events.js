// Comprehensive curated campus catalog mixing Technical and Cultural events across Departments and Clubs,
// along with multi-day symposiums containing 10+ sub-activities spanning Day 1 and Day 2 (both technical & non-technical).

const events = [
    // =========================================================================
    // 1. DEDICATED 2-DAY SYMPOSIUM: CRYPTERA 2K26 (CSE Department)
    // Spans 2 days, contains 10 activities (5 Technical, 5 Non-Technical/Creative)
    // =========================================================================
    {
        id: 1,
        title: "Cryptera 2K26",
        category: "Technical",
        eventFormat: "SYMPOSIUM",
        eventType: "INTER_COLLEGE",
        numberOfDays: 2,
        date: "2026-11-20",
        time: "09:30 AM",
        endDate: "2026-11-21",
        endTime: "06:00 PM",
        deadline: "2026-11-18",
        venue: "CSE Seminar Complex, Labs 3 & 4 and Campus Quad",
        seats: 350,
        totalSeats: 350,
        availableSeats: 350,
        organizer: "Prof. S. Anand / Student Core",
        organizerEmail: "cryptera2k26@college.edu",
        organizingEntityName: "B.E. Computer Science and Engineering",
        department: "B.E. Computer Science and Engineering",
        organizerEntity: {
            id: 10,
            name: "B.E. Computer Science and Engineering",
            type: "DEPARTMENT",
            category: "Undergraduate Programmes",
            description: "Department of CSE driving innovations in software engineering, computing, and cybersecurity."
        },
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "Premier national-level 2-day technical and cultural symposium hosted by the Department of Computer Science and Engineering. Featuring 10 multi-track challenges spanning coding duels, zero-day capture-the-flag, web hackathons, gaming tournaments, movie trivia, and anime cosplay.",
        coordinatorName: "Prof. S. Anand",
        coordinatorContact: "+91 98421 20261",
        prizeDetails: "Cash Prizes worth ₹1,00,000 + Merit Certificates & Paid Internships",
        requiresApproval: false,
        externalParticipationAllowed: true,
        eligibleParticipants: "Students from all recognized Engineering, Arts & Science colleges and Universities",
        rules: [
            "Registration grants access to all Day 1 & Day 2 tracks.",
            "Carry valid college ID card for badge collection.",
            "Laptops recommended for coding and cybersecurity tracks."
        ],
        activities: [
            // DAY 1 - TECHNICAL
            {
                id: 101,
                name: "ByteCraft: Algorithmic Duel",
                description: "High-speed algorithmic contest testing dynamic programming, graph algorithms, and tricky data structures.",
                category: "Technical",
                dayNumber: 1,
                startTime: "2026-11-20T10:00:00.000Z",
                endTime: "2026-11-20T12:30:00.000Z",
                venue: "Computing Lab 4 (Block A)",
                maxParticipants: 100,
                availableSeats: 72,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 102,
                name: "Bug Blitz: Reverse Engineering & CTF",
                description: "Decompile binary executables, exploit buffer leaks, and capture the encrypted flags.",
                category: "Technical",
                dayNumber: 1,
                startTime: "2026-11-20T13:30:00.000Z",
                endTime: "2026-11-20T16:00:00.000Z",
                venue: "CSE Systems Centre (Room 302)",
                maxParticipants: 80,
                availableSeats: 54,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 103,
                name: "WebScape: 6-Hour AI Full-Stack Sprint",
                description: "Design and ship a generative AI-powered web prototype solving an announced problem statement.",
                category: "Technical",
                dayNumber: 1,
                startTime: "2026-11-20T10:30:00.000Z",
                endTime: "2026-11-20T16:30:00.000Z",
                venue: "Computing Lab 3",
                maxParticipants: 80,
                availableSeats: 48,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },

            // DAY 1 - NON-TECHNICAL / GAMING / CREATIVE
            {
                id: 104,
                name: "Valorant & BGMI Esports Showdown",
                description: "5v5 tactical shooter and battle royale knockout matches projected on the big auditorium screen.",
                category: "Gaming & Non-Tech",
                dayNumber: 1,
                startTime: "2026-11-20T11:00:00.000Z",
                endTime: "2026-11-20T15:30:00.000Z",
                venue: "Multimedia Hall B",
                maxParticipants: 120,
                availableSeats: 80,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 105,
                name: "Cinephile: Pop Culture & Movie Trivia",
                description: "Exciting audio-visual buzzer quiz on Hollywood, Kollywood, Anime, and TV series lore.",
                category: "Non-Technical",
                dayNumber: 1,
                startTime: "2026-11-20T14:30:00.000Z",
                endTime: "2026-11-20T16:30:00.000Z",
                venue: "CSE Seminar Audi 2",
                maxParticipants: 90,
                availableSeats: 65,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },

            // DAY 2 - TECHNICAL
            {
                id: 106,
                name: "RigCraft: PC Hardware Speed Build & Overclock",
                description: "Assemble high-performance liquid-cooled PC rigs and tune clock benchmarks against time.",
                category: "Technical",
                dayNumber: 2,
                startTime: "2026-11-21T09:30:00.000Z",
                endTime: "2026-11-21T12:00:00.000Z",
                venue: "CSE Ground Foyer Workshop Area",
                maxParticipants: 60,
                availableSeats: 38,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 107,
                name: "PaperTech: Next-Gen IEEE Research Presentation",
                description: "Present cutting-edge research in Quantum Computing, Distributed Systems, and Edge Intelligence.",
                category: "Technical",
                dayNumber: 2,
                startTime: "2026-11-21T10:00:00.000Z",
                endTime: "2026-11-21T13:00:00.000Z",
                venue: "Conference Room 101",
                maxParticipants: 50,
                availableSeats: 30,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },

            // DAY 2 - NON-TECHNICAL / CULTURAL & FUN
            {
                id: 108,
                name: "Sherlock In The Quad: Campus Mystery Hunt",
                description: "A fast-paced clue-solving treasure hunt across the college campus to crack a fictitious cyber mystery.",
                category: "Non-Technical",
                dayNumber: 2,
                startTime: "2026-11-21T10:30:00.000Z",
                endTime: "2026-11-21T13:30:00.000Z",
                venue: "Central Campus Quadrangle",
                maxParticipants: 100,
                availableSeats: 60,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 109,
                name: "MemeCrypt: Marketing & UI Meme Roast",
                description: "Create viral satirical product posters, tech memes, and pitch hilarious startup ideas to our panel.",
                category: "Non-Technical",
                dayNumber: 2,
                startTime: "2026-11-21T14:00:00.000Z",
                endTime: "2026-11-21T16:00:00.000Z",
                venue: "CSE Seminar Hall 1",
                maxParticipants: 70,
                availableSeats: 52,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 110,
                name: "Cosplay & Beatbox Cypher: Pop-Culture Mashup",
                description: "Show off character cosplays, open-mic rap, and live beatboxing to close out the symposium in style.",
                category: "Cultural & Fun",
                dayNumber: 2,
                startTime: "2026-11-21T15:30:00.000Z",
                endTime: "2026-11-21T17:30:00.000Z",
                venue: "Main Amphitheatre Foyer",
                maxParticipants: 150,
                availableSeats: 120,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            }
        ]
    },

    // =========================================================================
    // 2. CULTURAL CLUB EVENT: Dhwani '26 – Campus Unplugged & Indie Music Night
    // Hosted by Music Club (Club Event, Cultural)
    // =========================================================================
    {
        id: 2,
        title: "Dhwani '26: Campus Acoustic & Indie Fusion Night",
        category: "Cultural",
        eventFormat: "REGULAR",
        eventType: "INTRA_COLLEGE",
        numberOfDays: 1,
        date: "2026-11-14",
        time: "05:30 PM",
        endDate: "2026-11-14",
        endTime: "09:30 PM",
        deadline: "2026-11-13",
        venue: "Open Air Amphitheatre",
        seats: 450,
        totalSeats: 450,
        availableSeats: 450,
        organizer: "Music Club Core Team",
        organizerEmail: "music@college.edu",
        organizingEntityName: "Music Club",
        department: "Music Club",
        organizerEntity: {
            id: 21,
            name: "Music Club",
            type: "CLUB",
            category: "Cultural & Arts",
            description: "Campus melodies, classical, acoustic, and contemporary musical performances."
        },
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "An electrifying musical twilight featuring live unplugged acoustic sets, violin solos, rock covers, and indie fusion performed by student bands across all batches. Food trucks, neon installations, and open-mic segments included.",
        coordinatorName: "Karthik R (Lead Guitarist)",
        coordinatorContact: "+91 97890 43210",
        prizeDetails: "Audience Choice Best Band Trophy & Studio Recording Vouchers",
        requiresApproval: false,
        externalParticipationAllowed: false,
        eligibleParticipants: "Coimbatore Institute of Technology Students Only",
        rules: [
            "Valid college ID card mandatory for gate admission.",
            "Outside food and drinks prohibited inside amphitheatre.",
            "Open-mic slots allocated on first-come basis at venue desk."
        ],
        activities: []
    },

    // =========================================================================
    // 3. DEPARTMENT EVENT: ELECT-ERA '26 (EEE Department)
    // Technical Symposium
    // =========================================================================
    {
        id: 3,
        title: "ELECT-ERA '26",
        category: "Technical",
        eventFormat: "SYMPOSIUM",
        eventType: "INTER_COLLEGE",
        numberOfDays: 2,
        date: "2026-12-05",
        time: "09:00 AM",
        endDate: "2026-12-06",
        endTime: "05:30 PM",
        deadline: "2026-12-01",
        venue: "EEE Conference Hall & Robotics Arena",
        seats: 250,
        totalSeats: 250,
        availableSeats: 250,
        organizer: "Dr. V. Narayanan / EEE Council",
        organizerEmail: "electera26@college.edu",
        organizingEntityName: "B.E. Electrical and Electronics Engineering",
        department: "B.E. Electrical and Electronics Engineering",
        organizerEntity: {
            id: 11,
            name: "B.E. Electrical and Electronics Engineering",
            type: "DEPARTMENT",
            category: "Undergraduate Programmes",
            description: "Department of EEE excelling in power systems, renewable energy, and control engineering."
        },
        image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80",
        trending: false,
        description: "Flagship national-level technical symposium organized by the Department of Electrical and Electronics Engineering at CIT. Spotlighting high-speed Robo Tracer autonomous races, PCB hardware debugging, smart microgrid architectures, and quiz championships.",
        coordinatorName: "Dr. V. Narayanan",
        coordinatorContact: "+91 94431 88921",
        prizeDetails: "Cash Prizes ₹60,000 + Circuit Diagnostic Kits",
        requiresApproval: false,
        externalParticipationAllowed: true,
        eligibleParticipants: "EEE, ECE, E&I, Mechatronics, and Renewable Energy students across all colleges",
        rules: [
            "Robo race track rules strictly enforced by referee panel.",
            "Breadboards, ICs, and multimeters provided for circuit rounds."
        ],
        activities: [
            {
                id: 301,
                name: "Robo Tracer: High-Speed Line Follower",
                description: "Autonomous line tracking bot racing over sharp bends, intersections, and elevation bridges.",
                category: "Robotics",
                dayNumber: 1,
                startTime: "2026-12-05T10:00:00.000Z",
                endTime: "2026-12-05T13:00:00.000Z",
                venue: "Robotics Arena (Block D Ground)",
                maxParticipants: 80,
                availableSeats: 55,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 302,
                name: "Circuit Doctor: PCB Fault Tracing",
                description: "Diagnose short-circuits and failed gates in industrial power inverter circuits with thermal cams.",
                category: "Hardware",
                dayNumber: 1,
                startTime: "2026-12-05T14:00:00.000Z",
                endTime: "2026-12-05T16:30:00.000Z",
                venue: "Power Electronics Lab",
                maxParticipants: 60,
                availableSeats: 42,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 303,
                name: "VoltZap: Tech & General Buzzer Quiz",
                description: "High-voltage battle answering circuit physics, inventor trivia, and electronics history.",
                category: "Quizzing",
                dayNumber: 2,
                startTime: "2026-12-06T10:00:00.000Z",
                endTime: "2026-12-06T12:30:00.000Z",
                venue: "Main Audi Hall B",
                maxParticipants: 90,
                availableSeats: 70,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            }
        ]
    },

    // =========================================================================
    // 4. CULTURAL CLUB EVENT: Natya Tarang '26 – Inter-College Dance & Street Theatre
    // Hosted by Dramatix & Arts Club (Cultural, Inter-College)
    // =========================================================================
    {
        id: 4,
        title: "Natya Tarang '26: Dance & Street Theatre Extravaganza",
        category: "Cultural",
        eventFormat: "REGULAR",
        eventType: "INTER_COLLEGE",
        numberOfDays: 1,
        date: "2026-11-28",
        time: "03:00 PM",
        endDate: "2026-11-28",
        endTime: "08:30 PM",
        deadline: "2026-11-25",
        venue: "CIT Main Auditorium & Open Stage",
        seats: 400,
        totalSeats: 400,
        availableSeats: 400,
        organizer: "Dramatix Society & Arts Club",
        organizerEmail: "dramatix@college.edu",
        organizingEntityName: "Dramatix",
        department: "Dramatix",
        organizerEntity: {
            id: 22,
            name: "Dramatix",
            type: "CLUB",
            category: "Cultural & Arts",
            description: "The premier theater, street play, and theatrical performance group."
        },
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "A grand inter-college cultural showcase celebrating theatrical expression, thematic Western and Classical dance troupes, mime acts, and socio-dramatic street plays from top collegiate teams.",
        coordinatorName: "Sanjana V (Dramatix President)",
        coordinatorContact: "+91 96555 12345",
        prizeDetails: "Rolling Championship Trophy + Cash Prizes ₹40,000",
        requiresApproval: false,
        externalParticipationAllowed: true,
        eligibleParticipants: "Students from all recognized Engineering, Arts & Science institutions",
        rules: [
            "Team size for street play: 8 to 15 members.",
            "Props and background music track to be submitted 1 hour prior to performance.",
            "Vulgarity or offensive political slogans will lead to immediate disqualification."
        ],
        activities: []
    },

    // =========================================================================
    // 5. TECHNICAL CLUB EVENT: CyberShield CTF '26 (Cyber Club)
    // Hosted by Cyber Club (Technical, Club Event)
    // =========================================================================
    {
        id: 5,
        title: "CyberShield CTF '26: National Cybersecurity Challenge",
        category: "Technical",
        eventFormat: "REGULAR",
        eventType: "INTER_COLLEGE",
        numberOfDays: 1,
        date: "2026-12-01",
        time: "09:00 AM",
        endDate: "2026-12-01",
        endTime: "05:00 PM",
        deadline: "2026-11-29",
        venue: "Cybersecurity Centre Lab (Block C)",
        seats: 120,
        totalSeats: 120,
        availableSeats: 120,
        organizer: "Cyber Club Convenors",
        organizerEmail: "cyberclub@college.edu",
        organizingEntityName: "Cyber Club",
        department: "Cyber Club",
        organizerEntity: {
            id: 23,
            name: "Cyber Club",
            type: "CLUB",
            category: "Technical",
            description: "Promoting cybersecurity awareness, ethical hacking, CTF competitions, and online safety."
        },
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "An 8-hour live offensive & defensive capture-the-flag hackathon covering web app vulnerability analysis, memory forensics, steganography, and cryptography challenges designed by industry red-teamers.",
        coordinatorName: "Aditya Mohan",
        coordinatorContact: "+91 98940 76543",
        prizeDetails: "₹35,000 Cash + OffSec Training Vouchers",
        requiresApproval: false,
        externalParticipationAllowed: true,
        eligibleParticipants: "Open to ethical hackers and computing scholars across India",
        rules: [
            "Teams of up to 3 members.",
            "Attacking the platform infrastructure itself will lead to ban.",
            "Flag submission log monitored by automated anti-cheat engine."
        ],
        activities: []
    },

    // =========================================================================
    // 6. DEPARTMENT SYMPOSIUM: Aavishkar 2K26 (Chemical Engineering Department)
    // =========================================================================
    {
        id: 6,
        title: "Aavishkar 2K26",
        category: "Technical",
        eventFormat: "SYMPOSIUM",
        eventType: "INTER_COLLEGE",
        numberOfDays: 2,
        date: "2026-11-15",
        time: "09:00 AM",
        endDate: "2026-11-16",
        endTime: "05:00 PM",
        deadline: "2026-11-12",
        venue: "Chemical Engineering Auditorium, Pilot Plant & Lab C",
        seats: 200,
        totalSeats: 200,
        availableSeats: 200,
        organizer: "Dr. K. Raman / Aavishkar Council",
        organizerEmail: "aavishkar2k26@college.edu",
        organizingEntityName: "B.Tech. Chemical Engineering",
        department: "B.Tech. Chemical Engineering",
        organizerEntity: {
            id: 12,
            name: "B.Tech. Chemical Engineering",
            type: "DEPARTMENT",
            category: "Undergraduate Programmes",
            description: "Department of Chemical Engineering advancing chemical processes, biotechnology, and materials science."
        },
        image: "/aavishkar.png",
        trending: false,
        description: "National technical symposium hosted by the Department of Chemical Engineering at CIT. Featuring process simulation hackathons in DWSIM/Aspen, Chem-E-Car reaction vehicle derbies, green hydrogen paper conclaves, and pilot plant tours.",
        coordinatorName: "Dr. K. Raman",
        coordinatorContact: "+91 98432 11223",
        prizeDetails: "₹50,000 Cash + Certificates endorsed by IIChE",
        requiresApproval: false,
        externalParticipationAllowed: true,
        eligibleParticipants: "Chemical Engineering, Biotechnology, Petroleum, and Polymer science scholars",
        rules: [
            "Lab safety goggles required for physical chemistry demonstration events.",
            "Aspen and DWSIM pre-installed on workstations."
        ],
        activities: [
            {
                id: 601,
                name: "ProcessSim: Refinery Flowsheet Optimization",
                description: "Simulate a multi-stage crude distillation column flowsheet in Aspen to optimize yield.",
                category: "Simulation",
                dayNumber: 1,
                startTime: "2026-11-15T10:00:00.000Z",
                endTime: "2026-11-15T12:30:00.000Z",
                venue: "Chemical CAD Lab",
                maxParticipants: 60,
                availableSeats: 44,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            },
            {
                id: 602,
                name: "Chem-E-Car: Reaction Driven Vehicle Derby",
                description: "Design a shoe-box size car propelled solely by chemical reaction to halt at exact target distance.",
                category: "Hardware",
                dayNumber: 2,
                startTime: "2026-11-16T10:00:00.000Z",
                endTime: "2026-11-16T13:00:00.000Z",
                venue: "Pilot Plant Lawn",
                maxParticipants: 40,
                availableSeats: 25,
                fee: 0,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                isActive: true
            }
        ]
    },

    // =========================================================================
    // 7. LITERARY & ARTS CLUB EVENT: Sangamam: Tamil Heritage & Debate Conclave
    // Hosted by Muthamizh Mandram & Literary Club (Cultural & Literary)
    // =========================================================================
    {
        id: 7,
        title: "Sangamam: Tamil Heritage, Poetry & Pattimandram",
        category: "Cultural",
        eventFormat: "REGULAR",
        eventType: "INTRA_COLLEGE",
        numberOfDays: 1,
        date: "2026-12-10",
        time: "02:30 PM",
        endDate: "2026-12-10",
        endTime: "07:00 PM",
        deadline: "2026-12-08",
        venue: "Kamarajar Arangam (Main Audi)",
        seats: 350,
        totalSeats: 350,
        availableSeats: 350,
        organizer: "Muthamizh Mandram Executive Committee",
        organizerEmail: "muthamizh@college.edu",
        organizingEntityName: "Muthamizh Mandram",
        department: "Muthamizh Mandram",
        organizerEntity: {
            id: 24,
            name: "Muthamizh Mandram",
            type: "CLUB",
            category: "Language & Heritage",
            description: "Celebrating Tamil culture, literature, traditional arts, and festival gatherings."
        },
        image: "https://images.unsplash.com/photo-1609137144820-ea379447c234?auto=format&fit=crop&w=800&q=80",
        trending: false,
        description: "A cultural evening celebrating classical and folk Tamil literature, dramatic oratory, kavithai recitation, traditional Parai Isai performances, and the grand annual student Pattimandram debate.",
        coordinatorName: "Selvan M. Thangavel",
        coordinatorContact: "+91 94888 23456",
        prizeDetails: "Memorial Trophies, Book Bundles & Cash Awards",
        requiresApproval: false,
        externalParticipationAllowed: false,
        eligibleParticipants: "Coimbatore Institute of Technology Students Only",
        rules: [
            "Poetry submissions must be original compositions.",
            "Debate rounds judged on argumentation depth, diction, and adherence to time limits."
        ],
        activities: []
    },

    // =========================================================================
    // 8. DEPARTMENT WORKSHOP: Generative AI & Agentic Systems Bootcamp (IT Department)
    // =========================================================================
    {
        id: 8,
        title: "Generative AI & Agentic Systems Hands-on Bootcamp",
        category: "Workshop",
        eventFormat: "REGULAR",
        eventType: "INTER_COLLEGE",
        numberOfDays: 1,
        date: "2026-11-10",
        time: "09:30 AM",
        endDate: "2026-11-10",
        endTime: "04:30 PM",
        deadline: "2026-11-08",
        venue: "IT Department Seminar Hall & Lab 1",
        seats: 120,
        totalSeats: 120,
        availableSeats: 120,
        organizer: "Prof. M. Karthik",
        organizerEmail: "genai.bootcamp@college.edu",
        organizingEntityName: "B.Tech. Information Technology",
        department: "B.Tech. Information Technology",
        organizerEntity: {
            id: 13,
            name: "B.Tech. Information Technology",
            type: "DEPARTMENT",
            category: "Undergraduate Programmes",
            description: "Department of IT focusing on cloud computing, web technologies, and enterprise architecture."
        },
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "An intensive single-day technical masterclass exploring prompt engineering, retrieval-augmented generation (RAG) with vector databases, and fine-tuning open-source models for student developers.",
        coordinatorName: "Prof. M. Karthik",
        coordinatorContact: "+91 98422 55667",
        prizeDetails: "Certificate of Completion & GitHub Certification Kit",
        requiresApproval: false,
        externalParticipationAllowed: true,
        eligibleParticipants: "All college students interested in Artificial Intelligence and Full-Stack Engineering",
        rules: [
            "Bring your own laptop with Python 3.10+ installed.",
            "Free API keys and cloud notebook environments provided during morning session."
        ],
        activities: []
    },

    // =========================================================================
    // 9. INTRA-COLLEGE TECHNICAL EVENT: CIT Intra-Hackathon: Campus Solve '26 (CSE)
    // Exclusively for CIT campus students
    // =========================================================================
    {
        id: 9,
        title: "Campus Solve '26: CIT Intra-Department 12-Hour Hackathon",
        category: "Technical",
        eventFormat: "REGULAR",
        eventType: "INTRA_COLLEGE",
        numberOfDays: 1,
        date: "2026-11-25",
        time: "08:30 AM",
        endDate: "2026-11-25",
        endTime: "08:30 PM",
        deadline: "2026-11-23",
        venue: "Central Computing Center (CCC), Block A",
        seats: 180,
        totalSeats: 180,
        availableSeats: 180,
        organizer: "Prof. S. Anand",
        organizerEmail: "cse.organizer@college.edu",
        organizingEntityName: "B.E. Computer Science and Engineering",
        department: "B.E. Computer Science and Engineering",
        organizerEntity: {
            id: 10,
            name: "B.E. Computer Science and Engineering",
            type: "DEPARTMENT",
            category: "Undergraduate Programmes",
            description: "Department of CSE driving innovations in software engineering, computing, and cybersecurity."
        },
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "An intensive intra-college internal hackathon challenging CIT student teams across all departments to develop smart campus web applications, canteen queuing optimizers, and automated hostel pass systems.",
        coordinatorName: "Prof. S. Anand",
        coordinatorContact: "+91 98421 20261",
        prizeDetails: "Cash Prizes ₹25,000 + Incubation Support in CIT Innovation Cell",
        requiresApproval: false,
        externalParticipationAllowed: false,
        eligibleParticipants: "Coimbatore Institute of Technology Students Only (All Batches & Branches)",
        rules: [
            "Teams can consist of 2 to 4 students from any branch of CIT.",
            "Projects must solve one of 5 announced campus operational pain points.",
            "College Wi-Fi access, dinner, and caffeine rations provided at the center."
        ],
        activities: []
    },

    // =========================================================================
    // 10. INTRA-COLLEGE CULTURAL EVENT: RhythmScape '26 – Inter-Year Western & Classical Battle (Music Club)
    // Intra-college music contest
    // =========================================================================
    {
        id: 10,
        title: "RhythmScape '26: CIT Inter-Batch Unplugged Jam & Band Battle",
        category: "Cultural",
        eventFormat: "REGULAR",
        eventType: "INTRA_COLLEGE",
        numberOfDays: 1,
        date: "2026-12-02",
        time: "04:30 PM",
        endDate: "2026-12-02",
        endTime: "09:00 PM",
        deadline: "2026-11-30",
        venue: "Open Air Amphitheatre & Music Room",
        seats: 300,
        totalSeats: 300,
        availableSeats: 300,
        organizer: "Karthik R",
        organizerEmail: "music.organizer@college.edu",
        organizingEntityName: "Music Club",
        department: "Music Club",
        organizerEntity: {
            id: 21,
            name: "Music Club",
            type: "CLUB",
            category: "Cultural & Arts",
            description: "Campus melodies, classical, acoustic, and contemporary musical performances."
        },
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        trending: false,
        description: "Annual internal campus music battle pitting 1st, 2nd, 3rd, and final year student bands against each other in genres including Carnatic fusion, indie rock, cinematic mashups, and percussion solo battles.",
        coordinatorName: "Karthik R",
        coordinatorContact: "+91 97890 43210",
        prizeDetails: "Rolling Shield 'CIT Voice of the Year' + ₹15,000",
        requiresApproval: false,
        externalParticipationAllowed: false,
        eligibleParticipants: "Coimbatore Institute of Technology Students Only",
        rules: [
            "Each year/batch can field up to 2 vocalists and 1 band unit.",
            "Acoustic instruments and standard drum kit provided on stage.",
            "Maximum stage time per act: 8 minutes including sound check."
        ],
        activities: []
    },

    // =========================================================================
    // 11. INTRA-COLLEGE TECHNICAL EVENT: CircuitQuest '26 – Internal Hardware Debugging (EEE)
    // =========================================================================
    {
        id: 11,
        title: "CircuitQuest '26: Speed Breadboarding & IoT Circuit Race",
        category: "Technical",
        eventFormat: "REGULAR",
        eventType: "INTRA_COLLEGE",
        numberOfDays: 1,
        date: "2026-12-08",
        time: "02:00 PM",
        endDate: "2026-12-08",
        endTime: "05:30 PM",
        deadline: "2026-12-06",
        venue: "EEE Microcontroller & Embedded Systems Lab",
        seats: 100,
        totalSeats: 100,
        availableSeats: 100,
        organizer: "Dr. V. Narayanan",
        organizerEmail: "eee.organizer@college.edu",
        organizingEntityName: "B.E. Electrical and Electronics Engineering",
        department: "B.E. Electrical and Electronics Engineering",
        organizerEntity: {
            id: 11,
            name: "B.E. Electrical and Electronics Engineering",
            type: "DEPARTMENT",
            category: "Undergraduate Programmes",
            description: "Department of EEE excelling in power systems, renewable energy, and control engineering."
        },
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        trending: false,
        description: "Hands-on intra-college embedded engineering competition where student pairs race against the clock to wire sensor networks on breadboards, eliminate IC bugs, and transmit real-time telemetry over ESP32 Wi-Fi.",
        coordinatorName: "Dr. V. Narayanan",
        coordinatorContact: "+91 94431 88921",
        prizeDetails: "Arduino & ESP32 Pro Starter Kits + ₹8,000",
        requiresApproval: false,
        externalParticipationAllowed: false,
        eligibleParticipants: "Coimbatore Institute of Technology Students Only (EEE, ECE, Mech, Mechatronics, CSE)",
        rules: [
            "Teams of 2 students.",
            "All components (ICs, resistors, jumper cables, multimeters) provided at workstations.",
            "Judging based on logic accuracy, solderless neatness, and completion timestamp."
        ],
        activities: []
    },

    // =========================================================================
    // 12. INTRA-COLLEGE CULTURAL & DRAMA: Curtains Up '26 – Street Theatre & Mime Fest (Dramatix)
    // =========================================================================
    {
        id: 12,
        title: "Curtains Up '26: CIT Inter-Department Street Play & Mime Conclave",
        category: "Cultural",
        eventFormat: "REGULAR",
        eventType: "INTRA_COLLEGE",
        numberOfDays: 1,
        date: "2026-12-14",
        time: "03:30 PM",
        endDate: "2026-12-14",
        endTime: "07:30 PM",
        deadline: "2026-12-12",
        venue: "CIT Quadrangle & Open Stage",
        seats: 250,
        totalSeats: 250,
        availableSeats: 250,
        organizer: "Sanjana V",
        organizerEmail: "dramatix.organizer@college.edu",
        organizingEntityName: "Dramatix",
        department: "Dramatix",
        organizerEntity: {
            id: 22,
            name: "Dramatix",
            type: "CLUB",
            category: "Cultural & Arts",
            description: "The premier theater, street play, and theatrical performance group."
        },
        image: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80",
        trending: false,
        description: "High-energy intra-college street theatre showcase bringing student troupes together in the central quad to perform original sketches, satirical campus spoofs, social awareness nukkad natak, and synchronized mime acts.",
        coordinatorName: "Sanjana V",
        coordinatorContact: "+91 96555 12345",
        prizeDetails: "Best Play Trophy + Cash Prizes ₹12,000",
        requiresApproval: false,
        externalParticipationAllowed: false,
        eligibleParticipants: "Coimbatore Institute of Technology Students Only",
        rules: [
            "Team size: 6 to 12 performers per department or club team.",
            "Performance duration: 10 to 12 minutes.",
            "Live dholak / acoustic beats permitted; electronic amplification strictly optional."
        ],
        activities: []
    }
];

export default events;