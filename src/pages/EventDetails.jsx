import { useParams, Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import DistrictCollegeSelector from "../components/DistrictCollegeSelector";
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
import QRCode from "../components/QRCode";

function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, currentUser, registerForEvent, cancelEventRegistration, bookmarks, toggleSaveEvent, showToast, registrations } = useContext(AppContext);

    const [showTicket, setShowTicket] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [externalCollege, setExternalCollege] = useState("");
    const [institutionDetails, setInstitutionDetails] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    // Institution picker for external students on inter-college events
    const [externalInstitution, setExternalInstitution] = useState({
        state: "", district: "", institutionId: "", collegeName: ""
    });


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
    const rawEligible = event.eligibleParticipants || (isInterCollege ? "Inter-College Students" : "Coimbatore Institute of Technology Students Only");
    const eligibleParticipants = rawEligible === "Our College Students Only" ? "Coimbatore Institute of Technology Students Only" : rawEligible;

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
    const userRole = currentUser?.role?.toLowerCase();
    const isStudent = userRole === "student";
    const isRegistered = currentUser && registrations?.some(r => r.studentId === currentUser.id && r.eventId === event.id && r.status !== "Cancelled" && r.status !== "Rejected");
    const isSoldOut = event.seats <= 0;

    const now = new Date();

    const isDeadlinePassed = (() => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(23, 59, 59, 999);
        return now > deadlineDate;
    })();

    const isEventEnded = (() => {
        if (!event.rawEndDate && !event.endDate) return false;
        const end = new Date(event.rawEndDate || event.endDate);
        return now > end;
    })();

    const isOngoing = (() => {
        const start = new Date(event.rawDate || event.date);
        const end = new Date(event.rawEndDate || event.endDate || event.date);
        return start <= now && now <= end;
    })();

    // Eligibility status
    const isInternalStudent = currentUser?.affiliationStatus === "INTERNAL_VERIFIED" || userRole === "admin" || userRole === "organizer";
    const isExternalStudent = currentUser?.affiliationStatus === "EXTERNAL";
    const isUnverifiedStudent = currentUser?.affiliationStatus === "UNVERIFIED";

    // Institution category computation for external students
    const institutionCategory = (() => {
        const targetName = externalInstitution?.collegeName || currentUser?.institution?.name || currentUser?.collegeName || '';
        const targetType = currentUser?.institution?.institutionType || '';
        if (!targetName) return 'ENGINEERING';
        const name = targetName.toUpperCase();
        const type = targetType.toUpperCase();

        if (name.includes('POLYTECHNIC') || type.includes('DIPLOMA') || type.includes('POLYTECHNIC')) {
            return 'POLYTECHNIC';
        }
        if (
            name.includes('INDIAN INSTITUTE OF TECHNOLOGY') || name.includes('IIT ') ||
            name.includes('NATIONAL INSTITUTE OF TECHNOLOGY') || name.includes('NIT ') ||
            name.includes('ANNA UNIVERSITY') || name.includes('UNIVERSITY') ||
            type.includes('UNIVERSITY') || type.includes('INSTITUTE OF NATIONAL IMPORTANCE')
        ) {
            return 'UNIVERSITY';
        }
        if (
            name.includes('MANAGEMENT') || name.includes('BUSINESS') ||
            name.includes(' B-SCHOOL') || type.includes('MANAGEMENT')
        ) {
            return 'MANAGEMENT';
        }
        if (
            name.includes('ARTS') || name.includes('SCIENCE') ||
            name.includes('HUMANITIES') || type.includes('ARTS')
        ) {
            return 'ARTS_SCIENCE';
        }
        return 'ENGINEERING';
    })();

    const eventCatUpper = (event.category || '').toUpperCase();
    const isTechnicalEvent = eventCatUpper === 'TECHNICAL' || eventCatUpper === 'HACKATHON' || eventCatUpper === 'CODING';
    const isCulturalEvent = eventCatUpper === 'CULTURAL' || eventCatUpper === 'CULTURALS' || eventCatUpper === 'ARTS';

    // External students from Arts/Science, Management, Universities, or Polytechnic cannot register for Technical events
    const isExternalRestrictedForTechnical = isExternalStudent && isTechnicalEvent && (
        institutionCategory === 'ARTS_SCIENCE' ||
        institutionCategory === 'MANAGEMENT' ||
        institutionCategory === 'UNIVERSITY' ||
        institutionCategory === 'POLYTECHNIC'
    );

    // Opening schedule status
    const targetOpeningDate = isExternalStudent
        ? (event.rawExternalRegOpensAt || event.externalRegOpensAt || event.rawInternalRegOpensAt || event.internalRegOpensAt)
        : (event.rawInternalRegOpensAt || event.internalRegOpensAt);

    const isRegNotOpen = targetOpeningDate ? now < new Date(targetOpeningDate) : false;
    const openingDateLabel = targetOpeningDate ? new Date(targetOpeningDate).toLocaleString() : "";

    // Schedule Clash Detection with already registered events
    const clashingEvent = (() => {
        if (!currentUser || !registrations || isRegistered) return null;
        const thisStart = new Date(event.rawDate || event.date);
        const rawEnd = event.rawEndDate || event.endDate ? new Date(event.rawEndDate || event.endDate) : null;
        const thisEnd = (rawEnd && rawEnd > thisStart) ? rawEnd : new Date(thisStart.getTime() + 2 * 60 * 60 * 1000);

        const activeRegs = registrations.filter(
            r => r.studentId === currentUser.id && r.eventId !== event.id && r.status !== "Cancelled" && r.status !== "Rejected"
        );

        for (const reg of activeRegs) {
            const otherEvt = events.find(e => e.id === reg.eventId);
            if (!otherEvt) continue;
            const exStart = new Date(otherEvt.rawDate || otherEvt.date);
            const exRawEnd = otherEvt.rawEndDate || otherEvt.endDate ? new Date(otherEvt.rawEndDate || otherEvt.endDate) : null;
            const exEnd = (exRawEnd && exRawEnd > exStart) ? exRawEnd : new Date(exStart.getTime() + 2 * 60 * 60 * 1000);

            if (thisStart < exEnd && thisEnd > exStart) {
                return otherEvt;
            }
        }
        return null;
    })();

    const activeUserReg = registrations?.find(
        r => r.studentId === currentUser?.id && r.eventId === event.id && r.status !== "Cancelled" && r.status !== "Rejected"
    );

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

        if (clashingEvent) {
            showToast(`Schedule clash! You are already registered for "${clashingEvent.title}" during this time slot.`, "error");
            return;
        }

        // Intra-College Eligibility Checks
        if (!isInterCollege) {
            if (isExternalStudent) {
                showToast("This Intra-College event is exclusively for students of Coimbatore Institute of Technology.", "error");
                return;
            }
            if (isUnverifiedStudent) {
                showToast("Your institutional affiliation is unverified. Please verify your profile to register.", "warning");
                return;
            }
        }

        // Technical event restriction for external non-Engineering students
        if (isExternalRestrictedForTechnical) {
            showToast("Eligibility Notice: Technical events are restricted to Engineering college students. External students from Arts, Science, Management, or Universities may only register for Cultural events.", "error");
            return;
        }

        // Pre-populate college from verified profile
        const defaultCollege = (!currentUser.collegeName || currentUser.collegeName === "Our College" || currentUser.collegeName === "CIT")
            ? "Coimbatore Institute of Technology"
            : currentUser.collegeName;
        setExternalCollege(defaultCollege);
        setInstitutionDetails(currentUser.department ? `${currentUser.department}${currentUser.rollNumber ? ` • ${currentUser.rollNumber}` : ''}` : "");

        // Pre-populate institution selector from verified profile for external students
        if (isExternalStudent && currentUser.institution?.status === "APPROVED") {
            setExternalInstitution({
                state: currentUser.collegeState || currentUser.institution?.state || "",
                district: currentUser.collegeDistrict || currentUser.institution?.district || "",
                institutionId: String(currentUser.institutionId || currentUser.institution?.id || ""),
                collegeName: currentUser.collegeName || currentUser.institution?.name || ""
            });
        } else if (!isExternalStudent) {
            // Internal student: reset external picker
            setExternalInstitution({ state: "", district: "", institutionId: "", collegeName: "" });
        }

        setShowRegisterModal(true);
    };

    // Does this event + user combination require institution selection?
    const needsInstitutionPicker = isInterCollege && isExternalStudent && (
        !currentUser?.institution || currentUser?.institution?.status !== "APPROVED"
    );
    // Has the external user provided a valid institution (either from profile or picker)?
    const hasValidInstitution = isExternalStudent
        ? (currentUser?.institution?.status === "APPROVED" || externalInstitution.institutionId)
        : true;

    const handleConfirmRegistration = async (e) => {
        e.preventDefault();

        if (!externalCollege.trim()) {
            showToast("Please specify your college or institution name.", "warning");
            return;
        }

        // For external students on inter-college events, need valid institutionId
        if (isInterCollege && isExternalStudent) {
            const resolvedId = externalInstitution.institutionId || currentUser?.institutionId;
            if (!resolvedId) {
                showToast("Please select your institution from the directory.", "warning");
                return;
            }
        }

        setIsProcessing(true);

        // Build the extra payload
        const extraData = {
            participantCollege: externalCollege.trim(),
            institutionDetails: institutionDetails.trim()
        };

        // Attach institution fields for external students
        if (isExternalStudent) {
            const resolvedId = externalInstitution.institutionId || currentUser?.institutionId;
            const resolvedState = externalInstitution.state || currentUser?.collegeState;
            const resolvedDistrict = externalInstitution.district || currentUser?.collegeDistrict;
            if (resolvedId) {
                extraData.institutionId = parseInt(resolvedId, 10);
                extraData.participantState = resolvedState;
                extraData.participantDistrict = resolvedDistrict;
            }
        }

        const success = await registerForEvent(event.id, "Participant", extraData);
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

                    {/* If Symposium: Dedicated Multi-Day Activity Schedule */}
                    {event.eventFormat === "SYMPOSIUM" && (
                        <div className="mb-5 p-4 rounded-4 bg-dark bg-opacity-60 border border-warning border-opacity-30">
                            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                <div>
                                    <span className="badge bg-warning text-dark fw-bold px-2 py-1 mb-1">🏛️ DEDICATED SYMPOSIUM SCHEDULE</span>
                                    <h3 className="text-white mb-0 fw-bold">Day-Wise Activities & Tracks</h3>
                                    <small className="text-muted">Explore multi-track activities, venues, seats, and register for individual events.</small>
                                </div>
                                <span className="badge bg-secondary text-white px-3 py-2 fs-7">
                                    {event.numberOfDays || 1} Day{(event.numberOfDays || 1) > 1 ? 's' : ''} Duration
                                </span>
                            </div>

                            {/* Day Tabs */}
                            {(() => {
                                const totalDays = Math.max(1, event.numberOfDays || 1);
                                const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);
                                const activitiesList = event.activities || [];
                                
                                return (
                                    <SymposiumScheduleViewer 
                                        event={event} 
                                        dayNumbers={dayNumbers} 
                                        activities={activitiesList}
                                        currentUser={currentUser}
                                        isRegisteredOverall={isRegistered}
                                    />
                                );
                            })()}
                        </div>
                    )}

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

                        {event.isDemo && (
                            <div className="alert alert-warning py-2 px-3 fs-8 mb-3 border-0 bg-warning bg-opacity-10 text-warning rounded-3 d-flex align-items-center gap-2">
                                <span className="badge bg-warning text-dark fw-bold">DEMO</span>
                                <span>Plausible upcoming schedule for demo & testing.</span>
                            </div>
                        )}

                        {isOngoing && (
                            <div className="alert alert-success py-2 px-3 fs-8 mb-3 border-0 bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center gap-2">
                                <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
                                <strong>Event is currently ONGOING!</strong>
                            </div>
                        )}

                        {isEventEnded && (
                            <div className="alert alert-secondary py-2 px-3 fs-8 mb-3 border-0 bg-secondary bg-opacity-10 text-muted rounded-3">
                                🏁 <strong>Event Completed:</strong> Scheduled sessions have concluded.
                            </div>
                        )}

                        {isRegNotOpen && !isEventEnded && (
                            <div className="alert alert-warning py-2 px-3 fs-8 mb-3 border-0 bg-warning bg-opacity-10 text-warning rounded-3">
                                ⏳ <strong>Registration Opens Soon:</strong> Opens on {openingDateLabel}.
                            </div>
                        )}

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

                        {clashingEvent && !isRegistered && (
                            <div className="alert alert-danger py-2 px-3 fs-8 mb-3 border border-danger border-opacity-50 bg-danger bg-opacity-10 text-danger rounded-3">
                                ⚠️ <strong>Schedule Clash Detected:</strong> Overlaps with your registered event{" "}
                                <Link to={`/events/${clashingEvent.id}`} className="text-danger fw-bold text-decoration-underline">
                                    {clashingEvent.title}
                                </Link>{" "}
                                ({clashingEvent.date} • {clashingEvent.time}).
                            </div>
                        )}

                        {isExternalRestrictedForTechnical && !isRegistered && (
                            <div className="alert alert-warning py-2 px-3 fs-8 mb-3 border-0 bg-warning bg-opacity-10 text-warning rounded-3">
                                ⚠️ <strong>Eligibility Notice:</strong> This Technical event is restricted to Engineering college students. Arts, Science, Management, and University students are eligible for Cultural events only.
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
                                        : clashingEvent
                                        ? "btn-outline-danger disabled"
                                        : isEventEnded
                                        ? "btn-secondary disabled"
                                        : isRegNotOpen
                                        ? "btn-outline-warning disabled"
                                        : isExternalRestrictedForTechnical
                                        ? "btn-outline-warning disabled"
                                        : (!isInterCollege && (isExternalStudent || isUnverifiedStudent))
                                        ? "btn-outline-secondary disabled"
                                        : isDeadlinePassed
                                        ? "btn-secondary disabled"
                                        : isSoldOut
                                        ? "btn-secondary disabled"
                                        : "btn-primary"
                                }`}
                                onClick={handleRegisterClick}
                                disabled={((isSoldOut || isEventEnded || isRegNotOpen || isDeadlinePassed || Boolean(clashingEvent) || isExternalRestrictedForTechnical || (!isInterCollege && (isExternalStudent || isUnverifiedStudent))) && !isRegistered) || isProcessing}
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
                                ) : clashingEvent ? (
                                    "Schedule Clash with Registered Event"
                                ) : isEventEnded ? (
                                    "Event Ended"
                                ) : isRegNotOpen ? (
                                    "Registration Opens Soon"
                                ) : isExternalRestrictedForTechnical ? (
                                    "Technical Event — Engineering Colleges Only"
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
                                className="btn btn-outline-primary w-100 mt-3 py-2 text-center fw-bold d-flex align-items-center justify-content-center gap-2"
                                onClick={() => setShowTicket(true)}
                            >
                                <FaQrcode /> View Entry Ticket
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Registration Confirmation Modal Before Issuing Ticket */}
            {showRegisterModal && (
                <div 
                    className="modal fade show d-block" 
                    tabIndex="-1" 
                    style={{ background: "rgba(9, 13, 22, 0.82)", backdropFilter: "blur(6px)", zIndex: 1050 }}
                    role="dialog"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-dark text-white border border-secondary shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-secondary px-4 py-3" style={{ background: "linear-gradient(135deg, #1b3b8b 0%, #2563eb 100%)" }}>
                                <div>
                                    <span className="badge bg-dark bg-opacity-50 text-white fs-9 text-uppercase tracking-wider mb-1">Step 1 of 2 • Pre-Ticket Verification</span>
                                    <h5 className="modal-title fw-bold text-white mb-0">Confirm Event Registration</h5>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRegisterModal(false)}></button>
                            </div>
                            <form onSubmit={handleConfirmRegistration}>
                                <div className="modal-body p-4">
                                    <div className="p-3 rounded-3 mb-3 border border-secondary bg-black bg-opacity-25">
                                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                            <h6 className="fw-bold text-white mb-0">{event.title}</h6>
                                            <span className="badge bg-primary text-white">{event.category}</span>
                                        </div>
                                        <div className="row g-2 fs-8 text-muted">
                                            <div className="col-6">
                                                <FaCalendarAlt className="me-1 text-primary" /> {event.date}
                                            </div>
                                            <div className="col-6">
                                                <FaClock className="me-1 text-success" /> {event.time}
                                            </div>
                                            <div className="col-12">
                                                <FaMapMarkerAlt className="me-1 text-danger" /> {event.venue}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-6">
                                            <label className="form-label text-muted fs-9 text-uppercase mb-1">Attendee Name</label>
                                            <input type="text" className="form-control form-control-sm" value={currentUser?.name || ""} disabled />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted fs-9 text-uppercase mb-1">Student Email</label>
                                            <input type="text" className="form-control form-control-sm" value={currentUser?.email || ""} disabled />
                                        </div>
                                    </div>

                                    {/* Institution Display / Selector */}
                                    {isExternalStudent && currentUser?.institution?.status === "APPROVED" ? (
                                        <div className="mb-3 p-3 rounded-3 border border-success border-opacity-40 bg-success bg-opacity-10">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <FaShieldAlt className="text-success" />
                                                <span className="text-success fw-semibold fs-8">Verified Institution</span>
                                            </div>
                                            <strong className="text-white d-block">{currentUser.collegeName}</strong>
                                            <small className="text-muted">
                                                {currentUser.collegeDistrict && `${currentUser.collegeDistrict}, `}{currentUser.collegeState}
                                            </small>
                                        </div>
                                    ) : needsInstitutionPicker ? (
                                        <div className="mb-3">
                                            <label className="form-label text-muted fs-8 text-uppercase">
                                                Your Institution <span className="text-danger">*</span>
                                            </label>
                                            <DistrictCollegeSelector
                                                value={externalInstitution}
                                                onChange={setExternalInstitution}
                                                disabled={isProcessing}
                                                userEmail={currentUser?.email || ""}
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-3">
                                            <label className="form-label text-muted fs-8 text-uppercase">College / Institution Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Coimbatore Institute of Technology"
                                                value={externalCollege}
                                                onChange={(e) => setExternalCollege(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="mb-2">
                                        <label className="form-label text-muted fs-8 text-uppercase">Department &amp; Roll Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. B.Tech IT • 71762205042"
                                            value={institutionDetails}
                                            onChange={(e) => setInstitutionDetails(e.target.value)}
                                        />
                                    </div>
                                    <small className="text-muted fs-9 d-block mt-2">
                                        By confirming, a unique verifiable QR entry pass will be generated for your account.
                                    </small>
                                </div>
                                <div className="modal-footer border-secondary px-4 py-3 d-flex justify-content-between">
                                    <button type="button" className="btn btn-outline-secondary px-3" onClick={() => setShowRegisterModal(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2"
                                        disabled={isProcessing || (needsInstitutionPicker && !externalInstitution.institutionId)}
                                    >
                                        {isProcessing ? "Issuing Ticket..." : <><FaCheck /> Confirm &amp; Issue Ticket</>}
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
                    style={{ background: "rgba(9, 13, 22, 0.85)", backdropFilter: "blur(6px)", zIndex: 1050 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ticket-modal-title"
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "440px" }}>
                        <div className="modal-content bg-transparent border-0">
                            <div className="ticket-wrapper">
                                <div className="ticket-header">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-white bg-opacity-20 text-white px-3 py-1 rounded-pill">{event.category}</span>
                                        <span className="badge bg-success text-white px-3 py-1 rounded-pill">
                                            ✓ {activeUserReg?.status || "Confirmed"}
                                        </span>
                                    </div>
                                    <h3 id="ticket-modal-title" className="mb-0 text-white fw-extrabold tracking-wider">EVENT ENTRY PASS</h3>
                                    <small className="text-white text-opacity-75">CampusConnect Official Admission Ticket</small>
                                </div>
                                <div className="ticket-body">
                                    <h4 className="text-white text-center mb-3 fw-bold" style={{ fontSize: "1.3rem", lineHeight: 1.3 }}>
                                        {event.title}
                                    </h4>
                                    
                                    <div className="row g-3 mb-2 text-start p-3 rounded-3" style={{ background: "rgba(128, 128, 128, 0.08)", border: "1px solid var(--border-hairline)" }}>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-9 text-uppercase">Attendee</span>
                                            <strong className="text-white fs-7 d-block text-truncate">{currentUser?.name || "Student"}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-9 text-uppercase">Department / ID</span>
                                            <strong className="text-white fs-7 d-block text-truncate">{currentUser?.department || "General"}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-9 text-uppercase">Date & Time</span>
                                            <strong className="text-white fs-8 d-block">{event.date}</strong>
                                            <span className="text-muted fs-9">{event.time}</span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-9 text-uppercase">Venue</span>
                                            <strong className="text-white fs-8 d-block">{event.venue}</strong>
                                            <span className="text-muted fs-9 text-truncate d-block">{organizerEntityName}</span>
                                        </div>
                                    </div>

                                    <div className="ticket-divider"></div>

                                    <div className="text-center">
                                        <span className="text-muted d-block fs-9 text-uppercase tracking-wider mb-2">Scan Unique QR Code at Entrance</span>
                                        <div className="d-flex justify-content-center my-2">
                                            <QRCode
                                                value={activeUserReg?.ticketId || `CC-${event.id}-${currentUser?.id || 99}`}
                                                size={148}
                                            />
                                        </div>
                                        <div className="mt-2 px-3 py-1 rounded-pill d-inline-block font-monospace fs-8 fw-bold" style={{ background: "rgba(37, 99, 235, 0.12)", color: "var(--accent-color)", border: "1px solid rgba(37, 99, 235, 0.25)" }}>
                                            ID: {activeUserReg?.ticketId || `CC-${event.id}-${currentUser?.id || 99}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-dark bg-opacity-50 d-flex justify-content-between align-items-center gap-2 border-top border-secondary px-4">
                                    <Link
                                        to="/student?tab=tickets"
                                        className="btn btn-outline-light btn-sm px-3"
                                        onClick={() => setShowTicket(false)}
                                    >
                                        View All My Tickets
                                    </Link>
                                    <button 
                                        className="btn btn-primary btn-sm px-4 fw-bold"
                                        onClick={() => setShowTicket(false)}
                                    >
                                        Done
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

function SymposiumScheduleViewer({ event, dayNumbers, activities, currentUser, isRegisteredOverall }) {
    const [activeDay, setActiveDay] = useState(1);
    const { registerForActivity, cancelActivityRegistration, activityRegistrations } = useContext(AppContext);
    const [processingActivityId, setProcessingActivityId] = useState(null);

    const isStudent = currentUser?.role?.toLowerCase() === "student";
    const dayActivities = activities.filter(a => a.dayNumber === activeDay && a.isActive);

    const isActivityRegistered = (activityId) => {
        return activityRegistrations?.some(ar => ar.activityId === activityId && ar.status !== 'CANCELLED');
    };

    const handleActivityRegister = async (activity) => {
        if (!currentUser) {
            alert("Please log in to register for activities.");
            return;
        }

        if (activity.requiresOverallRegistration && !isRegisteredOverall) {
            alert("This activity requires overall symposium registration first. Please register for the symposium above!");
            return;
        }

        const registered = isActivityRegistered(activity.id);
        setProcessingActivityId(activity.id);

        if (registered) {
            await cancelActivityRegistration(activity.id);
        } else {
            await registerForActivity(activity.id);
        }

        setProcessingActivityId(null);
    };

    return (
        <div>
            {/* Day selector tabs */}
            <div className="d-flex gap-2 mb-3 overflow-auto pb-2">
                {dayNumbers.map((d) => (
                    <button
                        key={d}
                        className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${
                            activeDay === d ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'
                        }`}
                        onClick={() => setActiveDay(d)}
                    >
                        Day {d}
                    </button>
                ))}
            </div>

            {/* Activities list */}
            {dayActivities.length === 0 ? (
                <div className="text-center py-4 text-muted fs-7">
                    No scheduled activities announced for Day {activeDay} yet.
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {dayActivities.map((act) => {
                        const registered = isActivityRegistered(act.id);
                        const isFull = act.availableSeats <= 0;
                        const isProcessing = processingActivityId === act.id;

                        return (
                            <div 
                                key={act.id} 
                                className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-50 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
                            >
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                        <span className="badge bg-primary fs-8">{act.category}</span>
                                        {act.requiresSeparateRegistration ? (
                                            <span className="badge bg-info text-dark fs-8">Separate Reg Required</span>
                                        ) : (
                                            <span className="badge bg-secondary fs-8">Symposium Pass Included</span>
                                        )}
                                        {act.requiresOverallRegistration && (
                                            <span className="badge bg-warning text-dark fs-8">Requires Overall Pass</span>
                                        )}
                                        {act.fee > 0 ? (
                                            <span className="badge bg-success fs-8">₹{act.fee}</span>
                                        ) : (
                                            <span className="badge bg-success bg-opacity-25 text-success fs-8">Free</span>
                                        )}
                                    </div>
                                    <h5 className="text-white mb-1 fw-bold">{act.name}</h5>
                                    {act.description && <p className="text-muted fs-8 mb-2">{act.description}</p>}
                                    <div className="d-flex gap-3 text-muted fs-8 flex-wrap">
                                        <span><FaClock className="text-warning me-1" /> {new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(act.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span><FaMapMarkerAlt className="text-danger me-1" /> {act.venue}</span>
                                        <span><FaUsers className="text-info me-1" /> {act.availableSeats} / {act.maxParticipants} Seats Left</span>
                                    </div>
                                </div>

                                {/* Activity Registration Button */}
                                <div>
                                    {isStudent ? (
                                        <button
                                            className={`btn btn-sm px-4 py-2 fw-bold ${
                                                registered 
                                                    ? 'btn-success' 
                                                    : isFull 
                                                    ? 'btn-secondary disabled' 
                                                    : 'btn-outline-warning'
                                            }`}
                                            disabled={isProcessing || (isFull && !registered)}
                                            onClick={() => handleActivityRegister(act)}
                                        >
                                            {isProcessing ? (
                                                <span className="spinner-border spinner-border-sm me-1" />
                                            ) : registered ? (
                                                <>✓ Enrolled (Cancel)</>
                                            ) : isFull ? (
                                                'Sold Out'
                                            ) : (
                                                'Register Activity'
                                            )}
                                        </button>
                                    ) : (
                                        <span className="badge bg-secondary py-2 px-3">Student Only</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default EventDetails;