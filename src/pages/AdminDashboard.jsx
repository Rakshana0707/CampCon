import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AppContext } from "../context/AppContext";
import DashboardLayout from "../layouts/DashboardLayout";
import OrganizerEventCard from "../components/OrganizerEventCard";
import UserCard from "../components/UserCard";
import { 
    FaShieldAlt, 
    FaUsers, 
    FaCalendarAlt, 
    FaChartPie, 
    FaChartLine, 
    FaChartBar, 
    FaUserCog, 
    FaBriefcase, 
    FaBuilding, 
    FaPlus, 
    FaCheck, 
    FaTimes, 
    FaUserCheck, 
    FaUserPlus,
    FaToggleOn,
    FaToggleOff
} from "react-icons/fa";

// Import ChartJS and register components
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

function AdminDashboard() {
    const { currentUser, events, users, registrations, deleteEvent, deleteUser, changeUserRole, updateEventStatus, showToast } = useContext(AppContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("analytics");
    const [analytics, setAnalytics] = useState(null);

    // Official Organizer Management State
    const [organizers, setOrganizers] = useState([]);
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [orgFilter, setOrgFilter] = useState("ALL");
    
    // Assignment and Creation Modals
    const [selectedEntityForAssign, setSelectedEntityForAssign] = useState(null);
    const [assignUserId, setAssignUserId] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        name: "",
        email: "",
        password: "TempPassword123!",
        organizerEntityId: ""
    });

    // Hydrate backend metrics
    const fetchAnalytics = async () => {
        try {
            const res = await api.get("/admin/analytics");
            if (res.data.success) {
                setAnalytics(res.data.analytics);
            }
        } catch (error) {
            console.error("Failed to load analytics from backend:", error);
        }
    };

    const fetchAdminOrganizers = async () => {
        setLoadingOrgs(true);
        try {
            const res = await api.get("/admin/organizers");
            if (res.data.success) {
                setOrganizers(res.data.entities);
            }
        } catch (err) {
            console.error("Failed to fetch admin organizers", err);
        } finally {
            setLoadingOrgs(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        fetchAdminOrganizers();
    }, []);

    // Statistics aggregates
    const totalUsersCount = users.length;
    const studentCount = users.filter((u) => u.role === "Student").length;
    const organizerCount = users.filter((u) => u.role === "Organizer").length;
    const adminCount = users.filter((u) => u.role === "Admin").length;

    const activeEventsCount = events.length;
    const categoryCounts = events.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});

    const deptCounts = events.reduce((acc, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
    }, {});

    const validRegsCount = registrations.filter(r => r.status === "Approved").length;
    const totalRevenue = validRegsCount * 150;

    // Charts configuration: Roles
    const userRoleData = {
        labels: ["Students", "Organizers", "Admins"],
        datasets: [
            {
                label: "User Accounts",
                data: [studentCount, organizerCount, adminCount],
                backgroundColor: [
                    "rgba(56, 189, 248, 0.75)",
                    "rgba(167, 139, 250, 0.75)",
                    "rgba(244, 63, 94, 0.75)"
                ],
                borderColor: ["#38bdf8", "#a78bfa", "#f43f5e"],
                borderWidth: 1
            }
        ]
    };

    const eventCategoryData = {
        labels: Object.keys(categoryCounts),
        datasets: [
            {
                label: "Events",
                data: Object.values(categoryCounts),
                backgroundColor: "rgba(16, 185, 129, 0.75)",
                borderColor: "#10b981",
                borderWidth: 1
            }
        ]
    };

    const eventTypeChartData = {
        labels: ["Intra-College Events", "Inter-College Events"],
        datasets: [
            {
                label: "Events Classification",
                data: [
                    events.filter(e => e.eventType === "INTRA_COLLEGE").length,
                    events.filter(e => e.eventType === "INTER_COLLEGE").length
                ],
                backgroundColor: ["rgba(99, 102, 241, 0.8)", "rgba(6, 182, 212, 0.8)"],
                borderColor: ["#6366f1", "#06b6d4"],
                borderWidth: 1
            }
        ]
    };

    const handleToggleEntityStatus = async (entity) => {
        try {
            const res = await api.patch(`/admin/organizers/${entity.id}/status`, {
                isActive: !entity.isActive
            });
            if (res.data.success) {
                showToast(`${entity.name} is now ${!entity.isActive ? 'Active' : 'Deactivated'}.`, "info");
                fetchAdminOrganizers();
            }
        } catch (err) {
            showToast("Failed to update status", "danger");
        }
    };

    const handleAssignUser = async (e) => {
        e.preventDefault();
        if (!assignUserId || !selectedEntityForAssign) return;

        try {
            const res = await api.post("/admin/organizers/assign", {
                userId: parseInt(assignUserId, 10),
                organizerEntityId: selectedEntityForAssign.id
            });
            if (res.data.success) {
                showToast(`Assigned organizer to ${selectedEntityForAssign.name}!`, "success");
                setSelectedEntityForAssign(null);
                setAssignUserId("");
                fetchAdminOrganizers();
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Assignment failed", "danger");
        }
    };

    const handleRevokeAssignment = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to revoke this organizer assignment?")) return;
        try {
            const res = await api.delete(`/admin/organizers/assignments/${assignmentId}`);
            if (res.data.success) {
                showToast("Assignment revoked successfully", "info");
                fetchAdminOrganizers();
            }
        } catch (err) {
            showToast("Failed to revoke assignment", "danger");
        }
    };

    const handleCreateInviteOrganizer = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/admin/organizers/invite", inviteForm);
            if (res.data.success) {
                showToast(`Organizer account created for ${res.data.user.email}!`, "success");
                setShowInviteModal(false);
                setInviteForm({ name: "", email: "", password: "TempPassword123!", organizerEntityId: "" });
                fetchAdminOrganizers();
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Account creation failed", "danger");
        }
    };

    const handleEditEvent = (id) => {
        navigate(`/edit-event/${id}`);
    };

    const handleDeleteEvent = (id) => {
        if (window.confirm("Are you sure you want to delete this event across the platform?")) {
            deleteEvent(id);
        }
    };

    const handleDeleteUser = (id) => {
        if (id === currentUser.id) {
            alert("Cannot delete your own admin account.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this user?")) {
            deleteUser(id);
        }
    };

    const handleChangeUserRole = (id, newRole) => {
        changeUserRole(id, newRole);
    };

    const handleToggleUserActive = async (id, newActive) => {
        try {
            const res = await api.patch(`/admin/users/${id}/status`, { isActive: newActive });
            if (res.data.success) {
                showToast(`User account ${newActive ? 'activated' : 'deactivated'} successfully`, "info");
                fetchAllUsers();
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to update user status", "danger");
        }
    };

    const handleUpdateAffiliation = async (id, affiliationStatus) => {
        try {
            const res = await api.patch(`/admin/users/${id}/affiliation`, { affiliationStatus });
            if (res.data.success) {
                showToast(`Student affiliation verified as ${affiliationStatus}`, "success");
                fetchAllUsers();
            }
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to update affiliation", "danger");
        }
    };

    const stats = [
        { title: "Platform Users", value: totalUsersCount.toString(), color: "var(--accent-color)" },
        { title: "Active Events", value: activeEventsCount.toString(), color: "var(--accent-emerald)" },
        { title: "Official Entities", value: organizers.length ? organizers.length.toString() : "47", color: "var(--accent-cyan)" },
        { title: "Est. Revenue", value: `₹${totalRevenue}`, color: "var(--accent-amber)" }
    ];

    const sidebarUsersPreview = (
        <div>
            <h3 className="text-white mb-4 fw-bold d-flex align-items-center gap-2 fs-5" style={{ fontFamily: "var(--font-heading)" }}>
                <FaShieldAlt className="text-danger" /> Admin Controls
            </h3>
            <div className="glass-panel p-4 mb-3">
                <p className="text-muted fs-8 mb-0">
                    Administrator authority: Manage official college directory entities, assign verified staff/organizer accounts, and moderate campus events.
                </p>
            </div>
            
            <h5 className="text-white mb-3 mt-4 fw-bold fs-6">Directory Statistics</h5>
            <div className="glass-panel p-3">
                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-50 pb-2 mb-2">
                    <span className="text-muted fs-7">Academic Programmes</span>
                    <span className="text-white fw-bold">16</span>
                </div>
                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-50 pb-2 mb-2">
                    <span className="text-muted fs-7">Approved Clubs</span>
                    <span className="text-white fw-bold">31</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fs-7">Active Entities</span>
                    <span className="text-success fw-bold">
                        {organizers.filter(o => o.isActive).length}
                    </span>
                </div>
            </div>
        </div>
    );

    const filteredOrganizers = organizers.filter(org => {
        if (orgFilter === "ALL") return true;
        return org.type === orgFilter;
    });

    return (
        <DashboardLayout
            title="Global Admin Panel"
            subtitle="Managing official organizers, event scopes, and system metrics"
            stats={stats}
            sidebar={sidebarUsersPreview}
        >
            {/* Tabs Row */}
            <div className="d-flex flex-wrap gap-2 mb-4 border-bottom border-secondary pb-3">
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <FaChartPie /> Platform Analytics
                </button>
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'organizers' ? 'btn-info text-dark' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('organizers')}
                >
                    <FaBuilding /> Organizer Directory & Staffing ({organizers.length || 47})
                </button>
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'events' ? 'btn-success text-dark' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('events')}
                >
                    <FaCalendarAlt /> Manage Events ({activeEventsCount})
                </button>
                <button
                    className={`btn btn-sm py-2 px-4 fs-7 rounded-pill text-capitalize fw-bold d-flex align-items-center gap-2 ${activeTab === 'users' ? 'btn-warning text-dark' : 'btn-outline-light border-0'}`}
                    onClick={() => setActiveTab('users')}
                >
                    <FaUserCog /> Manage Users ({totalUsersCount})
                </button>
            </div>

            {/* TAB: Official Organizer Directory & Staffing */}
            {activeTab === "organizers" && (
                <div className="mt-2">
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <div className="d-flex gap-2 flex-wrap">
                            <button 
                                className={`btn btn-sm ${orgFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary text-light'}`}
                                onClick={() => setOrgFilter('ALL')}
                            >
                                All Entities ({organizers.length})
                            </button>
                            <button 
                                className={`btn btn-sm ${orgFilter === 'DEPARTMENT' ? 'btn-primary' : 'btn-outline-secondary text-light'}`}
                                onClick={() => setOrgFilter('DEPARTMENT')}
                            >
                                🏛️ Academic Departments (16)
                            </button>
                            <button 
                                className={`btn btn-sm ${orgFilter === 'CLUB' ? 'btn-info text-dark' : 'btn-outline-secondary text-light'}`}
                                onClick={() => setOrgFilter('CLUB')}
                            >
                                🚩 Approved Clubs (31)
                            </button>
                        </div>

                        <button 
                            className="btn btn-success btn-sm d-flex align-items-center gap-2"
                            onClick={() => setShowInviteModal(true)}
                        >
                            <FaUserPlus /> Provision Organizer Account
                        </button>
                    </div>

                    {loadingOrgs ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="text-muted mt-2">Loading official directory...</p>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {filteredOrganizers.map(org => (
                                <div key={org.id} className="col-lg-6">
                                    <div className="glass-panel p-3 h-100 border border-secondary border-opacity-30 rounded-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <span className={`badge ${org.type === 'DEPARTMENT' ? 'bg-primary text-white' : 'bg-info text-dark fw-bold'} fs-9 me-2`}>
                                                    {org.type === 'DEPARTMENT' ? 'Department' : 'Club'}
                                                </span>
                                                <span className="badge bg-secondary fs-9">{org.category}</span>
                                            </div>
                                            <button 
                                                className={`btn btn-sm p-1 border-0 ${org.isActive ? 'text-success' : 'text-danger'}`}
                                                onClick={() => handleToggleEntityStatus(org)}
                                                title={org.isActive ? "Click to Deactivate" : "Click to Activate"}
                                            >
                                                {org.isActive ? <FaToggleOn size={26} /> : <FaToggleOff size={26} />}
                                                <span className="ms-1 fs-8">{org.isActive ? "Active" : "Deactivated"}</span>
                                            </button>
                                        </div>

                                        <h6 className="text-white fw-bold mb-1">{org.name}</h6>
                                        <small className="text-muted d-block mb-3 text-truncate">{org.description}</small>

                                        {/* Assigned Accounts list */}
                                        <div className="border-top border-secondary pt-2 mt-2">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted fs-8 fw-semibold">Assigned Organizers ({org.assignments?.length || 0}):</span>
                                                {org.isActive && (
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm py-0 px-2 fs-8"
                                                        onClick={() => setSelectedEntityForAssign(org)}
                                                    >
                                                        + Assign User
                                                    </button>
                                                )}
                                            </div>

                                            {org.assignments && org.assignments.length > 0 ? (
                                                <div className="d-flex flex-wrap gap-2">
                                                    {org.assignments.map(a => (
                                                        <span key={a.id} className="badge bg-dark border border-secondary text-light d-flex align-items-center gap-2 py-1 px-2 fs-8">
                                                            <span>{a.user.name} ({a.user.email})</span>
                                                            <button 
                                                                className="btn btn-link text-danger p-0 border-0 lh-1" 
                                                                onClick={() => handleRevokeAssignment(a.id)}
                                                                title="Revoke assignment"
                                                            >
                                                                &times;
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <small className="text-muted fst-italic fs-8">No accounts currently assigned to this entity.</small>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Assign Existing User */}
            {selectedEntityForAssign && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0, 0, 0, 0.8)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-dark text-white border border-secondary rounded-4">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title fw-bold">Assign Organizer to {selectedEntityForAssign.name}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEntityForAssign(null)}></button>
                            </div>
                            <form onSubmit={handleAssignUser}>
                                <div className="modal-body">
                                    <p className="text-muted fs-8 mb-3">
                                        Select a user from the platform to grant organizer privileges for <strong>{selectedEntityForAssign.name}</strong>. The user's role will automatically be upgraded to ORGANIZER.
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label text-muted fs-8 text-uppercase">Select User</label>
                                        <select 
                                            className="form-select"
                                            value={assignUserId}
                                            onChange={(e) => setAssignUserId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choose User --</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name} ({u.email}) - Current: {u.role}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedEntityForAssign(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Confirm Assignment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Provision/Invite Organizer Account */}
            {showInviteModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0, 0, 0, 0.8)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-dark text-white border border-secondary rounded-4">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title fw-bold">Provision Official Organizer Account</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowInviteModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateInviteOrganizer}>
                                <div className="modal-body">
                                    <p className="text-muted fs-8 mb-3">
                                        Create a restricted organizer account bound strictly to an approved college department or club.
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label text-muted fs-8 text-uppercase">Organizing Entity *</label>
                                        <select 
                                            className="form-select"
                                            value={inviteForm.organizerEntityId}
                                            onChange={(e) => setInviteForm({ ...inviteForm, organizerEntityId: e.target.value })}
                                            required
                                        >
                                            <option value="">-- Select Approved Department or Club --</option>
                                            {organizers.filter(o => o.isActive).map(o => (
                                                <option key={o.id} value={o.id}>
                                                    {o.type === 'CLUB' ? '🚩 Club: ' : '🏛️ Dept: '} {o.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted fs-8 text-uppercase">Staff / Coordinator Name *</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="e.g. Prof. Arumugam"
                                            value={inviteForm.name}
                                            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted fs-8 text-uppercase">Official Email *</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            placeholder="e.g. coordinator@college.edu"
                                            value={inviteForm.email}
                                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted fs-8 text-uppercase">Initial Temporary Password *</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={inviteForm.password}
                                            onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success">Create Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
                <div className="row g-4 mt-1">
                    <div className="col-lg-4">
                        <div className="glass-panel p-4 h-100">
                            <h5 className="text-white mb-4 d-flex align-items-center gap-2 fs-6" style={{ fontFamily: "var(--font-heading)" }}>
                                <FaUsers className="text-primary" /> Roles Breakdown
                            </h5>
                            <div style={{ maxHeight: "200px", display: "flex", justifyContent: "center" }}>
                                <Doughnut 
                                    data={userRoleData} 
                                    options={{
                                        plugins: { legend: { labels: { color: "#94a3b8", font: { size: 10 }, boxWidth: 10 } } }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="glass-panel p-4 h-100">
                            <h5 className="text-white mb-4 d-flex align-items-center gap-2 fs-6" style={{ fontFamily: "var(--font-heading)" }}>
                                <FaBuilding className="text-info" /> Event Classification
                            </h5>
                            <div style={{ maxHeight: "200px", display: "flex", justifyContent: "center" }}>
                                <Doughnut 
                                    data={eventTypeChartData} 
                                    options={{
                                        plugins: { legend: { labels: { color: "#94a3b8", font: { size: 10 }, boxWidth: 10 } } }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="glass-panel p-4 h-100">
                            <h5 className="text-white mb-4 d-flex align-items-center gap-2 fs-6" style={{ fontFamily: "var(--font-heading)" }}>
                                <FaCalendarAlt className="text-warning" /> Categories Breakdown
                            </h5>
                            <div style={{ maxHeight: "200px", display: "flex", justifyContent: "center" }}>
                                <Bar 
                                    data={eventCategoryData}
                                    options={{
                                        scales: {
                                            x: { ticks: { color: "#94a3b8", font: { size: 9 } } },
                                            y: { ticks: { color: "#94a3b8", font: { size: 9 }, stepSize: 1 }, beginAtZero: true }
                                        },
                                        plugins: { legend: { display: false } }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="glass-panel p-4">
                            <h5 className="text-white mb-3 d-flex align-items-center gap-2 fs-6" style={{ fontFamily: "var(--font-heading)" }}>
                                <FaChartLine className="text-info" /> Platform Registration Trends
                            </h5>
                            <div style={{ height: "240px" }}>
                                {analytics?.trends && analytics.trends.length > 0 ? (
                                    <Line 
                                        data={{
                                            labels: analytics.trends.map(t => new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' })),
                                            datasets: [{
                                                label: "Approved Registrations",
                                                data: analytics.trends.map(t => t.count),
                                                borderColor: "#0ea5e9",
                                                backgroundColor: "rgba(14, 165, 233, 0.1)",
                                                borderWidth: 2,
                                                fill: true,
                                                tension: 0.3
                                            }]
                                        }} 
                                        options={{
                                            scales: {
                                                x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
                                                y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#94a3b8", font: { size: 10 }, stepSize: 1 }, beginAtZero: true }
                                            },
                                            plugins: { legend: { display: false } }
                                        }}
                                    />
                                ) : (
                                    <p className="text-muted text-center fs-8 mt-5 pt-3">No registration trends to display yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
                <div className="mt-2">
                    {events.length === 0 ? (
                        <div className="empty-state">
                            <FaBriefcase />
                            <h5>No active events</h5>
                            <p>No events have been created on the platform yet.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {events.map((event) => (
                                <OrganizerEventCard
                                    key={event.id}
                                    event={event}
                                    onEdit={handleEditEvent}
                                    onDelete={handleDeleteEvent}
                                    onApprove={(id) => updateEventStatus(id, "APPROVED")}
                                    onReject={(id) => updateEventStatus(id, "REJECTED")}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="mt-2">
                    <div className="glass-panel p-4">
                        {users.map((user) => (
                            <div key={user.id} className="mb-3">
                                <UserCard
                                    user={user}
                                    onDelete={handleDeleteUser}
                                    onChangeRole={handleChangeUserRole}
                                    onToggleActive={handleToggleUserActive}
                                    onVerifyAffiliation={handleUpdateAffiliation}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}

export default AdminDashboard;