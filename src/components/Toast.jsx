import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

export default function Toast() {
    const { toasts } = useContext(AppContext);

    if (!toasts || toasts.length === 0) return null;

    const icons = {
        success: <FaCheckCircle className="text-success fs-5" />,
        danger: <FaExclamationCircle className="text-danger fs-5" />,
        warning: <FaExclamationTriangle className="text-warning fs-5" />,
        info: <FaInfoCircle className="text-info fs-5" />
    };

    return (
        <div className="toast-container-custom" aria-live="polite" aria-atomic="true">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-custom ${toast.type}`} role={toast.type === 'danger' ? 'alert' : 'status'}>
                    {icons[toast.type] || <FaInfoCircle />}
                    <div>{toast.message}</div>
                </div>
            ))}
        </div>
    );
}
