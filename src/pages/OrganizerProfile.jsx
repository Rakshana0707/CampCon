import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import EventCard from "../components/EventCard";
import { FaBuilding, FaArrowLeft, FaEnvelope, FaUserTie, FaCalendarAlt, FaCheckCircle, FaGlobe, FaUniversity } from "react-icons/fa";

function OrganizerProfile() {
    const { id } = useParams();
    const [organizer, setOrganizer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/organizers/${id}`);
                if (res.data.success) {
                    setOrganizer(res.data.organizer);
                }
            } catch (err) {
                console.error("Failed to load organizer profile", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: "70vh" }}>
                <div className="spinner-border text-primary my-5" role="status"></div>
                <p className="text-muted">Loading organizer profile...</p>
            </div>
        );
    }

    if (!organizer) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: "70vh" }}>
                <div className="glass-panel p-5 max-width-600 mx-auto mt-5">
                    <h3 className="text-white mb-3">Organizer Not Found</h3>
                    <p className="text-muted">This entity is not present in the verified official directory.</p>
                    <Link to="/organizers" className="btn btn-primary mt-3">
                        <FaArrowLeft className="me-2" /> Back to Organizer Directory
                    </Link>
                </div>
            </div>
        );
    }

    const upcomingEvents = organizer.upcomingEvents || [];
    const pastEvents = organizer.pastEvents || [];
    const isDept = organizer.type === "DEPARTMENT";

    return (
        <div className="container py-5" style={{ minHeight: "85vh" }}>
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb mb-0 bg-transparent p-0 fs-8 fw-semibold">
                    <li className="breadcrumb-item">
                        <Link to="/" className="text-muted text-decoration-none">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/organizers" className="text-muted text-decoration-none">Organizer Directory</Link>
                    </li>
                    <li className="breadcrumb-item active text-white" aria-current="page">
                        {organizer.name}
                    </li>
                </ol>
            </nav>

            {/* Profile Header Hero */}
            <div className="glass-panel p-4 p-md-5 mb-5 rounded-4 border border-secondary border-opacity-30 position-relative overflow-hidden">
                <div className="row align-items-center g-4">
                    <div className="col-md-2 text-center text-md-start">
                        <div className="p-4 rounded-4 bg-primary bg-opacity-20 text-primary d-inline-flex align-items-center justify-content-center" style={{ width: "90px", height: "90px" }}>
                            {isDept ? <FaUniversity size={42} /> : <FaBuilding size={42} />}
                        </div>
                    </div>

                    <div className="col-md-7 text-center text-md-start">
                        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2 flex-wrap">
                            <span className={`badge ${isDept ? 'bg-primary text-white' : 'bg-info text-dark fw-bold'} px-3 py-1 fs-7`}>
                                {isDept ? "🏛️ Official Academic Programme" : "🚩 Approved College Club"}
                            </span>
                            <span className="badge bg-secondary text-white px-3 py-1 fs-7">
                                {organizer.category || "General Unit"}
                            </span>
                            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-2 py-1 fs-8">
                                <FaCheckCircle className="me-1" /> Verified Entity
                            </span>
                        </div>

                        <h2 className="text-white fw-extrabold mb-2" style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem" }}>
                            {organizer.name}
                        </h2>

                        <p className="text-muted fs-6 mb-0">
                            {organizer.description || "Official entity of our college hosting technical symposiums, workshops, and student festivals."}
                        </p>
                    </div>

                    <div className="col-md-3 text-center text-md-end border-md-start border-secondary ps-md-4">
                        <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary text-start mb-2">
                            <span className="text-muted fs-8 d-block text-uppercase">Authorized Contact</span>
                            <span className="text-white fw-semibold fs-7 d-flex align-items-center gap-2 mt-1">
                                <FaUserTie className="text-primary" /> {organizer.contactPerson || "Faculty / Student In-charge"}
                            </span>
                            {organizer.contactEmail && (
                                <span className="text-muted fs-8 d-flex align-items-center gap-2 mt-1">
                                    <FaEnvelope size={10} /> {organizer.contactEmail}
                                </span>
                            )}
                        </div>

                        <div className="d-flex justify-content-between text-muted fs-8 px-1">
                            <span>Total Events: <strong className="text-white">{upcomingEvents.length + pastEvents.length}</strong></span>
                            <span>Upcoming: <strong className="text-success">{upcomingEvents.length}</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Filter Tabs */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h3 className="text-white fw-bold mb-0" style={{ fontFamily: "var(--font-heading)" }}>
                    Organized Events
                </h3>

                <div className="btn-group">
                    <button
                        className={`btn ${activeTab === "upcoming" ? "btn-primary" : "btn-outline-secondary text-light"}`}
                        onClick={() => setActiveTab("upcoming")}
                    >
                        Upcoming Events ({upcomingEvents.length})
                    </button>
                    <button
                        className={`btn ${activeTab === "past" ? "btn-primary" : "btn-outline-secondary text-light"}`}
                        onClick={() => setActiveTab("past")}
                    >
                        Past Events ({pastEvents.length})
                    </button>
                </div>
            </div>

            {/* Events Listing */}
            {activeTab === "upcoming" ? (
                upcomingEvents.length === 0 ? (
                    <div className="glass-panel p-5 text-center max-width-600 mx-auto">
                        <FaCalendarAlt size={45} className="text-secondary opacity-50 mb-3" />
                        <h4 className="text-white">No Upcoming Events</h4>
                        <p className="text-muted mb-3">This entity does not have any active upcoming events announced right now.</p>
                        <Link to="/events" className="btn btn-outline-primary btn-sm">
                            Explore All Campus Events
                        </Link>
                    </div>
                ) : (
                    <div className="row">
                        {upcomingEvents.map(evt => (
                            <EventCard key={evt.id} event={evt} />
                        ))}
                    </div>
                )
            ) : (
                pastEvents.length === 0 ? (
                    <div className="glass-panel p-5 text-center max-width-600 mx-auto">
                        <FaCalendarAlt size={45} className="text-secondary opacity-50 mb-3" />
                        <h4 className="text-white">No Past Events</h4>
                        <p className="text-muted">No completed events recorded for this entity yet.</p>
                    </div>
                ) : (
                    <div className="row">
                        {pastEvents.map(evt => (
                            <EventCard key={evt.id} event={evt} />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

export default OrganizerProfile;
