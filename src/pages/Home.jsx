import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import { FaArrowRight, FaFeatherAlt, FaBookmark, FaUniversity, FaAward } from "react-icons/fa";

function Home() {
    const { events } = useContext(AppContext);

    // Pick a featured event: prioritize an active symposium or trending event, or the latest event
    const featuredEvent = events.find(e => e.eventFormat === "SYMPOSIUM" || e.trending) || events[0] || null;

    // Upcoming events excluding the featured one to avoid duplicate card right beneath it
    const remainingEvents = featuredEvent ? events.filter(e => e.id !== featuredEvent.id) : events;
    const upcomingEvents = remainingEvents.slice(0, 8);

    return (
        <div>
            {/* Editorial Hero with Magazine Composition */}
            <Hero featuredEvent={featuredEvent} />

            {/* Upcoming Stories & Events Section */}
            <section className="container py-5">
                <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2 pb-3 border-bottom" style={{ borderColor: "var(--border-editorial)" }}>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="editorial-meta-tag mb-0">Campus Calendar</span>
                            <span className="editorial-annotation">This Season</span>
                        </div>
                        <h2 className="serif-heading mb-0 mt-1" style={{ fontSize: "2.1rem" }}>
                            Upcoming Chapters & Events
                        </h2>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <Link to="/events" className="btn btn-editorial-secondary btn-sm px-3 py-2 d-flex align-items-center gap-2">
                            View Full Index <FaArrowRight size={11} />
                        </Link>
                    </div>
                </div>

                {/* Event Cards Grid */}
                {upcomingEvents.length === 0 ? (
                    <div className="editorial-panel p-5 text-center my-4">
                        <FaFeatherAlt size={32} className="text-muted mb-3" />
                        <h4 className="serif-heading">No Upcoming Events Published Yet</h4>
                        <p className="text-muted fs-7 max-width-600 mx-auto">
                            The student journal is being prepared for upcoming events. Organizers can publish new official events.
                        </p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {upcomingEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </section>

            {/* Editorial Featurette: Curated campus departments & organizations */}
            <section className="py-5" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-editorial)", borderBottom: "1px solid var(--border-editorial)" }}>
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-5">
                            <span className="editorial-meta-tag">Official Directory</span>
                            <h2 className="serif-heading mb-3" style={{ fontSize: "2.3rem" }}>
                                Authored by official academic departments and student societies.
                            </h2>
                            <p className="text-muted fs-7 mb-4" style={{ lineHeight: 1.7 }}>
                                Every symposium and competition on CampusConnect is authenticated through verified organizer credentials, guaranteeing official college endorsement, certificate verification, and institutional merit.
                            </p>
                            <Link to="/organizers" className="btn btn-editorial-primary px-4 py-2">
                                Explore Department Directory →
                            </Link>
                        </div>

                        <div className="col-lg-7">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="editorial-card p-4 h-100">
                                        <div className="p-2 rounded-2 bg-primary bg-opacity-10 text-primary d-inline-block mb-3" style={{ width: "fit-content" }}>
                                            <FaUniversity size={20} />
                                        </div>
                                        <h5 className="serif-heading fs-6 mb-2">Academic Departments</h5>
                                        <p className="text-muted fs-8 mb-0">
                                            Chemical Engineering, EEE, Information Technology, Computer Science, and institutional centres.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="editorial-card p-4 h-100">
                                        <div className="p-2 rounded-2 bg-warning bg-opacity-10 text-warning d-inline-block mb-3" style={{ width: "fit-content" }}>
                                            <FaAward size={20} />
                                        </div>
                                        <h5 className="serif-heading fs-6 mb-2">Dedicated Symposiums</h5>
                                        <p className="text-muted fs-8 mb-0">
                                            Multi-track parent events including CHEMOVISTA, Cryptera, ELECT-ERA, and NEXERA.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="editorial-card p-4 h-100">
                                        <div className="p-2 rounded-2 bg-info bg-opacity-10 text-info d-inline-block mb-3" style={{ width: "fit-content" }}>
                                            <FaBookmark size={20} />
                                        </div>
                                        <h5 className="serif-heading fs-6 mb-2">Student Societies & Clubs</h5>
                                        <p className="text-muted fs-8 mb-0">
                                            Coding clubs, robotics leagues, cultural syndicates, and sports boards.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="editorial-card p-4 h-100">
                                        <div className="p-2 rounded-2 bg-success bg-opacity-10 text-success d-inline-block mb-3" style={{ width: "fit-content" }}>
                                            <FaFeatherAlt size={20} />
                                        </div>
                                        <h5 className="serif-heading fs-6 mb-2">Verified Certificates</h5>
                                        <p className="text-muted fs-8 mb-0">
                                            Cryptographically generated participation badges and verified attendance records.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;