import { Link } from "react-router-dom";
import { FaCompass, FaChevronRight } from "react-icons/fa";

function Hero() {
    return (
        <section className="hero d-flex align-items-center py-5">
            <div className="container py-lg-5">
                <div className="row justify-content-center text-center">
                    <div className="col-lg-9 col-xl-8">
                        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-dark bg-opacity-50 border border-secondary text-primary fw-semibold mb-4 fs-7">
                            <span className="badge bg-primary text-white">New</span> Discover student hackathons, workshops & fests
                        </div>
                        
                        <h1 className="display-3 fw-extrabold text-white mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                            Connecting Minds, <br />
                            <span className="text-primary bg-clip-text">Inspiring Campus Success</span>
                        </h1>
                        
                        <p className="lead text-muted mb-4 fs-5">
                            Discover, Register, and Participate in the most happening technical hackathons, cultural festivals, sports meets, and hands-on workshops across your campus.
                        </p>
                        
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            <Link
                                to="/events"
                                className="btn btn-primary btn-lg px-4 py-3 d-flex align-items-center gap-2"
                            >
                                <FaCompass /> Explore Events
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-outline-light btn-lg px-4 py-3 d-flex align-items-center gap-2"
                            >
                                Get Started <FaChevronRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;