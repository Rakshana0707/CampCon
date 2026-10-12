function StatsCard({ number, title }) {
    return (
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="stats-card glass-card">
                <h2>{number}</h2>
                <p>{title}</p>
            </div>
        </div>
    );
}

export default StatsCard;