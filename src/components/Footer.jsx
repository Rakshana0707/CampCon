import { Link } from "react-router-dom";
import { FaCalendarAlt, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

function Footer() {
    return (
        <footer className="bg-dark text-light py-5 mt-5 border-top border-secondary border-opacity-35" style={{ background: "rgba(10, 15, 28, 0.95)" }}>
            <div className="container">
                <div className="row g-4">
                    {/* Brand Section */}
                    <div className="col-lg-5 col-md-12 mb-4 mb-lg-0">
                        <Link className="d-flex align-items-center gap-2 text-white fw-bold fs-4 mb-3" to="/">
                            <FaCalendarAlt className="text-primary" />
                            <span style={{ fontFamily: "var(--font-heading)" }}>Campus<span className="text-primary">Connect</span></span>
                        </Link>
                        <p className="text-muted mb-0" style={{ maxWidth: "400px" }}>
                            The central hub for all campus activities. Empowering student bodies, streamlining registrations, and enhancing engagement.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                        <h5 className="text-white fw-semibold mb-3">Navigation</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2 text-muted">
                            <li><Link to="/" className="text-muted hover:text-white">Home</Link></li>
                            <li><Link to="/events" className="text-muted hover:text-white">All Events</Link></li>
                            <li><Link to="/login" className="text-muted hover:text-white">Login</Link></li>
                            <li><Link to="/register" className="text-muted hover:text-white">Register</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="col-lg-4 col-md-6 text-muted">
                        <h5 className="text-white fw-semibold mb-3">Campus Office</h5>
                        <p className="d-flex align-items-center gap-2 mb-2"><FaMapMarkerAlt className="text-primary" /> Academic Block II, Student Activity Centre</p>
                        <p className="d-flex align-items-center gap-2 mb-2"><FaPhone className="text-primary" /> +91 422 123456</p>
                        <p className="d-flex align-items-center gap-2 mb-0"><FaEnvelope className="text-primary" /> events@college.edu</p>
                    </div>
                </div>

                <hr className="border-secondary my-4" />

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center text-muted fs-8">
                    <span>© 2026 CampusConnect. All Rights Reserved.</span>
                    <span className="mt-2 mt-sm-0">Pair Programmed with Antigravity AI</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;