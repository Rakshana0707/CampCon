import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { FaBuilding, FaSearch, FaUniversity, FaEnvelope, FaUserTie, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function Organizers() {
    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL"); // ALL, DEPARTMENT, CLUB
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    useEffect(() => {
        const fetchOrganizers = async () => {
            setLoading(true);
            try {
                const res = await api.get("/organizers");
                if (res.data.success) {
                    setOrganizers(res.data.organizers);
                }
            } catch (err) {
                console.error("Failed to fetch organizer directory", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizers();
    }, []);

    // Extract categories
    const categories = ["ALL", ...new Set(organizers.map(o => o.category).filter(Boolean))];

    const filtered = organizers.filter(org => {
        const matchesSearch = 
            org.name.toLowerCase().includes(search.toLowerCase()) ||
            org.description?.toLowerCase().includes(search.toLowerCase()) ||
            org.contactPerson?.toLowerCase().includes(search.toLowerCase());

        const matchesType = 
            typeFilter === "ALL" || org.type === typeFilter;

        const matchesCategory = 
            categoryFilter === "ALL" || org.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    const academicDepts = filtered.filter(o => o.type === "DEPARTMENT");
    const clubs = filtered.filter(o => o.type === "CLUB");

    return (
        <div className="container py-5" style={{ minHeight: "85vh" }}>
            <div className="text-center mb-5">
                <span className="text-primary fw-bold text-uppercase tracking-wider fs-7">
                    Official College Directory
                </span>
                <h1 className="fw-extrabold text-white mt-1" style={{ fontSize: "2.6rem" }}>
                    Verified Organizers & Academic Units
                </h1>
                <p className="text-muted max-width-600 mx-auto">
                    Browse all official academic programmes, departments, and approved student clubs authorized to host events on CampusConnect.
                </p>
            </div>

            {/* Type Filter Pills */}
            <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                <button
                    className={`btn px-4 py-2 rounded-pill fw-semibold ${typeFilter === "ALL" ? "btn-primary" : "btn-outline-secondary text-light"}`}
                    onClick={() => { setTypeFilter("ALL"); setCategoryFilter("ALL"); }}
                >
                    All Entities ({organizers.length})
                </button>
                <button
                    className={`btn px-4 py-2 rounded-pill fw-semibold ${typeFilter === "DEPARTMENT" ? "btn-primary" : "btn-outline-secondary text-light"}`}
                    onClick={() => { setTypeFilter("DEPARTMENT"); setCategoryFilter("ALL"); }}
                >
                    🏛️ Academic Departments & Programmes (16)
                </button>
                <button
                    className={`btn px-4 py-2 rounded-pill fw-semibold ${typeFilter === "CLUB" ? "btn-info text-dark" : "btn-outline-secondary text-light"}`}
                    onClick={() => { setTypeFilter("CLUB"); setCategoryFilter("ALL"); }}
                >
                    🚩 Approved Clubs & Cells (31)
                </button>
            </div>

            {/* Search and Category Row */}
            <div className="row g-3 mb-5 align-items-center">
                <div className="col-md-8">
                    <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-muted">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by department name, club name, or keywords..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="ALL">All Categories</option>
                        {categories.filter(c => c !== "ALL").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-3">Loading official directory...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-panel p-5 text-center max-width-600 mx-auto">
                    <FaBuilding size={48} className="text-secondary opacity-50 mb-3" />
                    <h4 className="text-white">No Organizers Match Your Search</h4>
                    <p className="text-muted">Try clearing search keywords or selecting "All Entities".</p>
                    <button className="btn btn-outline-primary" onClick={() => { setSearch(""); setTypeFilter("ALL"); setCategoryFilter("ALL"); }}>
                        Reset Directory Search
                    </button>
                </div>
            ) : (
                <div>
                    <div className="row g-4">
                        {filtered.map(org => (
                            <div key={org.id} className="col-lg-4 col-md-6">
                                <div className="glass-panel p-4 h-100 d-flex flex-column border border-secondary border-opacity-30 rounded-4 transition-hover">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <span className={`badge ${org.type === "DEPARTMENT" ? "bg-primary text-white" : "bg-info text-dark fw-bold"}`}>
                                            {org.type === "DEPARTMENT" ? "🏛️ Academic Unit" : "🚩 Club / Cell"}
                                        </span>
                                        <span className="badge bg-secondary text-light fs-8">
                                            {org.category || "General"}
                                        </span>
                                    </div>

                                    <h5 className="text-white fw-bold mb-2" style={{ minHeight: "48px" }}>
                                        {org.name}
                                    </h5>

                                    <p className="text-muted fs-7 mb-4 flex-grow-1" style={{ minHeight: "60px" }}>
                                        {org.description || "Official college organization registered for campus events."}
                                    </p>

                                    <div className="border-top border-secondary pt-3 mt-auto fs-8 text-muted">
                                        {org.contactPerson && (
                                            <div className="d-flex align-items-center gap-2 mb-1 text-truncate">
                                                <FaUserTie className="text-primary" />
                                                <span>{org.contactPerson}</span>
                                            </div>
                                        )}
                                        {org.contactEmail && (
                                            <div className="d-flex align-items-center gap-2 mb-2 text-truncate">
                                                <FaEnvelope className="text-secondary" />
                                                <span>{org.contactEmail}</span>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-between align-items-center pt-2">
                                            <span className="text-info">
                                                <FaCalendarAlt className="me-1" /> {org._count?.events || 0} Events
                                            </span>
                                            <Link to={`/organizers/${org.id}`} className="btn btn-outline-primary btn-sm px-3">
                                                View Profile →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Organizers;
