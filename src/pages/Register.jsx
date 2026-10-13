import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import DistrictCollegeSelector from "../components/DistrictCollegeSelector";

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
        role: "Student",
        collegeName: "Coimbatore Institute of Technology"
    });

    // External institution selection state (managed by DistrictCollegeSelector)
    const [externalInstitution, setExternalInstitution] = useState({
        state: "",
        district: "",
        institutionId: "",
        collegeName: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isExternal = form.collegeName === "External College";

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
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            // Reset external institution when switching affiliation
            ...(name === "collegeName" ? {} : {})
        }));

        // Clear external institution when switching back to internal
        if (name === "collegeName" && value !== "External College") {
            setExternalInstitution({ state: "", district: "", institutionId: "", collegeName: "" });
        }
    };

    // Validation: external students must have a valid institutionId selected
    const isExternalValid = !isExternal || (
        externalInstitution.institutionId &&
        externalInstitution.state &&
        externalInstitution.district
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isExternal && !externalInstitution.institutionId) {
            alert("Please select your institution from the directory.");
            return;
        }

        setIsSubmitting(true);

        const submissionData = isExternal
            ? {
                ...form,
                collegeName: externalInstitution.collegeName,
                affiliationType: "EXTERNAL",
                collegeState: externalInstitution.state,
                collegeDistrict: externalInstitution.district,
                institutionId: parseInt(externalInstitution.institutionId, 10)
            }
            : {
                ...form,
                collegeName: "Coimbatore Institute of Technology",
                affiliationType: "INTERNAL"
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
        <div className="py-5" style={{ minHeight: "85vh", backgroundColor: "var(--bg-primary)" }}>
            <div className="container">
                {/* Back to Home Button */}
                <div className="mb-4 text-center">
                    <Link to="/" className="btn btn-editorial-secondary btn-sm d-inline-flex align-items-center gap-2">
                        <FaArrowLeft size={11} /> Back to Front Page
                    </Link>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        <div className="editorial-panel p-4 p-md-5 shadow-sm">
                            <div className="text-center mb-4">
                                <span className="editorial-meta-tag mb-1">New Membership</span>
                                <h2 className="serif-heading mb-1" style={{ fontSize: "2.1rem" }}>
                                    Join the Campus Journal
                                </h2>
                                <p className="text-muted fs-8 mb-0">
                                    Register as a verified student to enroll in symposiums and hackathons
                                </p>
                            </div>

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
                                                placeholder={isExternal ? "john@example.com" : "yourname@cit.edu.in"}
                                                name="email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </div>
                                        {!isExternal && (
                                            <small className="text-info fs-9 d-block mt-1">
                                                💡 Use your official @cit.edu.in email for instant internal student verification.
                                            </small>
                                        )}
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
                                            <option value="V Year">V Year (Integrated M.Sc.)</option>
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
                                            value={form.collegeName}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                        >
                                            <option value="Coimbatore Institute of Technology">Coimbatore Institute of Technology (Internal Student)</option>
                                            <option value="External College">External College / Other Institution</option>
                                        </select>
                                        <small className="text-muted fs-9 d-block mt-1">
                                            {isExternal
                                                ? "Eligible for all open Inter-College events."
                                                : "Institutional email or admin verification grants Intra-College access."}
                                        </small>
                                    </div>
                                </div>

                                {/* External institution cascading selector */}
                                {isExternal && (
                                    <div className="mb-3">
                                        <DistrictCollegeSelector
                                            value={externalInstitution}
                                            onChange={setExternalInstitution}
                                            disabled={isSubmitting}
                                            userEmail={form.email}
                                        />
                                        {isExternal && !externalInstitution.institutionId && (
                                            <div className="alert alert-warning border border-warning border-opacity-30 bg-warning bg-opacity-10 text-warning py-2 px-3 mt-2 rounded-3 fs-8">
                                                ⚠️ Please select your state, district, and institution to continue.
                                            </div>
                                        )}
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
                                                placeholder={isExternal ? "e.g. 23IT001 or Student ID" : "e.g. 22IT042, 23CS105, 24MSS015, or 7176..."}
                                                name="rollNumber"
                                                value={form.rollNumber || ""}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        </div>
                                        {!isExternal && (
                                            <small className="text-muted fs-9 d-block mt-1">
                                                Accepts CIT department roll numbers across all years &amp; branches (e.g., 22IT042, 23CS105, 24MSS015) or Anna University register numbers (7176...).
                                            </small>
                                        )}
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

                                <button
                                    className="btn btn-success w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
                                    type="submit"
                                    disabled={isSubmitting || !isExternalValid}
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