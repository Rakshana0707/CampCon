import { useParams, Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaUsers,
    FaArrowLeft,
    FaShareAlt,
    FaCheck,
    FaQrcode,
    FaShieldAlt,
    FaAward,
    FaHeart,
    FaBuilding,
    FaGlobe,
    FaEnvelope,
    FaUserTie
} from "react-icons/fa";

import { getFallbackImage } from "../utils/helpers";

function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, currentUser, registerForEvent, cancelEventRegistration, bookmarks, toggleSaveEvent, showToast, registrations } = useContext(AppContext);

    const [showTicket, setShowTicket] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [externalCollege, setExternalCollege] = useState("");
    const [institutionDetails, setInstitutionDetails] = useState("");

    const event = events.find(
        (item) => item.id === Number(id)
    );

    if (!event) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
                <div className="glass-panel p-5 max-width-600 mx-auto mt-5">
                    <h2 className="text-white mb-3">Event Not Found</h2>
                    <p className="text-muted">The event you are looking for does not exist or has been removed.</p>
                    <Link to="/events" className="btn btn-primary mt-3">
                        <FaArrowLeft className="me-2" /> Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    // Organizing entity & meta
    const isInterCollege = event.eventType === "INTER_COLLEGE";
    const organizingEntity = event.organizerEntity;
    const organizerEntityName = event.organizingEntityName || organizingEntity?.name || event.department || "Official College Entity";
    const organizerType = organizingEntity?.type || "DEPARTMENT";
    const organizerDescription = organizingEntity?.description || "";
    const contactPerson = event.contactPerson || organizingEntity?.contactPerson || event.coordinatorName || "Event Coordinator";
    const contactEmail = event.contactEmail || organizingEntity?.contactEmail || event.organizerEmail || "";
    const eligibleParticipants = event.eligibleParticipants || (isInterCollege ? "Inter-College Students" : "Our College Students Only");

    const description = event.description || "No description provided for this event. Stay tuned for more details!";
    const rules = event.rules || [
        isInterCollege ? "Bring your respective College ID card." : "Bring your official College ID card.",
        "Follow event guidelines and code of conduct.",
        "Attend on time at the specified venue."
    ];
    const coordinatorName = event.coordinatorName || contactPerson;
    const coordinatorContact = event.coordinatorContact || "+91 99999 99999";
    const prizeDetails = event.prizeDetails || "Certificates of participation & prize accolades.";
    const deadline = event.deadline || event.date;
    const requiresApproval = event.requiresApproval || false;

    // Registration and Bookmark checks
    const isBookmarked = bookmarks?.includes(event.id);
    const isStudent = currentUser && currentUser.role === "Student";
    const isRegistered = currentUser && registrations?.some(r => r.studentId === currentUser.id && r.eventId === event.id && r.status !== "Cancelled" && r.status !== "Rejected");
    const isSoldOut = event.seats <= 0;

    const isDeadlinePassed = (() => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(23, 59, 59, 999);
        return new Date() > deadlineDate;
    })();

    const [isProcessing, setIsProcessing] = useState(false);

    // Eligibility status
    const isInternalStudent = currentUser?.affiliationStatus === "INTERNAL_VERIFIED" || currentUser?.role === "Admin" || currentUser?.role === "Organizer";
    const isExternalStudent = currentUser?.affiliationStatus === "EXTERNAL";
    const isUnverifiedStudent = currentUser?.affiliationStatus === "UNVERIFIED";

    const handleRegisterClick = async () => {
        if (!currentUser) {
            showToast("Please log in to register", "warning");
            navigate("/login");
            return;
        }

        if (isRegistered) {
            // Cancel registration
            setIsProcessing(true);
            await cancelEventRegistration(event.id);
            setIsProcessing(false);
            return;
        }

        // Intra-College Eligibility Checks
        if (!isInterCollege) {
            if (isExternalStudent) {
                showToast("This Intra-College event is exclusively for students of our college.", "error");
                return;
            }
            if (isUnverifiedStudent) {
                showToast("Your institutional affiliation is unverified. Please verify your profile to register.", "warning");
                return;
            }
        }

        // Inter-College events:
        // External students (or students without verified internal profile) must provide institution details
        if (isInterCollege && (isExternalStudent || !isInternalStudent)) {
            setExternalCollege(currentUser.collegeName && currentUser.collegeName !== "Our College" ? currentUser.collegeName : "");
            setShowRegisterModal(true);
            return;
        }

        // Internal Verified Student registration
        setIsProcessing(true);
        const success = await registerForEvent(event.id, "Participant", {
            participantCollege: currentUser.collegeName || "Our College",
            institutionDetails: currentUser.department || ""
        });
        if (success) {
            setShowTicket(true);
        }
        setIsProcessing(false);
    };

    const handleConfirmRegistration = async (e) => {
        e.preventDefault();
        if (!externalCollege.trim()) {
            showToast("Please specify your college or institution name.", "warning");
            return;
        }
        setIsProcessing(true);
        const success = await registerForEvent(event.id, "Participant", {
            participantCollege: externalCollege.trim(),
            institutionDetails: institutionDetails.trim()
        });
        setIsProcessing(false);
        if (success) {
            setShowRegisterModal(false);
            setShowTicket(true);
        }
    };

    const handleShareClick = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast("Event link copied to clipboard!", "info");
    };

    return (
        <div className="container py-5" style={{ minHeight: "80vh" }}>
            {/* Breadcrumb Navigation */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb mb-0 bg-transparent p-0 fs-8 fw-semibold">
                    <li className="breadcrumb-item">
                        <Link to="/" className="text-muted text-decoration-none">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/events" className="text-muted text-decoration-none">Discover Events</Link>
                    </li>
                    <li className="breadcrumb-item active text-white text-truncate" aria-current="page">
                        {event.title}
                    </li>
                </ol>
            </nav>

            <div className="row g-5">
                {/* Event Image and Primary Info */}
                <div className="col-lg-8">
                    <div className="position-relative mb-4">
                        <img
                            src={event.image || getFallbackImage(event.category)}
                            className="img-fluid w-100 rounded-4 shadow-lg"
                            alt={event.title}
                            style={{ height: "400px", objectFit: "cover" }}
                        />
                        <div className="position-absolute bottom-3 left-3 m-3 d-flex gap-2 flex-wrap">
                            <span className="badge bg-primary text-white px-3 py-2 fs-6 shadow">
                                {event.category}
                            </span>
                            <span className={`badge px-3 py-2 fs-6 shadow ${isInterCollege ? 'bg-info text-dark fw-bold' : 'bg-dark text-white border border-secondary'}`}>
                                {isInterCollege ? "🌐 Inter-College Event" : "🏛️ Intra-College Event"}
                            </span>
                        </div>
                    </div>

                    <h1 className="fw-extrabold text-white mb-3" style={{ fontSize: "2.6rem", fontFamily: "var(--font-heading)" }}>
                        {event.title}
                    </h1>

                    {/* Organizing Entity Banner & Link */}
                    <div className="p-3 rounded-3 mb-4 bg-dark bg-opacity-60 border border-secondary d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 rounded-circle bg-primary bg-opacity-20 text-primary">
                                <FaBuilding className="fs-4" />
                            </div>
                            <div>
                                <span className="text-muted fs-8 text-uppercase tracking-wider d-block">Organized by Official {organizerType === 'CLUB' ? 'Club' : 'Department'}</span>
                                <h5 className="text-white mb-0 fw-bold">{organizerEntityName}</h5>
                                {organizerDescription && (
                                    <small className="text-muted d-block mt-1">{organizerDescription}</small>
                                )}
                            </div>
                        </div>

                        {organizingEntity && (
                            <Link to={`/organizers/${organizingEntity.id}`} className="btn btn-outline-primary btn-sm px-3">
                                View Profile & Events →
                            </Link>
                        )}
                    </div>

                    {/* Stats Icons Bar */}
                    <div className="row g-3 mb-4 text-center">
                        <div className="col-6 col-md-3">
                            <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary">
                                <FaCalendarAlt className="fs-4 text-primary mb-2" />
                                <span className="d-block text-muted fs-8 text-uppercase">Date</span>
                                <strong className="text-white fs-7">{event.date}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary">
                                <FaClock className="fs-4 text-success mb-2" />
                                <span className="d-block text-muted fs-8 text-uppercase">Time</span>
                                <strong className="text-white fs-7">{event.time}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary">
                                <FaMapMarkerAlt className="fs-4 text-danger mb-2" />
                                <span className="d-block text-muted fs-8 text-uppercase">Venue</span>
                                <strong className="text-white fs-7 text-truncate d-block">{event.venue}</strong>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary">
                                <FaUsers className="fs-4 text-warning mb-2" />
                                <span className="d-block text-muted fs-8 text-uppercase">Seats Left</span>
                                <strong className="text-white fs-7">{event.seats}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility & External Participation Card */}
                    <div className="p-3 rounded-4 mb-4 border d-flex align-items-center gap-3" style={{ background: "rgba(30, 41, 59, 0.4)", borderColor: "var(--glass-border)" }}>
                        <div className="p-3 rounded-circle bg-info bg-opacity-20 text-info">
                            <FaGlobe className="fs-4" />
                        </div>
                        <div>
                            <span className="text-muted d-block fs-8 text-uppercase tracking-wider">Participant Eligibility</span>
                            <strong className="text-white fs-6 d-block">{eligibleParticipants}</strong>
                            <small className="text-muted">
                                {isInterCollege 
                                    ? (event.externalParticipationAllowed ? "✓ External students from other universities welcome" : "⚠️ Limited to in-college participants by coordinator")
                                    : "✓ Exclusive to students within our institution"}
                            </small>
                        </div>
                    </div>

                    {/* Prize Highlights */}
                    <div className="p-3 rounded-4 mb-4 border d-flex align-items-center gap-3" style={{ background: "rgba(99, 102, 241, 0.08)", borderColor: "rgba(99, 102, 241, 0.15)" }}>
                        <div className="bg-warning bg-opacity-20 text-warning p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                            <FaAward className="fs-4" />
                        </div>
                        <div>
                            <span className="text-muted d-block fs-8 text-uppercase tracking-wider">Prizes & Certification</span>
                            <strong className="text-white fs-6">{prizeDetails}</strong>
                        </div>
                    </div>

                    <h3 className="text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>About Event</h3>
                    <p className="text-muted leading-relaxed mb-5" style={{ fontSize: "1.05rem" }}>
                        {description}
                    </p>

                    <h3 className="text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>Rules & Guidelines</h3>
                    <ul className="list-group list-group-flush bg-transparent border-0 mb-5">
                        {rules.map((rule, index) => (
                            <li key={index} className="list-group-item bg-transparent text-muted border-0 ps-0 d-flex align-items-start gap-2 fs-6">
                                <span className="text-primary mt-1">•</span>
                                <span>{rule}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sidebar Register Card */}
                <div className="col-lg-4">
                    <div className="glass-panel p-4 sticky-top" style={{ top: "100px", zIndex: 10 }}>
                        <h4 className="text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>Registration Details</h4>
                        
                        <div className="mb-3">
                            <span className="text-muted d-block fs-8">Organized by</span>
                            <span className="text-white fw-bold fs-6">{organizerEntityName}</span>
                            {organizingEntity && (
                                <Link to={`/organizers/${organizingEntity.id}`} className="text-primary fs-8 text-decoration-none d-block mt-1">
                                    View official profile →
                                </Link>
                            )}
                        </div>

                        <div className="mb-3">
                            <span className="text-muted d-block fs-8">Classification</span>
                            <span className={`badge ${isInterCollege ? 'bg-info text-dark' : 'bg-primary text-white'}`}>
                                {isInterCollege ? 'Inter-College Event' : 'Intra-College Event'}
                            </span>
                        </div>

                        <hr className="border-secondary my-3" />

                        <div className="mb-3">
                            <span className="text-muted d-block fs-8">Registration Deadline</span>
                            <span className="text-danger fw-bold fs-7 d-flex align-items-center gap-2">
                                <FaClock /> {deadline}
                            </span>
                        </div>

                        <div className="mb-3">
                            <span className="text-muted d-block fs-8">Authorized Contact</span>
                            <span className="text-white fw-semibold fs-7 d-block">{contactPerson}</span>
                            {contactEmail && (
                                <span className="text-muted fs-8 d-flex align-items-center gap-1 mt-1">
                                    <FaEnvelope size={10} /> {contactEmail}
                                </span>
                            )}
                        </div>

                        <hr className="border-secondary my-3" />

                        <div className="mb-4 d-flex justify-content-between align-items-center">
                            <span className="text-muted">Tickets</span>
                            <span className="text-success fw-extrabold fs-4">FREE</span>
                        </div>

                        {requiresApproval && (
                            <div className="alert alert-info py-2 px-3 fs-8 mb-3 border-0 bg-info bg-opacity-10 text-info rounded-3">
                                ℹ️ Registration requires organizer review and approval.
                            </div>
                        )}

                        {/* Eligibility Warning for Ineligible Students */}
                        {!isInterCollege && isExternalStudent && (
                            <div className="alert alert-warning py-2 px-3 fs-8 mb-3 border-0 bg-warning bg-opacity-10 text-warning rounded-3">
                                ⚠️ <strong>Eligibility Notice:</strong> Intra-College events are strictly restricted to students belonging to our college.
                            </div>
                        )}

                        {!isInterCollege && isUnverifiedStudent && (
                            <div className="alert alert-warning py-2 px-3 fs-8 mb-3 border-0 bg-warning bg-opacity-10 text-warning rounded-3">
                                ⚠️ <strong>Verification Required:</strong> Your institutional affiliation is pending verification by administration.
                            </div>
                        )}

                        {/* Register Action Buttons */}
                        {currentUser && !isStudent ? (
                            <button className="btn btn-outline-light w-100 py-3 mb-3 fw-bold disabled" style={{ cursor: "not-allowed" }}>
                                <FaShieldAlt className="me-2" /> For Students Only
                            </button>
                        ) : (
                            <button
                                className={`btn w-100 py-3 mb-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 ${
                                    isRegistered
                                        ? "btn-success"
                                        : (!isInterCollege && (isExternalStudent || isUnverifiedStudent))
                                        ? "btn-outline-secondary disabled"
                                        : isDeadlinePassed
                                        ? "btn-secondary disabled"
                                        : isSoldOut
                                        ? "btn-secondary disabled"
                                        : "btn-primary"
                                }`}
                                onClick={handleRegisterClick}
                                disabled={((isSoldOut || isDeadlinePassed || (!isInterCollege && (isExternalStudent || isUnverifiedStudent))) && !isRegistered) || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : isRegistered ? (
                                    <>
                                        <FaCheck /> Registered (Click to Cancel)
                                    </>
                                ) : (!isInterCollege && isExternalStudent) ? (
                                    "Ineligible (External College)"
                                ) : (!isInterCollege && isUnverifiedStudent) ? (
                                    "Affiliation Unverified"
                                ) : isDeadlinePassed ? (
                                    "Registration Closed"
                                ) : isSoldOut ? (
                                    "Sold Out"
                                ) : (
                                    "Register Now"
                                )}
                            </button>
                        )}

                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-outline-light w-50 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 fs-7"
                                onClick={handleShareClick}
                            >
                                <FaShareAlt /> Share
                            </button>
                            <button 
                                className={`btn w-50 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 fs-7 ${isBookmarked ? 'btn-danger' : 'btn-outline-light'}`}
                                onClick={() => toggleSaveEvent(event.id)}
                            >
                                <FaHeart /> {isBookmarked ? "Saved" : "Save"}
                            </button>
                        </div>

                        {isRegistered && (
                            <button
                                className="btn btn-link text-primary w-100 mt-3 text-center fw-semibold text-decoration-none"
                                onClick={() => setShowTicket(true)}
                            >
                                View Entry Ticket
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Inter-College Registration Modal for External Students */}
            {showRegisterModal && (
                <div 
                    className="modal fade show d-block" 
                    tabIndex="-1" 
                    style={{ background: "rgba(0, 0, 0, 0.8)", zIndex: 1050 }}
                    role="dialog"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-dark text-white border border-secondary shadow-lg rounded-4">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title fw-bold">Inter-College Event Registration</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRegisterModal(false)}></button>
                            </div>
                            <form onSubmit={handleConfirmRegistration}>
                                <div className="modal-body">
                                    <p className="text-muted fs-7 mb-3">
                                        This is an Inter-College event. Please confirm your institution details to secure your seat.
                                    </p>

                                    <div className="mb-3">
                                        <label className="form-label text-muted fs-8 text-uppercase">Your College / Institution Name <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="e.g. PSG College of Technology / Our College"
                                            value={externalCollege}
                                            onChange={(e) => setExternalCollege(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-muted fs-8 text-uppercase">Department / Roll Number / Degree</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="e.g. B.Tech IT / 22IT045"
                                            value={institutionDetails}
                                            onChange={(e) => setInstitutionDetails(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowRegisterModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                                        {isProcessing ? "Confirming..." : "Confirm & Register"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Modal Overlay */}
            {showTicket && (
                <div 
                    className="modal fade show d-block" 
                    tabIndex="-1" 
                    style={{ background: "rgba(0, 0, 0, 0.8)", zIndex: 1050 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ticket-modal-title"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-transparent border-0">
                            <div className="ticket-wrapper">
                                <div className="ticket-header">
                                    <h3 id="ticket-modal-title" className="mb-1 text-white fw-bold">EVENT TICKET</h3>
                                    <span className="badge bg-dark bg-opacity-30 border border-white border-opacity-30">{event.category}</span>
                                </div>
                                <div className="ticket-body">
                                    <h4 className="text-white text-center mb-4 fw-extrabold">{event.title}</h4>
                                    
                                    <div className="row g-3 mb-4 text-white text-opacity-80">
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-8 text-uppercase">Attendee</span>
                                            <strong>{currentUser?.name || "Student"}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-8 text-uppercase">Organized By</span>
                                            <strong className="text-truncate d-block">{organizerEntityName}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-8 text-uppercase">Date & Time</span>
                                            <strong>{event.date}<br />{event.time}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-8 text-uppercase">Venue</span>
                                            <strong>{event.venue}</strong>
                                        </div>
                                    </div>

                                    <div className="ticket-divider"></div>

                                    <div className="text-center mt-3">
                                        <span className="text-muted d-block fs-8 text-uppercase mb-2">Scan Code at Entrance</span>
                                        <div className="qrcode-mock">
                                            <FaQrcode size={100} className="text-dark" />
                                        </div>
                                        <small className="text-muted d-block mt-3">Ticket ID: CC-{event.id}-{currentUser?.id || 99}</small>
                                    </div>
                                </div>
                                <div className="p-3 bg-dark bg-opacity-50 text-center border-top border-secondary">
                                    <button 
                                        className="btn btn-primary btn-sm px-4"
                                        onClick={() => setShowTicket(false)}
                                    >
                                        Close Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventDetails;