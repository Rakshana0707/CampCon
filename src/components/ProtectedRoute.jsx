import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function ProtectedRoute({ allowedRoles = [] }) {
    const { currentUser } = useContext(AppContext);
    const location = useLocation();

    if (!currentUser) {
        // Redirect to login but save the current path for post-login redirect
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const userRole = currentUser.role?.toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole)) {
        // Redirect to their native dashboard if role isn't authorized
        if (userRole === "admin") return <Navigate to="/admin" replace />;
        if (userRole === "organizer") return <Navigate to="/organizer" replace />;
        return <Navigate to="/student" replace />;
    }

    // Render the nested route content
    return <Outlet />;
}

export default ProtectedRoute;
