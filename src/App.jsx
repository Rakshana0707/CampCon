import AppRoutes from "./routes/AppRoutes";
import { AppContextProvider } from "./context/AppContext";
import Toast from "./components/Toast";

function App() {
    return (
        <AppContextProvider>
            <AppRoutes />
            <Toast />
        </AppContextProvider>
    );
}

export default App;