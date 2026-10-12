import { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EventCard from "../components/EventCard";
import SearchBar from "../components/SearchBar";
import { FaSlidersH, FaCalendarAlt, FaGlobe, FaUniversity, FaBuilding } from "react-icons/fa";
import api from "../services/api";

function Events() {
    const { events } = useContext(AppContext);
    const location = useLocation();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [department, setDepartment] = useState("All");
    const [eventTypeFilter, setEventTypeFilter] = useState("All"); // All, INTRA_COLLEGE, INTER_COLLEGE
    const [organizerEntityFilter, setOrganizerEntityFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("All"); // All, Today, Upcoming, Completed
    const [sortBy, setSortBy] = useState("date"); // date, seats, alphabet
    const [officialOrganizers, setOfficialOrganizers] = useState([]);

    // Fetch official organizers directory for filter dropdown
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const res = await api.get("/organizers");
                if (res.data.success) {
                    setOfficialOrganizers(res.data.organizers);
                }
            } catch (err) {
                console.error("Failed to fetch organizers for filters", err);
            }
        };
        fetchOrgs();
    }, []);

    // Set category or eventType if navigated with state
    useEffect(() => {
        if (location.state) {
            if (location.state.selectedCategory) {
                setCategory(location.state.selectedCategory);
            }
            if (location.state.selectedEventType) {
                setEventTypeFilter(location.state.selectedEventType);
            }
            if (location.state.selectedOrganizer) {
                setOrganizerEntityFilter(location.state.selectedOrganizer);
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const categories = ["All", "Technical", "Cultural", "Sports", "Workshop", "General"];

    // Dynamic departments list from events and official directories
    const departments = [
        "All", 
        ...new Set([
            ...events.map(e => e.department).filter(Boolean),
            ...officialOrganizers.filter(o => o.type === "DEPARTMENT").map(o => o.name)
        ])
    ];

    const clubs = officialOrganizers.filter(o => o.type === "CLUB").map(o => o.name);

    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.title?.toLowerCase().includes(search.toLowerCase()) ||
            event.description?.toLowerCase().includes(search.toLowerCase()) ||
            event.organizer?.toLowerCase().includes(search.toLowerCase()) ||
            event.organizingEntityName?.toLowerCase().includes(search.toLowerCase()) ||
            event.department?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            category === "All" || event.category === category;

        const matchesEventType =
            eventTypeFilter === "All" || event.eventType === eventTypeFilter;

        const matchesDepartment =
            department === "All" || 
            event.department === department || 
            event.organizingEntityName === department;

        const matchesOrganizerEntity =
            organizerEntityFilter === "All" || 
            event.organizingEntityName === organizerEntityFilter ||
            event.department === organizerEntityFilter ||
            event.organizerEntity?.name === organizerEntityFilter;

        let matchesDate = true;
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === "Today") {
            matchesDate = eventDate.getTime() === today.getTime();
        } else if (dateFilter === "Upcoming") {
            matchesDate = eventDate >= today;
        } else if (dateFilter === "Completed") {
            matchesDate = eventDate < today;
        }

        return matchesSearch && matchesCategory && matchesEventType && matchesDepartment && matchesOrganizerEntity && matchesDate;
    });

    // Sorting logic
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (sortBy === "seats") {
            return a.seats - b.seats;
        }
        if (sortBy === "alphabet") {
            return a.title.localeCompare(b.title);
        }
        return new Date(a.date) - new Date(b.date);
    });

    const clearAllFilters = () => {
        setCategory("All");
        setDepartment("All");
        setEventTypeFilter("All");
        setOrganizerEntityFilter("All");
        setDateFilter("All");
        setSearch("");
        setSortBy("date");
    };

    return (
        <div className="container py-5" style={{ minHeight: "80vh" }}>
            <div className="text-center mb-4">
                <span className="text-primary fw-bold text-uppercase tracking-wider fs-7">
                    Discover Campus & Inter-College Events
                </span>
                <h1 className="fw-extrabold text-white mt-1" style={{ fontSize: "2.6rem" }}>
                    Campus Events Explorer
                </h1>
                <p className="text-muted max-width-600 mx-auto">
                    Explore intra-college championships and inter-college symposiums from official academic departments and student clubs.
                </p>
            </div>

            {/* Event Type Filter Pills Header */}
            <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                <button
                    className={`btn px-4 py-2 rounded-pill fw-semibold ${eventTypeFilter === "All" ? "btn-primary" : "btn-outline-secondary text-light"}`}
                    onClick={() => setEventTypeFilter("All")}
                >
                    All Events
                </button>
                <button
                    className={`btn px-4 py-2 rounded-pill fw-semibold ${eventTypeFilter === "INTRA_COLLEGE" ? "btn-primary" : "btn-outline-secondary text-light"}`}
                    onClick={() => setEventTypeFilter("INTRA_COLLEGE")}
                >
                    🏛️ Intra-College Events
                </button>
                <button
                    className={`btn px-4 py-2 rounded-pill fw-semibold ${eventTypeFilter === "INTER_COLLEGE" ? "btn-info text-dark" : "btn-outline-secondary text-light"}`}
                    onClick={() => setEventTypeFilter("INTER_COLLEGE")}
                >
                    🌐 Inter-College Events
                </button>
            </div>

            {/* Search & Main Filter Controls Panel */}
            <div className="row g-3 mb-4 align-items-center">
                <div className="col-lg-4 col-md-6">
                    <SearchBar
                        search={search}
                        setSearch={setSearch}
                    />
                </div>

                {/* Department Filter */}
                <div className="col-lg-3 col-md-3">
                    <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-muted fs-8 fw-semibold">
                            <FaUniversity className="me-1" /> DEPT
                        </span>
                        <select
                            className="form-select fs-7"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            {departments.filter(d => d !== "All").map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Organizing Club Filter */}
                <div className="col-lg-3 col-md-3">
                    <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-muted fs-8 fw-semibold">
                            <FaBuilding className="me-1" /> CLUB
                        </span>
                        <select
                            className="form-select fs-7"
                            value={organizerEntityFilter}
                            onChange={(e) => setOrganizerEntityFilter(e.target.value)}
                        >
                            <option value="All">All Clubs & Entities</option>
                            {clubs.map((club) => (
                                <option key={club} value={club}>
                                    {club}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Clear Filters Button */}
                <div className="col-lg-2 col-md-12">
                    <button 
                        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 fs-7"
                        onClick={clearAllFilters}
                    >
                        <FaSlidersH /> Clear Filters
                    </button>
                </div>
            </div>

            {/* Sub-Filters Pill Row */}
            <div className="glass-panel p-3 mb-4">
                <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="text-muted fs-8 fw-bold text-uppercase tracking-wider">Category:</span>
                        <div className="filter-pills-row">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`filter-pill ${category === cat ? "active" : ""}`}
                                    onClick={() => setCategory(cat)}
                                    style={{ fontSize: "0.85rem", padding: "5px 12px" }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="text-muted fs-8 fw-bold text-uppercase tracking-wider">Timeline:</span>
                        <div className="filter-pills-row">
                            {["All", "Today", "Upcoming", "Completed"].map((timeOpt) => (
                                <button
                                    key={timeOpt}
                                    className={`filter-pill ${dateFilter === timeOpt ? "active" : ""}`}
                                    onClick={() => setDateFilter(timeOpt)}
                                    style={{ fontSize: "0.85rem", padding: "5px 12px" }}
                                >
                                    {timeOpt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted fs-8 fw-bold text-uppercase tracking-wider">Sort:</span>
                        <select
                            className="form-select form-select-sm bg-dark text-white border-secondary fs-8"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: "110px" }}
                        >
                            <option value="date">Date</option>
                            <option value="seats">Seats</option>
                            <option value="alphabet">A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Active Filter Indicators */}
            {(category !== "All" || department !== "All" || eventTypeFilter !== "All" || organizerEntityFilter !== "All" || dateFilter !== "All" || search) && (
                <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
                    <small className="text-muted">Active Filters:</small>
                    {eventTypeFilter !== "All" && (
                        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 py-1 px-2 fs-8">
                            Type: {eventTypeFilter === "INTRA_COLLEGE" ? "Intra-College" : "Inter-College"}
                        </span>
                    )}
                    {category !== "All" && (
                        <span className="badge bg-secondary py-1 px-2 fs-8">Category: {category}</span>
                    )}
                    {department !== "All" && (
                        <span className="badge bg-secondary py-1 px-2 fs-8">Dept: {department}</span>
                    )}
                    {organizerEntityFilter !== "All" && (
                        <span className="badge bg-secondary py-1 px-2 fs-8">Club: {organizerEntityFilter}</span>
                    )}
                    {dateFilter !== "All" && (
                        <span className="badge bg-secondary py-1 px-2 fs-8">Timeline: {dateFilter}</span>
                    )}
                    {search && (
                        <span className="badge bg-secondary py-1 px-2 fs-8">Keyword: "{search}"</span>
                    )}
                    <button className="btn btn-link text-danger p-0 ms-2 fs-8 text-decoration-none" onClick={clearAllFilters}>
                        Reset All
                    </button>
                </div>
            )}

            {/* Events Grid */}
            <div className="row">
                {sortedEvents.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <div className="glass-panel p-5 max-width-600 mx-auto">
                            <div className="text-muted mb-3">
                                <FaCalendarAlt size={48} className="text-secondary opacity-50" />
                            </div>
                            <h4 className="text-white mb-2">No Matching Events Found</h4>
                            <p className="text-muted mb-4">
                                No events match your selected filters. Try switching event types, selecting "All Departments", or clearing your search keywords.
                            </p>
                            <button className="btn btn-outline-primary" onClick={clearAllFilters}>
                                <FaSlidersH className="me-2" /> Clear All Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    sortedEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default Events;