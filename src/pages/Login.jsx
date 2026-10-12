import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaEnvelope, FaLock, FaUserGraduate, FaShieldAlt, FaBriefcase, FaArrowLeft } from "react-icons/fa";

function Login() {
    const { login, currentUser } = useContext(AppContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            const from = location.state?.from?.pathname;
            if (from) {
                navigate(from, { replace: true });
            } else {
                const role = currentUser.role.toLowerCase();
                if (role === "admin") navigate("/admin");
                else if (role === "organizer") navigate("/organizer");
                else navigate("/student");
            }
        }
    }, [currentUser, navigate, location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await login(email, password);
        if (res.success) {
            const from = location.state?.from?.pathname;
            if (from) {
                navigate(from, { replace: true });
            } else {
                const role = res.user.role.toLowerCase();
                if (role === "admin") navigate("/admin");
                else if (role === "organizer") navigate("/organizer");
                else navigate("/student");
            }
        } else {
            setIsSubmitting(false);
        }
    };

    // Quick Login Seed Accounts
    const handleQuickLogin = (role) => {
        let testEmail = "";
        if (role === "student") testEmail = "student@college.edu";
        else if (role === "organizer") testEmail = "organizer@college.edu";
        else if (role === "organizer-pending") testEmail = "vikram@college.edu";
        else if (role === "admin") testEmail = "admin@college.edu";

        setEmail(testEmail);
        setPassword("password123");
    };

    return (
        <div className="auth-page">
            <div className="container">
                {/* Back to Home Button */}
                <div className="mb-4 text-center">
                    <Link to="/" className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2">
                        <FaArrowLeft /> Back to Home
                    </Link>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="auth-card glass-panel shadow-lg">
                            <h2 className="text-center fw-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                                Welcome Back 👋
                            </h2>
                            <p className="text-center text-muted mb-4">
                                Sign in to check your campus events
                            </p>

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label htmlFor="loginEmail" className="text-white form-label fw-medium">Email Address <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-dark border-secondary text-muted">
                                            <FaEnvelope />
                                        </span>
                                        <input
                                            id="loginEmail"
                                            type="email"
                                            className="form-control"
                                            placeholder="name@college.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="loginPassword" className="text-white form-label fw-medium">Password <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-dark border-secondary text-muted">
                                            <FaLock />
                                        </span>
                                        <input
                                            id="loginPassword"
                                            type="password"
                                            className="form-control"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <button 
                                    className="btn btn-primary w-100 py-3 fw-bold mb-3 fs-6 d-flex justify-content-center align-items-center gap-2"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Authenticating...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>
                            </form>

                            {/* Demo Accounts Panel */}
                            <div className="mt-4 p-3 rounded bg-dark bg-opacity-50 border border-secondary">
                                <span className="text-muted d-block text-center fs-7 mb-2 fw-semibold">
                                    QUICK DEMO ACCOUNTS
                                </span>
                                <div className="d-flex flex-column gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-light btn-sm py-2 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handleQuickLogin("student")}
                                    >
                                        <FaUserGraduate className="text-primary" /> Student Account
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-light btn-sm py-2 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handleQuickLogin("organizer")}
                                    >
                                        <FaBriefcase className="text-success" /> Organizer (Approved)
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-light btn-sm py-2 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handleQuickLogin("organizer-pending")}
                                    >
                                        <FaBriefcase className="text-warning" /> Organizer (Pending Approval)
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-light btn-sm py-2 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handleQuickLogin("admin")}
                                    >
                                        <FaShieldAlt className="text-danger" /> Admin Account
                                    </button>
                                </div>
                            </div>

                            <p className="text-center text-muted mt-4 mb-0">
                                Don't have an account?
                                <Link to="/register" className="ms-2 text-primary fw-semibold">
                                    Register
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;