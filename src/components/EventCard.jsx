import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUsers,
    FaHeart
} from "react-icons/fa";

import { getFallbackImage } from "../utils/helpers";

function EventCard({ event }) {
    const { bookmarks, toggleSaveEvent } = useContext(AppContext);

    const isFavorite = bookmarks?.includes(event.id);

    const toggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaveEvent(event.id);
    };

    return (
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="event-card">
                <div className="event-image">
                    <img
                        src={event.image || getFallbackImage(event.category)}
                        alt={`${event.title} promotional banner`}
                        loading="lazy"
                    />

                    {event.trending && (
                        <span className="trending-badge">
                            Trending
                        </span>
                    )}

                    <button 
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={toggleFavorite}
                        title="Add to Favorites"
                        aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        <FaHeart style={{ fill: isFavorite ? 'white' : 'currentColor' }} />
                    </button>
                </div>

                <div className="p-3 d-flex flex-column flex-grow-1">
                    <div className="d-flex flex-wrap gap-1 mb-2 align-items-center">
                        {/* Event Type Badge */}
                        <span 
                            className={`badge fs-8 px-2 py-1 ${
                                event.eventType === "INTER_COLLEGE" 
                                    ? "bg-info text-dark fw-bold" 
                                    : "bg-primary text-white"
                            }`}
                            style={{ letterSpacing: "0.5px" }}
                        >
                            {event.eventType === "INTER_COLLEGE" ? "🌐 Inter-College" : "🏛️ Intra-College"}
                        </span>

                        <span className="badge bg-secondary text-white fs-8 px-2 py-1">
                            {event.category}
                        </span>
                    </div>

                    <h5 className="fw-bold text-white mb-1" style={{ minHeight: "44px", fontSize: "1.05rem" }}>
                        {event.title}
                    </h5>

                    {/* Organizing Entity */}
                    <p className="text-info text-opacity-75 mb-2 fs-8 text-truncate" title={event.organizingEntityName || event.department}>
                        By: <span className="fw-semibold text-light">{event.organizingEntityName || event.department}</span>
                    </p>

                    <p className="text-muted mb-2 fs-7 d-flex align-items-center gap-2">
                        <FaCalendarAlt className="text-primary" />
                        <span>{event.date} • {event.time}</span>
                    </p>

                    <p className="text-muted mb-2 fs-7 d-flex align-items-center gap-2">
                        <FaMapMarkerAlt className="text-danger" />
                        <span className="text-truncate">{event.venue}</span>
                    </p>

                    <p className="text-muted mb-3 fs-7 d-flex align-items-center gap-2 mt-auto">
                        <FaUsers className="text-success" />
                        <span>{event.seats} Seats Available</span>
                    </p>

                    <Link
                        to={`/events/${event.id}`}
                        className="btn btn-primary w-100 mt-2 py-2 fw-semibold"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default EventCard;