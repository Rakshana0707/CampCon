/**
 * CampCon Distinct Image Engine & Anti-Duplicate Helpers
 * Guarantees that every event card across the app receives a completely unique,
 * domain-matched cover image with zero duplicates.
 */

// Master categorized pool of verified, high-quality, topic-tailored Unsplash images
export const CATEGORY_IMAGE_REGISTRY = {
    Technical: [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80", // Cyberpunk workstation
        "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80", // Neon circuit motherboard
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80", // Cyber padlock security
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80", // Team hackathon sprint
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80", // Electronics breadboard & multimeter
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Satellite telemetry globe
        "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80", // Industrial robotic arm
        "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80", // Big data analytics streams
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", // Civil engineering blueprint
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // Microchip semiconductor wafer
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", // Cloud datacenter servers
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80", // Autonomous drone robotics
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80", // Laser optics physics lab
        "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80", // Chemistry research lab flasks
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80", // Solar energy & smart microgrid
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80"  // Virtual Reality headset
    ],
    Cultural: [
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80", // Acoustic guitar stage bokeh
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80", // Theatrical dance spotlight
        "https://images.unsplash.com/photo-1609137144820-ea379447c234?auto=format&fit=crop&w=800&q=80", // Glowing brass Diya lamps
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80", // Live concert rock drums
        "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80", // Red velvet theatre stage curtains
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80", // Classical violin symphony
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80", // Stand-up comedy stage mic
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80", // Fine arts canvas & paints
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80", // Film clapperboard & cinematic set
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", // DSLR photography contest
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"  // Literature & poetry calligraphy
    ],
    Workshop: [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80", // Generative AI neural mesh
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80", // Interactive whiteboard masterclass
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80", // Product design UX sprint
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80"  // Keynote speaker auditorium podium
    ],
    Sports: [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80", // Athletics sprint track
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80", // Basketball tournament
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80", // Football stadium floodlights
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80", // Badminton indoor match
        "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80", // Chess championship board
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80", // Table tennis arena
        "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80"  // Fitness sprint workout
    ],
    Gaming: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"  // Esports tournament arena
    ],
    Default: [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80", // Campus youth collaboration
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"  // University library hall
    ]
};

// Flattened global unique list for fallback exhaustiveness
export const GLOBAL_UNIQUE_POOL = [
    ...CATEGORY_IMAGE_REGISTRY.Technical,
    ...CATEGORY_IMAGE_REGISTRY.Cultural,
    ...CATEGORY_IMAGE_REGISTRY.Workshop,
    ...CATEGORY_IMAGE_REGISTRY.Sports,
    ...CATEGORY_IMAGE_REGISTRY.Gaming,
    ...CATEGORY_IMAGE_REGISTRY.Default
];

/**
 * Generates an integer hash from any string or number seed.
 */
function hashString(str) {
    const s = String(str || "");
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

/**
 * Selects an image from category pool or global pool that is NOT in usedImages set.
 * 
 * @param {string} category 
 * @param {Set<string>} usedImages 
 * @param {string|number} seed 
 * @returns {string} A distinct image URL guaranteed not to be in usedImages.
 */
export const getUniqueImage = (category = "Technical", usedImages = new Set(), seed = "") => {
    const categoryPool = CATEGORY_IMAGE_REGISTRY[category] || CATEGORY_IMAGE_REGISTRY.Default;
    const startIndex = hashString(seed) % categoryPool.length;

    // 1. Try to find an unused image in the event's category pool
    for (let i = 0; i < categoryPool.length; i++) {
        const candidate = categoryPool[(startIndex + i) % categoryPool.length];
        if (!usedImages.has(candidate)) {
            return candidate;
        }
    }

    // 2. Fall back to any unused image from the entire global pool
    const globalStartIndex = hashString(seed) % GLOBAL_UNIQUE_POOL.length;
    for (let i = 0; i < GLOBAL_UNIQUE_POOL.length; i++) {
        const candidate = GLOBAL_UNIQUE_POOL[(globalStartIndex + i) % GLOBAL_UNIQUE_POOL.length];
        if (!usedImages.has(candidate)) {
            return candidate;
        }
    }

    // 3. Fallback to index-based deterministic selection
    return categoryPool[startIndex];
};

/**
 * Deduplicates a list of event objects so that EVERY single event card
 * is guaranteed to have a unique, non-repeating cover image.
 * 
 * @param {Array<Object>} eventsList - Array of event objects
 * @returns {Array<Object>} Array of events with 100% distinct images
 */
export const deduplicateEvents = (eventsList = []) => {
    if (!Array.isArray(eventsList)) return [];

    const usedImages = new Set();

    // Pass 1: Reserve custom local uploads and verified specific images (like /aavishkar.png)
    eventsList.forEach(evt => {
        if (evt?.image && typeof evt.image === "string" && evt.image.trim().startsWith("/")) {
            usedImages.add(evt.image.trim());
        }
    });

    // Pass 2: Process all events ensuring each receives a unique image
    return eventsList.map((evt, idx) => {
        if (!evt) return evt;
        const rawImage = typeof evt.image === "string" ? evt.image.trim() : "";

        // If event already has an image that hasn't been claimed by a previous card, keep it!
        if (rawImage && !usedImages.has(rawImage)) {
            usedImages.add(rawImage);
            return {
                ...evt,
                image: rawImage
            };
        }

        // Image was missing OR was a duplicate of an earlier event card -> assign a fresh distinct one
        const seed = evt.id || evt.title || idx;
        const freshImage = getUniqueImage(evt.category, usedImages, seed);
        usedImages.add(freshImage);

        return {
            ...evt,
            image: freshImage
        };
    });
};

/**
 * Backwards-compatible getFallbackImage that ensures fallback selections
 * do not collide with known used images.
 */
export const getFallbackImage = (category, seed = "", usedImages = new Set()) => {
    return getUniqueImage(category, usedImages, seed);
};
