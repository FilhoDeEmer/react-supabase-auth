import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  // enquanto o supabase ainda está restaurando a sessão
  if (loading) return <p>Carregando sessão...</p>;

  // às vezes user ainda não veio mas session já existe (principalmente pós-OAuth)
  if (!user && session) return <p>Carregando usuário...</p>;

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirectTo=${redirect}`} replace />;
  }

  return <>{children}</>;
}