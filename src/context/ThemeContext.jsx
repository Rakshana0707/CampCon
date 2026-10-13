import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("campcon_theme");
        if (saved === "light" || saved === "dark") {
            return saved;
        }
        // Default based on system preference
        if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light"; // Default to editorial warm ivory in light mode if no dark preference
    });

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        if (theme === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
            root.setAttribute("data-theme", "dark");
            root.setAttribute("data-bs-theme", "dark");
            root.style.colorScheme = "dark";
            if (body) {
                body.classList.add("dark");
                body.classList.remove("light");
                body.setAttribute("data-theme", "dark");
                body.setAttribute("data-bs-theme", "dark");
                body.style.backgroundColor = "#0A1120";
                body.style.color = "#F4EFE6";
            }
        } else {
            root.classList.remove("dark");
            root.classList.add("light");
            root.setAttribute("data-theme", "light");
            root.setAttribute("data-bs-theme", "light");
            root.style.colorScheme = "only light";
            if (body) {
                body.classList.remove("dark");
                body.classList.add("light");
                body.setAttribute("data-theme", "light");
                body.setAttribute("data-bs-theme", "light");
                body.style.backgroundColor = "#FFFFFF";
                body.style.color = "#1D1135";
            }
        }
        localStorage.setItem("campcon_theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
