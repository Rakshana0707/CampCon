const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const officialProgrammes = [
    // Undergraduate Programmes
    { name: "B.E. Civil Engineering", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Department of Civil Engineering fostering infrastructure development and sustainable construction." },
    { name: "B.E. Mechanical Engineering", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Department of Mechanical Engineering specializing in robotics, thermal sciences, and manufacturing." },
    { name: "B.E. Electrical and Electronics Engineering", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Department of EEE excelling in power systems, renewable energy, and control engineering." },
    { name: "B.E. Electronics and Communication Engineering", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Department of ECE leading communications, signal processing, and embedded systems." },
    { name: "B.E. Computer Science and Engineering", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Department of CSE driving innovations in software engineering, computing, and cybersecurity." },
    { name: "B.E. Electronics Engineering (VLSI Design and Technology)", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Specialized programme in Semiconductor Physics, VLSI Circuit Design, and Chip Technology." },
    { name: "B.Tech. Chemical Engineering", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Department of Chemical Engineering advancing chemical processes, biotechnology, and materials science." },
    { name: "B.Tech. Information Technology", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Department of IT focusing on cloud computing, web technologies, and enterprise architecture." },
    { name: "B.Tech. Artificial Intelligence and Data Science", type: "DEPARTMENT", category: "Undergraduate Programmes", description: "Department of AI & DS advancing machine learning, deep learning, and big data analytics." },

    // Postgraduate Programmes
    { name: "M.E. Construction Management", type: "DEPARTMENT", category: "Postgraduate Programmes", description: "Postgraduate programme specializing in modern project execution, site operations, and structural economics." },
    { name: "Master of Computer Applications", type: "DEPARTMENT", category: "Postgraduate Programmes", description: "MCA programme focusing on enterprise application development, cloud computing, and advanced systems." },
    { name: "Master of Business Administration", type: "DEPARTMENT", category: "Postgraduate Programmes", description: "Department of Management Studies cultivating leadership, operations, finance, and marketing strategies." },

    // Five-Year Integrated Programmes
    { name: "M.Sc. Software Systems", type: "DEPARTMENT", category: "Five-Year Integrated Programmes", description: "Five-year integrated masters programme in end-to-end software engineering and system architecture." },
    { name: "M.Sc. Data Science", type: "DEPARTMENT", category: "Five-Year Integrated Programmes", description: "Five-year integrated masters programme in statistical modeling, computational data analytics, and AI." },
    { name: "M.Sc. Decision and Computing Sciences", type: "DEPARTMENT", category: "Five-Year Integrated Programmes", description: "Five-year integrated masters combining quantitative decision analysis, computational mathematics, and computing." },
    { name: "M.Sc. Artificial Intelligence and Machine Learning", type: "DEPARTMENT", category: "Five-Year Integrated Programmes", description: "Five-year integrated masters dedicated to advanced neural networks, computer vision, and cognitive systems." }
];

const officialClubs = [
    { name: "Japan Horizons Club", type: "CLUB", category: "Cultural & Language", description: "Dedicated to exploring Japanese language, culture, and professional opportunities." },
    { name: "Career Guidance and Counselling Cell", type: "CLUB", category: "Student Welfare & Career", description: "Providing mentorship, career counseling, and skill development guidance to students." },
    { name: "CLAP Cell", type: "CLUB", category: "Student Welfare & Career", description: "Campus Learning and Awareness Programme empowering student potential." },
    { name: "Entrepreneurship Development Cell", type: "CLUB", category: "Innovation & Business", description: "Incubating startup mindsets, investor sessions, and venture creation on campus." },
    { name: "Women Empowerment Cell", type: "CLUB", category: "Social Welfare", description: "Fostering leadership, safety awareness, and empowerment initiatives for women." },
    { name: "Kalam Knowledge Club", type: "CLUB", category: "Science & Innovation", description: "Inspired by Dr. A.P.J. Abdul Kalam, organizing science conventions, seminars, and quizzes." },
    { name: "Yoga Club", type: "CLUB", category: "Health & Fitness", description: "Promoting physical wellness, mindfulness, and healthy living through yoga practices." },
    { name: "NSS", type: "CLUB", category: "Social Service", description: "National Service Scheme driving community development, blood donation camps, and social welfare." },
    { name: "RSP", type: "CLUB", category: "Social Service", description: "Road Safety Patrol promoting traffic awareness and safety compliance." },
    { name: "Rotaract Club", type: "CLUB", category: "Community Service", description: "Youth wing of Rotary International dedicated to humanitarian service and leadership." },
    { name: "YRC", type: "CLUB", category: "Social Service", description: "Youth Red Cross promoting life preservation, health camps, and emergency response training." },
    { name: "Fit India", type: "CLUB", category: "Health & Fitness", description: "Promoting physical activities, sports events, and fitness challenges across the campus." },
    { name: "Space Club", type: "CLUB", category: "Science & Technology", description: "Exploring astronomy, rocketry, satellite systems, and space sciences." },
    { name: "Photographic Club", type: "CLUB", category: "Arts & Media", description: "Capturing campus memories, visual storytelling, and cinematography." },
    { name: "Cyber Club", type: "CLUB", category: "Technical", description: "Promoting cybersecurity awareness, ethical hacking, CTF competitions, and online safety." },
    { name: "Music Club", type: "CLUB", category: "Cultural & Arts", description: "Campus melodies, classical, acoustic, and contemporary musical performances." },
    { name: "Literary Club", type: "CLUB", category: "Literary & Debate", description: "Debates, creative writing, poetry, elocution, and literary symposia." },
    { name: "YHAI", type: "CLUB", category: "Adventure & Nature", description: "Youth Hostels Association of India promoting trekking, eco-tourism, and adventure camps." },
    { name: "Martial Arts Club", type: "CLUB", category: "Sports & Fitness", description: "Self-defense training, martial disciplines, and physical endurance." },
    { name: "Film Club", type: "CLUB", category: "Arts & Media", description: "Screenings, short film creations, critiques, and cinematic appreciation workshops." },
    { name: "Arts Club", type: "CLUB", category: "Cultural & Arts", description: "Visual arts, painting, sculpting, sketching, and campus creative installations." },
    { name: "Muthamizh Mandram", type: "CLUB", category: "Language & Heritage", description: "Celebrating Tamil culture, literature, traditional arts, and festival gatherings." },
    { name: "Dramatix", type: "CLUB", category: "Cultural & Arts", description: "The premier theater, street play, and theatrical performance group." },
    { name: "UBA", type: "CLUB", category: "Social Development", description: "Unnat Bharat Abhiyan driving rural development through technological solutions." },
    { name: "EBSS", type: "CLUB", category: "Cultural Integration", description: "Ek Bharat Shreshtha Bharat celebrating cultural diversity and inter-state heritage exchange." },
    { name: "Nature Club", type: "CLUB", category: "Environment", description: "Promoting ecological conservation, tree plantations, biodiversity walks, and sustainability." },
    { name: "GDS Club", type: "CLUB", category: "Technical", description: "Google Developer Student Club fostering open technology, hackathons, and software innovation." },
    { name: "FOSS Club", type: "CLUB", category: "Technical", description: "Free and Open Source Software club advocating for Linux, open collaboration, and contributions." },
    { name: "Quiz Club", type: "CLUB", category: "Literary & Intellectual", description: "Conducting trivia, business, science, and general knowledge championships." },
    { name: "Datalytics Club", type: "CLUB", category: "Technical & Data", description: "Specializing in business intelligence, machine learning hackathons, and data analytics." },
    { name: "Swachh Bharat Club", type: "CLUB", category: "Social Welfare", description: "Cleanliness drives, plastic-free campus campaigns, and sanitation hygiene awareness." }
];

async function seed() {
    console.log("🌱 Seeding Official Organizers...");

    let createdCount = 0;
    const allEntities = [...officialProgrammes, ...officialClubs];

    for (const entity of allEntities) {
        const existing = await prisma.organizerEntity.findUnique({
            where: { name: entity.name }
        });

        if (!existing) {
            await prisma.organizerEntity.create({
                data: {
                    name: entity.name,
                    type: entity.type,
                    category: entity.category,
                    description: entity.description,
                    contactEmail: `${entity.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@college.edu`,
                    contactPerson: `Coordinator - ${entity.name}`,
                    isActive: true
                }
            });
            createdCount++;
        }
    }

    console.log(`✅ Seeded ${createdCount} new organizer entities out of ${allEntities.length} official entities.`);
}

seed()
    .catch(e => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
