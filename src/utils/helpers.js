/**
 * Provides a highly reliable fallback image URL sourced from Unsplash based on the event category.
 * Used when an organizer does not provide a custom banner image during event creation.
 * 
 * @param {string} category - The category of the event (e.g., "Technical", "Cultural", "Sports").
 * @returns {string} - A valid Unsplash image URL.
 */
export const getFallbackImage = (category) => {
    switch (category) {
        case "Technical": 
            return "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80";
        case "Cultural": 
            return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";
        case "Sports": 
            return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80";
        case "Workshop": 
            return "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=800&q=80";
        default: 
            return "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80";
    }
};
