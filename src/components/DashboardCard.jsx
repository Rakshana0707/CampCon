function DashboardCard({ title, value, color }) {
    return (
        <div className="col-md-3 col-6 mb-4">
            <div
                className="editorial-card text-center p-3 h-100"
                style={{ borderTop: `3px solid ${color || 'var(--accent-cobalt)'}` }}
            >
                <h2 className="serif-heading mb-1" style={{ fontSize: "2.2rem", color: "var(--text-main)" }}>{value}</h2>
                <p className="text-muted text-uppercase tracking-wider fs-9 mb-0 fw-bold">{title}</p>
            </div>
        </div>
    );
}

export default DashboardCard;