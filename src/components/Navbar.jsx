import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { FaCalendarAlt, FaUserCircle, FaSignOutAlt, FaPlus, FaColumns, FaBars } from "react-icons/fa";

function Navbar() {
    const { currentUser, logout } = useContext(AppContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate("/");
    };

    const getDashboardPath = () => {
        if (!currentUser) return "/";
        const role = currentUser.role.toLowerCase();
        if (role === "admin") return "/admin";
        if (role === "organizer") return "/organizer";
        return "/student";
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: "var(--glass-bg)", backdropFilter: "blur(16px)", borderBottom: "var(--glass-border)" }}>
            <div className="container py-1">
                {/* Logo */}
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/" onClick={() => setIsMenuOpen(false)}>
                    <FaCalendarAlt className="me-2" style={{ color: "var(--accent-primary)" }} />
                    <span style={{ fontFamily: "var(--font-heading)" }}>Campus<span style={{ color: "var(--accent-primary)" }}>Connect</span></span>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="navbar-toggler border-0 shadow-none px-2"
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation"
                >
                    <FaBars className="text-light fs-4" />
                </button>

                {/* Navbar Items */}
                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav mx-auto gap-1">
                        <li className="nav-item">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `nav-link rounded px-3 py-2 ${isActive ? "active fw-bold" : "text-light"}`
                                }
                                style={({ isActive }) => isActive ? { backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--accent-primary)" } : {}}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                to="/events"
                                className={({ isActive }) =>
                                    `nav-link rounded px-3 py-2 ${isActive ? "active fw-bold" : "text-light"}`
                                }
                                style={({ isActive }) => isActive ? { backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--accent-primary)" } : {}}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Discover Events
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                to="/organizers"
                                className={({ isActive }) =>
                                    `nav-link rounded px-3 py-2 ${isActive ? "active fw-bold" : "text-light"}`
                                }
                                style={({ isActive }) => isActive ? { backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--accent-primary)" } : {}}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Official Directory
                            </NavLink>
                        </li>

                        {currentUser && (
                            <li className="nav-item d-lg-none">
                                <NavLink
                                    to={getDashboardPath()}
                                    className={({ isActive }) =>
                                        `nav-link rounded px-3 py-2 ${isActive ? "active fw-bold" : "text-light"}`
                                    }
                                    style={({ isActive }) => isActive ? { backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--accent-primary)" } : {}}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard Home
                                </NavLink>
                            </li>
                        )}
                    </ul>

                    <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-3 mt-lg-0 pb-3 pb-lg-0">
                        {currentUser ? (
                            <>
                                {currentUser.role === "Organizer" && (
                                    <Link to="/create-event" className="btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-1 py-2" onClick={() => setIsMenuOpen(false)}>
                                        <FaPlus size={12} /> Create Event
                                    </Link>
                                )}

                                <div className="dropdown">
                                    <button
                                        className="btn dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 w-100 justify-content-between"
                                        type="button"
                                        id="userDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{ background: "rgba(30, 41, 59, 0.6)", border: "var(--glass-border)", borderRadius: "var(--radius-pill)", color: "var(--text-main)" }}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <FaUserCircle className="fs-5" style={{ color: "var(--accent-primary)" }} />
                                            <span className="fw-medium">{currentUser.name}</span>
                                        </div>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark p-2 border-secondary shadow-lg mt-2 rounded-3" aria-labelledby="userDropdown" style={{ minWidth: "220px", background: "var(--glass-bg)", backdropFilter: "blur(16px)" }}>
                                        <li>
                                            <div className="dropdown-header text-muted pb-0">
                                                <small className="text-uppercase tracking-wider fs-9">Signed in as</small>
                                                <div className="text-white fw-bold text-truncate mt-1" title={currentUser.email}>{currentUser.email}</div>
                                                <span className="badge bg-primary bg-opacity-25 text-primary mt-2">{currentUser.role}</span>
                                            </div>
                                        </li>
                                        <li><hr className="dropdown-divider border-secondary my-2" /></li>
                                        <li>
                                            <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded" to={getDashboardPath()} onClick={() => setIsMenuOpen(false)}>
                                                <FaColumns className="text-muted" /> Dashboard Portal
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider border-secondary my-2" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item text-danger d-flex align-items-center gap-2 py-2 rounded"
                                                onClick={handleLogout}
                                            >
                                                <FaSignOutAlt /> Sign Out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link to="/login" className="btn btn-outline-light px-4 w-100" onClick={() => setIsMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary px-4 w-100" onClick={() => setIsMenuOpen(false)}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;