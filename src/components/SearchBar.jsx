import { FaSearch } from "react-icons/fa";

function SearchBar({ search, setSearch }) {
    return (
        <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-muted">
                <FaSearch />
            </span>
            <input
                type="text"
                className="form-control"
                placeholder="Search by event title, organizer or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
    );
}

export default SearchBar;