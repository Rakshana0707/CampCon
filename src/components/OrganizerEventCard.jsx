import {
    FaUsers,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaMapMarkerAlt
} from "react-icons/fa";

function OrganizerEventCard({ event, onEdit, onDelete, onApprove, onReject }) {
    return (
        <div className="organizer-card mb-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between w-100 gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-primary text-white fs-8">{event.category}</span>
                        {event.trending && (
                            <span className="badge bg-danger text-white fs-8">Trending</span>
                        )}
                        {event.status === "PENDING" && <span className="badge bg-warning text-dark fs-8">Pending Approval</span>}
                        {event.status === "REJECTED" && <span className="badge bg-secondary text-white fs-8">Rejected</span>}
                        {event.status === "APPROVED" && <span className="badge bg-success text-white fs-8">Approved</span>}
                    </div>
                    <h4 className="text-white fw-bold mb-2">{event.title}</h4>
                    <div className="d-flex flex-wrap gap-3 text-muted fs-7 mb-0">
                        <span className="d-flex align-items-center gap-1">
                            <FaCalendarAlt size={12} className="text-primary" /> {event.date} {event.time && `• ${event.time}`}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                            <FaMapMarkerAlt size={12} className="text-danger" /> {event.venue}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                            <FaUsers size={12} className="text-success" /> {event.seats} Seats Available
                        </span>
                    </div>
                </div>

                <div className="d-flex gap-2 align-self-end align-self-md-center">
                    {onApprove && event.status === "PENDING" && (
                        <button className="btn btn-success btn-sm px-3" onClick={() => onApprove(event.id)} aria-label={`Approve event ${event.title}`}>Approve</button>
                    )}
                    {onReject && event.status === "PENDING" && (
                        <button className="btn btn-warning btn-sm px-3" onClick={() => onReject(event.id)} aria-label={`Reject event ${event.title}`}>Reject</button>
                    )}
                    <button 
                        className="btn btn-primary btn-sm d-flex align-items-center gap-1 py-2 px-3"
                        onClick={() => onEdit(event.id)}
                        title="Edit Event"
                        aria-label={`Edit event ${event.title}`}
                    >
                        <FaEdit /> Edit
                    </button>
                    <button 
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 py-2 px-3"
                        onClick={() => onDelete(event.id)}
                        title="Delete Event"
                        aria-label={`Delete event ${event.title}`}
                    >
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrganizerEventCard;