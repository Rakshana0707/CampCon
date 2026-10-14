import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '../context/AppContext';
import { FaClock, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function SymposiumScheduleViewer({
  event = {},
  dayNumbers = [],
  activities = [],
  currentUser = null,
  isRegisteredOverall = false
}) {
  const [activeDay, setActiveDay] = useState(1);
  const { registerForActivity, cancelActivityRegistration, activityRegistrations } = useContext(AppContext);
  const [processingActivityId, setProcessingActivityId] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);

  // Fallback to event properties if dayNumbers or activities not passed directly
  const effectiveDayNumbers = dayNumbers && dayNumbers.length > 0
    ? dayNumbers
    : Array.from({ length: Math.max(1, event?.numberOfDays || 1) }, (_, i) => i + 1);

  const effectiveActivities = activities && activities.length > 0
    ? activities
    : (event?.activities || []);

  const userRole = currentUser?.role?.toLowerCase();
  const isAdmin = userRole === 'admin';
  const isOrganizer = userRole === 'organizer';

  // Extract organizer domain entities / departments
  const organizerEntityNames = [
    currentUser?.department,
    ...(currentUser?.organizerAssignments || []).map(a => a.organizerEntity?.name || a.name)
  ].filter(Boolean);

  // Conflict of Interest: Organizers cannot participate in activities of their own department's event
  const isOwnDepartmentEvent = isOrganizer && (
    (event?.organizerEmail && currentUser?.email && event.organizerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
    (currentUser?.id && event?.organizerId === currentUser.id) ||
    organizerEntityNames.some(d => {
      const dNorm = d.toLowerCase().trim();
      return (
        (event?.department && event.department.toLowerCase().trim() === dNorm) ||
        (event?.organizingEntityName && event.organizingEntityName.toLowerCase().trim() === dNorm) ||
        (event?.organizerEntity?.name && event.organizerEntity.name.toLowerCase().trim() === dNorm)
      );
    })
  );

  const canParticipate = (userRole === 'student' || isOrganizer) && !isOwnDepartmentEvent && !isAdmin;
  const dayActivities = effectiveActivities.filter(a => a.dayNumber === activeDay && a.isActive);

  const isActivityRegistered = (activityId) => {
    return activityRegistrations?.some(ar => ar.activityId === activityId && ar.status !== 'CANCELLED');
  };

  const handleInitiateActivityAction = (activity) => {
    if (!currentUser) {
      alert('Please log in to register for activities.');
      return;
    }
    const registered = isActivityRegistered(activity.id);
    if (!registered && activity.requiresOverallRegistration && !isRegisteredOverall) {
      alert('This activity requires overall symposium registration first. Please register for the symposium above!');
      return;
    }
    setConfirmModalData({
      activity,
      action: registered ? 'cancel' : 'register'
    });
  };

  const handleConfirmActivityAction = async () => {
    if (!confirmModalData) return;
    const { activity, action } = confirmModalData;
    setProcessingActivityId(activity.id);
    if (action === 'cancel') {
      await cancelActivityRegistration(activity.id);
    } else {
      await registerForActivity(activity.id);
    }
    setProcessingActivityId(null);
    setConfirmModalData(null);
  };

  return (
    <div>
      {/* Day selector tabs */}
      <div className="d-flex gap-2 mb-3 overflow-auto pb-2">
        {effectiveDayNumbers.map(d => (
          <button
            key={d}
            className={`btn btn-sm px-3 py-2 rounded-pill fw-bold ${activeDay === d ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'}`}
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
          {dayActivities.map(act => {
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
                <div>
                  {isAdmin ? (
                    <span className="badge bg-secondary py-2 px-3">Admin View</span>
                  ) : isOwnDepartmentEvent ? (
                    <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 py-2 px-3">Own Dept Event</span>
                  ) : canParticipate || !currentUser ? (
                    <button
                      className={`btn btn-sm px-4 py-2 fw-bold ${registered ? 'btn-success' : isFull ? 'btn-secondary disabled' : 'btn-outline-warning'}`}
                      disabled={isProcessing || (isFull && !registered)}
                      onClick={() => handleInitiateActivityAction(act)}
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

      {/* Confirmation Box Modal for Symposium Activity Registration & Cancellation */}
      {confirmModalData && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ background: "rgba(9, 13, 22, 0.85)", backdropFilter: "blur(6px)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "480px" }}>
            <div className="modal-content text-white border border-secondary border-opacity-50 shadow-lg rounded-4 overflow-hidden" style={{ background: "var(--bg-card, #111827)" }}>
              {/* Header */}
              <div 
                className="p-3 px-4 d-flex justify-content-between align-items-center"
                style={{
                  background: confirmModalData.action === 'register' 
                    ? "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)" 
                    : "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  {confirmModalData.action === 'register' ? (
                    <FaCheckCircle className="text-warning" size={18} />
                  ) : (
                    <FaExclamationTriangle className="text-danger" size={18} />
                  )}
                  <h5 className="mb-0 fw-bold fs-6">
                    {confirmModalData.action === 'register' ? "Confirm Event Registration" : "Confirm Cancellation"}
                  </h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setConfirmModalData(null)}
                  aria-label="Close"
                />
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="mb-3">
                  <span className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 mb-2 fs-9">
                    {confirmModalData.activity.category || "Symposium Track"}
                  </span>
                  <h4 className="fw-bold mb-1 text-white" style={{ fontSize: "1.2rem" }}>
                    {confirmModalData.activity.name}
                  </h4>
                  <div className="text-muted fs-8">
                    Part of <strong className="text-white text-opacity-90">{event?.title || "Symposium"}</strong>
                  </div>
                </div>

                {/* Event Snapshot Details */}
                <div className="p-3 rounded-3 mb-3" style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div className="row g-2 fs-8">
                    <div className="col-6">
                      <span className="text-muted d-block fs-9 text-uppercase">Schedule</span>
                      <span className="text-white fw-semibold">
                        Day {confirmModalData.activity.dayNumber}
                      </span>
                      <div className="text-muted fs-9">
                        {new Date(confirmModalData.activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(confirmModalData.activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block fs-9 text-uppercase">Venue</span>
                      <span className="text-white fw-semibold text-truncate d-block">
                        {confirmModalData.activity.venue}
                      </span>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted d-block fs-9 text-uppercase">Participant Fee</span>
                      <span className="text-success fw-bold">
                        {confirmModalData.activity.fee > 0 ? `₹${confirmModalData.activity.fee}` : "Free (Symposium Pass)"}
                      </span>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted d-block fs-9 text-uppercase">Seat Availability</span>
                      <span className="text-info fw-semibold">
                        {confirmModalData.activity.availableSeats} seats remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notice Message */}
                <p className="fs-8 text-muted mb-0">
                  {confirmModalData.action === 'register' ? (
                    <>
                      📌 <strong>Registration Notice:</strong> By confirming, a seat will be reserved under your name (<strong>{currentUser?.name}</strong>). This will be linked to your symposium entry pass and listed under your personal tickets.
                    </>
                  ) : (
                    <>
                      ⚠️ <strong>Cancellation Notice:</strong> Are you sure you want to cancel your registration for this event? Your reserved seat will be released for other students.
                    </>
                  )}
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="p-3 px-4 d-flex justify-content-end gap-2 border-top border-secondary border-opacity-25" style={{ background: "rgba(0,0,0,0.2)" }}>
                <button 
                  type="button" 
                  className="btn btn-outline-light btn-sm px-3"
                  onClick={() => setConfirmModalData(null)}
                  disabled={processingActivityId === confirmModalData.activity.id}
                >
                  Nevermind
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm px-4 fw-bold ${confirmModalData.action === 'register' ? 'btn-warning text-dark' : 'btn-danger'}`}
                  onClick={handleConfirmActivityAction}
                  disabled={processingActivityId === confirmModalData.activity.id}
                >
                  {processingActivityId === confirmModalData.activity.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : confirmModalData.action === 'register' ? (
                    "Confirm & Register"
                  ) : (
                    "Yes, Cancel Registration"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

SymposiumScheduleViewer.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number,
    numberOfDays: PropTypes.number,
    activities: PropTypes.array
  }),
  dayNumbers: PropTypes.arrayOf(PropTypes.number),
  activities: PropTypes.arrayOf(PropTypes.object),
  currentUser: PropTypes.object,
  isRegisteredOverall: PropTypes.bool
};

export default SymposiumScheduleViewer;
