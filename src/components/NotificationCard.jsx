import { FaBell } from "react-icons/fa";

function NotificationCard({ message, isRead, onRead }) {
    return (
        <div 
            className={`notification-card d-flex align-items-center gap-3 py-3 px-3 mb-2 border ${!isRead ? 'border-primary border-opacity-75 bg-primary bg-opacity-10' : 'border-secondary border-opacity-35 bg-dark bg-opacity-40'} rounded-3`}
            onClick={!isRead ? onRead : undefined}
            style={{ cursor: !isRead ? 'pointer' : 'default' }}
        >
            <div className={`p-2 rounded ${!isRead ? 'bg-primary bg-opacity-25 text-primary' : 'bg-warning bg-opacity-10 text-warning'}`}>
                <FaBell />
            </div>
            <div className="text-white text-opacity-90 fs-7 flex-grow-1">{message}</div>
            {!isRead && <span className="badge bg-primary rounded-circle p-1" style={{ width: '10px', height: '10px' }}></span>}
        </div>
    );
}

export default NotificationCard;