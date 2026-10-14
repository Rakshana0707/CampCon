import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import DashboardLayout from "../layouts/DashboardLayout";
import OrganizerEventCard from "../components/OrganizerEventCard";
import { FaPlus, FaBriefcase, FaCalendarAlt, FaChartPie, FaChartBar, FaUserCheck, FaHandsHelping, FaCheck, FaTimes, FaUsers, FaQrcode, FaSearch, FaTrash, FaGraduationCap, FaCalendarCheck } from "react-icons/fa";

// Import Chart.js and register components
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function OrganizerDashboard() {
    const { 
        currentUser, 
        events, 
        users, 
        registrations, 
        deleteEvent, 
        approveRegistration, 
        rejectRegistration, 
        assignVolunteer,
        removeVolunteer,
        markAttendance
    } = useContext(AppContext);
    
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("events"); // events, approvals, volunteers, attendance
    const [selectedVolunteerEvent, setSelectedVolunteerEvent] = useState("");
    const [selectedVolunteerStudent, setSelectedVolunteerStudent] = useState("");
    const [volunteerFormError, setVolunteerFormError] = useState("");
    const [volunteerFormSuccess, setVolunteerFormSuccess] = useState("");
    const [scannerInput, setScannerInput] = useState("");

    // Identify organizer's assigned domain entities / departments
    const organizerEntityNames = [
        currentUser.department,
        ...(currentUser.organizerAssignments || []).map(a => a.organizerEntity?.name || a.name)
    ].filter(Boolean);

    // Identify events managed by this organizer strictly within their assigned domain
    const myEvents = events.filter(e => {
        if (currentUser.role?.toLowerCase() === "admin") return true;

        const matchesEmail = e.organizerEmail === currentUser.email || (currentUser.id && e.organizerId === currentUser.id);
        const matchesDomain = organizerEntityNames.some(d => 
            d.toLowerCase().trim() === (e.department || "").toLowerCase().trim() ||
            d.toLowerCase().trim() === (e.organizingEntityName || "").toLowerCase().trim() ||
            d.toLowerCase().trim() === (e.organizerEntity?.name || "").toLowerCase().trim()
        );

        return matchesEmail || matchesDomain;
    });
    const displayEvents = myEvents;
    const myEventIds = displayEvents.map(e => e.id);

    // Identify registrations relating to this organizer's events
    const myRegistrations = registrations.filter(r => myEventIds.some(id => String(id) === String(r.eventId)));

    const pendingRequests = myRegistrations.filter(r => r.status?.toLowerCase() === "pending");
    const approvedRegistrations = myRegistrations.filter(r => r.status?.toLowerCase() === "approved" && r.role?.toLowerCase() !== "volunteer");
    const assignedVolunteersList = myRegistrations.filter(r => r.role?.toLowerCase() === "volunteer" && r.status?.toLowerCase() !== "cancelled" && r.status?.toLowerCase() !== "rejected");
    const totalValidRegistrations = pendingRequests.length + approvedRegistrations.length + assignedVolunteersList.length;

    // Simulated Revenue (e.g. 150 per reg)
    const totalRevenue = totalValidRegistrations * 150;

    // Categories Distribution Chart Data (based on their events)
    const categoryCounts = displayEvents.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});

    const doughnutData = {
        labels: Object.keys(categoryCounts),
        datasets: [
            {
                label: "Number of Events",
                data: Object.values(categoryCounts),
                backgroundColor: [
                    "rgba(99, 102, 241, 0.75)",
                    "rgba(6, 182, 212, 0.75)",
                    "rgba(16, 185, 129, 0.75)",
                    "rgba(245, 158, 11, 0.75)"
                ],
                borderColor: [
                    "#6366f1",
                    "#06b6d4",
                    "#10b981",
                    "#f59e0b"
                ],
                borderWidth: 1
            }
        ]
    };

    // Registrations by Event Chart Data
    const barData = {
        labels: displayEvents.map(e => e.title.substring(0, 15) + (e.title.length > 15 ? "..." : "")),
        datasets: [
            {
                label: "Participants Registered",
                data: displayEvents.map(e => myRegistrations.filter(r => r.eventId === e.id && r.status === "Approved").length),
                backgroundColor: "rgba(6, 182, 212, 0.6)",
                borderColor: "#06b6d4",
                borderWidth: 1
            }
        ]
    };

    const canManageEvent = (event) => {
        if (!event) return false;
        if (currentUser.role?.toLowerCase() === "admin") return true;
        const matchesEmail = event.organizerEmail === currentUser.email || (currentUser.id && event.organizerId === currentUser.id);
        const matchesDomain = organizerEntityNames.some(d => 
            d.toLowerCase().trim() === (event.department || "").toLowerCase().trim() ||
            d.toLowerCase().trim() === (event.organizingEntityName || "").toLowerCase().trim() ||
            d.toLowerCase().trim() === (event.organizerEntity?.name || "").toLowerCase().trim()
        );
        return matchesEmail || matchesDomain;
    };

    const handleEdit = (id) => {
        const target = events.find(e => e.id === id);
        if (!canManageEvent(target)) {
            alert("Permission Denied: You can only edit events belonging to your assigned department or club.");
            return;
        }
        navigate(`/edit-event/${id}`);
    };

    const handleDelete = (id) => {
        const target = events.find(e => e.id === id);
        if (!canManageEvent(target)) {
            alert("Permission Denied: You can only delete events belonging to your assigned department or club.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this event?")) {
            deleteEvent(id);
        }
    };

    const [isAssigning, setIsAssigning] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const handleAssignVolunteer = async (e) => {
        e.preventDefault();
        setVolunteerFormError("");
        setVolunteerFormSuccess("");

        if (!selectedVolunteerEvent || !selectedVolunteerStudent) {
            setVolunteerFormError("Please select both an event and a student.");
            return;
        }

        setIsAssigning(true);
        const result = await assignVolunteer(Number(selectedVolunteerEvent), Number(selectedVolunteerStudent));
        const isSuccess = result === true || result?.success === true;
        
        if (isSuccess) {
            setVolunteerFormSuccess("Volunteer assigned successfully!");
            setSelectedVolunteerEvent("");
            setSelectedVolunteerStudent("");
            setTimeout(() => setVolunteerFormSuccess(""), 4000);
        } else {
            setVolunteerFormError(result?.error || "Failed to assign volunteer. They may already be registered or the event is full.");
        }
        setIsAssigning(false);
    };

    const handleRemoveVolunteer = async (vol) => {
        const student = getStudentDetails(vol.studentId || vol.userId);
        const event = getEventDetails(vol.eventId);
        const studentName = student?.name || vol.studentName || vol.user?.name || "this student";
        const eventTitle = event?.title || "the event";

        if (window.confirm(`Are you sure you want to remove ${studentName} as a volunteer for "${eventTitle}"?`)) {
            await removeVolunteer(vol.id, vol.eventId, vol.studentId || vol.userId);
        }
    };

    const handleScan = async (e) => {
        e.preventDefault();
        const ticketId = scannerInput.trim();
        
        if (!ticketId) {
            alert("Please provide a valid Ticket ID.");
            return;
        }

        setIsScanning(true);
        const success = await markAttendance(ticketId);
        if (success) {
            setScannerInput("");
        }
        setIsScanning(false);
    };

    const stats = [
        { title: "Managed Events", value: displayEvents.length.toString(), color: "var(--accent-color)" },
        { title: "Registrations", value: totalValidRegistrations.toString(), color: "var(--accent-cyan)" },
        { title: "Pending Requests", value: pendingRequests.length.toString(), color: "var(--accent-amber)" },
        { title: "Est. Revenue", value: `₹${totalRevenue}`, color: "var(--accent-emerald)" }
    ];

    const actionsHeader = (
        <div className="d-flex align-items-center gap-2">
            <Link
                to="/student?tab=tickets"
                className="btn btn-outline-info d-flex align-items-center gap-2 py-2 px-3 shadow-sm fs-8"
                title="View events you registered for as a participant"
            >
                <FaQrcode /> My Personal Tickets
            </Link>
            <Link
                to="/create-event"
                className="btn btn-success d-flex align-items-center gap-2 py-2 px-4 shadow"
            >
                <FaPlus /> Create Event
            </Link>
        </div>
    );

    const sidebarCharts = (
        <div className="d-flex flex-column gap-4">
            <div className="glass-panel p-3">
                <h5 className="text-white mb-3 d-flex align-items-center gap-2 fs-6" style={{ fontFamily: "var(--font-heading)" }}>
                    <FaChartPie className="text-primary" /> Event Categories
                </h5>
                <div style={{ maxHeight: "200px", display: "flex", justifyContent: "center" }}>
                    {displayEvents.length > 0 ? (
                        <Doughnut 
                            data={doughnutData} 
                            options={{
                                plugins: {
                                    legend: {
                                        labels: { color: "#94a3b8", boxWidth: 12, font: { size: 10 } }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <p className="text-muted fs-8 text-center mt-4">No events to display</p>
                    )}
                </div>
            </div>

            <div className="glass-panel p-3">
                <h5 className="text-white mb-3 d-flex align-items-center gap-2 fs-6" style={{ fontFamily: "var(--font-heading)" }}>
                    <FaChartBar className="text-cyan" /> Registration Analytics
                </h5>
                <div style={{ maxHeight: "200px" }}>
                    {displayEvents.length > 0 ? (
                        <Bar 
                            data={barData} 
                            options={{
                                scales: {
                                    x: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#94a3b8", font: { size: 9 } } },
                                    y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#94a3b8", font: { size: 9 }, stepSize: 1 }, beginAtZero: true }
                                },
                                plugins: {
                                    legend: { display: false }
                                }
                            }}
                        />
                    ) : (
                        <p className="text-muted fs-8 text-center mt-4">No data available</p>
                    )}
                </div>
            </div>
        </div>
    );

    const getStudentDetails = (studentId) => users.find(u => String(u.id) === String(studentId));
    const getEventDetails = (eventId) => events.find(e => String(e.id) === String(eventId));
    const selectedEventObj = events.find(e => String(e.id) === String(selectedVolunteerEvent));

    const normalizeDept = (dept) => {
        if (!dept) return "";
        return dept.toLowerCase()
            .replace(/^(b\.?e\.?|b\.?tech\.?|m\.?e\.?|m\.?tech\.?|department of)\s*/i, "")
            .replace(/\s+/g, " ")
            .trim();
    };

    const eligibleVolunteerStudents = users.filter(u => {
        const role = (u.role || "").toLowerCase();
        if (role !== "student") return false;

        // Rule 1: Strictly no other/external college students as volunteers
        if (u.affiliationStatus === "EXTERNAL") return false;
        const college = (u.collegeName || "").toLowerCase().trim();
        if (college) {
            const isCit = college.includes("coimbatore institute of technology") || college === "cit" || college === "our college";
            if (!isCit) return false;
        }

        // Rule 2: Department students are the only ones that can volunteer for that symposium/department event
        if (selectedEventObj && selectedEventObj.department) {
            const evtDept = selectedEventObj.department.toLowerCase().trim();
            const isClubOrGeneral = ["club", "cell", "dramatix", "muthamizh", "mandram", "society", "general"].some(k => evtDept.includes(k));
            if (!isClubOrGeneral) {
                const normEvt = normalizeDept(selectedEventObj.department);
                const normStud = normalizeDept(u.department);
                if (normEvt && normStud && normEvt !== normStud && !normEvt.includes(normStud) && !normStud.includes(normEvt)) {
                    return false;
                }
            }
        }

        return true;
    });

    return (
        <DashboardLayout
            title="Organizer Dashboard"
            subtitle={`Managing events for ${currentUser.name}`}
            stats={stats}
            actions={actionsHeader}
            sidebar={sidebarCharts}
        >
            {/* Tabs Row */}
            <div className="d-flex flex-wrap gap-2 mb-4 border-bottom border-secondary pb-3">
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'events' ? 'btn-primary' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('events')}
                >
                    <FaCalendarAlt /> My Events ({displayEvents.length})
                </button>
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'symposiums' ? 'btn-warning text-dark' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('symposiums')}
                >
                    🏛️ Symposium Activities ({displayEvents.filter(e => e.eventFormat === 'SYMPOSIUM').length})
                </button>
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'approvals' ? 'btn-warning text-dark' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('approvals')}
                >
                    <FaUserCheck /> Registration Approvals 
                    {pendingRequests.length > 0 && <span className="badge bg-danger ms-1">{pendingRequests.length}</span>}
                </button>
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'volunteers' ? 'btn-info text-dark' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('volunteers')}
                >
                    <FaHandsHelping /> Volunteers ({assignedVolunteersList.length})
                </button>
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'attendance' ? 'btn-success text-dark' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('attendance')}
                >
                    <FaQrcode /> Scanner
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "events" && (
                <div>
                    {displayEvents.length === 0 ? (
                        <div className="empty-state mt-3">
                            <FaBriefcase />
                            <h5>No events managed</h5>
                            <p>Get started by creating your first campus event.</p>
                            <Link to="/create-event" className="btn btn-success mt-2 px-4 py-2 fw-bold">
                                Create Event
                            </Link>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3 mt-3">
                            {displayEvents.map(event => (
                                <OrganizerEventCard
                                    key={event.id}
                                    event={event}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "symposiums" && (
                <div className="mt-3">
                    {displayEvents.filter(e => e.eventFormat === 'SYMPOSIUM').length === 0 ? (
                        <div className="empty-state mt-3">
                            <FaBriefcase />
                            <h5>No symposiums managed</h5>
                            <p>You have not organized any symposiums yet. Select 'Dedicated Symposium' in the Create Event form.</p>
                            <Link to="/create-event" className="btn btn-warning text-dark mt-2 px-4 py-2 fw-bold">
                                Create Symposium
                            </Link>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-4">
                            {displayEvents.filter(e => e.eventFormat === 'SYMPOSIUM').map(symp => (
                                <OrganizerSymposiumCard key={symp.id} symposium={symp} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "approvals" && (
                <div className="mt-3">
                    {pendingRequests.length === 0 ? (
                        <div className="empty-state mt-3">
                            <FaCheck className="text-success opacity-75" />
                            <h5>All Caught Up!</h5>
                            <p className="mb-0">There are no pending registration requests for your events.</p>
                        </div>
                    ) : (
                        <div className="glass-panel p-0 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-dark table-hover mb-0 align-middle">
                                    <thead className="table-active text-muted fs-8 text-uppercase tracking-wider">
                                        <tr>
                                            <th className="ps-4 py-3 border-0">Student</th>
                                            <th className="py-3 border-0">Event</th>
                                            <th className="py-3 border-0">Role</th>
                                            <th className="pe-4 py-3 border-0 text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map(req => {
                                            const student = getStudentDetails(req.studentId);
                                            const event = getEventDetails(req.eventId);
                                            if (!event) return null;
                                            const studentName = student?.name || req.studentName || "Student";
                                            const studentRoll = student?.rollNumber || req.studentRollNumber || "23MX101";
                                            const studentDept = student?.department || req.studentDepartment || "Student";
                                            
                                            return (
                                                <tr key={req.id}>
                                                    <td className="ps-4 py-3 border-secondary border-opacity-25">
                                                        <div className="fw-bold text-white fs-7">{studentName}</div>
                                                        <div className="text-muted fs-8">{studentRoll} • {studentDept}</div>
                                                    </td>
                                                    <td className="py-3 border-secondary border-opacity-25">
                                                        <span className="text-white fs-7">{event.title}</span>
                                                        <span className="d-block text-muted fs-8">{event.date}</span>
                                                    </td>
                                                    <td className="py-3 border-secondary border-opacity-25">
                                                        <span className="badge bg-secondary bg-opacity-50 text-light border border-light border-opacity-25">
                                                            {req.role}
                                                        </span>
                                                    </td>
                                                    <td className="pe-4 py-3 border-secondary border-opacity-25 text-end">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <button 
                                                                className="btn btn-success btn-sm px-3 d-flex align-items-center gap-1 fs-8 fw-semibold"
                                                                onClick={() => approveRegistration(req.id)}
                                                            >
                                                                <FaCheck /> Approve
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center gap-1 fs-8 fw-semibold"
                                                                onClick={() => rejectRegistration(req.id)}
                                                            >
                                                                <FaTimes /> Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "volunteers" && (
                <div className="mt-3">
                    <div className="glass-panel p-4 mb-4 border border-info border-opacity-25 bg-info bg-opacity-10">
                        <h5 className="text-white mb-3 d-flex align-items-center gap-2 fs-6">
                            <FaPlus className="text-info" /> Assign New Volunteer
                        </h5>
                        
                        {volunteerFormSuccess && (
                            <div className="alert alert-success py-2 fs-7 mb-3 d-flex align-items-center gap-2">
                                <FaCheck /> {volunteerFormSuccess}
                            </div>
                        )}
                        {volunteerFormError && (
                            <div className="alert alert-danger py-2 fs-7 mb-3 d-flex align-items-center gap-2">
                                <FaTimes /> {volunteerFormError}
                            </div>
                        )}

                        <form onSubmit={handleAssignVolunteer} className="row g-3 align-items-end">
                            <div className="col-md-5">
                                <label htmlFor="volEvent" className="form-label text-white fs-8 fw-semibold mb-1">Select Event <span className="text-danger">*</span></label>
                                <select 
                                    id="volEvent"
                                    className="form-select fs-7" 
                                    value={selectedVolunteerEvent}
                                    onChange={(e) => {
                                        setSelectedVolunteerEvent(e.target.value);
                                        setSelectedVolunteerStudent(""); // Reset student selection on event switch
                                        setVolunteerFormError("");
                                        setVolunteerFormSuccess("");
                                    }}
                                    disabled={isAssigning}
                                    required
                                >
                                    <option value="">-- Choose Managed Event --</option>
                                    {displayEvents.map(e => (
                                        <option key={e.id} value={e.id}>
                                            {e.title} ({e.date}) {e.department ? `[${e.department}]` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label htmlFor="volStudent" className="form-label text-white fs-8 fw-semibold mb-0">Select Student <span className="text-danger">*</span></label>
                                    {selectedEventObj && (
                                        <span className="badge bg-info bg-opacity-25 text-info fs-9 border border-info border-opacity-25">
                                            {selectedEventObj.department || "Internal CIT Only"}
                                        </span>
                                    )}
                                </div>
                                <select 
                                    id="volStudent"
                                    className="form-select fs-7" 
                                    value={selectedVolunteerStudent}
                                    onChange={(e) => setSelectedVolunteerStudent(e.target.value)}
                                    disabled={isAssigning || !selectedVolunteerEvent}
                                    required
                                >
                                    {!selectedVolunteerEvent ? (
                                        <option value="">-- Please select an event first --</option>
                                    ) : eligibleVolunteerStudents.length === 0 ? (
                                        <option value="">-- No eligible department students found --</option>
                                    ) : (
                                        <>
                                            <option value="">-- Select Student ({eligibleVolunteerStudents.length} available) --</option>
                                            {eligibleVolunteerStudents.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name} ({u.rollNumber || 'No Roll'}) - {u.department}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                                <div className="form-text fs-9 text-muted mt-1">
                                    <span className="text-warning">●</span> Only verified CIT {selectedEventObj?.department ? `${selectedEventObj.department} students` : 'department students'} can volunteer. External students are not eligible.
                                </div>
                            </div>
                            <div className="col-md-2">
                                <button type="submit" disabled={isAssigning || !selectedVolunteerEvent || !selectedVolunteerStudent} className="btn btn-info w-100 fw-bold d-flex justify-content-center align-items-center gap-2">
                                    {isAssigning ? <span className="spinner-border spinner-border-sm"></span> : "Assign"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="text-white mb-0 fw-bold fs-5 d-flex align-items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                            <FaHandsHelping className="text-info" /> Assigned Team
                            <span className="badge bg-secondary bg-opacity-25 text-info fs-8 fw-semibold px-2.5 py-1 rounded-pill border border-info border-opacity-25 ms-1">
                                {assignedVolunteersList.length} Active
                            </span>
                        </h5>
                    </div>

                    {assignedVolunteersList.length === 0 ? (
                        <div className="empty-state mt-2">
                            <FaUsers />
                            <h5>No Team Members</h5>
                            <p className="mb-0">No volunteers assigned to your events yet.</p>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {assignedVolunteersList.map(vol => {
                                const student = getStudentDetails(vol.studentId || vol.userId);
                                const event = getEventDetails(vol.eventId);
                                if (!event) return null;
                                const studentName = student?.name || vol.studentName || vol.user?.name || "Student";
                                const studentRoll = student?.rollNumber || vol.studentRollNumber || vol.user?.rollNumber || "23MX101";
                                const studentDept = student?.department || vol.studentDepartment || vol.user?.department || "Student";

                                return (
                                    <div key={vol.id} className="col-lg-6 col-12">
                                        <div 
                                            className="glass-panel p-3 h-100 d-flex flex-column justify-content-between rounded-3 border border-secondary border-opacity-25 shadow-sm"
                                            style={{
                                                background: "rgba(15, 23, 42, 0.65)",
                                                backdropFilter: "blur(12px)",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            {/* Top Row: Avatar + Student info + Remove button */}
                                            <div className="d-flex align-items-start justify-content-between gap-3">
                                                <div className="d-flex align-items-center gap-3 min-w-0">
                                                    <div 
                                                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                                        style={{ 
                                                            width: "44px", 
                                                            height: "44px", 
                                                            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)",
                                                            border: "1px solid rgba(6, 182, 212, 0.35)",
                                                            color: "#38bdf8"
                                                        }}
                                                    >
                                                        <FaHandsHelping size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                                            <h6 className="text-white fw-bold mb-0 fs-6 text-truncate" title={studentName}>
                                                                {studentName}
                                                            </h6>
                                                            <span 
                                                                className="badge px-2 py-0.5 fs-9 fw-semibold rounded-pill"
                                                                style={{
                                                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                                                    border: "1px solid rgba(255, 255, 255, 0.15)",
                                                                    color: "#94a3b8"
                                                                }}
                                                            >
                                                                {studentRoll}
                                                            </span>
                                                        </div>
                                                        <p className="text-secondary fs-8 mb-0 d-flex align-items-center gap-1.5 text-truncate" title={studentDept}>
                                                            <FaGraduationCap size={13} className="text-info flex-shrink-0" />
                                                            <span className="text-truncate">{studentDept}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Remove Action Button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-sm d-flex align-items-center gap-1.5 px-2.5 py-1.5 fs-8 rounded-pill flex-shrink-0"
                                                    style={{
                                                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                                                        border: "1px solid rgba(239, 68, 68, 0.28)",
                                                        color: "#f87171",
                                                        transition: "all 0.18s ease"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.22)";
                                                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.55)";
                                                        e.currentTarget.style.color = "#ffffff";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                                                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.28)";
                                                        e.currentTarget.style.color = "#f87171";
                                                    }}
                                                    onClick={() => handleRemoveVolunteer(vol)}
                                                    title={`Remove ${studentName} as volunteer`}
                                                >
                                                    <FaTrash size={11} /> <span>Remove</span>
                                                </button>
                                            </div>

                                            {/* Bottom Strip: Assigned Event */}
                                            <div 
                                                className="mt-3 pt-2.5 d-flex align-items-center justify-content-between flex-wrap gap-2"
                                                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.07)" }}
                                            >
                                                <div className="d-flex align-items-center gap-1.5 fs-8 text-secondary">
                                                    <FaCalendarCheck size={12} className="text-info flex-shrink-0" />
                                                    <span>Assigned Event:</span>
                                                </div>
                                                <span 
                                                    className="badge px-2.5 py-1 fs-8 fw-semibold rounded-pill text-truncate"
                                                    style={{ 
                                                        maxWidth: "280px",
                                                        backgroundColor: "rgba(99, 102, 241, 0.16)",
                                                        border: "1px solid rgba(99, 102, 241, 0.32)",
                                                        color: "#c7d2fe"
                                                    }}
                                                    title={event.title}
                                                >
                                                    {event.title}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "attendance" && (
                <div className="mt-3">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="glass-panel p-5 text-center">
                                <div className="mb-4">
                                    <div className="d-inline-flex bg-success bg-opacity-25 p-4 rounded-circle mb-3" style={{ border: "2px dashed #10b981" }}>
                                        <FaQrcode size={50} className="text-success" />
                                    </div>
                                    <h4 className="text-white fw-bold" style={{ fontFamily: "var(--font-heading)" }}>QR Scanner Terminal (Simulation)</h4>
                                    <div className="alert alert-warning py-2 fs-8 mb-4 border-0 text-start mx-auto" style={{ maxWidth: "450px" }}>
                                        <strong>Note:</strong> This interface simulates a hardware QR scanner. Type the alphanumeric Ticket ID manually. In a secure production environment, this would be an encrypted cryptographic payload scanned directly via camera.
                                    </div>
                                </div>

                                <form onSubmit={handleScan} className="d-flex align-items-center justify-content-center gap-2 mx-auto" style={{ maxWidth: "400px" }}>
                                    <label htmlFor="scanInput" className="visually-hidden">Ticket ID</label>
                                    <input
                                        id="scanInput"
                                        type="text"
                                        className="form-control form-control-lg bg-dark text-white border-secondary text-center font-monospace tracking-wider"
                                        placeholder="e.g. CC-1-2"
                                        value={scannerInput}
                                        onChange={(e) => setScannerInput(e.target.value.toUpperCase())}
                                        disabled={isScanning}
                                        required
                                    />
                                    <button type="submit" disabled={isScanning} className="btn btn-success btn-lg px-4 d-flex align-items-center gap-2 fw-bold">
                                        {isScanning ? <span className="spinner-border spinner-border-sm"></span> : <><FaSearch /> Verify</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}

function OrganizerSymposiumCard({ symposium }) {
    const { addSymposiumActivity, removeSymposiumActivity } = useContext(AppContext);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newActivity, setNewActivity] = useState({
        name: "",
        category: "Technical",
        description: "",
        dayNumber: 1,
        startTime: symposium.rawDate ? new Date(symposium.rawDate).toISOString().slice(0, 16) : "",
        endTime: symposium.rawEndDate ? new Date(symposium.rawEndDate).toISOString().slice(0, 16) : "",
        venue: symposium.venue || "",
        maxParticipants: 50,
        requiresSeparateRegistration: true,
        requiresOverallRegistration: true,
        fee: 0
    });
    const [submitting, setSubmitting] = useState(false);

    const activities = symposium.activities || [];
    const totalDays = Math.max(1, symposium.numberOfDays || 1);

    const handleCreateActivity = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await addSymposiumActivity(symposium.id, newActivity);
        setSubmitting(false);
        if (res) {
            setShowAddModal(false);
            setNewActivity({
                name: "",
                category: "Technical",
                description: "",
                dayNumber: 1,
                startTime: symposium.rawDate ? new Date(symposium.rawDate).toISOString().slice(0, 16) : "",
                endTime: symposium.rawEndDate ? new Date(symposium.rawEndDate).toISOString().slice(0, 16) : "",
                venue: symposium.venue || "",
                maxParticipants: 50,
                requiresSeparateRegistration: true,
                requiresOverallRegistration: true,
                fee: 0
            });
        }
    };

    return (
        <div className="glass-panel p-4 border border-warning border-opacity-30 rounded-4">
            <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                <div>
                    <span className="badge bg-warning text-dark fw-bold px-2 py-1 mb-1">🏛️ DEDICATED SYMPOSIUM</span>
                    <h4 className="text-white fw-bold mb-1">{symposium.title}</h4>
                    <span className="text-muted fs-8">
                        {symposium.date} to {symposium.endDate || symposium.date} • {symposium.venue} • Capacity: {symposium.seats} seats
                    </span>
                </div>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-warning text-dark btn-sm fw-bold d-flex align-items-center gap-1"
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaPlus /> Add Activity
                    </button>
                    <Link to={`/events/${symposium.id}`} className="btn btn-outline-light btn-sm">
                        Public View →
                    </Link>
                </div>
            </div>

            {/* Scheduled Activities Listing */}
            <div className="mt-3">
                <h6 className="text-white fw-bold mb-2 fs-7">Child Activities ({activities.length}):</h6>
                {activities.length === 0 ? (
                    <div className="p-3 rounded-3 bg-dark bg-opacity-40 text-muted fs-8 text-center border border-secondary border-opacity-25">
                        No child activities added yet. Click "+ Add Activity" to schedule events, hackathons, and sessions.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-sm align-middle mb-0 fs-8">
                            <thead>
                                <tr className="text-muted text-uppercase">
                                    <th>Day</th>
                                    <th>Activity Name</th>
                                    <th>Category</th>
                                    <th>Time</th>
                                    <th>Venue</th>
                                    <th>Capacity</th>
                                    <th>Reg Prerequisite</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((act) => (
                                    <tr key={act.id}>
                                        <td><span className="badge bg-secondary">Day {act.dayNumber}</span></td>
                                        <td className="fw-bold text-white">{act.name}</td>
                                        <td><span className="badge bg-primary fs-9">{act.category}</span></td>
                                        <td>{new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(act.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{act.venue}</td>
                                        <td>{act.availableSeats} / {act.maxParticipants} left</td>
                                        <td>
                                            {act.requiresOverallRegistration ? (
                                                <span className="badge bg-warning text-dark fs-9">Overall Required</span>
                                            ) : (
                                                <span className="badge bg-secondary fs-9">Open</span>
                                            )}
                                        </td>
                                        <td className="text-end">
                                            <button 
                                                className="btn btn-outline-danger btn-sm py-0 px-2 fs-9"
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to cancel/remove activity "${act.name}"?`)) {
                                                        removeSymposiumActivity(act.id);
                                                    }
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for adding activity */}
            {showAddModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.8)", zIndex: 1060 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content bg-dark border border-secondary text-white">
                            <form onSubmit={handleCreateActivity}>
                                <div className="modal-header border-secondary">
                                    <h5 className="modal-title fw-bold">Add Activity to {symposium.title}</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <label className="form-label fs-8 fw-bold">Activity Name *</label>
                                            <input 
                                                className="form-control form-control-sm"
                                                value={newActivity.name}
                                                onChange={e => setNewActivity({ ...newActivity, name: e.target.value })}
                                                placeholder="e.g. Algorithmic Coding Sprint"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fs-8 fw-bold">Category</label>
                                            <select 
                                                className="form-select form-select-sm"
                                                value={newActivity.category}
                                                onChange={e => setNewActivity({ ...newActivity, category: e.target.value })}
                                            >
                                                <option value="Technical">Technical</option>
                                                <option value="Non-Technical">Non-Technical</option>
                                                <option value="Workshop">Workshop</option>
                                                <option value="Gaming">Gaming</option>
                                                <option value="General">General</option>
                                            </select>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fs-8 fw-bold">Day Number *</label>
                                            <select 
                                                className="form-select form-select-sm"
                                                value={newActivity.dayNumber}
                                                onChange={e => setNewActivity({ ...newActivity, dayNumber: parseInt(e.target.value, 10) })}
                                            >
                                                {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
                                                    <option key={d} value={d}>Day {d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fs-8 fw-bold">Start Time *</label>
                                            <input 
                                                type="datetime-local" 
                                                className="form-control form-control-sm"
                                                value={newActivity.startTime}
                                                onChange={e => setNewActivity({ ...newActivity, startTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fs-8 fw-bold">End Time *</label>
                                            <input 
                                                type="datetime-local" 
                                                className="form-control form-control-sm"
                                                value={newActivity.endTime}
                                                onChange={e => setNewActivity({ ...newActivity, endTime: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fs-8 fw-bold">Venue *</label>
                                            <input 
                                                className="form-control form-control-sm"
                                                value={newActivity.venue}
                                                onChange={e => setNewActivity({ ...newActivity, venue: e.target.value })}
                                                placeholder="e.g. Lab 204"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fs-8 fw-bold">Max Participants *</label>
                                            <input 
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={newActivity.maxParticipants}
                                                onChange={e => setNewActivity({ ...newActivity, maxParticipants: parseInt(e.target.value, 10) })}
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fs-8 fw-bold">Activity Description</label>
                                            <textarea 
                                                className="form-control form-control-sm"
                                                rows="2"
                                                value={newActivity.description}
                                                onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                                                placeholder="Overview of this specific competition, rules, or session..."
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-check">
                                                <input 
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="requiresOverallRegistrationCheck"
                                                    checked={newActivity.requiresOverallRegistration}
                                                    onChange={e => setNewActivity({ ...newActivity, requiresOverallRegistration: e.target.checked })}
                                                />
                                                <label className="form-check-label fs-8" htmlFor="requiresOverallRegistrationCheck">
                                                    Require Overall Symposium Registration first
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-check">
                                                <input 
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="requiresSeparateRegistrationCheck"
                                                    checked={newActivity.requiresSeparateRegistration}
                                                    onChange={e => setNewActivity({ ...newActivity, requiresSeparateRegistration: e.target.checked })}
                                                />
                                                <label className="form-check-label fs-8" htmlFor="requiresSeparateRegistrationCheck">
                                                    Require Separate Activity Registration
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-warning text-dark btn-sm fw-bold" disabled={submitting}>
                                        {submitting ? "Adding..." : "Add Activity"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrganizerDashboard;