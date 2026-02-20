import { Navigate, useLocation} from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children}: { children : React.ReactNode}) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <p>Carregando sessão...</p>

    if (!user) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirectTo=${redirect}`} replace />;
    }
    return <>{children}</>;
}