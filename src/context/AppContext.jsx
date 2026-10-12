import React, { createContext, useState, useEffect } from "react";
import api from "../services/api"; // Central API Service

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export function AppContextProvider({ children }) {
    // Safe JSON parser for currentUser hydration
    const safeJSONParse = (key, fallback) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch {
            return fallback;
        }
    };

    const [currentUser, setCurrentUser] = useState(() => safeJSONParse("campcon_current_user", null));
    
    // Core Data States
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [toasts, setToasts] = useState([]);
    
    // Loading States
    const [isLoading, setIsLoading] = useState(false);

    // Global Expiration Listener
    useEffect(() => {
        const handleAuthExpired = () => {
            setCurrentUser(null);
            localStorage.removeItem("campcon_current_user");
            showToast("Session expired. Please log in again.", "danger");
        };
        window.addEventListener("auth_expired", handleAuthExpired);
        return () => window.removeEventListener("auth_expired", handleAuthExpired);
    }, []);

    // Sync currentUser to localStorage for instant UI hydration across tabs
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("campcon_current_user", JSON.stringify(currentUser));
        } else {
            localStorage.removeItem("campcon_current_user");
        }
    }, [currentUser]);

    // Data Fetchers
    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/events");
            if (res.data.success) {
                const mappedEvents = res.data.events.map(e => ({
                    ...e,
                    seats: e.availableSeats,
                    organizerId: e.organizerId,
                    organizer: e.organizer?.name || "Unknown",
                    organizerEmail: e.organizer?.email || "",
                    organizingEntityName: e.organizerEntity?.name || e.department || "General",
                    organizerEntity: e.organizerEntity || null,
                    eventType: e.eventType || "INTRA_COLLEGE",
                    externalParticipationAllowed: e.externalParticipationAllowed || false,
                    eligibleParticipants: e.eligibleParticipants || "",
                    contactPerson: e.contactPerson || e.organizerEntity?.contactPerson || "",
                    contactEmail: e.contactEmail || e.organizerEntity?.contactEmail || "",
                    date: e.date ? new Date(e.date).toISOString().split('T')[0] : "",
                    time: e.date ? new Date(e.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
                    deadline: e.deadline ? new Date(e.deadline).toISOString().split('T')[0] : ""
                }));
                setEvents(mappedEvents);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (!currentUser || currentUser.role !== "Admin") return;
        try {
            const res = await api.get("/admin/users");
            if (res.data.success) {
                // Map backend Prisma format to frontend compatibility layer
                const mappedUsers = res.data.users.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase(),
                    department: u.department,
                    year: u.year,
                    rollNumber: u.rollNumber
                }));
                setUsers(mappedUsers);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchUsers();
    }, [currentUser]);

    // Toast Manager helper
    const showToast = (message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    // 3. App Actions
    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            if (response.data.success) {
                const { user, token } = response.data;
                localStorage.setItem("campcon_token", token);
                setCurrentUser(user);
                showToast(`Welcome back, ${user.name}!`, "success");
                return { success: true, user };
            }
        } catch (error) {
            const errMsg = error.response?.data?.error || "Invalid credentials";
            showToast(errMsg, "danger");
            return { success: false, error: errMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem("campcon_token");
        showToast("Logged out successfully", "info");
        setCurrentUser(null);
    };

    const registerUser = async (userData) => {
        try {
            const response = await api.post("/auth/register", userData);
            if (response.data.success) {
                const { user, token } = response.data;
                localStorage.setItem("campcon_token", token);
                setCurrentUser(user);
                showToast("Registration successful! Welcome aboard.", "success");
                return { success: true, user };
            }
        } catch (error) {
            const errMsg = error.response?.data?.error || "Registration failed";
            showToast(errMsg, "danger");
            return { success: false, error: errMsg };
        }
    };

    const toggleSaveEvent = (eventId) => {
        setBookmarks((prev) => {
            const isBookmarked = prev.includes(eventId);
            if (isBookmarked) {
                showToast("Event removed from bookmarks", "info");
                return prev.filter((id) => id !== eventId);
            } else {
                showToast("Event saved to bookmarks", "success");
                return [...prev, eventId];
            }
        });
    };

    const fetchNotifications = async () => {
        try {
            if (!currentUser) return;
            const res = await api.get("/notifications");
            if (res.data.success) {
                // Map to match existing frontend fields
                const mapped = res.data.notifications.map(n => ({
                    id: n.id,
                    message: n.message,
                    isRead: n.isRead,
                    date: new Date(n.createdAt).toLocaleDateString()
                }));
                setNotifications(mapped);
            }
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            const res = await api.patch(`/notifications/${id}/read`);
            if (res.data.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    // Reload notifications when user changes
    useEffect(() => {
        fetchNotifications();
    }, [currentUser]);

    const addNotification = (message, targetUserId = null) => {
        // Now handled by the backend automatically during actions. 
        // This shim refreshes the list in case of local mock triggers.
        fetchNotifications();
    };

    const fetchMyRegistrations = async () => {
        setIsLoading(true);
        try {
            if (!currentUser) return;
            const res = await api.get("/registrations/me");
            if (res.data.success) {
                // Map backend registrations to match frontend expectations
                const mappedRegs = res.data.registrations.map(r => ({
                    id: r.id,
                    ticketId: r.ticketId,
                    studentId: r.userId,
                    eventId: r.eventId,
                    certificateId: r.certificate?.certificateId || null,
                    role: r.role === 'VOLUNTEER' ? 'Volunteer' : 'Participant',
                    status: r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase(),
                    attendance: r.attendance === 'PRESENT' ? 'Present' : 'Pending',
                    certificateType: r.certificateType.charAt(0).toUpperCase() + r.certificateType.slice(1).toLowerCase()
                }));
                setRegistrations(mappedRegs);
            }
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrganizerRegistrations = async () => {
        setIsLoading(true);
        try {
            if (!currentUser || !events) return;
            
            const myEventIds = events.filter(e => e.organizerId === currentUser.id).map(e => e.id);
            if (myEventIds.length === 0) {
                setIsLoading(false);
                return;
            }

            let allRegs = [];
            for (let id of myEventIds) {
                const res = await api.get(`/events/${id}/registrations`);
                if (res.data.success) {
                    const mapped = res.data.registrations.map(r => ({
                        id: r.id,
                        ticketId: r.ticketId,
                        studentId: r.userId,
                        eventId: r.eventId,
                        studentName: r.user.name,
                        studentEmail: r.user.email,
                        role: r.role === 'VOLUNTEER' ? 'Volunteer' : 'Participant',
                        status: r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase(),
                        attendance: r.attendance === 'PRESENT' ? 'Present' : 'Pending',
                        certificateType: r.certificateType.charAt(0).toUpperCase() + r.certificateType.slice(1).toLowerCase()
                    }));
                    allRegs = [...allRegs, ...mapped];
                }
            }
            setRegistrations(allRegs);
        } catch (error) {
             console.error("Failed to fetch organizer registrations", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch registrations when user logs in or events load
    useEffect(() => {
        if (!currentUser) return;
        if (currentUser.role === 'Student') {
            fetchMyRegistrations();
        } else if (currentUser.role === 'Organizer' || currentUser.role === 'Admin') {
            fetchOrganizerRegistrations();
        }
    }, [currentUser, events]);

    const registerForEvent = async (eventId, role = "Participant", extraData = {}) => {
        try {
            const token = localStorage.getItem("campcon_token");
            if (!token) {
                showToast("Please log in to register for events", "warning");
                return false;
            }

            const res = await api.post(`/registrations`, { 
                eventId, 
                role: role.toUpperCase(),
                ...extraData
            });

            if (res.data.success) {
                await fetchEvents(); // Update seats immediately
                await fetchMyRegistrations(); // Update tickets
                showToast(`Registered successfully!`, "success");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Registration failed", "danger");
            return false;
        }
    };

    const cancelEventRegistration = async (eventId) => {
        try {
            const token = localStorage.getItem("campcon_token");
            if (!token) return false;

            const res = await api.delete(`/registrations/${eventId}`);

            if (res.data.success) {
                await fetchEvents(); // Refresh seat count
                await fetchMyRegistrations(); // Refresh tickets
                showToast(`Cancelled registration successfully`, "info");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to cancel registration", "danger");
            return false;
        }
    };

    const approveRegistration = (regId) => {
        const targetReg = registrations.find(r => r.id === regId);
        if (!targetReg || targetReg.status === "Approved") return;
        
        const targetEvent = events.find(e => e.id === targetReg.eventId);
        
        if (targetEvent && targetEvent.seats <= 0) {
            showToast("Cannot approve: Event is at full capacity!", "danger");
            return;
        }

        setRegistrations((prev) =>
            prev.map((r) => r.id === regId ? { ...r, status: "Approved" } : r)
        );

        setEvents((prev) =>
            prev.map((evt) =>
                evt.id === targetReg.eventId ? { ...evt, seats: Math.max(0, evt.seats - 1) } : evt
            )
        );

        addNotification(`Registration for ${targetEvent?.title || 'Event'} approved!`, targetReg.studentId);
        showToast("Registration approved successfully!", "success");
    };

    const rejectRegistration = (regId) => {
        const targetReg = registrations.find(r => r.id === regId);
        if (!targetReg) return;
        
        const wasApproved = targetReg.status === "Approved";

        setRegistrations((prev) =>
            prev.map((r) => r.id === regId ? { ...r, status: "Rejected" } : r)
        );

        if (wasApproved) {
            setEvents((prev) => 
                prev.map(evt => evt.id === targetReg.eventId ? { ...evt, seats: evt.seats + 1 } : evt)
            );
        }

        const targetEvent = events.find(e => e.id === targetReg.eventId);
        addNotification(`Registration for ${targetEvent?.title || 'Event'} rejected.`, targetReg.studentId);
        showToast("Registration rejected", "warning");
    };

    const assignVolunteer = (eventId, studentId) => {
        const targetEvent = events.find(e => e.id === eventId);
        if (!targetEvent) return false;

        const alreadyRegistered = registrations.some(
            (r) => r.studentId === studentId && r.eventId === eventId && r.status !== "Cancelled" && r.status !== "Rejected"
        );
        
        if (alreadyRegistered) {
            showToast("Student is already registered for this event", "warning");
            return false;
        }

        if (targetEvent.seats <= 0) {
            showToast("Cannot assign volunteer: Event is at full capacity!", "danger");
            return false;
        }

        const newReg = {
            id: registrations.length ? Math.max(...registrations.map((r) => r.id)) + 1 : 1,
            studentId: studentId,
            eventId: eventId,
            role: "Volunteer",
            status: "Approved",
            attendance: "Pending",
            certificateType: "Volunteer"
        };
        
        setRegistrations((prev) => [...prev, newReg]);
        
        setEvents((prev) =>
            prev.map((evt) =>
                evt.id === eventId ? { ...evt, seats: Math.max(0, evt.seats - 1) } : evt
            )
        );

        showToast("Volunteer assigned successfully!", "success");
        return true;
    };

    const markAttendance = async (ticketId) => {
        try {
            const res = await api.patch(`/registrations/${ticketId}/attendance`);

            if (res.data.success) {
                await fetchOrganizerRegistrations(); // Refresh the list of attendees
                showToast(res.data.message || "Attendance recorded! Certificate generated.", "success");
                addNotification(`Attendance verified for ticket ${ticketId}!`);
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to verify ticket", "danger");
            return false;
        }
    };


    const createEvent = async (eventData) => {
        try {
            const combinedDate = eventData.time ? `${eventData.date} ${eventData.time}` : eventData.date;

            const payload = {
                ...eventData,
                date: combinedDate,
                deadline: eventData.deadline || eventData.date,
                totalSeats: parseInt(eventData.seats, 10),
            };

            const res = await api.post("/events", payload);

            if (res.data.success) {
                await fetchEvents();
                showToast(`Event created successfully!`, "success");
                return res.data.event;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to create event", "danger");
            return false;
        }
    };

    const updateEvent = async (eventId, eventData) => {
        try {
            const combinedDate = eventData.time ? `${eventData.date} ${eventData.time}` : eventData.date;

            const payload = {
                ...eventData,
                date: combinedDate,
                deadline: eventData.deadline || eventData.date,
                totalSeats: parseInt(eventData.seats, 10),
            };

            const res = await api.put(`/events/${eventId}`, payload);

            if (res.data.success) {
                await fetchEvents();
                showToast("Event updated successfully!", "success");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to update event", "danger");
            return false;
        }
    };

    const deleteEvent = async (eventId) => {
        try {
            const res = await api.delete(`/events/${eventId}`);

            if (res.data.success) {
                await fetchEvents();
                
                // Cascade frontend state deletions
                setBookmarks((prev) => prev.filter((id) => id !== eventId));
                setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));
                
                showToast("Event deleted successfully", "success");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to delete event", "danger");
            return false;
        }
    };

    const deleteUser = async (userId) => {
        try {
            const res = await api.delete(`/admin/users/${userId}`);
            if (res.data.success) {
                setUsers((prev) => prev.filter((u) => u.id !== Number(userId)));
                setRegistrations((prev) => prev.filter((reg) => reg.studentId !== Number(userId)));
                showToast(`User removed successfully`, "danger");
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to delete user", "danger");
        }
    };

    const changeUserRole = async (userId, newRole) => {
        try {
            const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole.toUpperCase() });
            if (res.data.success) {
                setUsers((prev) => prev.map((u) => (u.id === Number(userId) ? { ...u, role: newRole } : u)));
                showToast(`User role updated to ${newRole}`, "success");
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to change user role", "danger");
        }
    };

    const updateEventStatus = async (eventId, status) => {
        try {
            const res = await api.patch(`/events/${eventId}/status`, { status });
            if (res.data.success) {
                await fetchEvents();
                showToast(`Event marked as ${status}`, "info");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to update event status", "danger");
            return false;
        }
    };

    return (
        <AppContext.Provider
            value={{
                events,
                users,
                currentUser,
                notifications,
                bookmarks,
                toasts,
                showToast,
                login,
                logout,
                registerUser,
                registerForEvent,
                cancelEventRegistration,
                createEvent,
                updateEvent,
                deleteEvent,
                updateEventStatus,
                deleteUser,
                changeUserRole,
                addNotification,
                fetchNotifications,
                markNotificationAsRead,
                toggleSaveEvent,
                registrations,
                setRegistrations,
                approveRegistration,
                rejectRegistration,
                assignVolunteer,
                markAttendance,
                isLoading
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
