import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaBuilding, FaArrowRight } from "react-icons/fa";
import { getFallbackImage } from "../utils/helpers";

function Hero({ featuredEvent }) {
    if (!featuredEvent) {
        return (
            <section className="editorial-hero-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <span className="editorial-meta-tag">The Campus Gazette • Volume IV</span>
                            <h1 className="editorial-hero-title">
                                A campus full of stories.
                            </h1>
                            <p className="editorial-hero-sub">
                                An independent journal of student innovation, multidisciplinary symposiums, cultural movements, and technical championships.
                            </p>
                            <div className="d-flex align-items-center gap-3 mt-4">
                                <Link to="/events" className="btn btn-editorial-primary px-4 py-2">
                                    Explore Directory →
                                </Link>
                                <span className="editorial-annotation">Curated weekly by student editors</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const isInterCollege = featuredEvent.eventType === "INTER_COLLEGE";
    const eventImage = featuredEvent.image || getFallbackImage(featuredEvent.category, featuredEvent.id || featuredEvent.title);
    const dateFormatted = featuredEvent.date ? new Date(featuredEvent.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Upcoming";
    const organizerName = featuredEvent.organizingEntityName || featuredEvent.department || "Official College Entity";

    return (
        <section className="editorial-hero-section">
            <div className="container">
                {/* Hero Top Title & Editorial Header */}
                <div className="row align-items-end mb-4">
                    <div className="col-lg-8">
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <span className="editorial-meta-tag mb-0">The Campus Chronicle • Issue № 42</span>
                            <span className="editorial-annotation">Field Notes & Happenings</span>
                        </div>
                        <h1 className="editorial-hero-title mt-2">
                            A campus full of stories.
                        </h1>
                        <p className="editorial-hero-sub mb-0">
                            Discover extraordinary symposiums, hackathons, and cultural chapters authored by departments and clubs across the institution.
                        </p>
                    </div>
                    <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                        <Link to="/events" className="btn btn-editorial-secondary py-2 px-3">
                            Browse All Stories <FaArrowRight className="ms-1" size={11} />
                        </Link>
                    </div>
                </div>

                {/* Featured Event Panel — Magazine Layout */}
                <div className="featured-magazine-box mt-4">
                    <div className="row g-0 align-items-stretch">
                        {/* Event Artwork / Image with paper badge */}
                        <div className="col-lg-7 position-relative">
                            <img
                                src={eventImage}
                                alt={featuredEvent.title}
                                className="featured-magazine-image"
                                loading="lazy"
                            />
                            <div className="position-absolute top-0 start-0 m-3 d-flex gap-2 flex-wrap">
                                <span className={isInterCollege ? "badge-inter" : "badge-intra"}>
                                    {isInterCollege ? "🌐 Inter-College" : "🏛️ Intra-College"}
                                </span>
                                {featuredEvent.eventFormat === "SYMPOSIUM" && (
                                    <span className="badge-symposium">
                                        ★ SYMPOSIUM
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Event Editorial Details Column */}
                        <div className="col-lg-5 p-4 p-md-5 d-flex flex-column justify-content-between" style={{ background: "var(--bg-card)" }}>
                            <div>
                                <div className="d-flex align-items-center justify-content-between text-muted fs-8 mb-2">
                                    <span className="text-uppercase fw-bold tracking-wider" style={{ color: "var(--accent-cobalt)" }}>
                                        {featuredEvent.category} • Featured Dispatch
                                    </span>
                                    <span>{featuredEvent.seats} seats remaining</span>
                                </div>

                                <h2 className="serif-heading mb-3" style={{ fontSize: "2rem", lineHeight: 1.15 }}>
                                    {featuredEvent.title}
                                </h2>

                                <p className="text-muted fs-7 mb-4 line-clamp-3" style={{ lineHeight: 1.6 }}>
                                    {featuredEvent.description || "Join this landmark campus engagement bringing together participants for workshops, project showcases, and hands-on competitions."}
                                </p>

                                <div className="d-flex flex-column gap-2 text-muted fs-8 py-3 border-top border-bottom" style={{ borderColor: "var(--border-editorial)" }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaCalendarAlt className="text-secondary" />
                                        <span className="text-main fw-medium">{dateFormatted} {featuredEvent.time ? `at ${featuredEvent.time}` : ""}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaMapMarkerAlt className="text-secondary" />
                                        <span className="text-main fw-medium">{featuredEvent.venue || "Campus Grounds"}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaBuilding className="text-secondary" />
                                        <span className="text-main fw-medium">{organizerName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <Link
                                    to={`/events/${featuredEvent.id}`}
                                    className="btn btn-editorial-primary px-4 py-2 d-inline-flex align-items-center gap-2"
                                >
                                    Read Story & Register <FaArrowRight size={12} />
                                </Link>

                                <span className="fs-8 text-muted">
                                    Deadline: {featuredEvent.deadline || "Open"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;