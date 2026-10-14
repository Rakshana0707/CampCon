import { useContext, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import DashboardLayout from "../layouts/DashboardLayout";
import NotificationCard from "../components/NotificationCard";
import QRCode from "../components/QRCode";
import {
    FaCalendarAlt,
    FaTicketAlt,
    FaBell,
    FaCalendarCheck,
    FaAward,
    FaHourglassHalf,
    FaExternalLinkAlt,
    FaBookmark,
    FaStar,
    FaPrint,
    FaTimes,
    FaClock,
    FaInfoCircle,
    FaQrcode,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaListUl
} from "react-icons/fa";

function StudentDashboard() {
    const { 
        currentUser, 
        events, 
        registrations, 
        activityRegistrations,
        cancelActivityRegistration,
        bookmarks, 
        notifications, 
        cancelEventRegistration, 
        markNotificationAsRead 
    } = useContext(AppContext);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [selectedTicketEvent, setSelectedTicketEvent] = useState(null);
    const [selectedCert, setSelectedCert] = useState(null);
    const [selectedSymposiumForModal, setSelectedSymposiumForModal] = useState(null);
    const [activityToCancel, setActivityToCancel] = useState(null);
    const [isCancellingActivity, setIsCancellingActivity] = useState(false);
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "tickets" ? "tickets" : "upcoming");

    // Helper: Find enrolled activities for a given symposium event
    const getEnrolledActivitiesForEvent = (eventId) => {
        const evt = (events || []).find(e => e.id === eventId);
        const evtActivityIds = new Set((evt?.activities || []).map(a => a.id));
        
        return (activityRegistrations || []).filter(ar => {
            if (ar.status === 'CANCELLED' || ar.status === 'Cancelled') return false;
            if (ar.activity?.eventId === eventId) return true;
            if (evtActivityIds.has(ar.activityId)) return true;
            return false;
        }).map(ar => {
            const actDetails = (evt?.activities || []).find(a => a.id === ar.activityId) || ar.activity || {};
            return {
                ...actDetails,
                ...ar,
                activityId: ar.activityId || actDetails.id,
                name: actDetails.name || ar.activity?.name || `Activity #${ar.activityId}`,
                category: actDetails.category || ar.activity?.category || "Symposium Track",
                dayNumber: actDetails.dayNumber || ar.activity?.dayNumber || 1,
                startTime: actDetails.startTime || ar.activity?.startTime,
                endTime: actDetails.endTime || ar.activity?.endTime,
                venue: actDetails.venue || ar.activity?.venue || evt?.venue
            };
        });
    };

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam && ["tickets", "upcoming", "completed", "pending", "cancelled"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "tickets") {
            setSearchParams({ tab: "tickets" });
        } else {
            setSearchParams({});
        }
    };

    // Gather student registrations and helper details
    const studentRegs = (registrations || []).filter((r) => r.studentId === currentUser?.id);
    const getEventForReg = (reg) => (events || []).find((e) => e.id === reg.eventId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Timeline filtering
    const upcomingRegs = studentRegs.filter((r) => {
        const evt = getEventForReg(r);
        return r.status === "Approved" && evt && new Date(evt.date) >= today;
    });

    const completedRegs = studentRegs.filter((r) => {
        const evt = getEventForReg(r);
        return r.status === "Approved" && evt && new Date(evt.date) < today;
    });

    const pendingRegs = studentRegs.filter((r) => r.status === "Pending");

    const cancelledRegs = studentRegs.filter((r) => r.status === "Cancelled" || r.status === "Rejected");

    // All active registered tickets (Approved or Pending)
    const ticketRegs = studentRegs.filter((r) => {
        const evt = getEventForReg(r);
        return evt && (r.status === "Approved" || r.status === "Pending");
    });

    // Bookmarked events
    const savedEvents = (events || []).filter((e) => bookmarks?.includes(e.id));

    // AI Recommendations based on department and category preferences
    const recommendations = (events || [])
        .filter((e) => {
            const alreadyReg = studentRegs.some((r) => r.eventId === e.id && r.status !== "Cancelled" && r.status !== "Rejected");
            return !alreadyReg && (e.department?.toLowerCase() === currentUser?.department?.toLowerCase() || e.trending);
        })
        .slice(0, 3);

    const userNotifications = (notifications || []).filter(n => !n.targetUserId || n.targetUserId === currentUser?.id);

    // Compute dynamic dashboard metrics
    const stats = [
        { title: "Registered", value: studentRegs.filter((r) => r.status !== "Cancelled" && r.status !== "Rejected").length.toString(), color: "var(--accent-color)" },
        { title: "Upcoming", value: upcomingRegs.length.toString(), color: "var(--accent-cyan)" },
        { title: "Completed", value: completedRegs.length.toString(), color: "var(--accent-emerald)" },
        { title: "Certificates", value: completedRegs.filter((r) => r.attendance === "Present" && r.certificateType !== "None").length.toString(), color: "var(--accent-amber)" }
    ];

    // Sidebar containing AI suggestions and notification list
    const sidebarContent = (
        <div className="d-flex flex-column gap-4">
            {/* AI Recommendations */}
            <div>
                <h3 className="text-white mb-3 fw-bold d-flex align-items-center gap-2 fs-5" style={{ fontFamily: "var(--font-heading)" }}>
                    <FaStar className="text-warning" /> AI Recommendations
                </h3>
                <div className="glass-panel p-3 d-flex flex-column gap-3">
                    {recommendations.length === 0 ? (
                        <p className="text-muted text-center py-3 mb-0 fs-8">No matching recommendations found.</p>
                    ) : (
                        recommendations.map((evt) => (
                            <div key={evt.id} className="p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-30">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="badge bg-indigo bg-opacity-25 text-primary fs-9 px-2 py-1">AI Suggested</span>
                                    <span className="text-muted fs-9 fw-semibold">{evt.category}</span>
                                </div>
                                <h6 className="text-white fw-bold mb-1 fs-7">{evt.title}</h6>
                                <p className="text-muted mb-2 fs-9">{evt.date} • {evt.venue}</p>
                                <Link to={`/events/${evt.id}`} className="btn btn-primary btn-sm w-100 py-2 fs-8 fw-bold text-center d-block">
                                    View Event
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Live Updates */}
            <div>
                <h3 className="text-white mb-3 fw-bold d-flex align-items-center gap-2 fs-5" style={{ fontFamily: "var(--font-heading)" }}>
                    <FaBell className="text-primary" /> Live Updates
                </h3>
                <div className="glass-panel p-3">
                    {userNotifications.length === 0 ? (
                        <p className="text-muted text-center py-4 mb-0 fs-8">No new notifications</p>
                    ) : (
                        userNotifications.slice(0, 4).map((notif) => (
                            <NotificationCard
                                key={notif.id}
                                message={notif.message}
                                isRead={notif.isRead}
                                onRead={() => markNotificationAsRead(notif.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    // Helper to get active registrations depending on the tab selected
    const getActiveRegs = () => {
        switch (activeTab) {
            case "tickets": return ticketRegs;
            case "upcoming": return upcomingRegs;
            case "completed": return completedRegs;
            case "pending": return pendingRegs;
            case "cancelled": return cancelledRegs;
            default: return upcomingRegs;
        }
    };

    const activeRegsList = getActiveRegs();

    return (
        <DashboardLayout
            title={`Welcome Back, ${currentUser.name} 👋`}
            subtitle={`${currentUser.department} • ${currentUser.year}`}
            stats={stats}
            sidebar={sidebarContent}
        >
            {/* Header Tabs Row */}
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 border-bottom border-secondary pb-3 gap-2">
                <h3 className="text-white mb-0 fw-bold d-flex align-items-center gap-2 fs-5" style={{ fontFamily: "var(--font-heading)" }}>
                    {activeTab === "tickets" ? (
                        <>
                            <FaTicketAlt className="text-primary" /> My Event Tickets Wallet
                        </>
                    ) : (
                        <>
                            <FaCalendarCheck className="text-primary" /> My Registrations
                        </>
                    )}
                </h3>
                <div className="d-flex flex-wrap gap-1">
                    <button
                        className={`btn btn-sm py-1 px-3 fs-8 rounded-pill d-flex align-items-center gap-1 fw-semibold ${activeTab === "tickets" ? 'btn-primary' : 'btn-outline-light border-0'}`}
                        onClick={() => handleTabChange("tickets")}
                    >
                        <FaQrcode size={12} /> My Tickets ({ticketRegs.length})
                    </button>
                    {["upcoming", "completed", "pending", "cancelled"].map((tab) => (
                        <button
                            key={tab}
                            className={`btn btn-sm py-1 px-3 fs-8 rounded-pill text-capitalize ${activeTab === tab ? 'btn-primary' : 'btn-outline-light border-0'}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab} (
                                {tab === "upcoming" ? upcomingRegs.length :
                                tab === "completed" ? completedRegs.length :
                                tab === "pending" ? pendingRegs.length :
                                cancelledRegs.length}
                            )
                        </button>
                    ))}
                </div>
            </div>

            {/* Dedicated Tickets Wallet View vs Standard Registrations List */}
            {activeTab === "tickets" ? (
                ticketRegs.length === 0 ? (
                    <div className="empty-state">
                        <FaTicketAlt />
                        <h5>No active event tickets yet</h5>
                        <p>Register for an upcoming college event or symposium to generate your unique QR entry ticket.</p>
                        <Link to="/events" className="btn btn-primary mt-2">
                            Discover Events
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4">
                        {ticketRegs.map((reg) => {
                            const event = getEventForReg(reg);
                            if (!event) return null;
                            const ticketCode = reg.ticketId || `CC-${event.id}-${currentUser.id}`;
                            const isPast = new Date(event.date) < today;
                            const isSymposium = event.eventFormat === "SYMPOSIUM" || (event.activities && event.activities.length > 0);
                            const enrolledActivities = isSymposium ? getEnrolledActivitiesForEvent(event.id) : [];

                            return (
                                <div key={reg.id} className="col-xl-6">
                                    <div
                                        className="rounded-4 overflow-hidden h-100 d-flex flex-column justify-content-between shadow-sm"
                                        style={{
                                            background: "var(--bg-card)",
                                            border: "1px solid var(--border-editorial)"
                                        }}
                                    >
                                        {/* Top Banner */}
                                        <div
                                            className="px-4 py-3 d-flex justify-content-between align-items-center"
                                            style={{ background: "linear-gradient(135deg, #1b3b8b 0%, #2563eb 100%)" }}
                                        >
                                            <div>
                                                <span className="badge bg-white bg-opacity-20 text-white fs-9 me-2">{event.category}</span>
                                                <span className="text-white text-opacity-75 fs-9 text-uppercase fw-bold">Entry Pass</span>
                                            </div>
                                            <span className={`badge ${reg.status === "Approved" ? "bg-success" : "bg-warning text-dark"} fs-9`}>
                                                {reg.status === "Approved" ? "✓ Confirmed" : "⏳ Pending Approval"}
                                            </span>
                                        </div>

                                        {/* Middle Content + Live QR Side-by-Side */}
                                        <div className="p-4 d-flex flex-column flex-sm-row align-items-center gap-4">
                                            <div className="flex-grow-1 w-100">
                                                <h5 className="text-white fw-bold mb-2">{event.title}</h5>
                                                <div className="d-flex flex-column gap-1 text-muted fs-8 mb-3">
                                                    <div><FaCalendarAlt className="me-2 text-primary" /> {event.date} • {event.time}</div>
                                                    <div><FaMapMarkerAlt className="me-2 text-danger" /> {event.venue}</div>
                                                </div>
                                                <div className="p-2 rounded-3 mb-2" style={{ background: "rgba(128,128,128,0.08)", border: "1px solid var(--border-hairline)" }}>
                                                    <div className="fs-9 text-muted text-uppercase">Attendee</div>
                                                    <div className="fs-8 fw-bold text-white">{currentUser.name} <span className="text-muted fw-normal">({currentUser.department})</span></div>
                                                </div>
                                                <div className="font-monospace fs-9 fw-bold" style={{ color: "var(--accent-color)" }}>
                                                    Ticket ID: {ticketCode}
                                                </div>
                                                {isSymposium && (
                                                    <div className="mt-2">
                                                        <span className={`badge ${enrolledActivities.length > 0 ? "bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30" : "bg-secondary bg-opacity-30 text-white text-opacity-75"} fs-9`}>
                                                            <FaCalendarCheck className="me-1" />
                                                            {enrolledActivities.length > 0 
                                                                ? `${enrolledActivities.length} Symposium Event${enrolledActivities.length === 1 ? '' : 's'} Enrolled`
                                                                : "No Individual Events Enrolled"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-center flex-shrink-0">
                                                <QRCode value={ticketCode} size={112} />
                                                <small className="text-muted d-block mt-1 fs-9">Unique QR</small>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="px-4 py-3 border-top border-secondary d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ background: "rgba(0,0,0,0.12)" }}>
                                            <Link to={`/events/${event.id}`} className="btn btn-outline-light btn-sm px-3 fs-8">
                                                <FaExternalLinkAlt size={10} className="me-1" /> Event Page
                                            </Link>
                                            <div className="d-flex flex-wrap gap-2">
                                                {/* Button to view all registered events in this symposium */}
                                                {isSymposium && (
                                                    <button
                                                        className="btn btn-warning btn-sm px-3 fs-8 fw-bold d-flex align-items-center gap-1 text-dark shadow-sm"
                                                        onClick={() => setSelectedSymposiumForModal({ event, enrolledActivities })}
                                                        title="View what all events in this symposium you have registered for"
                                                    >
                                                        <FaCalendarCheck size={11} /> Registered Events ({enrolledActivities.length})
                                                    </button>
                                                )}

                                                {!isPast && (
                                                    <button
                                                        className="btn btn-outline-danger btn-sm px-3 fs-8"
                                                        onClick={() => cancelEventRegistration(event.id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-primary btn-sm px-3 fs-8 fw-bold d-flex align-items-center gap-1"
                                                    onClick={() => setSelectedTicketEvent({ 
                                                        ...event, 
                                                        ticketId: ticketCode, 
                                                        regStatus: reg.status,
                                                        enrolledActivities 
                                                    })}
                                                >
                                                    <FaTicketAlt size={11} /> Full Pass
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : activeRegsList.length === 0 ? (
                <div className="empty-state">
                    <FaCalendarAlt />
                    <h5>No registrations found</h5>
                    <p>There are no registrations under this category currently. Go explore college events!</p>
                    <Link to="/events" className="btn btn-primary mt-2">
                        Discover Events
                    </Link>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {activeRegsList.map((reg) => {
                        const event = getEventForReg(reg);
                        if (!event) return null;
                        
                        const isPast = new Date(event.date) < today;

                        return (
                            <div key={reg.id} className="upcoming-event">
                                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 w-100 justify-content-between">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                            <span className="badge bg-primary text-white fs-9 px-2 py-1">{event.category}</span>
                                            {reg.role === "Volunteer" && (
                                                <span className="badge bg-indigo text-white fs-9 px-2 py-1">Volunteer</span>
                                            )}
                                            {reg.status === "Approved" ? (
                                                isPast ? (
                                                    <span className="badge bg-secondary text-white fs-9 d-flex align-items-center gap-1">
                                                        <FaAward size={10} /> Completed
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-success text-white fs-9 d-flex align-items-center gap-1">
                                                        <FaHourglassHalf size={10} /> Confirmed
                                                    </span>
                                                )
                                            ) : reg.status === "Pending" ? (
                                                <span className="badge bg-warning text-dark fs-9 d-flex align-items-center gap-1">
                                                    <FaClock size={10} /> Pending Organizer Approval
                                                </span>
                                            ) : reg.status === "Rejected" ? (
                                                <span className="badge bg-danger text-white fs-9 d-flex align-items-center gap-1">
                                                    <FaTimes size={10} /> Rejected
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary text-white fs-9 d-flex align-items-center gap-1">
                                                    <FaTimes size={10} /> Cancelled
                                                </span>
                                            )}
                                        </div>
                                        <h5 className="text-white fw-bold mb-1 fs-6">{event.title}</h5>
                                        <p className="text-muted mb-0 fs-8">
                                            {event.date} • {event.time} • <strong>{event.venue}</strong>
                                        </p>
                                    </div>

                                    <div className="d-flex gap-2 w-100 w-md-auto justify-content-end mt-2 mt-md-0">
                                        <Link to={`/events/${event.id}`} className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 py-2 px-3 fs-8 fw-semibold">
                                            <FaExternalLinkAlt size={10} /> Details
                                        </Link>
                                        
                                        {reg.status === "Approved" && !isPast && (
                                            <>
                                                <button
                                                    className="btn btn-primary btn-sm d-flex align-items-center gap-1 py-2 px-3 fs-8 fw-semibold"
                                                    onClick={() => setSelectedTicketEvent({ ...event, ticketId: reg.ticketId, regStatus: reg.status })}
                                                >
                                                    <FaTicketAlt size={11} /> Ticket
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm py-2 px-3 fs-8 fw-semibold"
                                                    onClick={() => cancelEventRegistration(event.id)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                        {reg.status === "Pending" && (
                                            <button
                                                className="btn btn-outline-danger btn-sm py-2 px-3 fs-8 fw-semibold"
                                                onClick={() => cancelEventRegistration(event.id)}
                                            >
                                                Cancel Request
                                            </button>
                                        )}

                                        {reg.status === "Approved" && isPast && (
                                            reg.attendance === "Present" && reg.certificateType !== "None" ? (
                                                <button 
                                                    className="btn btn-warning btn-sm d-flex align-items-center gap-1 py-2 px-3 fs-8 fw-bold text-dark" 
                                                    onClick={() => setSelectedCert(reg)}
                                                >
                                                    <FaAward /> Certificate
                                                </button>
                                            ) : (
                                                <span className="text-muted fs-8 d-flex align-items-center gap-1 border border-secondary p-2 rounded bg-dark bg-opacity-20" style={{ pointerEvents: "none" }}>
                                                    <FaInfoCircle /> Attendance Absent
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Saved Bookmarks Section */}
            <h3 className="text-white mt-5 mb-4 fw-bold d-flex align-items-center gap-2 fs-5" style={{ fontFamily: "var(--font-heading)" }}>
                <FaBookmark className="text-danger" /> Saved & Bookmarked Events
            </h3>
            {savedEvents.length === 0 ? (
                <div className="empty-state py-4">
                    <FaBookmark />
                    <h5>No bookmarked events</h5>
                    <p>Browse event details and click the heart icon to save them here for quick access!</p>
                </div>
            ) : (
                <div className="row g-3">
                    {savedEvents.map((evt) => (
                        <div key={evt.id} className="col-lg-6">
                            <div className="upcoming-event h-100 py-3">
                                <div className="d-flex align-items-center justify-content-between w-100 gap-3">
                                    <div>
                                        <span className="badge bg-primary text-white fs-9 mb-1">{evt.category}</span>
                                        <h6 className="text-white fw-bold mb-1 fs-7">{evt.title}</h6>
                                        <p className="text-muted mb-0 fs-8">{evt.date} • {evt.venue}</p>
                                    </div>
                                    <Link to={`/events/${evt.id}`} className="btn btn-outline-light btn-sm py-2 px-3 fs-8 fw-semibold">
                                        Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Ticket Modal Overlay */}
            {selectedTicketEvent && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(9, 13, 22, 0.85)", backdropFilter: "blur(6px)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "440px" }}>
                        <div className="modal-content bg-transparent border-0">
                            <div className="ticket-wrapper">
                                <div className="ticket-header">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-white bg-opacity-20 text-white px-3 py-1 rounded-pill">{selectedTicketEvent.category}</span>
                                        <span className="badge bg-success text-white px-3 py-1 rounded-pill">
                                            ✓ {selectedTicketEvent.regStatus || "Confirmed"}
                                        </span>
                                    </div>
                                    <h3 className="mb-0 text-white fw-extrabold tracking-wider">EVENT ENTRY PASS</h3>
                                    <small className="text-white text-opacity-75">CampusConnect Official Admission Ticket</small>
                                </div>
                                <div className="ticket-body">
                                    <h4 className="text-white text-center mb-3 fw-bold" style={{ fontSize: "1.3rem", lineHeight: 1.3 }}>
                                        {selectedTicketEvent.title}
                                    </h4>
                                    
                                    <div className="row g-3 mb-2 text-start p-3 rounded-3" style={{ background: "rgba(128, 128, 128, 0.08)", border: "1px solid var(--border-hairline)" }}>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-9 text-uppercase">Attendee</span>
                                            <strong className="text-white fs-7 d-block text-truncate">{currentUser.name}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-9 text-uppercase">Department</span>
                                            <strong className="text-white fs-7 d-block text-truncate">{currentUser.department}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-9 text-uppercase">Date & Time</span>
                                            <strong className="text-white fs-8 d-block">{selectedTicketEvent.date}</strong>
                                            <span className="text-muted fs-9">{selectedTicketEvent.time}</span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-9 text-uppercase">Venue</span>
                                            <strong className="text-white fs-8 d-block">{selectedTicketEvent.venue}</strong>
                                        </div>
                                    </div>

                                    {/* Enrolled Symposium Events (If Applicable) */}
                                    {selectedTicketEvent.enrolledActivities && selectedTicketEvent.enrolledActivities.length > 0 && (
                                        <div className="p-3 rounded-3 mb-3 text-start" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fs-9 text-uppercase fw-bold text-warning d-flex align-items-center gap-1">
                                                    <FaCalendarCheck size={11} /> Enrolled Symposium Events ({selectedTicketEvent.enrolledActivities.length})
                                                </span>
                                            </div>
                                            <div className="d-flex flex-column gap-2">
                                                {selectedTicketEvent.enrolledActivities.map(act => (
                                                    <div key={act.id || act.activityId} className="p-2 rounded bg-black bg-opacity-40 d-flex justify-content-between align-items-center fs-8">
                                                        <div>
                                                            <strong className="text-white d-block">{act.name}</strong>
                                                            <span className="text-muted fs-9">Day {act.dayNumber || 1} • {act.venue}</span>
                                                        </div>
                                                        <span className="badge bg-success bg-opacity-25 text-success fs-9">Enrolled</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="ticket-divider"></div>

                                    <div className="text-center">
                                        <span className="text-muted d-block fs-9 text-uppercase tracking-wider mb-2">Scan Unique QR Code at Entrance</span>
                                        <div className="d-flex justify-content-center my-2">
                                            <QRCode value={selectedTicketEvent.ticketId || `CC-${selectedTicketEvent.id}-${currentUser.id}`} size={148} />
                                        </div>
                                        <div className="mt-2 px-3 py-1 rounded-pill d-inline-block font-monospace fs-8 fw-bold" style={{ background: "rgba(37, 99, 235, 0.12)", color: "var(--accent-color)", border: "1px solid rgba(37, 99, 235, 0.25)" }}>
                                            ID: {selectedTicketEvent.ticketId || `CC-${selectedTicketEvent.id}-${currentUser.id}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-dark bg-opacity-50 d-flex justify-content-between align-items-center gap-2 border-top border-secondary px-4">
                                    <button 
                                        className="btn btn-outline-light btn-sm px-3 d-flex align-items-center gap-1"
                                        onClick={() => window.print()}
                                    >
                                        <FaPrint size={11} /> Print Pass
                                    </button>
                                    <button 
                                        className="btn btn-primary btn-sm px-4 fw-bold"
                                        onClick={() => setSelectedTicketEvent(null)}
                                    >
                                        Close Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dedicated Registered Symposium Events Modal */}
            {selectedSymposiumForModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(9, 13, 22, 0.85)", backdropFilter: "blur(6px)", zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: "640px" }}>
                        <div className="modal-content text-white border border-secondary border-opacity-50 shadow-lg rounded-4 overflow-hidden" style={{ background: "var(--bg-card, #111827)" }}>
                            {/* Header */}
                            <div className="p-3 px-4 d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                <div className="d-flex align-items-center gap-2">
                                    <FaCalendarCheck className="text-warning" size={18} />
                                    <div>
                                        <h5 className="mb-0 fw-bold fs-6">{selectedSymposiumForModal.event.title}</h5>
                                        <small className="text-muted fs-9">Your Registered Symposium Events & Contests</small>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setSelectedSymposiumForModal(null)}
                                    aria-label="Close"
                                />
                            </div>

                            {/* Body */}
                            <div className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                {getEnrolledActivitiesForEvent(selectedSymposiumForModal.event.id).length === 0 ? (
                                    <div className="text-center py-4">
                                        <FaInfoCircle size={36} className="text-warning text-opacity-50 mb-3" />
                                        <h6 className="text-white fw-bold">No Individual Events Enrolled Yet</h6>
                                        <p className="text-muted fs-8 mb-3" style={{ maxWidth: "420px", margin: "0 auto" }}>
                                            You have an overall entry pass for <strong>{selectedSymposiumForModal.event.title}</strong>, but have not registered for any individual track competitions, paper presentations, or workshops yet.
                                        </p>
                                        <Link 
                                            to={`/events/${selectedSymposiumForModal.event.id}`} 
                                            className="btn btn-primary btn-sm px-4 fw-bold"
                                            onClick={() => setSelectedSymposiumForModal(null)}
                                        >
                                            <FaExternalLinkAlt size={10} className="me-1" /> Explore Day-Wise Events & Register
                                        </Link>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fs-8 text-muted">
                                                Enrolled in <strong className="text-warning">{getEnrolledActivitiesForEvent(selectedSymposiumForModal.event.id).length}</strong> event(s)
                                            </span>
                                            <Link 
                                                to={`/events/${selectedSymposiumForModal.event.id}`} 
                                                className="btn btn-outline-light btn-sm fs-9 py-1"
                                                onClick={() => setSelectedSymposiumForModal(null)}
                                            >
                                                + Browse More Events
                                            </Link>
                                        </div>

                                        <div className="d-flex flex-column gap-3">
                                            {getEnrolledActivitiesForEvent(selectedSymposiumForModal.event.id).map((act) => (
                                                <div 
                                                    key={act.id || act.activityId} 
                                                    className="p-3 rounded-3 border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
                                                    style={{ background: "rgba(255, 255, 255, 0.03)", borderColor: "rgba(255, 255, 255, 0.08)" }}
                                                >
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                            <span className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 fs-9">
                                                                {act.category || "Symposium Track"}
                                                            </span>
                                                            <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 fs-9">
                                                                Day {act.dayNumber || 1}
                                                            </span>
                                                            <span className="badge bg-success bg-opacity-25 text-success fs-9">
                                                                ✓ Enrolled
                                                            </span>
                                                        </div>
                                                        <h6 className="fw-bold text-white mb-1">{act.name}</h6>
                                                        {act.description && <p className="text-muted fs-9 mb-2 text-truncate" style={{ maxWidth: "420px" }}>{act.description}</p>}
                                                        <div className="d-flex gap-3 text-muted fs-9 flex-wrap">
                                                            {act.startTime && (
                                                                <span>
                                                                    <FaClock className="text-warning me-1" /> 
                                                                    {new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(act.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                            {act.venue && (
                                                                <span><FaMapMarkerAlt className="text-danger me-1" /> {act.venue}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex-shrink-0">
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm px-3 fs-9"
                                                            onClick={() => setActivityToCancel(act)}
                                                        >
                                                            Cancel Entry
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 px-4 d-flex justify-content-between align-items-center border-top border-secondary border-opacity-25" style={{ background: "rgba(0,0,0,0.2)" }}>
                                <Link 
                                    to={`/events/${selectedSymposiumForModal.event.id}`} 
                                    className="btn btn-outline-light btn-sm fs-8"
                                    onClick={() => setSelectedSymposiumForModal(null)}
                                >
                                    <FaExternalLinkAlt size={10} className="me-1" /> View Full Event Schedule
                                </Link>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary btn-sm px-4"
                                    onClick={() => setSelectedSymposiumForModal(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Activity Confirmation Box (inside StudentDashboard) */}
            {activityToCancel && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0, 0, 0, 0.85)", zIndex: 1070 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
                        <div className="modal-content text-white border border-danger border-opacity-50 shadow-lg rounded-4 overflow-hidden" style={{ background: "var(--bg-card, #111827)" }}>
                            <div className="p-3 px-4 d-flex align-items-center gap-2 border-bottom border-secondary border-opacity-25" style={{ background: "rgba(239, 68, 68, 0.15)" }}>
                                <FaExclamationTriangle className="text-danger" size={18} />
                                <h6 className="mb-0 fw-bold">Cancel Event Registration?</h6>
                            </div>
                            <div className="p-4 fs-8">
                                <p className="mb-2">
                                    Are you sure you want to cancel your enrollment in:
                                </p>
                                <div className="p-2 rounded bg-white bg-opacity-5 text-white fw-semibold mb-3 border border-secondary border-opacity-25">
                                    {activityToCancel.name}
                                </div>
                                <p className="text-muted mb-0 fs-9">
                                    Your reserved seat will be released immediately and you will no longer appear on the attendance roster for this event.
                                </p>
                            </div>
                            <div className="p-3 px-4 d-flex justify-content-end gap-2 border-top border-secondary border-opacity-25 bg-black bg-opacity-30">
                                <button 
                                    className="btn btn-outline-light btn-sm px-3" 
                                    onClick={() => setActivityToCancel(null)}
                                    disabled={isCancellingActivity}
                                >
                                    Nevermind
                                </button>
                                <button 
                                    className="btn btn-danger btn-sm px-3 fw-bold"
                                    disabled={isCancellingActivity}
                                    onClick={async () => {
                                        setIsCancellingActivity(true);
                                        await cancelActivityRegistration(activityToCancel.activityId || activityToCancel.id);
                                        setIsCancellingActivity(false);
                                        setActivityToCancel(null);
                                    }}
                                >
                                    {isCancellingActivity ? "Cancelling..." : "Yes, Cancel Registration"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Certificate Modal Overlay */}
            {selectedCert && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0, 0, 0, 0.85)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content bg-transparent border-0">
                            {/* Certificate Canvas Frame */}
                            <div className="certificate-frame p-4 rounded-4 shadow-lg" style={{ background: "radial-gradient(circle, #101b33 0%, #0b1120 100%)", border: "2px solid rgba(255,255,255,0.06)", position: "relative" }}>
                                <div className="p-5 h-100 rounded-3 text-center d-flex flex-column justify-content-between" style={{ border: "2px solid #f59e0b" }}>
                                    
                                    {/* Header Seal */}
                                    <div className="mb-4">
                                        <h5 className="text-warning fw-bold text-uppercase tracking-widest mb-1 fs-8" style={{ fontFamily: "var(--font-heading)" }}>
                                            CAMPUSCONNECT ACADEMIC NETWORK
                                        </h5>
                                        <div className="d-flex align-items-center justify-content-center my-3">
                                            <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "70px", height: "70px", border: "2px double #f59e0b" }}>
                                                <FaAward size={32} />
                                            </div>
                                        </div>
                                        <h2 className="text-white fw-extrabold" style={{ fontFamily: "var(--font-heading)", letterSpacing: "2px", fontSize: "1.8rem" }}>
                                            CERTIFICATE OF {selectedCert.certificateType?.toUpperCase()}
                                        </h2>
                                    </div>

                                    {/* Presenting block */}
                                    <div className="my-3">
                                        <span className="text-muted fs-8 text-uppercase tracking-wider">This is proudly awarded to</span>
                                        <h3 className="text-warning fw-bold mt-2 mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", borderBottom: "1px dashed rgba(255,255,255,0.15)", display: "inline-block", paddingBottom: "5px" }}>
                                            {currentUser.name}
                                        </h3>
                                        <p className="text-muted fs-7 mt-2">
                                            Roll Number: <strong>{currentUser.rollNumber || "23MX101"}</strong> • Department of <strong>{currentUser.department}</strong>
                                        </p>
                                    </div>

                                    {/* Event Details block */}
                                    {getEventForReg(selectedCert) ? (
                                        <div className="my-3 text-white text-opacity-80 fs-7 max-width-600 mx-auto leading-relaxed">
                                            for outstanding {selectedCert.certificateType === "Volunteer" ? "services as a volunteer" : selectedCert.certificateType === "Winner" ? "performance as a winner" : "participation"} in the campus event 
                                            <strong className="text-white d-block fs-6 my-2">"{getEventForReg(selectedCert).title}"</strong>
                                            conducted by the <strong>{getEventForReg(selectedCert).organizer || "Student Committee"}</strong> at the venue 
                                            <strong> {getEventForReg(selectedCert).venue}</strong> on <strong>{getEventForReg(selectedCert).date}</strong>.
                                        </div>
                                    ) : (
                                        <div className="my-3 text-danger fs-7 max-width-600 mx-auto leading-relaxed">
                                            Error: Event details are no longer available. This event may have been deleted by the organizer.
                                        </div>
                                    )}

                                    {/* Signatures Row */}
                                    <div className="row g-4 mt-5 pt-3 align-items-center">
                                        <div className="col-4">
                                            <div className="text-center text-white text-opacity-50 fs-8 border-top border-secondary pt-2">
                                                <em className="text-white fs-7 d-block mb-1">{getEventForReg(selectedCert)?.coordinatorName || "Aakash K"}</em>
                                                <strong>EVENT COORDINATOR</strong>
                                            </div>
                                        </div>
                                        <div className="col-4 d-none d-md-block">
                                            <div className="d-flex justify-content-center">
                                                <div className="text-warning border border-warning border-opacity-30 rounded-circle p-2 fs-9 fw-bold" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    SEAL
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-center text-white text-opacity-50 fs-8 border-top border-secondary pt-2">
                                                <em className="text-white fs-7 d-block mb-1">Dr. S. Premkumar</em>
                                                <strong>PRINCIPAL / DEAN</strong>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Verification Hash */}
                                    {selectedCert.certificateId && (
                                        <div className="text-center mt-4 border-top border-secondary border-opacity-25 pt-3">
                                            <small className="text-warning text-opacity-75 fs-9 font-monospace" style={{ letterSpacing: '1px' }}>
                                                ID: {selectedCert.certificateId}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="p-3 bg-dark bg-opacity-70 text-center border-top border-secondary rounded-bottom-4 d-flex justify-content-center gap-3">
                                <button 
                                    className="btn btn-warning px-4 d-flex align-items-center gap-2 fw-bold text-dark"
                                    onClick={() => window.print()}
                                >
                                    <FaPrint /> Print Certificate
                                </button>
                                <button 
                                    className="btn btn-outline-light px-4"
                                    onClick={() => setSelectedCert(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default StudentDashboard;