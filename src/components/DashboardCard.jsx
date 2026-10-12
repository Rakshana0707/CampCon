function DashboardCard({ title, value, color }) {
    return (
        <div className="col-md-3 col-6 mb-4">
            <div
                className="dashboard-card text-center"
                style={{ borderTop: `4px solid ${color}` }}
            >
                <h2 className="fw-extrabold text-white mb-1" style={{ fontSize: "2.4rem" }}>{value}</h2>
                <p className="text-muted text-uppercase tracking-wider fs-8 mb-0 fw-semibold">{title}</p>
            </div>
        </div>
    );
}

export default DashboardCard;