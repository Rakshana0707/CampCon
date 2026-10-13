/**
 * Official Tamil Nadu District Directory & Normalization Map
 * Source: Tamil Nadu Government District Directory (https://tndistricts.nic.in/)
 * Total Official Districts: 38
 */

const TN_OFFICIAL_DISTRICTS_38 = [
    'Ariyalur',
    'Chengalpattu',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kallakurichi',
    'Kancheepuram',
    'Kanniyakumari',
    'Karur',
    'Krishnagiri',
    'Madurai',
    'Mayiladuthurai',
    'Nagapattinam',
    'Namakkal',
    'Nilgiris',
    'Perambalur',
    'Pudukkottai',
    'Ramanathapuram',
    'Ranipet',
    'Salem',
    'Sivaganga',
    'Tenkasi',
    'Thanjavur',
    'Theni',
    'Thoothukudi',
    'Tiruchirappalli',
    'Tirunelveli',
    'Tirupathur',
    'Tiruppur',
    'Tiruvallur',
    'Tiruvannamalai',
    'Tiruvarur',
    'Vellore',
    'Viluppuram',
    'Virudhunagar'
];

// Direct mapping for unbifurcated districts from dataset
const DIRECT_DISTRICT_MAP = {
    'ARIYALUR': 'Ariyalur',
    'CHENNAI': 'Chennai',
    'COIMBATORE': 'Coimbatore',
    'CUDDALORE': 'Cuddalore',
    'DHARMAPURI': 'Dharmapuri',
    'DINDIGUL': 'Dindigul',
    'ERODE': 'Erode',
    'KANYAKUMARI': 'Kanniyakumari',
    'KANNIYAKUMARI': 'Kanniyakumari',
    'KARUR': 'Karur',
    'KRISHNAGIRI': 'Krishnagiri',
    'MADURAI': 'Madurai',
    'NAMAKKAL': 'Namakkal',
    'NILGIRIS': 'Nilgiris',
    'PERAMBALUR': 'Perambalur',
    'PUDUKKOTTAI': 'Pudukkottai',
    'RAMANATHAPURAM': 'Ramanathapuram',
    'SALEM': 'Salem',
    'SIVAGANGA': 'Sivaganga',
    'THANJAVUR': 'Thanjavur',
    'THENI': 'Theni',
    'THIRUVALLUR': 'Tiruvallur',
    'TIRUVALLUR': 'Tiruvallur',
    'THIRUVARUR': 'Tiruvarur',
    'TIRUVARUR': 'Tiruvarur',
    'THOOTHUKUDI': 'Thoothukudi',
    'TIRUCHIRAPPALLI': 'Tiruchirappalli',
    'TIRUPPUR': 'Tiruppur',
    'TIRUVANNAMALAI': 'Tiruvannamalai',
    'VIRUDHUNAGAR': 'Virudhunagar'
};

/**
 * Carefully resolve historical parent districts into current official 38 districts
 * based on taluks, localities, and pin-codes present in institution address.
 */
function resolveOfficialDistrict(rawDistrict, addressText = '', instituteName = '') {
    if (!rawDistrict) return null;
    const rawUpper = rawDistrict.trim().toUpperCase();
    const searchTarget = ((addressText || '') + ' ' + (instituteName || '')).toUpperCase();

    // 1. Vellore parent district -> bifurcated into Vellore, Ranipet, Tirupathur (2019)
    if (rawUpper === 'VELLORE') {
        if (searchTarget.includes('RANIPET') || searchTarget.includes('ARAKKONAM') || searchTarget.includes('WALJA') || searchTarget.includes('SHOLINGHUR') || searchTarget.includes('NEMILI') || searchTarget.includes('ARCOT')) {
            return 'Ranipet';
        }
        if (searchTarget.includes('TIRUPATHUR') || searchTarget.includes('VANIYAMBADI') || searchTarget.includes('AMBUR') || searchTarget.includes('NATRAMPALLI')) {
            return 'Tirupathur';
        }
        return 'Vellore';
    }

    // 2. Viluppuram parent district -> bifurcated into Viluppuram and Kallakurichi (2019)
    if (rawUpper === 'VILUPPURAM' || rawUpper === 'VILLUPURAM') {
        if (searchTarget.includes('KALLAKURICHI') || searchTarget.includes('SANKARAPURAM') || searchTarget.includes('ULUNDURPET') || searchTarget.includes('CHINNASALEM') || searchTarget.includes('KALVARAYAN')) {
            return 'Kallakurichi';
        }
        return 'Viluppuram';
    }

    // 3. Kancheepuram parent district -> bifurcated into Kancheepuram and Chengalpattu (2019)
    if (rawUpper === 'KANCHIPURAM' || rawUpper === 'KANCHEEPURAM') {
        if (searchTarget.includes('CHENGALPATTU') || searchTarget.includes('CHENGALPET') || searchTarget.includes('KELAMBAKKAM') || searchTarget.includes('TAMBARAM') || searchTarget.includes('VANDALUR') || searchTarget.includes('MADHURANTAKAM') || searchTarget.includes('PALLAVARAM') || searchTarget.includes('MAHABALIPURAM') || searchTarget.includes('CHEYYUR') || searchTarget.includes('TIRUPORUR') || searchTarget.includes('KATTANKULATHUR')) {
            return 'Chengalpattu';
        }
        return 'Kancheepuram';
    }

    // 4. Tirunelveli parent district -> bifurcated into Tirunelveli and Tenkasi (2019)
    if (rawUpper === 'TIRUNELVELI') {
        if (searchTarget.includes('TENKASI') || searchTarget.includes('KADAYANALLUR') || searchTarget.includes('SANKARANKOVIL') || searchTarget.includes('SHENCOTTAH') || searchTarget.includes('ALANGULAM') || searchTarget.includes('VEERAKERALAMPUTHUR') || searchTarget.includes('THIRUVENGADAM') || searchTarget.includes('AYIKUDI')) {
            return 'Tenkasi';
        }
        return 'Tirunelveli';
    }

    // 5. Nagapattinam parent district -> bifurcated into Nagapattinam and Mayiladuthurai (2020)
    if (rawUpper === 'NAGAPATTINAM') {
        if (searchTarget.includes('MAYILADUTHURAI') || searchTarget.includes('SIRKAZHI') || searchTarget.includes('THARANGAMBADI') || searchTarget.includes('KUTHILAM') || searchTarget.includes('MANNAMPANDAL')) {
            return 'Mayiladuthurai';
        }
        return 'Nagapattinam';
    }

    // Direct exact or canonical match
    if (DIRECT_DISTRICT_MAP[rawUpper]) {
        return DIRECT_DISTRICT_MAP[rawUpper];
    }

    // Fallback: check if rawDistrict matches any of the official 38 case-insensitively
    const match = TN_OFFICIAL_DISTRICTS_38.find(d => d.toLowerCase() === rawDistrict.trim().toLowerCase());
    return match || null;
}

module.exports = {
    TN_OFFICIAL_DISTRICTS_38,
    DIRECT_DISTRICT_MAP,
    resolveOfficialDistrict
};
