import { Link } from "react-router-dom";
import { FaCalendarAlt, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

function Footer() {
    return (
        <footer className="editorial-footer py-5 mt-5">
            <div className="container">
                <div className="row g-4">
                    {/* Brand Section */}
                    <div className="col-lg-5 col-md-12 mb-4 mb-lg-0">
                        <Link className="d-flex align-items-center gap-2 editorial-brand fs-4 mb-3 text-decoration-none" to="/">
                            <FaCalendarAlt style={{ color: "var(--accent-purple)" }} />
                            <span>CampusConnect</span>
                            <span className="editorial-brand-dot" aria-hidden="true"></span>
                        </Link>
                        <p className="text-muted mb-0" style={{ maxWidth: "400px" }}>
                            The central hub for all campus activities. Empowering student bodies, streamlining registrations, and enhancing engagement.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                        <h5 className="serif-heading fs-6 fw-semibold mb-3">Navigation</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2 text-muted fs-8">
                            <li><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
                            <li><Link to="/events" className="text-muted text-decoration-none">All Events</Link></li>
                            <li><Link to="/login" className="text-muted text-decoration-none">Login</Link></li>
                            <li><Link to="/register" className="text-muted text-decoration-none">Register</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="col-lg-4 col-md-6 text-muted fs-8">
                        <h5 className="serif-heading fs-6 fw-semibold mb-3">Campus Office</h5>
                        <p className="d-flex align-items-center gap-2 mb-2"><FaMapMarkerAlt style={{ color: "var(--accent-purple)" }} /> Academic Block II, Student Activity Centre</p>
                        <p className="d-flex align-items-center gap-2 mb-2"><FaPhone style={{ color: "var(--accent-purple)" }} /> +91 422 123456</p>
                        <p className="d-flex align-items-center gap-2 mb-0"><FaEnvelope style={{ color: "var(--accent-purple)" }} /> events@college.edu</p>
                    </div>
                </div>

                <hr className="editorial-rule my-4" />

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center text-muted fs-8">
                    <span>© 2026 CampusConnect. All Rights Reserved.</span>
                    <span className="mt-2 mt-sm-0">Pair Programmed with Antigravity AI</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;