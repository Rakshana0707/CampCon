import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import CategoryCard from "../components/CategoryCard";
import StatsCard from "../components/StatsCard";
import { FaArrowRight, FaCheckCircle, FaUsers, FaCalendarAlt, FaStar } from "react-icons/fa";

function Home() {
    const { events } = useContext(AppContext);
    const navigate = useNavigate();

    // Filter to trending events (or fallback to first 4 if none are marked trending)
    const trendingEvents = events.filter(e => e.trending).slice(0, 4);
    const displayEvents = trendingEvents.length ? trendingEvents : events.slice(0, 4);

    const handleCategoryClick = (category) => {
        navigate("/events", { state: { selectedCategory: category } });
    };

    return (
        <>
            <Hero />

            {/* Featured Events */}
            <section className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <span className="text-primary fw-bold text-uppercase tracking-wider fs-7">
                            Handpicked for you
                        </span>
                        <h2 className="fw-extrabold text-white mt-1 mb-0" style={{ fontSize: "2.2rem" }}>
                            Trending Events
                        </h2>
                    </div>
                    <Link to="/events" className="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
                        View All Events <FaArrowRight size={12} />
                    </Link>
                </div>

                <div className="row">
                    {displayEvents.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                        />
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section className="bg-light py-5" style={{ background: "rgba(16, 27, 51, 0.4)", borderTop: "1px solid rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="text-primary fw-bold text-uppercase tracking-wider fs-7">
                            Structured exploration
                        </span>
                        <h2 className="fw-extrabold text-white mt-1 mb-0" style={{ fontSize: "2.2rem" }}>
                            Browse By Category
                        </h2>
                    </div>

                    <div className="row">
                        <CategoryCard
                            title="Technical"
                            icon="Technical"
                            onClick={() => handleCategoryClick("Technical")}
                        />
                        <CategoryCard
                            title="Cultural"
                            icon="Cultural"
                            onClick={() => handleCategoryClick("Cultural")}
                        />
                        <CategoryCard
                            title="Sports"
                            icon="Sports"
                            onClick={() => handleCategoryClick("Sports")}
                        />
                        <CategoryCard
                            title="Workshop"
                            icon="Workshop"
                            onClick={() => handleCategoryClick("Workshop")}
                        />
                    </div>
                </div>
            </section>

            {/* Statistics */}
            <section className="container py-5">
                <div className="text-center mb-5">
                    <span className="text-primary fw-bold text-uppercase tracking-wider fs-7">
                        Our scale & impact
                    </span>
                    <h2 className="fw-extrabold text-white mt-1 mb-0" style={{ fontSize: "2.2rem" }}>
                        Campus Highlights
                    </h2>
                </div>

                <div className="row">
                    <StatsCard
                        number="150+"
                        title="Events Conducted"
                    />
                    <StatsCard
                        number="5,000+"
                        title="Students Connected"
                    />
                    <StatsCard
                        number="40+"
                        title="Student Clubs"
                    />
                    <StatsCard
                        number="98%"
                        title="Student Satisfaction"
                    />
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="why-section">
                <div className="container">
                    <div className="row align-items-center gap-lg-5">
                        <div className="col-lg-5 mb-4 mb-lg-0">
                            <span className="text-primary fw-bold text-uppercase tracking-wider fs-7">
                                Key Benefits
                            </span>
                            <h2 className="fw-extrabold text-white mt-1 mb-3" style={{ fontSize: "2.5rem" }}>
                                Why CampusConnect?
                            </h2>
                            <p className="lead text-muted mb-4">
                                Experience a seamless campus ecosystem designed to keep you updated, integrated, and inspired.
                            </p>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-3">
                                    <FaCheckCircle className="text-success mt-1 fs-5" />
                                    <div>
                                        <h5 className="text-white mb-1">Instant Registrations</h5>
                                        <p className="text-muted mb-0">Book your slot with a single click and access digital entry codes instantly.</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <FaCheckCircle className="text-success mt-1 fs-5" />
                                    <div>
                                        <h5 className="text-white mb-1">Analytics for Organizers</h5>
                                        <p className="text-muted mb-0">Keep track of participant registration, ticket revenue, and workshop preferences.</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <FaCheckCircle className="text-success mt-1 fs-5" />
                                    <div>
                                        <h5 className="text-white mb-1">Role-Based Experience</h5>
                                        <p className="text-muted mb-0">Custom control dashboards for Students, Organizers, and College Admins.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="position-relative p-4 rounded-4 border border-secondary" style={{ background: "rgba(30,41,59,0.3)" }}>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-primary bg-opacity-25 p-3 rounded-circle text-primary">
                                        <FaCalendarAlt size={30} />
                                    </div>
                                    <div>
                                        <h4 className="text-white mb-0">12 Active Events</h4>
                                        <p className="text-muted mb-0">Happening this month</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-success bg-opacity-25 p-3 rounded-circle text-success">
                                        <FaUsers size={30} />
                                    </div>
                                    <div>
                                        <h4 className="text-white mb-0">2,400+ registrations</h4>
                                        <p className="text-muted mb-0">In the last 30 days</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-warning bg-opacity-25 p-3 rounded-circle text-warning">
                                        <FaStar size={30} />
                                    </div>
                                    <div>
                                        <h4 className="text-white mb-0">4.9 Star Rating</h4>
                                        <p className="text-muted mb-0">From participant feedback</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container my-5">
                <div className="cta-section text-center">
                    <h2 className="display-5 fw-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                        Ready to Join Your Next Event?
                    </h2>
                    <p className="mt-3 text-white text-opacity-80 fs-5 max-width-600 mx-auto">
                        Explore technical, cultural, and sports events happening across campus and level up your skills.
                    </p>
                    <Link
                        to="/events"
                        className="btn btn-warning btn-lg mt-3 px-5 py-3 fw-bold"
                    >
                        Explore All Events
                    </Link>
                </div>
            </section>
        </>
    );
}

export default Home;