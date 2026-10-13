import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import DistrictCollegeSelector from "../components/DistrictCollegeSelector";

const STREAM_CONFIG = {
    "B.E.": {
        name: "B.E. (Bachelor of Engineering)",
        maxYears: 4,
        courses: [
            "Computer Science and Engineering",
            "Information Technology",
            "Electrical and Electronics Engineering",
            "Electronics and Communication Engineering",
            "Mechanical Engineering",
            "Civil Engineering",
            "Electronics Engineering (VLSI Design and Technology)"
        ]
    },
    "B.Tech.": {
        name: "B.Tech. (Bachelor of Technology)",
        maxYears: 4,
        courses: [
            "Information Technology",
            "Artificial Intelligence and Data Science",
            "Chemical Engineering",
            "Computer Science and Business Systems"
        ]
    },
    "M.Sc. (Integrated)": {
        name: "M.Sc. Integrated (5 Years)",
        maxYears: 5,
        courses: [
            "Software Systems",
            "Data Science",
            "Decision and Computing Sciences",
            "Artificial Intelligence and Machine Learning"
        ]
    },
    "M.E. / M.Tech.": {
        name: "M.E. / M.Tech. (Postgraduate)",
        maxYears: 2,
        courses: [
            "Computer Science and Engineering",
            "VLSI Design",
            "Embedded and Real Time Systems",
            "Construction Management",
            "Structural Engineering",
            "Environmental Engineering and Management"
        ]
    },
    "MCA": {
        name: "MCA (Master of Computer Applications)",
        maxYears: 2,
        courses: [
            "Computer Applications"
        ]
    },
    "MBA": {
        name: "MBA (Master of Business Administration)",
        maxYears: 2,
        courses: [
            "Business Administration"
        ]
    },
    "Other": {
        name: "Other Stream / Degree",
        maxYears: 5,
        courses: []
    }
};

function Register() {
    const { registerUser, currentUser } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedStream, setSelectedStream] = useState("B.E.");
    const [selectedCourse, setSelectedCourse] = useState("Computer Science and Engineering");
    const [customCourse, setCustomCourse] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        department: "B.E. Computer Science and Engineering",
        rollNumber: "",
        year: "I Year",
        role: "Student",
        collegeName: "Coimbatore Institute of Technology"
    });

    const availableYears = (() => {
        const cfg = STREAM_CONFIG[selectedStream] || STREAM_CONFIG["B.E."];
        const max = cfg.maxYears || 4;
        const years = ["I Year", "II Year"];
        if (max >= 3) years.push("III Year");
        if (max >= 4) years.push("IV Year");
        if (max >= 5) years.push("V Year");
        years.push("Staff / Faculty");
        return years;
    })();

    const handleStreamChange = (e) => {
        const stream = e.target.value;
        setSelectedStream(stream);
        const cfg = STREAM_CONFIG[stream];
        if (cfg && cfg.courses.length > 0) {
            setSelectedCourse(cfg.courses[0]);
        } else {
            setSelectedCourse("Other");
        }
        const max = cfg?.maxYears || 4;
        if (max < 5 && form.year === "V Year") {
            setForm(prev => ({ ...prev, year: "I Year" }));
        } else if (max < 4 && form.year === "IV Year") {
            setForm(prev => ({ ...prev, year: "I Year" }));
        } else if (max < 3 && form.year === "III Year") {
            setForm(prev => ({ ...prev, year: "I Year" }));
        }
    };

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

        const effectiveDept = (selectedStream === "Other" || selectedCourse === "Other")
            ? customCourse.trim()
            : (selectedCourse.startsWith("M.Sc.") || selectedCourse.startsWith("MCA") || selectedCourse.startsWith("MBA")
                ? selectedCourse
                : `${selectedStream} ${selectedCourse}`);

        if (!effectiveDept) {
            alert("Please specify your course / department name.");
            setIsSubmitting(false);
            return;
        }

        const submissionData = isExternal
            ? {
                ...form,
                department: effectiveDept,
                collegeName: externalInstitution.collegeName,
                affiliationType: "EXTERNAL",
                collegeState: externalInstitution.state,
                collegeDistrict: externalInstitution.district,
                institutionId: parseInt(externalInstitution.institutionId, 10)
            }
            : {
                ...form,
                department: effectiveDept,
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
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="regStream" className="text-white form-label fw-medium">Stream / Degree <span className="text-danger">*</span></label>
                                        <select
                                            id="regStream"
                                            className="form-select bg-dark text-white border-secondary"
                                            value={selectedStream}
                                            onChange={handleStreamChange}
                                            disabled={isSubmitting}
                                        >
                                            {Object.keys(STREAM_CONFIG).map((stream) => (
                                                <option key={stream} value={stream}>{STREAM_CONFIG[stream].name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-5 mb-3">
                                        <label htmlFor="regCourse" className="text-white form-label fw-medium">Course / Branch <span className="text-danger">*</span></label>
                                        {selectedStream === "Other" ? (
                                            <input
                                                id="regCourse"
                                                className="form-control"
                                                placeholder="e.g. B.Sc. Computer Science"
                                                value={customCourse}
                                                onChange={(e) => setCustomCourse(e.target.value)}
                                                disabled={isSubmitting}
                                                required
                                            />
                                        ) : (
                                            <select
                                                id="regCourse"
                                                className="form-select bg-dark text-white border-secondary"
                                                value={selectedCourse}
                                                onChange={(e) => setSelectedCourse(e.target.value)}
                                                disabled={isSubmitting}
                                            >
                                                {STREAM_CONFIG[selectedStream]?.courses.map((course) => (
                                                    <option key={course} value={course}>{course}</option>
                                                ))}
                                                <option value="Other">Other / Not Listed</option>
                                            </select>
                                        )}
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label htmlFor="regYear" className="text-white form-label fw-medium">Year of Study</label>
                                        <select
                                            id="regYear"
                                            className="form-select"
                                            name="year"
                                            value={form.year}
                                            onChange={handleChange}
                                            disabled={form.role !== "Student" || isSubmitting}
                                        >
                                            {availableYears.map((yr) => (
                                                <option key={yr} value={yr}>{yr}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {selectedStream !== "Other" && selectedCourse === "Other" && (
                                    <div className="mb-3">
                                        <label htmlFor="customCourseInput" className="text-white form-label fw-medium fs-8">
                                            Specify Course / Department Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            id="customCourseInput"
                                            className="form-control"
                                            placeholder="e.g. Biotechnology, Robotics, etc."
                                            value={customCourse}
                                            onChange={(e) => setCustomCourse(e.target.value)}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                )}

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