/**
 * Official State, District, and Institution Directory Dataset
 * Structured for Tamil Nadu (all 38 districts) and extensible to additional Indian states.
 * Note: Records marked with isVerifiedSample: true are representative sample institutions
 * for districts where full AICTE/AISHE directory synchronization has not yet been imported.
 */

const STATE_DISTRICTS = {
    "Tamil Nadu": [
        "Ariyalur",
        "Chengalpattu",
        "Chennai",
        "Coimbatore",
        "Cuddalore",
        "Dharmapuri",
        "Dindigul",
        "Erode",
        "Kallakurichi",
        "Kancheepuram",
        "Kanniyakumari",
        "Karur",
        "Krishnagiri",
        "Madurai",
        "Mayiladuthurai",
        "Nagapattinam",
        "Namakkal",
        "Nilgiris",
        "Perambalur",
        "Pudukkottai",
        "Ramanathapuram",
        "Ranipet",
        "Salem",
        "Sivaganga",
        "Tenkasi",
        "Thanjavur",
        "Theni",
        "Thoothukudi",
        "Tiruchirappalli",
        "Tirunelveli",
        "Tirupathur",
        "Tiruppur",
        "Tiruvallur",
        "Tiruvannamalai",
        "Tiruvarur",
        "Vellore",
        "Viluppuram",
        "Virudhunagar"
    ],
    "Kerala": [
        "Ernakulam",
        "Kozhikode",
        "Palakkad",
        "Thrissur",
        "Thiruvananthapuram"
    ],
    "Karnataka": [
        "Bengaluru Urban",
        "Dakshina Kannada",
        "Mysuru"
    ]
};

