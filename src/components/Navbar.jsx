import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { 
    FaSearch, 
    FaSun, 
    FaMoon, 
    FaUserCircle, 
    FaSignOutAlt, 
    FaPlus, 
    FaColumns, 
    FaBars,
    FaCompass,
    FaTicketAlt
} from "react-icons/fa";

function Navbar() {
    const { currentUser, logout } = useContext(AppContext);
    const { theme, toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [navSearch, setNavSearch] = useState("");

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate("/");
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (navSearch.trim()) {
            navigate("/events", { state: { initialSearch: navSearch.trim() } });
            setNavSearch("");
            setIsMenuOpen(false);
        }
    };

    const getDashboardPath = () => {
        if (!currentUser) return "/";
        const role = currentUser.role.toLowerCase();
        if (role === "admin") return "/admin";
        if (role === "organizer") return "/organizer";
        return "/student";
    };

    return (
        <nav className="navbar navbar-expand-lg sticky-top editorial-navbar py-2">
            <div className="container">
                {/* Logo & Brand */}
                <Link className="editorial-brand text-decoration-none" to="/" onClick={() => setIsMenuOpen(false)}>
                    <span>CampusConnect</span>
                    <span className="editorial-brand-dot" aria-hidden="true"></span>
                </Link>

                {/* Mobile Controls: Theme toggle + Hamburger */}
                <div className="d-flex align-items-center gap-2 d-lg-none">
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        {isDark ? <FaSun className="text-warning" size={14} /> : <FaMoon size={14} />}
                    </button>

                    <button
                        className="btn btn-sm btn-editorial-secondary p-2"
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation"
                    >
                        <FaBars size={16} />
                    </button>
                </div>

                {/* Navbar Content */}
                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="editorialNavContent">
                    {/* Editorial Nav Links */}
                    <ul className="navbar-nav mx-auto align-items-lg-center gap-1 my-3 my-lg-0">
                        <li className="nav-item">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `editorial-nav-link ${isActive ? "active" : ""}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                to="/events"
                                className={({ isActive }) => `editorial-nav-link ${isActive ? "active" : ""}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Discover
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                to="/events"
                                state={{ selectedEventFormat: "SYMPOSIUM" }}
                                className="editorial-nav-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Symposiums
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                to="/organizers"
                                className={({ isActive }) => `editorial-nav-link ${isActive ? "active" : ""}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Organizations
                            </NavLink>
                        </li>

                        {(currentUser?.role?.toLowerCase() === "student" || currentUser?.role?.toLowerCase() === "organizer") && (
                            <li className="nav-item">
                                <NavLink
                                    to="/student?tab=tickets"
                                    className="editorial-nav-link d-flex align-items-center gap-1"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <FaTicketAlt size={12} /> My Tickets
                                </NavLink>
                            </li>
                        )}

                        {currentUser && (
                            <li className="nav-item d-lg-none">
                                <NavLink
                                    to={getDashboardPath()}
                                    className="editorial-nav-link"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </NavLink>
                            </li>
                        )}
                    </ul>

                    {/* Right Side: Search, Theme Toggle & Auth Controls */}
                    <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 pt-2 pt-lg-0 border-top border-lg-0" style={{ borderColor: "var(--border-editorial)" }}>
                        {/* Compact Search Box */}
                        <form onSubmit={handleSearchSubmit} className="nav-search-wrapper my-2 my-lg-0">
                            <FaSearch 
                                size={12} 
                                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} 
                            />
                            <input
                                type="text"
                                className="nav-search-input w-100"
                                placeholder="Search stories, events..."
                                value={navSearch}
                                onChange={(e) => setNavSearch(e.target.value)}
                            />
                        </form>

                        {/* Desktop Theme Toggle */}
                        <button
                            className="theme-toggle-btn d-none d-lg-inline-flex"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                            title={`Switch to ${isDark ? 'light' : 'dark'} mode (current: ${theme})`}
                        >
                            {isDark ? <FaSun className="text-warning" size={14} /> : <FaMoon size={14} />}
                        </button>

                        {currentUser ? (
                            <div className="d-flex align-items-center gap-2">
                                {currentUser.role?.toLowerCase() === "organizer" && (
                                    <Link 
                                        to="/create-event" 
                                        className="btn btn-editorial-primary btn-sm d-flex align-items-center gap-1 py-1 px-3"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FaPlus size={10} /> Publish
                                    </Link>
                                )}

                                <div className="dropdown">
                                    <button
                                        className="btn btn-editorial-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2 py-1 px-2"
                                        type="button"
                                        id="userEditorialDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <FaUserCircle size={16} style={{ color: "var(--accent-cobalt)" }} />
                                        <span className="fw-semibold fs-8">{currentUser.name}</span>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow-sm p-2 border" style={{ background: "var(--bg-card)", borderColor: "var(--border-editorial)", minWidth: "210px" }} aria-labelledby="userEditorialDropdown">
                                        <li className="px-2 py-1">
                                            <small className="text-muted text-uppercase tracking-wider fs-9 d-block">Account Role</small>
                                            <span className="badge bg-primary bg-opacity-10 text-primary fw-bold mt-1">{currentUser.role}</span>
                                        </li>
                                        <li><hr className="dropdown-divider my-2" style={{ borderColor: "var(--border-editorial)" }} /></li>
                                        <li>
                                            <Link 
                                                className="dropdown-item rounded d-flex align-items-center gap-2 fs-8 py-2" 
                                                to={getDashboardPath()} 
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <FaColumns size={12} /> Dashboard Portal
                                            </Link>
                                        </li>
                                        {(currentUser.role?.toLowerCase() === "student" || currentUser.role?.toLowerCase() === "organizer") && (
                                            <li>
                                                <Link 
                                                    className="dropdown-item rounded d-flex align-items-center gap-2 fs-8 py-2" 
                                                    to="/student?tab=tickets" 
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <FaTicketAlt size={12} /> My Event Tickets
                                                </Link>
                                            </li>
                                        )}
                                        <li><hr className="dropdown-divider my-2" style={{ borderColor: "var(--border-editorial)" }} /></li>
                                        <li>
                                            <button
                                                className="dropdown-item text-danger rounded d-flex align-items-center gap-2 fs-8 py-2"
                                                onClick={handleLogout}
                                            >
                                                <FaSignOutAlt size={12} /> Sign Out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link 
                                    to="/login" 
                                    className="btn btn-editorial-secondary btn-sm py-1 px-3" 
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="btn btn-editorial-primary btn-sm py-1 px-3" 
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Join
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