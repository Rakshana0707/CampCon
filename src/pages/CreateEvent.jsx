import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaCalendarPlus, FaArrowLeft, FaCheck, FaBuilding, FaGlobe } from "react-icons/fa";
import api from "../services/api";
import { getFallbackImage } from "../utils/helpers";

function CreateEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, currentUser, createEvent, updateEvent, showToast } = useContext(AppContext);

    const isEditMode = !!id;

    const [form, setForm] = useState({
        title: "",
        category: "Technical",
        department: "",
        venue: "",
        date: "",
        time: "",
        deadline: "",
        seats: "",
        description: "",
        prizeDetails: "",
        coordinatorName: "",
        coordinatorContact: "",
        image: "",
        requiresApproval: false,
        // Event Classification & Eligibility (Required selection, no silent default)
        eventType: "",
        organizerEntityId: "",
        externalParticipationAllowed: false,
        eligibleParticipants: "",
        contactPerson: "",
        contactEmail: ""
    });

    const [authorizedEntities, setAuthorizedEntities] = useState([]);
    const [isLoadingEntities, setIsLoadingEntities] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch authorized organizer entities for the logged-in user
    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const res = await api.get("/organizers/my-entities");
                if (res.data.success) {
                    setAuthorizedEntities(res.data.entities);
                    // Default to first assigned entity if creating
                    if (!isEditMode && res.data.entities.length > 0) {
                        setForm(prev => ({
                            ...prev,
                            organizerEntityId: res.data.entities[0].id.toString(),
                            department: res.data.entities[0].name
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to load authorized entities", err);
                showToast("Could not load your assigned organizer entities", "warning");
            } finally {
                setIsLoadingEntities(false);
            }
        };

        if (currentUser) {
            fetchEntities();
        }
    }, [currentUser, isEditMode]);

    // Load event data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const targetEvent = events.find((e) => e.id === Number(id));
            if (targetEvent) {
                setForm({
                    title: targetEvent.title || "",
                    category: targetEvent.category || "Technical",
                    department: targetEvent.department || "",
                    venue: targetEvent.venue || "",
                    date: targetEvent.date || "",
                    time: targetEvent.time || "",
                    deadline: targetEvent.deadline || "",
                    seats: targetEvent.seats || "",
                    description: targetEvent.description || "",
                    prizeDetails: targetEvent.prizeDetails || "",
                    coordinatorName: targetEvent.coordinatorName || "",
                    coordinatorContact: targetEvent.coordinatorContact || "",
                    image: targetEvent.image || "",
                    requiresApproval: targetEvent.requiresApproval || false,
                    eventType: targetEvent.eventType || "INTRA_COLLEGE",
                    organizerEntityId: targetEvent.organizerEntityId?.toString() || "",
                    externalParticipationAllowed: targetEvent.externalParticipationAllowed || false,
                    eligibleParticipants: targetEvent.eligibleParticipants || "Our College Students Only",
                    contactPerson: targetEvent.contactPerson || "",
                    contactEmail: targetEvent.contactEmail || ""
                });
            } else {
                showToast("Event to edit not found", "danger");
                navigate(-1);
            }
        }
    }, [id, isEditMode, events, navigate, showToast]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === "checkbox" ? checked : value;

        setForm(prev => {
            const updated = { ...prev, [name]: val };

            // When organizerEntityId changes, update department name accordingly
            if (name === "organizerEntityId") {
                const selectedEntity = authorizedEntities.find(ent => ent.id.toString() === value);
                if (selectedEntity) {
                    updated.department = selectedEntity.name;
                    if (!updated.contactPerson && selectedEntity.contactPerson) {
                        updated.contactPerson = selectedEntity.contactPerson;
                    }
                    if (!updated.contactEmail && selectedEntity.contactEmail) {
                        updated.contactEmail = selectedEntity.contactEmail;
                    }
                }
            }

            // Adjust default eligible participants text when eventType toggles
            if (name === "eventType") {
                if (val === "INTER_COLLEGE") {
                    updated.eligibleParticipants = "Open to participants from multiple colleges";
                    updated.externalParticipationAllowed = true;
                } else {
                    updated.eligibleParticipants = "Our College Students Only";
                    updated.externalParticipationAllowed = false;
                }
            }

            return updated;
        });

        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let newErrors = {};

        if (!form.date) {
            newErrors.date = "Event date is required.";
        } else if (isNaN(new Date(form.date).getTime())) {
            newErrors.date = "Invalid event date.";
        }

        if (!form.deadline) {
            newErrors.deadline = "Registration deadline is required.";
        } else if (isNaN(new Date(form.deadline).getTime())) {
            newErrors.deadline = "Invalid registration deadline.";
        }

        if (Object.keys(newErrors).length === 0) {
            const parseDateTime = (dateStr, timeStr) => {
                const d = new Date(`${dateStr}T00:00:00`);
                if (timeStr) {
                    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                    if (match) {
                        let hours = parseInt(match[1]);
                        const mins = parseInt(match[2]);
                        const modifier = match[3];
                        if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                        if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
                        d.setHours(hours, mins, 0, 0);
                    }
                }
                return d;
            };

            const deadlineDate = new Date(`${form.deadline}T00:00:00`);
            const eventDayOnly = new Date(`${form.date}T00:00:00`);

            if (deadlineDate > eventDayOnly) {
                newErrors.deadline = "Deadline cannot be after the event date.";
            }
        }

        if (!form.organizerEntityId && authorizedEntities.length > 0) {
            newErrors.organizerEntityId = "Please select an authorized organizing department or club.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast("Please fix the validation errors before submitting.", "danger");
            return;
        }

        if (!form.title.trim() || !form.venue.trim() || !form.date.trim()) {
            showToast("Please fill all mandatory fields", "warning");
            return;
        }

        setIsSubmitting(true);
        const finalImage = form.image.trim() !== "" ? form.image : getFallbackImage(form.category);

        const eventData = {
            ...form,
            image: finalImage,
            organizer: currentUser.name,
            organizerEmail: currentUser.email,
            organizerEntityId: form.organizerEntityId ? parseInt(form.organizerEntityId, 10) : undefined
        };

        let result = false;
        if (isEditMode) {
            result = await updateEvent(id, eventData);
        } else {
            result = await createEvent(eventData);
        }
        
        setIsSubmitting(false);

        if (result) {
            if (currentUser.role === "Admin") {
                navigate("/admin");
            } else {
                navigate("/organizer");
            }
        }
    };

    return (
        <div className="container py-5" style={{ minHeight: "85vh" }}>
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb mb-0 bg-transparent p-0 fs-8 fw-semibold">
                    <li className="breadcrumb-item">
                        <button onClick={() => navigate(-1)} className="btn btn-link text-muted p-0 m-0 border-0 text-decoration-none align-baseline">
                            Back
                        </button>
                    </li>
                    <li className="breadcrumb-item active text-white" aria-current="page">
                        {isEditMode ? "Edit Event" : "Create Event"}
                    </li>
                </ol>
            </nav>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="glass-panel p-4 p-md-5 shadow-lg border border-secondary border-opacity-30 rounded-4">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-success bg-opacity-15 p-3 rounded-circle text-success">
                                <FaCalendarPlus size={30} />
                            </div>
                            <div>
                                <h2 className="text-white fw-extrabold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                                    {isEditMode ? "Edit Event Details" : "Create New Official Event"}
                                </h2>
                                <p className="text-muted mb-0">Publish an intra-college or inter-college event under your authorized department or club.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* SECTION: Official Organizing Entity & Event Type */}
                            <div className="p-3 mb-4 rounded-4 bg-dark bg-opacity-50 border border-secondary">
                                <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FaBuilding className="text-primary" /> Official Organizing Entity & Event Scope
                                </h5>

                                <div className="row">
                                    {/* Organizing Entity Selection */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-white fw-semibold">
                                            Authorized Organizing Department / Club *
                                        </label>
                                        {isLoadingEntities ? (
                                            <div className="text-muted fs-8">Loading authorized entities...</div>
                                        ) : authorizedEntities.length === 0 ? (
                                            <div className="alert alert-warning py-2 fs-8 mb-0">
                                                ⚠️ You have not been assigned to any official department or club. Contact administrator.
                                            </div>
                                        ) : (
                                            <select
                                                className={`form-select ${errors.organizerEntityId ? 'is-invalid' : ''}`}
                                                name="organizerEntityId"
                                                value={form.organizerEntityId}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">-- Select Your Authorized Entity --</option>
                                                {authorizedEntities.map(ent => (
                                                    <option key={ent.id} value={ent.id}>
                                                        {ent.type === 'CLUB' ? '🚩 Club: ' : '🏛️ Dept: '} {ent.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {errors.organizerEntityId && <div className="invalid-feedback d-block">{errors.organizerEntityId}</div>}
                                    </div>

                                    {/* Event Type */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-white fw-semibold">
                                            Event Classification *
                                        </label>
                                        <select
                                            className="form-select"
                                            name="eventType"
                                            value={form.eventType}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="INTRA_COLLEGE">🏛️ Intra-College (Within our college only)</option>
                                            <option value="INTER_COLLEGE">🌐 Inter-College (Multi-college / External)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* External participation toggle for Inter-College */}
                                {form.eventType === "INTER_COLLEGE" && (
                                    <div className="p-3 rounded-3 bg-info bg-opacity-10 border border-info border-opacity-25 mt-2">
                                        <div className="form-check form-switch d-flex align-items-center gap-3">
                                            <input
                                                className="form-check-input mt-0"
                                                type="checkbox"
                                                id="externalParticipationAllowed"
                                                name="externalParticipationAllowed"
                                                style={{ width: "40px", height: "20px" }}
                                                checked={form.externalParticipationAllowed}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label text-white fw-semibold mb-0" htmlFor="externalParticipationAllowed">
                                                Allow External College Participants to Register
                                                <small className="d-block text-muted fs-8 mt-1">
                                                    When enabled, attendees from other institutions can register by providing their college name.
                                                </small>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Primary Details Row */}
                            <div className="row">
                                <div className="col-md-8 mb-3">
                                    <label className="form-label text-white fw-semibold">Event Title *</label>
                                    <input
                                        className="form-control"
                                        name="title"
                                        placeholder="e.g. CodeCraft State-Level Hackathon"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label text-white fw-semibold">Category</label>
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                    >
                                        <option value="Technical">Technical</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-white fw-semibold">Venue *</label>
                                    <input
                                        className="form-control"
                                        name="venue"
                                        placeholder="e.g. Main Auditorium / Lab 4"
                                        value={form.venue}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-white fw-semibold">Eligibility Requirements</label>
                                    <input
                                        className="form-control"
                                        name="eligibleParticipants"
                                        placeholder="e.g. Open to all engineering students / All colleges"
                                        value={form.eligibleParticipants}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Timeline & Capacity Row */}
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <label className="form-label text-white fw-semibold">Event Date *</label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.date && <div className="invalid-feedback d-block">{errors.date}</div>}
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label text-white fw-semibold">Event Time *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.time ? 'is-invalid' : ''}`}
                                        name="time"
                                        placeholder="e.g. 10:00 AM"
                                        value={form.time}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.time && <div className="invalid-feedback d-block">{errors.time}</div>}
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label text-white fw-semibold">Reg. Deadline *</label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.deadline ? 'is-invalid' : ''}`}
                                        name="deadline"
                                        value={form.deadline}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.deadline && <div className="invalid-feedback d-block fw-bold">{errors.deadline}</div>}
                                </div>
                                <div className="col-md-3 mb-4">
                                    <label className="form-label text-white fw-semibold">Max Capacity *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="seats"
                                        placeholder="e.g. 150"
                                        value={form.seats}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Official Contacts and Prizes */}
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label text-white fw-semibold">Authorized Contact Person</label>
                                    <input
                                        className="form-control"
                                        name="contactPerson"
                                        placeholder="e.g. Dr. Rajesh Kumar"
                                        value={form.contactPerson}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label text-white fw-semibold">Official Contact Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="contactEmail"
                                        placeholder="e.g. club@college.edu"
                                        value={form.contactEmail}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label text-white fw-semibold">Prize / Awards Info</label>
                                    <input
                                        className="form-control"
                                        name="prizeDetails"
                                        placeholder="e.g. ₹10,000 Cash Prize + Trophy"
                                        value={form.prizeDetails}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Banner & Description */}
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label className="form-label text-white fw-semibold">Event Banner Image URL (Optional)</label>
                                    <input
                                        className="form-control"
                                        name="image"
                                        placeholder="Leave blank for automatic category banner"
                                        value={form.image}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-12 mb-4">
                                    <label className="form-label text-white fw-semibold">Description & Agenda</label>
                                    <textarea
                                        rows={4}
                                        className="form-control"
                                        name="description"
                                        placeholder="Detailed event overview, rules, schedule, eligibility..."
                                        value={form.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Approval Toggle */}
                            <div className="glass-panel p-3 mb-4 rounded border border-warning border-opacity-50 bg-warning bg-opacity-10">
                                <div className="form-check form-switch d-flex align-items-center gap-3">
                                    <input
                                        className="form-check-input mt-0"
                                        type="checkbox"
                                        id="requiresApproval"
                                        name="requiresApproval"
                                        style={{ width: "40px", height: "20px" }}
                                        checked={form.requiresApproval}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label text-white fw-semibold mb-0" htmlFor="requiresApproval">
                                        Require Manual Organizer Approval for Registrations
                                        <small className="d-block text-warning text-opacity-75 fs-8 mt-1">If enabled, registrations will remain in 'Pending' state until manually approved.</small>
                                    </label>
                                </div>
                            </div>

                            <button 
                                className="btn btn-success btn-lg w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                                type="submit"
                                disabled={isSubmitting || (authorizedEntities.length === 0 && currentUser?.role !== "Admin")}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        {isEditMode ? "Saving Changes..." : "Publishing Event..."}
                                    </>
                                ) : (
                                    <><FaCheck /> {isEditMode ? "Save Changes" : "Publish Official Event"}</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateEvent;