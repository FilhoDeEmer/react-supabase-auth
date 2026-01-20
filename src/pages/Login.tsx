import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import AuthLayout from "../layout/AuthLayout";

export default function Login() {
  const { signInWithPassword, user, signInWithGoogle } = useAuth();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const redirectParam = search.get("redirect") ?? search.get("redirectTo");

  useEffect(() => {
    if (user) {
      const to = redirectParam ? decodeURIComponent(redirectParam) : "/dashboard";
      navigate(to, { replace: true });
    }
  }, [user, navigate, redirectParam]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await signInWithPassword(email, password);
      const redirect = search.get("redirect");
      navigate(redirect ? decodeURIComponent(redirect) : "/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para continuar."
      footer={
        <span>
          Desenvolvido como protótipo por{" "}
          <span className="text-zinc-200">GIT: FilhoDeEmer</span>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-zinc-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-11 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-zinc-300" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-11 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
          />
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {errorMsg}
          </div>
        )}
        <br></br>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:hover:bg-indigo-600 transition font-semibold"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <br></br>
        <br></br>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full h-11 rounded-lg border border-zinc-800 hover:bg-zinc-950/60 transition font-semibold"
        >
          Entrar com Google
        </button>
        <br></br>
        <br></br>
        <div className="flex items-center justify-between text-sm">
          <Link
            to="/forgot-password"
            className="text-zinc-300 hover:text-white underline underline-offset-4"
          >
            Esqueci minha senha
          </Link>

          <Link
            to="/register"
            className="text-indigo-300 hover:text-indigo-200 underline underline-offset-4"
          >
            Criar conta
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
