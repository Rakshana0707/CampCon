import {
    FaLaptopCode,
    FaMusic,
    FaFootballBall,
    FaChalkboardTeacher
} from "react-icons/fa";

function CategoryCard({ title, icon, onClick, active }) {
    const icons = {
        Technical: <FaLaptopCode size={40} />,
        Cultural: <FaMusic size={40} />,
        Sports: <FaFootballBall size={40} />,
        Workshop: <FaChalkboardTeacher size={40} />
    };

    return (
        <div className="col-md-3 col-6 mb-4" onClick={onClick}>
            <div className={`category-card ${active ? 'active' : ''}`}>
                <div className="mb-3">
                    {icons[icon] || <FaLaptopCode size={40} />}
                </div>
                <h5 className="mb-0 fw-semibold text-white">{title}</h5>
            </div>
        </div>
    );
}

export default CategoryCard;