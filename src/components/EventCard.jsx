import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaHeart,
    FaBuilding
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

    const isInterCollege = event.eventType === "INTER_COLLEGE";
    const dateFormatted = event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
    const organizerName = event.organizingEntityName || event.department || "Campus Organization";

    // Lifecycle badge status
    const now = new Date();
    const startDate = new Date(event.rawDate || event.date);
    const endDate = new Date(event.rawEndDate || event.endDate || event.date);
    const isOngoing = startDate <= now && now <= endDate;
    const isEnded = now > endDate;
    const regOpens = event.rawInternalRegOpensAt || event.internalRegOpensAt;
    const isRegUpcoming = regOpens && now < new Date(regOpens);
    const isDeadlinePassed = event.deadline && now > new Date(event.rawDeadline || event.deadline);

    return (
        <div className="col-lg-4 col-md-6 mb-4">
            <Link to={`/events/${event.id}`} className="text-decoration-none">
                <div className="event-card">
                    <div className="event-image">
                        <img
                            src={event.image || getFallbackImage(event.category)}
                            alt={`${event.title} artwork`}
                            loading="lazy"
                        />

                        {/* Top Badges */}
                        <div className="position-absolute top-0 start-0 m-2 d-flex gap-1 flex-wrap">
                            <span className={isInterCollege ? "badge-inter" : "badge-intra"}>
                                {isInterCollege ? "🌐 Inter" : "🏛️ Intra"}
                            </span>
                            {event.eventFormat === "SYMPOSIUM" && (
                                <span className="badge-symposium">
                                    ★ Symposium
                                </span>
                            )}
                        </div>

                        <button 
                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                            onClick={toggleFavorite}
                            title="Save Event"
                            aria-label={isFavorite ? "Remove from Favorites" : "Save Event"}
                        >
                            <FaHeart style={{ fill: isFavorite ? '#ef4444' : 'currentColor' }} size={13} />
                        </button>
                    </div>

                    <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="text-uppercase tracking-wider fw-bold fs-9" style={{ color: "var(--accent-cobalt)" }}>
                                    {event.category}
                                </span>
                                {isOngoing ? (
                                    <span className="badge bg-success bg-opacity-10 text-success fs-9 border border-success border-opacity-25">
                                        ● Live
                                    </span>
                                ) : isEnded ? (
                                    <span className="badge bg-secondary bg-opacity-20 text-muted fs-9">
                                        Completed
                                    </span>
                                ) : isRegUpcoming ? (
                                    <span className="badge bg-warning bg-opacity-10 text-warning fs-9">
                                        Opens Soon
                                    </span>
                                ) : isDeadlinePassed || event.seats <= 0 ? (
                                    <span className="badge bg-danger bg-opacity-10 text-danger fs-9">
                                        Closed
                                    </span>
                                ) : (
                                    <span className="badge bg-success bg-opacity-10 text-success fs-9">
                                        Open
                                    </span>
                                )}
                            </div>

                            <h5 className="serif-heading mb-2 fs-6 text-truncate-2" style={{ minHeight: "2.5rem", lineHeight: 1.25 }}>
                                {event.title}
                            </h5>

                            <div className="d-flex flex-column gap-1 text-muted fs-8 mb-3">
                                <div className="d-flex align-items-center gap-1 text-truncate">
                                    <FaCalendarAlt size={10} className="text-secondary" />
                                    <span>{dateFormatted} {event.time ? `• ${event.time}` : ""}</span>
                                </div>
                                <div className="d-flex align-items-center gap-1 text-truncate">
                                    <FaMapMarkerAlt size={10} className="text-secondary" />
                                    <span className="text-truncate">{event.venue || "Campus Venue"}</span>
                                </div>
                                <div className="d-flex align-items-center gap-1 text-truncate">
                                    <FaBuilding size={10} className="text-secondary" />
                                    <span className="text-truncate">{organizerName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-2 border-top fs-8 text-muted" style={{ borderColor: "var(--border-editorial)" }}>
                            <span>{event.seats > 0 ? `${event.seats} seats` : "Sold Out"}</span>
                            <span className="fw-semibold text-primary">Details →</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default EventCard;