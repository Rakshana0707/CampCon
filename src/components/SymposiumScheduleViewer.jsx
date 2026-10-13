import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '../context/AppContext';
import { FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

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

  // Fallback to event properties if dayNumbers or activities not passed directly
  const effectiveDayNumbers = dayNumbers && dayNumbers.length > 0
    ? dayNumbers
    : Array.from({ length: Math.max(1, event?.numberOfDays || 1) }, (_, i) => i + 1);

  const effectiveActivities = activities && activities.length > 0
    ? activities
    : (event?.activities || []);

  const isStudent = currentUser?.role?.toLowerCase() === 'student';
  const dayActivities = effectiveActivities.filter(a => a.dayNumber === activeDay && a.isActive);

  const isActivityRegistered = (activityId) => {
    return activityRegistrations?.some(ar => ar.activityId === activityId && ar.status !== 'CANCELLED');
  };

  const handleActivityRegister = async (activity) => {
    if (!currentUser) {
      alert('Please log in to register for activities.');
      return;
    }
    if (activity.requiresOverallRegistration && !isRegisteredOverall) {
      alert('This activity requires overall symposium registration first. Please register for the symposium above!');
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
                  {isStudent ? (
                    <button
                      className={`btn btn-sm px-4 py-2 fw-bold ${registered ? 'btn-success' : isFull ? 'btn-secondary disabled' : 'btn-outline-warning'}`}
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