const INITIAL_INSTITUTIONS = [
    // --- COIMBATORE (Host & Neighboring Verified Institutions) ---
    {
        code: "TN-CBE-CIT",
        name: "Coimbatore Institute of Technology",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Government Aided Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-PSGCT",
        name: "PSG College of Technology",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Government Aided Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-GCT",
        name: "Government College of Technology, Coimbatore",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Government Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-KCT",
        name: "Kumaraguru College of Technology",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-SKCET",
        name: "Sri Krishna College of Engineering and Technology",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-SREC",
        name: "Sri Ramakrishna Engineering College",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-KPRIET",
        name: "KPR Institute of Engineering and Technology",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-AMRITA",
        name: "Amrita Vishwa Vidyapeetham, Coimbatore",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Deemed University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-PSGITECH",
        name: "PSG Institute of Technology and Applied Research",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Engineering & Technology",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CBE-PSGCAS",
        name: "PSG College of Arts and Science",
        state: "Tamil Nadu",
        district: "Coimbatore",
        institutionType: "Autonomous Arts & Science",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- CHENNAI ---
    {
        code: "TN-CHE-CEG",
        name: "College of Engineering, Guindy (Anna University)",
        state: "Tamil Nadu",
        district: "Chennai",
        institutionType: "State University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CHE-IITM",
        name: "Indian Institute of Technology Madras",
        state: "Tamil Nadu",
        district: "Chennai",
        institutionType: "Institute of National Importance",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CHE-ACT",
        name: "Alagappa College of Technology (Anna University)",
        state: "Tamil Nadu",
        district: "Chennai",
        institutionType: "State University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CHE-LOYOLA",
        name: "Loyola College, Chennai",
        state: "Tamil Nadu",
        district: "Chennai",
        institutionType: "Autonomous Arts & Science",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CHE-MIDS",
        name: "Meenakshi Sundararajan Engineering College",
        state: "Tamil Nadu",
        district: "Chennai",
        institutionType: "Engineering & Technology",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- CHENGALPATTU ---
    {
        code: "TN-CGL-MIT",
        name: "Madras Institute of Technology, Chromepet (Anna University)",
        state: "Tamil Nadu",
        district: "Chengalpattu",
        institutionType: "State University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CGL-SSN",
        name: "Sri Sivasubramaniya Nadar College of Engineering (SSN)",
        state: "Tamil Nadu",
        district: "Chengalpattu",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CGL-SRM",
        name: "SRM Institute of Science and Technology, Kattankulathur",
        state: "Tamil Nadu",
        district: "Chengalpattu",
        institutionType: "Deemed University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-CGL-VITC",
        name: "Vellore Institute of Technology, Chennai Campus",
        state: "Tamil Nadu",
        district: "Chengalpattu",
        institutionType: "Deemed University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- KANCHEEPURAM ---
    {
        code: "TN-KPM-SVCE",
        name: "Sri Venkateswara College of Engineering, Sriperumbudur",
        state: "Tamil Nadu",
        district: "Kancheepuram",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-KPM-REC",
        name: "Rajalakshmi Engineering College",
        state: "Tamil Nadu",
        district: "Kancheepuram",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- TIRUVALLUR ---
    {
        code: "TN-TLR-RMK",
        name: "R.M.K. Engineering College",
        state: "Tamil Nadu",
        district: "Tiruvallur",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TLR-VEC",
        name: "Velammal Engineering College",
        state: "Tamil Nadu",
        district: "Tiruvallur",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- TIRUCHIRAPPALLI ---
    {
        code: "TN-TRY-NITT",
        name: "National Institute of Technology, Tiruchirappalli",
        state: "Tamil Nadu",
        district: "Tiruchirappalli",
        institutionType: "Institute of National Importance",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TRY-IIITT",
        name: "Indian Institute of Information Technology, Tiruchirappalli",
        state: "Tamil Nadu",
        district: "Tiruchirappalli",
        institutionType: "Institute of National Importance",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TRY-SRCE",
        name: "Saranathan College of Engineering",
        state: "Tamil Nadu",
        district: "Tiruchirappalli",
        institutionType: "Engineering & Technology",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TRY-KRCE",
        name: "K. Ramakrishnan College of Engineering",
        state: "Tamil Nadu",
        district: "Tiruchirappalli",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- MADURAI ---
    {
        code: "TN-MDU-TCE",
        name: "Thiagarajar College of Engineering",
        state: "Tamil Nadu",
        district: "Madurai",
        institutionType: "Government Aided Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-MDU-VCET",
        name: "Velammal College of Engineering and Technology, Madurai",
        state: "Tamil Nadu",
        district: "Madurai",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-MDU-AMC",
        name: "The American College, Madurai",
        state: "Tamil Nadu",
        district: "Madurai",
        institutionType: "Autonomous Arts & Science",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- VELLORE ---
    {
        code: "TN-VLR-VIT",
        name: "Vellore Institute of Technology (VIT), Vellore",
        state: "Tamil Nadu",
        district: "Vellore",
        institutionType: "Deemed University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-VLR-TPGIT",
        name: "Thanthai Periyar Government Institute of Technology",
        state: "Tamil Nadu",
        district: "Vellore",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- ERODE ---
    {
        code: "TN-ERD-KEC",
        name: "Kongu Engineering College, Perundurai",
        state: "Tamil Nadu",
        district: "Erode",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-ERD-BIT",
        name: "Bannari Amman Institute of Technology, Sathyamangalam",
        state: "Tamil Nadu",
        district: "Erode",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-ERD-GCE",
        name: "Government College of Engineering, Erode (IRTT)",
        state: "Tamil Nadu",
        district: "Erode",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- SALEM ---
    {
        code: "TN-SLM-GCE",
        name: "Government College of Engineering, Salem",
        state: "Tamil Nadu",
        district: "Salem",
        institutionType: "Government Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-SLM-SONA",
        name: "Sona College of Technology",
        state: "Tamil Nadu",
        district: "Salem",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- THANJAVUR ---
    {
        code: "TN-TNJ-SASTRA",
        name: "SASTRA Deemed to be University, Thanjavur",
        state: "Tamil Nadu",
        district: "Thanjavur",
        institutionType: "Deemed University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TNJ-GCET",
        name: "Government College of Engineering, Sengipatti",
        state: "Tamil Nadu",
        district: "Thanjavur",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- TIRUNELVELI ---
    {
        code: "TN-TVL-GCET",
        name: "Government College of Engineering, Tirunelveli",
        state: "Tamil Nadu",
        district: "Tirunelveli",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TVL-FXEC",
        name: "Francis Xavier Engineering College",
        state: "Tamil Nadu",
        district: "Tirunelveli",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- VIRUDHUNAGAR ---
    {
        code: "TN-VNR-MEPCO",
        name: "Mepco Schlenk Engineering College, Sivakasi",
        state: "Tamil Nadu",
        district: "Virudhunagar",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-VNR-KCET",
        name: "Kamaraj College of Engineering and Technology",
        state: "Tamil Nadu",
        district: "Virudhunagar",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- SIVAGANGA ---
    {
        code: "TN-SVG-ACGCET",
        name: "Alagappa Chettiar Government College of Engineering and Technology, Karaikudi",
        state: "Tamil Nadu",
        district: "Sivaganga",
        institutionType: "Government Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- THOOTHUKUDI ---
    {
        code: "TN-TUT-NEC",
        name: "National Engineering College, Kovilpatti",
        state: "Tamil Nadu",
        district: "Thoothukudi",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- DINDIGUL ---
    {
        code: "TN-DGL-PSNA",
        name: "PSNA College of Engineering and Technology, Dindigul",
        state: "Tamil Nadu",
        district: "Dindigul",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- KARUR ---
    {
        code: "TN-KRR-MKCE",
        name: "M. Kumarasamy College of Engineering, Karur",
        state: "Tamil Nadu",
        district: "Karur",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- NAMAKKAL ---
    {
        code: "TN-NMK-KSRCT",
        name: "K.S. Rangasamy College of Technology, Tiruchengode",
        state: "Tamil Nadu",
        district: "Namakkal",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-NMK-MEC",
        name: "Muthayammal Engineering College, Rasipuram",
        state: "Tamil Nadu",
        district: "Namakkal",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- CUDDALORE ---
    {
        code: "TN-CDL-AUFEAT",
        name: "Annamalai University Faculty of Engineering and Technology",
        state: "Tamil Nadu",
        district: "Cuddalore",
        institutionType: "State University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- KANNIYAKUMARI ---
    {
        code: "TN-KKM-UCE",
        name: "University College of Engineering, Nagercoil",
        state: "Tamil Nadu",
        district: "Kanniyakumari",
        institutionType: "Anna University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-KKM-SXCCE",
        name: "St. Xavier's Catholic College of Engineering, Chunkankadai",
        state: "Tamil Nadu",
        district: "Kanniyakumari",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- REMAINING TAMIL NADU DISTRICTS (Verified Constituent / Government / Representative Sample Records) ---
    {
        code: "TN-ARL-UCE",
        name: "University College of Engineering, Ariyalur",
        state: "Tamil Nadu",
        district: "Ariyalur",
        institutionType: "Anna University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-DPI-GCE",
        name: "Government College of Engineering, Dharmapuri",
        state: "Tamil Nadu",
        district: "Dharmapuri",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-KLK-GASC",
        name: "Government Arts and Science College, Kallakurichi (Sample Directory Record)",
        state: "Tamil Nadu",
        district: "Kallakurichi",
        institutionType: "Government Arts & Science",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: true
    },
    {
        code: "TN-KGI-GCE",
        name: "Government College of Engineering, Bargur",
        state: "Tamil Nadu",
        district: "Krishnagiri",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-MYD-AVC",
        name: "A.V.C. College of Engineering, Mayiladuthurai",
        state: "Tamil Nadu",
        district: "Mayiladuthurai",
        institutionType: "Engineering & Technology",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-NGP-UCE",
        name: "University College of Engineering, Thirukkuvalai",
        state: "Tamil Nadu",
        district: "Nagapattinam",
        institutionType: "Anna University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-NLG-GAC",
        name: "Government Arts College, Udhagamandalam",
        state: "Tamil Nadu",
        district: "Nilgiris",
        institutionType: "Government Arts & Science",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-PBL-DEC",
        name: "Dhanalakshmi Srinivasan Engineering College, Perambalur",
        state: "Tamil Nadu",
        district: "Perambalur",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-PDK-MNSK",
        name: "M.N.S.K. College of Engineering, Pudukkottai",
        state: "Tamil Nadu",
        district: "Pudukkottai",
        institutionType: "Engineering & Technology",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-RMD-UCE",
        name: "University College of Engineering, Ramanathapuram",
        state: "Tamil Nadu",
        district: "Ramanathapuram",
        institutionType: "Anna University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-RPT-CAHCET",
        name: "C. Abdul Hakeem College of Engineering and Technology, Melvisharam",
        state: "Tamil Nadu",
        district: "Ranipet",
        institutionType: "Engineering & Technology",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TSI-JPCOE",
        name: "J.P. College of Engineering, Tenkasi",
        state: "Tamil Nadu",
        district: "Tenkasi",
        institutionType: "Engineering & Technology",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-THN-GCE",
        name: "Government College of Engineering, Bodinayakkanur",
        state: "Tamil Nadu",
        district: "Theni",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TPT-SHC",
        name: "Sacred Heart College (Autonomous), Tirupathur",
        state: "Tamil Nadu",
        district: "Tirupathur",
        institutionType: "Autonomous Arts & Science",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TPR-BIET",
        name: "Builders Engineering College, Kangeyam",
        state: "Tamil Nadu",
        district: "Tiruppur",
        institutionType: "Engineering & Technology",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TVM-UCE",
        name: "University College of Engineering, Arni",
        state: "Tamil Nadu",
        district: "Tiruvannamalai",
        institutionType: "Anna University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-TRV-CUTN",
        name: "Central University of Tamil Nadu, Thiruvarur",
        state: "Tamil Nadu",
        district: "Tiruvarur",
        institutionType: "Central University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "TN-VPM-UCE",
        name: "University College of Engineering, Villupuram",
        state: "Tamil Nadu",
        district: "Viluppuram",
        institutionType: "Anna University Constituent",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },

    // --- KERALA & KARNATAKA (Multi-State Extensibility Records) ---
    {
        code: "KL-PKD-IITPKD",
        name: "Indian Institute of Technology Palakkad",
        state: "Kerala",
        district: "Palakkad",
        institutionType: "Institute of National Importance",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KL-PKD-GEC",
        name: "Government Engineering College, Sreekrishnapuram",
        state: "Kerala",
        district: "Palakkad",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KL-KZK-NITC",
        name: "National Institute of Technology Calicut",
        state: "Kerala",
        district: "Kozhikode",
        institutionType: "Institute of National Importance",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KL-EKM-CUSAT",
        name: "Cochin University of Science and Technology (CUSAT)",
        state: "Kerala",
        district: "Ernakulam",
        institutionType: "State University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KL-TSR-GEC",
        name: "Government Engineering College, Thrissur",
        state: "Kerala",
        district: "Thrissur",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KL-TVM-CET",
        name: "College of Engineering Trivandrum (CET)",
        state: "Kerala",
        district: "Thiruvananthapuram",
        institutionType: "Government Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KA-BLR-IISC",
        name: "Indian Institute of Science (IISc), Bengaluru",
        state: "Karnataka",
        district: "Bengaluru Urban",
        institutionType: "Institute of National Importance",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KA-BLR-RVCE",
        name: "R.V. College of Engineering, Bengaluru",
        state: "Karnataka",
        district: "Bengaluru Urban",
        institutionType: "Autonomous Engineering",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KA-DK-NITK",
        name: "National Institute of Technology Karnataka, Surathkal",
        state: "Karnataka",
        district: "Dakshina Kannada",
        institutionType: "Institute of National Importance",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    },
    {
        code: "KA-MYS-SJCE",
        name: "JSS Science and Technology University (SJCE), Mysuru",
        state: "Karnataka",
        district: "Mysuru",
        institutionType: "State Private University",
        isActive: true,
        status: "APPROVED",
        isVerifiedSample: false
    }
];

module.exports = {
    STATE_DISTRICTS,
    INITIAL_INSTITUTIONS
};
