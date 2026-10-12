import { FaUserGraduate, FaTrash, FaUserShield, FaUserEdit } from "react-icons/fa";

function UserCard({ user, onDelete, onChangeRole, onToggleActive, onVerifyAffiliation }) {
    const handleRoleToggle = () => {
        const nextRole = user.role === "Student" ? "Organizer" : "Student";
        onChangeRole(user.id, nextRole);
    };

    return (
        <div className="user-card d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-3 mb-2 border border-secondary border-opacity-35 bg-dark bg-opacity-40 rounded-3 gap-3">
            <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-circle ${user.role === 'Admin' ? 'bg-danger bg-opacity-20 text-danger' : user.role === 'Organizer' ? 'bg-success bg-opacity-20 text-success' : 'bg-primary bg-opacity-20 text-primary'}`}>
                    {user.role === 'Admin' ? <FaUserShield size={20} /> : <FaUserGraduate size={20} />}
                </div>
                <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <h5 className="text-white fw-semibold mb-0 fs-6">{user.name}</h5>
                        {user.isActive === false && (
                            <span className="badge bg-danger text-white fs-9">Deactivated</span>
                        )}
                        {user.affiliationStatus === "INTERNAL_VERIFIED" && (
                            <span className="badge bg-success text-white fs-9">🏛️ Internal Verified</span>
                        )}
                        {user.affiliationStatus === "EXTERNAL" && (
                            <span className="badge bg-info text-dark fs-9">🌐 External ({user.collegeName || "Other"})</span>
                        )}
                        {user.affiliationStatus === "UNVERIFIED" && (
                            <span className="badge bg-warning text-dark fs-9">⚠️ Unverified</span>
                        )}
                    </div>
                    <p className="text-muted mb-0 fs-8">
                        {user.email} • {user.department || "General"} {user.rollNumber ? `• ${user.rollNumber}` : ""}
                    </p>
                </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
                {user.role !== "Admin" && (
                    <>
                        {user.affiliationStatus === "UNVERIFIED" && onVerifyAffiliation && (
                            <button
                                className="btn btn-outline-success btn-sm p-1 px-2 fs-8"
                                onClick={() => onVerifyAffiliation(user.id, "INTERNAL_VERIFIED")}
                                title="Approve internal college affiliation"
                            >
                                Verify Internal
                            </button>
                        )}
                        {onToggleActive && (
                            <button
                                className={`btn btn-sm p-1 px-2 fs-8 ${user.isActive === false ? 'btn-outline-success' : 'btn-outline-warning'}`}
                                onClick={() => onToggleActive(user.id, user.isActive === false)}
                                title={user.isActive === false ? "Reactivate user account" : "Deactivate user account"}
                            >
                                {user.isActive === false ? "Activate" : "Deactivate"}
                            </button>
                        )}
                        <button 
                            className="btn btn-outline-light btn-sm p-2 d-flex align-items-center gap-1 fs-8"
                            onClick={handleRoleToggle}
                            title="Toggle Role Student / Organizer"
                            aria-label={`Change role for ${user.name}`}
                            style={{ borderRadius: "8px" }}
                        >
                            <FaUserEdit /> Role
                        </button>
                        <button 
                            className="btn btn-outline-danger btn-sm p-2 d-flex align-items-center justify-content-center"
                            onClick={() => onDelete(user.id)}
                            title="Remove User"
                            aria-label={`Delete user ${user.name}`}
                            style={{ borderRadius: "8px" }}
                        >
                            <FaTrash size={12} />
                        </button>
                    </>
                )}
                {user.role === "Admin" && (
                    <span className="badge bg-danger text-white fs-8 px-2 py-1">Admin</span>
                )}
            </div>
        </div>
    );
}

export default UserCard;