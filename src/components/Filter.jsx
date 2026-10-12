function Filter({ category, setCategory }) {
    return (
        <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
        >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
        </select>
    );
}

export default Filter;