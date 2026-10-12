const events = [
    {
        id: 1,
        title: "Hackathon 2026",
        category: "Technical",
        date: "2026-08-25",
        time: "09:00 AM",
        venue: "Main Auditorium",
        seats: 150,
        organizer: "Coding Club",
        organizerEmail: "organizer@college.edu",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "Join the biggest coding competition of the year where students solve real-world problems, collaborate in teams, and compete for exciting prizes and internships.",
        department: "CSE",
        deadline: "2026-08-23",
        coordinatorName: "Aakash K",
        coordinatorContact: "+91 98765 43210",
        prizeDetails: "1st Prize: ₹15,000 | 2nd Prize: ₹10,000 | Free cloud credits",
        requiresApproval: false,
        rules: [
            "Bring your college ID card.",
            "Maximum 4 members per team.",
            "Laptop is mandatory.",
            "Internet will be provided."
        ]
    },
    {
        id: 2,
        title: "Cultural Fest 2026",
        category: "Cultural",
        date: "2026-08-20",
        time: "05:00 PM",
        venue: "Open Air Theatre",
        seats: 500,
        organizer: "Fine Arts Club",
        organizerEmail: "organizer@college.edu",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "Experience a night of magic, music, and dance. Featuring outstanding performances by campus bands, dance groups, and guest performers from all over the country.",
        department: "Fine Arts",
        deadline: "2026-08-18",
        coordinatorName: "Rithanya M",
        coordinatorContact: "+91 98765 43211",
        prizeDetails: "Exciting gift hampers & performance certificates",
        requiresApproval: false,
        rules: [
            "Registration required for entry.",
            "Food and drinks are not allowed inside.",
            "Carry a digital copy of your ticket.",
            "Follow campus conduct guidelines."
        ]
    },
    {
        id: 3,
        title: "Football Tournament",
        category: "Sports",
        date: "2026-08-28",
        time: "08:00 AM",
        venue: "College Ground",
        seats: 250,
        organizer: "Sports Committee",
        organizerEmail: "organizer@college.edu",
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
        trending: false,
        description: "Unleash your sportsmanship in the annual inter-departmental Football Tournament. Register your team and secure the championship cup for your department.",
        department: "Sports",
        deadline: "2026-08-26",
        coordinatorName: "Nithin S",
        coordinatorContact: "+91 98765 43212",
        prizeDetails: "Winner Trophy & ₹5,000 Cash Prize",
        requiresApproval: true,
        rules: [
            "11 players + 3 substitutes per team.",
            "Wear appropriate department jersey and studs.",
            "Matches will be knock-out style.",
            "Referee decisions are final."
        ]
    },
    {
        id: 4,
        title: "AI & Generative Tech Workshop",
        category: "Workshop",
        date: "2026-08-30",
        time: "10:00 AM",
        venue: "Lab 3",
        seats: 80,
        organizer: "AI & ML Society",
        organizerEmail: "organizer2@college.edu",
        image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=800&q=80",
        trending: true,
        description: "An intensive hands-on workshop focused on building real-world applications using modern LLMs, prompt engineering, and visual intelligence. Recommended for developers of all skill levels.",
        department: "CSE",
        deadline: "2026-08-29",
        coordinatorName: "Dr. Prem Kumar",
        coordinatorContact: "+91 98765 43213",
        prizeDetails: "Participation Certificate & Internship Opportunities",
        requiresApproval: false,
        rules: [
            "Basic knowledge of programming is preferred.",
            "Ensure Node.js and Python are installed on your laptop.",
            "Workshop slides and code repos will be shared beforehand."
        ]
    }
];

export default events;