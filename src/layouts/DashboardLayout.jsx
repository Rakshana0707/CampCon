import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import DashboardCard from "../components/DashboardCard";
import { FaUserCircle, FaSignOutAlt, FaColumns, FaCalendarAlt, FaPlus, FaHome, FaBars, FaTimes, FaTicketAlt } from "react-icons/fa";

function DashboardLayout({ title, subtitle, stats = [], children, sidebar, actions }) {
    const { currentUser, logout } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Auto-close sidebar on mobile when navigating
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname, location.search]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (!currentUser) return null;

    const role = currentUser.role
        ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1).toLowerCase()
        : "Student";

    // Sidebar navigation links based on user role
    const getNavLinks = () => {
        if (role === "Student") {
            return [
                { label: "Dashboard Home", path: "/student", icon: <FaColumns /> },
                { label: "My Event Tickets", path: "/student?tab=tickets", icon: <FaTicketAlt /> },
                { label: "Explore Events", path: "/events", icon: <FaCalendarAlt /> }
            ];
        }
        if (role === "Organizer") {
            return [
                { label: "Dashboard Home", path: "/organizer", icon: <FaColumns /> },
                { label: "Create Event", path: "/create-event", icon: <FaPlus /> },
                { label: "View Event Hub", path: "/events", icon: <FaCalendarAlt /> }
            ];
        }
        if (role === "Admin") {
            return [
                { label: "Dashboard Home", path: "/admin", icon: <FaColumns /> },
                { label: "Manage Events", path: "/events", icon: <FaCalendarAlt /> }
            ];
        }
        return [];
    };

    return (
        <div className="container-fluid py-4" style={{ minHeight: "85vh" }}>
            <div className="row g-4">
                {/* Left Sidebar Control Panel */}
                <div className="col-lg-3 col-md-4">
                    {/* Mobile Sidebar Toggle */}
                    <div className="d-md-none mb-3">
                        <button 
                            className="btn btn-outline-light w-100 d-flex justify-content-between align-items-center"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{ borderRadius: "var(--radius-md)" }}
                        >
                            <span className="fw-bold d-flex align-items-center gap-2">
                                <FaColumns /> {role} Menu
                            </span>
                            {isSidebarOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>

                    <div className={`editorial-panel p-4 sticky-top ${isSidebarOpen ? 'd-block' : 'd-none d-md-block'}`} style={{ top: "90px", zIndex: 5 }}>
                        {/* Profile Info */}
                        <div className="text-center mb-4">
                            <FaUserCircle size={56} className="mb-2" style={{ color: "var(--accent-cobalt)" }} />
                            <h5 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>{currentUser.name}</h5>
                            <span className="badge mb-2" style={{ backgroundColor: "var(--accent-primary-subtle)", color: "var(--accent-cobalt)", border: "1px solid var(--accent-cobalt)" }}>{role}</span>
                            <p className="text-muted fs-8 mb-0 text-truncate" title={currentUser.email}>{currentUser.email}</p>
                            {currentUser.department && (
                                <p className="text-muted fs-8 mb-0">{currentUser.department}</p>
                            )}
                        </div>

                        <hr className="my-3" style={{ borderColor: "var(--border-editorial)" }} />

                        {/* Navigation List */}
                        <div className="d-flex flex-column gap-1 mb-4">
                            <span className="text-muted fs-9 fw-bold px-2 text-uppercase" style={{ letterSpacing: "1px" }}>
                                Editorial Portal
                            </span>
                            <Link to="/" className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 py-2 px-3 border-0 rounded" style={{ color: "var(--text-main)", backgroundColor: "transparent" }}>
                                <FaHome className="text-muted" /> Front Page
                            </Link>
                            {getNavLinks().map((link, idx) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={idx}
                                        to={link.path}
                                        className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 py-2 px-3 border-0 rounded"
                                        style={{ 
                                            backgroundColor: isActive ? "var(--accent-primary-subtle)" : "transparent",
                                            color: isActive ? "var(--accent-cobalt)" : "var(--text-main)",
                                            fontWeight: isActive ? "600" : "400"
                                        }}
                                    >
                                        <span style={{ color: isActive ? "var(--accent-cobalt)" : "var(--text-muted)" }}>{link.icon}</span> 
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <hr className="my-3" style={{ borderColor: "var(--border-editorial)" }} />

                        {/* Logout Trigger */}
                        <button
                            className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 py-2 px-3 border-0 rounded"
                            onClick={handleLogout}
                            style={{ color: "var(--status-danger)", backgroundColor: "var(--status-danger-subtle)" }}
                        >
                            <FaSignOutAlt /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Right Content Panel */}
                <div className="col-lg-9 col-md-8">
                    {/* Header */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3 border-bottom pb-3" style={{ borderColor: "var(--border-editorial)" }}>
                        <div>
                            <span className="editorial-meta-tag mb-1">
                                {role} Management
                            </span>
                            <h2 className="serif-heading mb-0" style={{ fontSize: "2.2rem" }}>
                                {title}
                            </h2>
                            <p className="text-muted fs-7 mb-0">{subtitle}</p>
                        </div>
                        {actions && <div className="d-flex align-items-center gap-2 w-100 w-md-auto">{actions}</div>}
                    </div>

                    {/* Stats Metrics Grid */}
                    {stats.length > 0 && (
                        <div className="row g-3 mb-4">
                            {stats.map((stat, idx) => (
                                <DashboardCard
                                    key={idx}
                                    title={stat.title}
                                    value={stat.value}
                                    color={stat.color}
                                />
                            ))}
                        </div>
                    )}

                    {/* Layout Split: Children (Main) & Sidebar (Secondary) */}
                    <div className="row g-4">
                        <div className={sidebar ? "col-lg-8" : "col-12"}>
                            {children}
                        </div>
                        {sidebar && (
                            <div className="col-lg-4">
                                {sidebar}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;
