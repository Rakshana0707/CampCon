import axios from "axios";

// Automatically use the VITE_API_URL environment variable, falling back to localhost during dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor: Attach JWT Token to every outbound request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("campcon_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor: Handle Authentication Expirations globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized or token expired
            console.warn("Authentication expired. Logging out.");
            localStorage.removeItem("campcon_token");
            // Dispatch a custom event so the React layer can catch it and reset the currentUser state
            window.dispatchEvent(new Event("auth_expired"));
        }
        return Promise.reject(error);
    }
);

export default api;
