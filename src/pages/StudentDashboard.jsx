import { useContext, useState } from "react";
import { Link } from "react-router-dom";
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
    FaInfoCircle
} from "react-icons/fa";

function StudentDashboard() {
    const { currentUser, events, registrations, bookmarks, notifications, cancelEventRegistration, markNotificationAsRead } = useContext(AppContext);
    
    const [selectedTicketEvent, setSelectedTicketEvent] = useState(null);
    const [selectedCert, setSelectedCert] = useState(null);
    const [activeTab, setActiveTab] = useState("upcoming");

    // Gather student registrations and helper details
    const studentRegs = registrations.filter((r) => r.studentId === currentUser.id);
    const getEventForReg = (reg) => events.find((e) => e.id === reg.eventId);

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

    // Bookmarked events
    const savedEvents = events.filter((e) => bookmarks?.includes(e.id));

    // AI Recommendations based on department and category preferences
    const recommendations = events
        .filter((e) => {
            const alreadyReg = studentRegs.some((r) => r.eventId === e.id && r.status !== "Cancelled" && r.status !== "Rejected");
            return !alreadyReg && (e.department?.toLowerCase() === currentUser.department?.toLowerCase() || e.trending);
        })
        .slice(0, 3);

    const userNotifications = notifications.filter(n => !n.targetUserId || n.targetUserId === currentUser.id);

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
                    <FaCalendarCheck className="text-primary" /> My Registrations
                </h3>
                <div className="d-flex flex-wrap gap-1">
                    {["upcoming", "completed", "pending", "cancelled"].map((tab) => (
                        <button
                            key={tab}
                            className={`btn btn-sm py-1 px-3 fs-8 rounded-pill text-capitalize ${activeTab === tab ? 'btn-primary' : 'btn-outline-light border-0'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab} (
                                tab === "upcoming" ? upcomingRegs.length :
                                tab === "completed" ? completedRegs.length :
                                tab === "pending" ? pendingRegs.length :
                                cancelledRegs.length
                            )
                        </button>
                    ))}
                </div>
            </div>

            {/* Registrations List */}
            {activeRegsList.length === 0 ? (
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
                                                    onClick={() => setSelectedTicketEvent({ ...event, ticketId: reg.ticketId })}
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
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0, 0, 0, 0.8)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-transparent border-0">
                            <div className="ticket-wrapper">
                                <div className="ticket-header">
                                    <h3 className="mb-1 text-white fw-bold">EVENT TICKET</h3>
                                    <span className="badge bg-dark bg-opacity-30 border border-white border-opacity-30">{selectedTicketEvent.category}</span>
                                </div>
                                <div className="ticket-body">
                                    <h4 className="text-white text-center mb-4 fw-extrabold">{selectedTicketEvent.title}</h4>
                                    
                                    <div className="row g-3 mb-4 text-white text-opacity-80">
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-8 text-uppercase">Attendee</span>
                                            <strong>{currentUser.name}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-8 text-uppercase">Department</span>
                                            <strong>{currentUser.department}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-8 text-uppercase">Date & Time</span>
                                            <strong>{selectedTicketEvent.date}<br />{selectedTicketEvent.time}</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted d-block fs-8 text-uppercase">Venue</span>
                                            <strong>{selectedTicketEvent.venue}</strong>
                                        </div>
                                    </div>

                                    <div className="ticket-divider"></div>

                                    <div className="text-center mt-3">
                                        <span className="text-muted d-block fs-8 text-uppercase mb-2">Scan Code at Entrance</span>
                                        <div className="d-flex justify-content-center">
                                            <QRCode value={selectedTicketEvent.ticketId || `CC-${selectedTicketEvent.id}-${currentUser.id}`} size={120} />
                                        </div>
                                        <small className="text-muted d-block mt-3 font-monospace">Ticket ID: {selectedTicketEvent.ticketId || `CC-${selectedTicketEvent.id}-${currentUser.id}`}</small>
                                    </div>
                                </div>
                                <div className="p-3 bg-dark bg-opacity-50 text-center border-top border-secondary">
                                    <button 
                                        className="btn btn-primary btn-sm px-4"
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