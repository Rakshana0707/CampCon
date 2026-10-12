import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaChevronRight, FaArrowLeft } from "react-icons/fa";

function Register() {
    const { registerUser, currentUser } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        department: "",
        rollNumber: "",
        year: "I Year",
        role: "Student"
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const submissionData = {
            ...form,
            collegeName: form.collegeName === "External College" ? (form.customCollegeName || "External College") : "Our College"
        };
        const res = await registerUser(submissionData);
        if (res.success) {
            if (res.user.status === "Pending") {
                navigate("/login");
            } else {
                const from = location.state?.from?.pathname;
                if (from) {
                    navigate(from, { replace: true });
                } else {
                    const role = res.user.role.toLowerCase();
                    if (role === "admin") navigate("/admin");
                    else if (role === "organizer") navigate("/organizer");
                    else navigate("/student");
                }
            }
        } else {
            setIsSubmitting(false);
        }
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
                    <div className="col-lg-6">
                        <div className="auth-card glass-panel shadow-lg">
                            <h2 className="text-center fw-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                                Create Account 🚀
                            </h2>
                            <p className="text-center text-muted mb-4">
                                Join CampusConnect to organize or attend events
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="regName" className="text-white form-label fw-medium">Full Name <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-muted">
                                                <FaUser />
                                            </span>
                                            <input
                                                id="regName"
                                                className="form-control"
                                                placeholder="John Doe"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="regEmail" className="text-white form-label fw-medium">Email Address <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-muted">
                                                <FaEnvelope />
                                            </span>
                                            <input
                                                id="regEmail"
                                                className="form-control"
                                                placeholder="john@college.edu"
                                                name="email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="regDept" className="text-white form-label fw-medium">Department <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-muted">
                                                <FaBuilding />
                                            </span>
                                            <input
                                                id="regDept"
                                                className="form-control"
                                                placeholder="Computer Science"
                                                name="department"
                                                value={form.department}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="regYear" className="text-white form-label fw-medium">Year of Study / Staff</label>
                                        <select
                                            id="regYear"
                                            className="form-select"
                                            name="year"
                                            value={form.year}
                                            onChange={handleChange}
                                            disabled={form.role !== "Student" || isSubmitting}
                                        >
                                            <option value="I Year">I Year</option>
                                            <option value="II Year">II Year</option>
                                            <option value="III Year">III Year</option>
                                            <option value="IV Year">IV Year</option>
                                            <option value="Staff">Staff / Faculty</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="regRole" className="text-white form-label fw-medium">Role <span className="text-danger">*</span></label>
                                        <select
                                            id="regRole"
                                            className="form-select bg-dark text-white border-secondary"
                                            name="role"
                                            value="Student"
                                            disabled={true}
                                        >
                                            <option value="Student">Student (Attend Events)</option>
                                        </select>
                                        <small className="text-muted fs-9 d-block mt-1">
                                            ℹ️ Official Organizer accounts are provisioned exclusively by College Administration.
                                        </small>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="regCollege" className="text-white form-label fw-medium">College Affiliation <span className="text-danger">*</span></label>
                                        <select
                                            id="regCollege"
                                            className="form-select bg-dark text-white border-secondary"
                                            name="collegeName"
                                            value={form.collegeName || "Our College"}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                        >
                                            <option value="Our College">Our College (Internal Student)</option>
                                            <option value="External College">External College / Other Institution</option>
                                        </select>
                                        <small className="text-muted fs-9 d-block mt-1">
                                            {form.collegeName === "External College" ? "Eligible for all open Inter-College events." : "Institutional email or admin verification grants Intra-College access."}
                                        </small>
                                    </div>
                                </div>

                                {form.collegeName === "External College" && (
                                    <div className="mb-3">
                                        <label htmlFor="regExtName" className="text-white form-label fw-medium">External Institution / College Name <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-muted">
                                                <FaBuilding />
                                            </span>
                                            <input
                                                id="regExtName"
                                                className="form-control"
                                                placeholder="e.g. Coimbatore Institute of Technology"
                                                name="customCollegeName"
                                                value={form.customCollegeName || ""}
                                                onChange={(e) => setForm({ ...form, customCollegeName: e.target.value })}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <label htmlFor="regRoll" className="text-white form-label fw-medium">Roll Number / Student ID <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-muted">
                                                <FaUser />
                                            </span>
                                            <input
                                                id="regRoll"
                                                className="form-control"
                                                placeholder="e.g. 23MX101"
                                                name="rollNumber"
                                                value={form.rollNumber || ""}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-12 mb-4">
                                        <label htmlFor="regPass" className="text-white form-label fw-medium">Password <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-muted">
                                                <FaLock />
                                            </span>
                                            <input
                                                id="regPass"
                                                type="password"
                                                className="form-control"
                                                placeholder="Min 6 characters"
                                                name="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                minLength={6}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {form.role === "Organizer" && (
                                    <div className="alert alert-warning border border-warning border-opacity-30 bg-warning bg-opacity-10 text-warning text-center fs-7 py-3 mb-4 rounded-3">
                                        <strong>Notice:</strong> Your account will need to be approved by the college Administrator before you can access organizer tools.
                                    </div>
                                )}

                                <button 
                                    className="btn btn-success w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>Register Account <FaChevronRight size={14} /></>
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-muted mt-4 mb-0">
                                Already have an account?
                                <Link to="/login" className="ms-2 text-primary fw-semibold">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;