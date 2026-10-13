import React, { createContext, useState, useEffect } from "react";
import api from "../services/api"; // Central API Service
import defaultEvents from "../data/events";

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

    const normalizeCollegeName = (name) => {
        if (!name || name === "Our College" || name === "CIT") {
            return "Coimbatore Institute of Technology";
        }
        return name;
    };

    const normalizeUser = (user) => {
        if (!user) return null;
        return {
            ...user,
            role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "Student",
            collegeName: normalizeCollegeName(user.collegeName),
            // Institution directory fields
            institution: user.institution || null,
            collegeState: user.collegeState || null,
            collegeDistrict: user.collegeDistrict || null,
            institutionId: user.institutionId || null,
            affiliationStatus: user.affiliationStatus || "UNVERIFIED",
            organizerAssignments: user.organizerAssignments || []
        };
    };

    const [currentUser, setCurrentUser] = useState(() => normalizeUser(safeJSONParse("campcon_current_user", null)));
    
    // Core Data States
    const [events, setEvents] = useState(defaultEvents);
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
                    eventFormat: e.eventFormat || "REGULAR",
                    numberOfDays: e.numberOfDays || 1,
                    activities: e.activities || [],
                    externalParticipationAllowed: e.externalParticipationAllowed || false,
                    eligibleParticipants: e.eligibleParticipants || "",
                    contactPerson: e.contactPerson || e.organizerEntity?.contactPerson || "",
                    contactEmail: e.contactEmail || e.organizerEntity?.contactEmail || "",
                    rawDate: e.date,
                    rawEndDate: e.endDate,
                    rawDeadline: e.deadline,
                    rawInternalRegOpensAt: e.internalRegOpensAt,
                    rawExternalRegOpensAt: e.externalRegOpensAt,
                    rawExpiresAt: e.expiresAt,
                    isDemo: Boolean(e.isDemo),
                    date: e.date ? new Date(e.date).toISOString().split('T')[0] : "",
                    time: e.date ? new Date(e.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
                    endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : "",
                    endTime: e.endDate ? new Date(e.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
                    deadline: e.deadline ? new Date(e.deadline).toISOString().split('T')[0] : "",
                    internalRegOpensAt: e.internalRegOpensAt ? new Date(e.internalRegOpensAt).toISOString().split('T')[0] : "",
                    internalRegOpensTime: e.internalRegOpensAt ? new Date(e.internalRegOpensAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
                    externalRegOpensAt: e.externalRegOpensAt ? new Date(e.externalRegOpensAt).toISOString().split('T')[0] : "",
                    externalRegOpensTime: e.externalRegOpensAt ? new Date(e.externalRegOpensAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""
                }));
                if (mappedEvents.length > 0) {
                    setEvents(mappedEvents);
                } else {
                    setEvents(defaultEvents);
                }
            }
        } catch (error) {
            console.error("Failed to fetch events from API, using default catalog:", error);
            setEvents(defaultEvents);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (!currentUser) return;
        const role = currentUser.role?.toLowerCase();
        if (role === "admin") {
            try {
                const res = await api.get("/admin/users");
                if (res.data.success) {
                    const mappedUsers = res.data.users.map(u => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase(),
                        department: u.department,
                        year: u.year,
                        rollNumber: u.rollNumber,
                        collegeName: u.collegeName,
                        affiliationStatus: u.affiliationStatus,
                        isActive: u.isActive,
                        organizerAssignments: u.organizerAssignments || []
                    }));
                    setUsers(mappedUsers);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        } else if (role === "organizer") {
            try {
                const res = await api.get("/registrations/students");
                if (res.data.success) {
                    const mappedStudents = res.data.students.map(u => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: "Student",
                        department: u.department,
                        rollNumber: u.rollNumber,
                        collegeName: u.collegeName,
                        affiliationStatus: u.affiliationStatus
                    }));
                    setUsers(mappedStudents);
                }
            } catch (error) {
                console.error("Failed to fetch students for organizer:", error);
            }
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchUsers();
    }, [currentUser]);

    // Toast Manager helper
    const showToast = (message, type = "success") => {
        const id = Date.now() + Math.random();
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
                const normalized = normalizeUser(user);
                localStorage.setItem("campcon_token", token);
                setCurrentUser(normalized);
                showToast(`Welcome back, ${normalized.name}!`, "success");
                return { success: true, user: normalized };
            }
        } catch (error) {
            // Development fallback if backend server is not running
            const MOCK_PROFILES = {
                "organizer@college.edu": {
                    id: 901,
                    name: "Dr. K. Rajesh",
                    email: "organizer@college.edu",
                    role: "ORGANIZER",
                    department: "B.Tech. Chemical Engineering",
                    collegeName: "Coimbatore Institute of Technology",
                    affiliationStatus: "INTERNAL_VERIFIED",
                    organizerAssignments: [{ organizerEntity: { name: "B.Tech. Chemical Engineering" } }]
                },
                "cse.organizer@college.edu": {
                    id: 902,
                    name: "Prof. S. Anand",
                    email: "cse.organizer@college.edu",
                    role: "ORGANIZER",
                    department: "B.E. Computer Science and Engineering",
                    collegeName: "Coimbatore Institute of Technology",
                    affiliationStatus: "INTERNAL_VERIFIED",
                    organizerAssignments: [{ organizerEntity: { name: "B.E. Computer Science and Engineering" } }]
                },
                "eee.organizer@college.edu": {
                    id: 903,
                    name: "Dr. V. Narayanan",
                    email: "eee.organizer@college.edu",
                    role: "ORGANIZER",
                    department: "B.E. Electrical and Electronics Engineering",
                    collegeName: "Coimbatore Institute of Technology",
                    affiliationStatus: "INTERNAL_VERIFIED",
                    organizerAssignments: [{ organizerEntity: { name: "B.E. Electrical and Electronics Engineering" } }]
                },
                "music.organizer@college.edu": {
                    id: 904,
                    name: "Karthik R",
                    email: "music.organizer@college.edu",
                    role: "ORGANIZER",
                    department: "Music Club",
                    collegeName: "Coimbatore Institute of Technology",
                    affiliationStatus: "INTERNAL_VERIFIED",
                    organizerAssignments: [{ organizerEntity: { name: "Music Club" } }]
                },
                "cyber.organizer@college.edu": {
                    id: 905,
                    name: "Aditya Mohan",
                    email: "cyber.organizer@college.edu",
                    role: "ORGANIZER",
                    department: "Cyber Club",
                    collegeName: "Coimbatore Institute of Technology",
                    affiliationStatus: "INTERNAL_VERIFIED",
                    organizerAssignments: [{ organizerEntity: { name: "Cyber Club" } }]
                },
                "dramatix.organizer@college.edu": {
                    id: 906,
                    name: "Sanjana V",
                    email: "dramatix.organizer@college.edu",
                    role: "ORGANIZER",
                    department: "Dramatix",
                    collegeName: "Coimbatore Institute of Technology",
                    affiliationStatus: "INTERNAL_VERIFIED",
                    organizerAssignments: [{ organizerEntity: { name: "Dramatix" } }]
                },
                "student@college.edu": {
                    id: 907,
                    name: "Aarav Sharma",
                    email: "student@college.edu",
                    role: "STUDENT",
                    department: "B.E. Computer Science and Engineering",
                    rollNumber: "23CS101",
                    collegeName: "Coimbatore Institute of Technology",
                    affiliationStatus: "INTERNAL_VERIFIED"
                },
                "admin@college.edu": {
                    id: 908,
                    name: "CampusConnect Administrator",
                    email: "admin@college.edu",
                    role: "ADMIN",
                    department: "Administration",
                    collegeName: "Coimbatore Institute of Technology",
                    affiliationStatus: "INTERNAL_VERIFIED"
                }
            };

            if (MOCK_PROFILES[email] && (password === "password123" || password === "Admin@123")) {
                const user = normalizeUser(MOCK_PROFILES[email]);
                localStorage.setItem("campcon_token", "mock_jwt_token");
                setCurrentUser(user);
                showToast(`Welcome back, ${user.name}! (Demo Mode)`, "success");
                return { success: true, user };
            }

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
                const normalized = normalizeUser(user);
                localStorage.setItem("campcon_token", token);
                setCurrentUser(normalized);
                showToast("Registration successful! Welcome aboard.", "success");
                return { success: true, user: normalized };
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

    const [activityRegistrations, setActivityRegistrations] = useState([]);

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

                if (res.data.activityRegistrations) {
                    setActivityRegistrations(res.data.activityRegistrations);
                }
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
            
            const isAdmin = currentUser.role?.toLowerCase() === 'admin';
            const myEventIds = events
                .filter(e => isAdmin || e.organizerId === currentUser.id)
                .map(e => e.id);

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
                        studentName: r.user?.name || "Student",
                        studentEmail: r.user?.email || "",
                        studentRollNumber: r.user?.rollNumber || "",
                        studentDepartment: r.user?.department || "",
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
        const role = currentUser.role?.toLowerCase();
        if (role === 'student') {
            fetchMyRegistrations();
        } else if (role === 'organizer' || role === 'admin') {
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

    const approveRegistration = async (regId) => {
        try {
            const res = await api.patch(`/registrations/${regId}/status`, { status: "APPROVED" });
            if (res.data.success) {
                await fetchEvents();
                await fetchOrganizerRegistrations();
                showToast("Registration approved successfully!", "success");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to approve registration", "danger");
            return false;
        }
    };

    const rejectRegistration = async (regId) => {
        try {
            const res = await api.patch(`/registrations/${regId}/status`, { status: "REJECTED" });
            if (res.data.success) {
                await fetchEvents();
                await fetchOrganizerRegistrations();
                showToast("Registration rejected", "warning");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to reject registration", "danger");
            return false;
        }
    };

    const assignVolunteer = async (eventId, studentId) => {
        try {
            const res = await api.post("/registrations/volunteer", { eventId, studentId });
            if (res.data.success) {
                await fetchEvents();
                await fetchOrganizerRegistrations();
                showToast("Volunteer assigned successfully!", "success");
                return true;
            }
            return false;
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to assign volunteer", "danger");
            return false;
        }
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
            const combinedEndDate = eventData.endDate ? 
                (eventData.endTime ? `${eventData.endDate} ${eventData.endTime}` : eventData.endDate) : 
                combinedDate;

            const combinedInternalOpens = eventData.internalRegOpensAt ? 
                (eventData.internalRegOpensTime ? `${eventData.internalRegOpensAt} ${eventData.internalRegOpensTime}` : eventData.internalRegOpensAt) :
                undefined;

            const combinedExternalOpens = eventData.externalRegOpensAt ? 
                (eventData.externalRegOpensTime ? `${eventData.externalRegOpensAt} ${eventData.externalRegOpensTime}` : eventData.externalRegOpensAt) :
                undefined;

            const payload = {
                ...eventData,
                date: combinedDate,
                endDate: combinedEndDate,
                deadline: eventData.deadline || eventData.date,
                internalRegOpensAt: combinedInternalOpens,
                externalRegOpensAt: combinedExternalOpens,
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
            const combinedEndDate = eventData.endDate ? 
                (eventData.endTime ? `${eventData.endDate} ${eventData.endTime}` : eventData.endDate) : 
                combinedDate;

            const combinedInternalOpens = eventData.internalRegOpensAt ? 
                (eventData.internalRegOpensTime ? `${eventData.internalRegOpensAt} ${eventData.internalRegOpensTime}` : eventData.internalRegOpensAt) :
                undefined;

            const combinedExternalOpens = eventData.externalRegOpensAt ? 
                (eventData.externalRegOpensTime ? `${eventData.externalRegOpensAt} ${eventData.externalRegOpensTime}` : eventData.externalRegOpensAt) :
                undefined;

            const payload = {
                ...eventData,
                date: combinedDate,
                endDate: combinedEndDate,
                deadline: eventData.deadline || eventData.date,
                internalRegOpensAt: combinedInternalOpens,
                externalRegOpensAt: combinedExternalOpens,
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

    // Symposium Activity Actions
    const addSymposiumActivity = async (symposiumId, activityData) => {
        try {
            const res = await api.post(`/events/${symposiumId}/activities`, activityData);
            if (res.data.success) {
                await fetchEvents();
                showToast("Activity added successfully!", "success");
                return res.data.activity;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to add activity", "danger");
            return null;
        }
    };

    const updateSymposiumActivity = async (activityId, activityData) => {
        try {
            const res = await api.put(`/activities/${activityId}`, activityData);
            if (res.data.success) {
                await fetchEvents();
                showToast("Activity updated successfully!", "success");
                return res.data.activity;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to update activity", "danger");
            return null;
        }
    };

    const removeSymposiumActivity = async (activityId) => {
        try {
            const res = await api.delete(`/activities/${activityId}`);
            if (res.data.success) {
                await fetchEvents();
                showToast(res.data.message || "Activity removed", "info");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to remove activity", "danger");
            return false;
        }
    };

    const registerForActivity = async (activityId, extraData = {}) => {
        try {
            const res = await api.post(`/activities/${activityId}/register`, extraData);
            if (res.data.success) {
                await fetchEvents();
                if (currentUser?.role?.toLowerCase() === 'student') {
                    await fetchMyRegistrations();
                }
                showToast(res.data.message || "Successfully registered for activity!", "success");
                return res.data.registration;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to register for activity", "danger");
            return null;
        }
    };

    const cancelActivityRegistration = async (activityId) => {
        try {
            const res = await api.delete(`/activities/${activityId}/register`);
            if (res.data.success) {
                await fetchEvents();
                if (currentUser?.role?.toLowerCase() === 'student') {
                    await fetchMyRegistrations();
                }
                showToast(res.data.message || "Activity registration cancelled", "info");
                return true;
            }
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to cancel activity registration", "danger");
            return false;
        }
    };

    const getActivityRegistrations = async (activityId) => {
        try {
            const res = await api.get(`/activities/${activityId}/registrations`);
            if (res.data.success) {
                return res.data.registrations;
            }
            return [];
        } catch (error) {
            showToast(error.response?.data?.error || "Failed to load activity registrations", "danger");
            return [];
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
                addSymposiumActivity,
                updateSymposiumActivity,
                removeSymposiumActivity,
                registerForActivity,
                cancelActivityRegistration,
                getActivityRegistrations,
                deleteUser,
                changeUserRole,
                addNotification,
                fetchNotifications,
                markNotificationAsRead,
                toggleSaveEvent,
                registrations,
                setRegistrations,
                activityRegistrations,
                fetchMyRegistrations,
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
