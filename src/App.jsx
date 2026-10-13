import AppRoutes from "./routes/AppRoutes";
import { AppContextProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import Toast from "./components/Toast";

function App() {
    return (
        <ThemeProvider>
            <AppContextProvider>
                <AppRoutes />
                <Toast />
            </AppContextProvider>
        </ThemeProvider>
    );
}

export default App;