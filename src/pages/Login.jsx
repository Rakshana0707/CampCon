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
        let testPassword = "password123";
        if (role === "student") {
            testEmail = "student@college.edu";
        } else if (role === "organizer-chem" || role === "organizer") {
            testEmail = "organizer@college.edu";
        } else if (role === "organizer-cse") {
            testEmail = "cse.organizer@college.edu";
        } else if (role === "organizer-eee") {
            testEmail = "eee.organizer@college.edu";
        } else if (role === "organizer-music") {
            testEmail = "music.organizer@college.edu";
        } else if (role === "organizer-cyber") {
            testEmail = "cyber.organizer@college.edu";
        } else if (role === "organizer-dramatix") {
            testEmail = "dramatix.organizer@college.edu";
        } else if (role === "organizer-pending") {
            testEmail = "vikram@college.edu";
        } else if (role === "admin") {
            testEmail = "admin@college.edu";
            testPassword = "Admin@123";
        }

        setEmail(testEmail);
        setPassword(testPassword);
    };

    return (
        <div className="py-5" style={{ minHeight: "85vh", backgroundColor: "var(--bg-primary)" }}>
            <div className="container">
                {/* Back to Home Button */}
                <div className="mb-4 text-center">
                    <Link to="/" className="btn btn-editorial-secondary btn-sm d-inline-flex align-items-center gap-2">
                        <FaArrowLeft size={11} /> Back to Front Page
                    </Link>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="editorial-panel p-4 p-md-5 shadow-sm">
                            <div className="text-center mb-4">
                                <span className="editorial-meta-tag mb-1">Account Authentication</span>
                                <h2 className="serif-heading mb-1" style={{ fontSize: "2rem" }}>
                                    Welcome Back
                                </h2>
                                <p className="text-muted fs-8 mb-0">
                                    Sign in to your campus account to manage registrations
                                </p>
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label htmlFor="loginEmail" className="form-label fw-semibold fs-8" style={{ color: "var(--text-main)" }}>
                                        Email Address <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text border-end-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-editorial)", color: "var(--text-muted)" }}>
                                            <FaEnvelope size={12} />
                                        </span>
                                        <input
                                            id="loginEmail"
                                            type="email"
                                            className="form-control border-start-0 fs-8"
                                            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-editorial)", color: "var(--text-main)" }}
                                            placeholder="name@college.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="loginPassword" className="form-label fw-semibold fs-8" style={{ color: "var(--text-main)" }}>
                                        Password <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text border-end-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-editorial)", color: "var(--text-muted)" }}>
                                            <FaLock size={12} />
                                        </span>
                                        <input
                                            id="loginPassword"
                                            type="password"
                                            className="form-control border-start-0 fs-8"
                                            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-editorial)", color: "var(--text-main)" }}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <button 
                                    className="btn btn-editorial-primary w-100 py-2 fw-semibold mb-3 fs-7 d-flex justify-content-center align-items-center gap-2"
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
                            <div className="mt-4 p-3 rounded" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-editorial)" }}>
                                <span className="text-muted d-block text-center fs-9 mb-2 fw-bold text-uppercase tracking-wider">
                                    Quick Demo Profiles
                                </span>
                                <div className="d-flex flex-column gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-light btn-sm py-2 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handleQuickLogin("student")}
                                    >
                                        <FaUserGraduate className="text-primary" /> Student Account
                                    </button>

                                    <div className="p-2 rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed var(--border-editorial)" }}>
                                        <div className="fs-9 text-uppercase text-muted fw-bold mb-1 d-flex align-items-center gap-1">
                                            <FaBriefcase className="text-success" /> Domain Organizers (Isolated Rights)
                                        </div>
                                        <div className="row g-1">
                                            <div className="col-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm w-100 py-1 fs-9 text-truncate text-start"
                                                    onClick={() => handleQuickLogin("organizer-cse")}
                                                    title="Prof. S. Anand (CSE Dept)"
                                                >
                                                    💻 CSE Dept
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm w-100 py-1 fs-9 text-truncate text-start"
                                                    onClick={() => handleQuickLogin("organizer-chem")}
                                                    title="Dr. K. Rajesh (Chem Dept)"
                                                >
                                                    🧪 Chemical Dept
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm w-100 py-1 fs-9 text-truncate text-start"
                                                    onClick={() => handleQuickLogin("organizer-eee")}
                                                    title="Dr. V. Narayanan (EEE Dept)"
                                                >
                                                    ⚡ EEE Dept
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm w-100 py-1 fs-9 text-truncate text-start"
                                                    onClick={() => handleQuickLogin("organizer-music")}
                                                    title="Karthik R (Music Club)"
                                                >
                                                    🎸 Music Club
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm w-100 py-1 fs-9 text-truncate text-start"
                                                    onClick={() => handleQuickLogin("organizer-cyber")}
                                                    title="Aditya Mohan (Cyber Club)"
                                                >
                                                    🛡️ Cyber Club
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm w-100 py-1 fs-9 text-truncate text-start"
                                                    onClick={() => handleQuickLogin("organizer-dramatix")}
                                                    title="Sanjana V (Dramatix)"
                                                >
                                                    🎭 Dramatix Club
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline-light btn-sm py-1 d-flex align-items-center justify-content-center gap-2 fs-8"
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