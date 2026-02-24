import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const finishLogin = async () => {
      // força recuperação da sessão após OAuth
      const { data } = await supabase.auth.getSession();

      const redirectTo = searchParams.get("redirectTo");

      if (data.session) {
        navigate(redirectTo || "/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    };

    finishLogin();
  }, [navigate, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-zinc-400">Finalizando login...</p>
    </div>
  );
}