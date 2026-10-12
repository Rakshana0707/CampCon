import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

function NotFound() {
    return (
        <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
            <div className="glass-panel p-5 max-width-600 shadow-lg">
                <FaExclamationTriangle className="text-warning display-1 mb-4" />
                <h1 className="text-white fw-extrabold mb-3">404 - Page Not Found</h1>
                <p className="text-muted mb-4 fs-6">
                    Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
                </p>
                <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2">
                    <FaHome /> Back to Home
                </Link>
            </div>
        </div>
    );
}

export default NotFound;