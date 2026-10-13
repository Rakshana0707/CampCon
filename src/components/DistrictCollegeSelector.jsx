import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { FaUniversity, FaMapMarkerAlt, FaExclamationCircle, FaPlusCircle, FaCheckCircle, FaSyncAlt, FaSearch } from "react-icons/fa";

/**
 * Reusable District-Based College Selector for External Student Registration & Inter-College Events
 *
 * Specific requirements:
 * 1. State: fixed to Tamil Nadu for this feature.
 * 2. District: dropdown containing imported 38 official Tamil Nadu districts.
 * 3. College / Institution: searchable dropdown containing active institutions belonging to selected district.
 *
 * Interaction rules:
 * - Initially no district or college selected.
 * - Changing district clears selected college.
 * - College field remains disabled until a district is selected.
 * - Typing searches institution names in real-time.
 * - Includes "My college isn't listed" verification request workflow.
 */
function DistrictCollegeSelector({
    value = { state: "Tamil Nadu", district: "", institutionId: "", collegeName: "" },
    onChange,
    disabled = false,
    userEmail = "",
    verifiedProfileBadge = false
}) {
    const [districts, setDistricts] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [collegeSearch, setCollegeSearch] = useState("");

    const [loadingLocations, setLoadingLocations] = useState(true);
    const [loadingColleges, setLoadingColleges] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [collegeError, setCollegeError] = useState("");

    // "My college isn't listed" inline drawer
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestForm, setRequestForm] = useState({
        name: "",
        state: "Tamil Nadu",
        district: value.district || "",
        institutionType: "Engineering & Technology"
    });
    const [submittingRequest, setSubmittingRequest] = useState(false);
    const [requestFeedback, setRequestFeedback] = useState(null);

    // 1. Fetch Official Tamil Nadu Districts on mount
    const fetchDistricts = async () => {
        setLoadingLocations(true);
        setLocationError("");
        try {
            const res = await api.get("/institutions/locations");
            if (res.data.success) {
                const tnDistricts = res.data.districtsByState?.["Tamil Nadu"] || [];
                setDistricts(tnDistricts);
            }
        } catch (err) {
            setLocationError(err.response?.data?.error || "Unable to load Tamil Nadu districts directory.");
        } finally {
            setLoadingLocations(false);
        }
    };

    useEffect(() => {
        fetchDistricts();
    }, []);

    // 2. Fetch Colleges when district is selected
    useEffect(() => {
        if (!value.district) {
            setColleges([]);
            setCollegeSearch("");
            setCollegeError("");
            return;
        }

        let isMounted = true;
        const fetchCollegesForDistrict = async () => {
            setLoadingColleges(true);
            setCollegeError("");
            try {
                const res = await api.get("/institutions", {
                    params: {
                        state: "Tamil Nadu",
                        district: value.district
                    }
                });
                if (isMounted && res.data.success) {
                    setColleges(res.data.institutions || []);
                }
            } catch (err) {
                if (isMounted) {
                    setCollegeError(err.response?.data?.error || "Failed to load institutions for this district.");
                }
            } finally {
                if (isMounted) {
                    setLoadingColleges(false);
                }
            }
        };

        fetchCollegesForDistrict();
        return () => {
            isMounted = false;
        };
    }, [value.district]);

    // Keep request form district in sync
    useEffect(() => {
        setRequestForm(prev => ({
            ...prev,
            district: value.district || prev.district || ""
        }));
    }, [value.district]);

    // Handlers enforcing strict reset cascade
    const handleDistrictChange = (e) => {
        const nextDistrict = e.target.value;
        setCollegeSearch("");
        // Changing district clears selected college
        onChange({
            state: "Tamil Nadu",
            district: nextDistrict,
            institutionId: "",
            collegeName: ""
        });
    };

    const handleCollegeSelect = (inst) => {
        if (!inst) {
            onChange({
                state: "Tamil Nadu",
                district: value.district,
                institutionId: "",
                collegeName: ""
            });
            return;
        }
        onChange({
            state: "Tamil Nadu",
            district: value.district,
            institutionId: inst.id,
            collegeName: inst.name
        });
    };

    // Filtered colleges by search query
    const filteredColleges = useMemo(() => {
        if (!collegeSearch.trim()) return colleges;
        const q = collegeSearch.toLowerCase().trim();
        return colleges.filter(c =>
            c.name.toLowerCase().includes(q) ||
            (c.code && c.code.toLowerCase().includes(q)) ||
            (c.institutionType && c.institutionType.toLowerCase().includes(q))
        );
    }, [colleges, collegeSearch]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!requestForm.name.trim() || !requestForm.district) {
            setRequestFeedback({
                type: "danger",
                message: "Please provide the official institution name and district."
            });
            return;
        }

        setSubmittingRequest(true);
        setRequestFeedback(null);
        try {
            const res = await api.post("/institutions/request", {
                name: requestForm.name.trim(),
                state: "Tamil Nadu",
                district: requestForm.district,
                institutionType: requestForm.institutionType,
                requestedByEmail: userEmail || undefined
            });
            if (res.data.success) {
                setRequestFeedback({
                    type: "success",
                    message: res.data.message || "Institution submitted for administrator verification!"
                });
                setRequestForm(prev => ({ ...prev, name: "" }));
            }
        } catch (err) {
            setRequestFeedback({
                type: "danger",
                message: err.response?.data?.error || "Failed to submit institution request."
            });
        } finally {
            setSubmittingRequest(false);
        }
    };

    const selectedCollegeObj = colleges.find(c => String(c.id) === String(value.institutionId));

    return (
        <div
            className="p-3 rounded-3 mb-3"
            style={{
                background: "rgba(37, 99, 235, 0.05)",
                border: "1px solid var(--border-editorial)"
            }}
        >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                    <FaUniversity style={{ color: "var(--accent-cobalt)" }} />
                    <span className="fw-bold fs-8 text-uppercase" style={{ letterSpacing: "0.05em", color: "var(--text-main)" }}>
                        Tamil Nadu Institution Directory Lookup
                    </span>
                </div>
                {verifiedProfileBadge && value.institutionId && (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fs-9">
                        ✓ Linked to Verified Profile Institution
                    </span>
                )}
            </div>

            {locationError && (
                <div className="alert alert-danger py-2 px-3 fs-8 d-flex justify-content-between align-items-center mb-3">
                    <span><FaExclamationCircle className="me-1" /> {locationError}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2 fs-9" onClick={fetchDistricts}>
                        <FaSyncAlt className="me-1" /> Retry
                    </button>
                </div>
            )}

            <div className="row g-3">
                {/* 1. State: Fixed to Tamil Nadu */}
                <div className="col-md-6">
                    <label htmlFor="extStateInput" className="form-label fs-8 fw-semibold mb-1" style={{ color: "var(--text-main)" }}>
                        1. State <span className="text-danger">*</span>
                    </label>
                    <input
                        id="extStateInput"
                        type="text"
                        className="form-control"
                        value="Tamil Nadu"
                        disabled={true}
                        readOnly
                        aria-label="State (Fixed to Tamil Nadu)"
                    />
                    <small className="text-muted fs-9">Official directory active for Tamil Nadu.</small>
                </div>

                {/* 2. Dependent District Selector */}
                <div className="col-md-6">
                    <label htmlFor="extDistrictSelect" className="form-label fs-8 fw-semibold mb-1" style={{ color: "var(--text-main)" }}>
                        2. District <span className="text-danger">*</span>
                    </label>
                    <select
                        id="extDistrictSelect"
                        className="form-select"
                        value={value.district || ""}
                        onChange={handleDistrictChange}
                        disabled={disabled || loadingLocations}
                        aria-label="Select Tamil Nadu District"
                        required
                    >
                        <option value="">
                            {loadingLocations ? "Loading districts..." : "-- Select District (38 Official) --"}
                        </option>
                        {districts.map((dist) => (
                            <option key={dist} value={dist}>
                                {dist}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Searchable College / Institution Selector */}
                <div className="col-12">
                    <label htmlFor="extCollegeSelect" className="form-label fs-8 fw-semibold mb-1" style={{ color: "var(--text-main)" }}>
                        3. College / Institution <span className="text-danger">*</span>
                    </label>

                    {/* Search Input when district selected */}
                    {value.district && colleges.length > 5 && (
                        <div className="input-group input-group-sm mb-2">
                            <span className="input-group-text bg-dark border-secondary text-muted">
                                <FaSearch size={11} />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={`Type to filter among ${colleges.length} colleges in ${value.district}...`}
                                value={collegeSearch}
                                onChange={(e) => setCollegeSearch(e.target.value)}
                                disabled={disabled || loadingColleges}
                            />
                            {collegeSearch && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setCollegeSearch("")}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}

                    <select
                        id="extCollegeSelect"
                        className="form-select"
                        value={value.institutionId || ""}
                        onChange={(e) => {
                            const instId = e.target.value;
                            const matched = colleges.find(c => String(c.id) === String(instId));
                            handleCollegeSelect(matched || null);
                        }}
                        disabled={disabled || !value.district || loadingColleges}
                        aria-label="Select College or Institution"
                        required
                    >
                        <option value="">
                            {!value.district
                                ? "Select a district first to view colleges"
                                : loadingColleges
                                ? `Loading colleges in ${value.district}...`
                                : colleges.length === 0
                                ? `No active colleges listed in ${value.district}`
                                : filteredColleges.length === 0
                                ? `No colleges matching "${collegeSearch}" in ${value.district}`
                                : `-- Select College in ${value.district} (${filteredColleges.length} available) --`}
                        </option>
                        {filteredColleges.map((col) => (
                            <option key={col.id} value={col.id}>
                                {col.name} {col.institutionType ? `(${col.institutionType})` : ""}
                            </option>
                        ))}
                    </select>

                    {collegeError && (
                        <small className="text-danger d-block mt-1 fs-9">
                            <FaExclamationCircle className="me-1" /> {collegeError}
                        </small>
                    )}

                    {value.district && !loadingColleges && colleges.length === 0 && (
                        <div className="alert alert-warning py-2 px-3 mt-2 fs-9 rounded-3">
                            ⚠️ No active institutions are currently mapped to {value.district}. You can use "My college isn't listed" below to request an addition.
                        </div>
                    )}
                </div>
            </div>

            {/* Validation Status & "My college isn't listed" Action */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 pt-2 border-top" style={{ borderColor: "var(--border-hairline)" }}>
                <div className="fs-9 text-muted">
                    {value.institutionId && selectedCollegeObj ? (
                        <span className="text-success fw-semibold">
                            <FaCheckCircle className="me-1" />
                            Selected: {selectedCollegeObj.name} ({selectedCollegeObj.district}, Tamil Nadu)
                        </span>
                    ) : (
                        <span>
                            <FaMapMarkerAlt className="me-1" />
                            Select your District and Institution from the Tamil Nadu directory.
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    className="btn btn-link btn-sm p-0 fs-9 text-decoration-none fw-semibold"
                    style={{ color: "var(--accent-cobalt)" }}
                    onClick={() => {
                        setShowRequestForm(!showRequestForm);
                        setRequestFeedback(null);
                    }}
                >
                    <FaPlusCircle className="me-1" />
                    {showRequestForm ? "Hide request form" : "My college isn't listed"}
                </button>
            </div>

            {/* Inline "My college isn't listed" Verification Request Panel */}
            {showRequestForm && (
                <div
                    className="mt-3 p-3 rounded-3"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px dashed var(--accent-cobalt)"
                    }}
                >
                    <h6 className="fw-bold fs-8 mb-1" style={{ color: "var(--text-main)" }}>
                        Request Institution Addition to Directory
                    </h6>
                    <p className="text-muted fs-9 mb-3">
                        Unlisted colleges require administrator verification before becoming selectable. Submit official details below for review.
                    </p>

                    {requestFeedback && (
                        <div className={`alert alert-${requestFeedback.type} py-2 px-3 fs-9 mb-3`}>
                            {requestFeedback.message}
                        </div>
                    )}

                    <div className="row g-2">
                        <div className="col-md-4">
                            <label className="form-label fs-9 text-muted mb-1">State</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value="Tamil Nadu"
                                disabled
                                readOnly
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fs-9 text-muted mb-1">District *</label>
                            <select
                                className="form-select form-select-sm"
                                value={requestForm.district}
                                onChange={(e) => setRequestForm({ ...requestForm, district: e.target.value })}
                            >
                                <option value="">-- Select District --</option>
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fs-9 text-muted mb-1">Institution Type</label>
                            <select
                                className="form-select form-select-sm"
                                value={requestForm.institutionType}
                                onChange={(e) => setRequestForm({ ...requestForm, institutionType: e.target.value })}
                            >
                                <option value="Engineering & Technology">Engineering & Technology</option>
                                <option value="Autonomous Engineering">Autonomous Engineering</option>
                                <option value="Arts & Science">Arts & Science</option>
                                <option value="Deemed University">Deemed University</option>
                                <option value="State University">State University</option>
                            </select>
                        </div>
                        <div className="col-md-8">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Enter official full name of your college / institution..."
                                value={requestForm.name}
                                onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                            />
                        </div>
                        <div className="col-md-4">
                            <button
                                type="button"
                                className="btn btn-primary btn-sm w-100 fw-semibold"
                                disabled={submittingRequest || !requestForm.name.trim() || !requestForm.district}
                                onClick={handleRequestSubmit}
                            >
                                {submittingRequest ? "Submitting..." : "Submit for Admin Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DistrictCollegeSelector;
