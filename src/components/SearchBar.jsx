import { FaSearch } from "react-icons/fa";

function SearchBar({ search, setSearch }) {
    return (
        <div className="input-group">
            <span className="input-group-text border-end-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-editorial)", color: "var(--text-muted)" }}>
                <FaSearch size={13} />
            </span>
            <input
                type="text"
                className="form-control border-start-0"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-editorial)", color: "var(--text-main)" }}
                placeholder="Search by event title, organizer, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
    );
}

export default SearchBar;