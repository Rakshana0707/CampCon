import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
    return (
        <>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <Navbar />

            <main id="main-content" tabIndex="-1">
                <Outlet />
            </main>

            <Footer />
        </>
    );
}

export default MainLayout;