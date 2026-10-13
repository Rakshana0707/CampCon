import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import StudentDashboard from "../pages/StudentDashboard";
import OrganizerDashboard from "../pages/OrganizerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import NotFound from "../pages/NotFound";
import CreateEvent from "../pages/CreateEvent";
import Organizers from "../pages/Organizers";
import OrganizerProfile from "../pages/OrganizerProfile";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Pages with Nav & Footer */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/organizers" element={<Organizers />} />
                    <Route path="/organizers/:id" element={<OrganizerProfile />} />

                    {/* Student Protected Routes (Accessible by Students and Organizers who participate) */}
                    <Route element={<ProtectedRoute allowedRoles={["Student", "Organizer"]} />}>
                        <Route path="/student" element={<StudentDashboard />} />
                    </Route>

                    {/* Organizer Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["Organizer"]} />}>
                        <Route path="/organizer" element={<OrganizerDashboard />} />
                    </Route>

                    {/* Admin Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>

                    {/* Collaborative Organizer/Admin Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["Organizer", "Admin"]} />}>
                        <Route path="/create-event" element={<CreateEvent />} />
                        <Route path="/edit-event/:id" element={<CreateEvent />} />
                    </Route>

                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Standalone Auth Pages (Unprotected) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;