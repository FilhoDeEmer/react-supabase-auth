/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { IconBrandGoogleFilled } from "@tabler/icons-react";

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export default function Login() {
  const { signInWithPassword, user, signInWithGoogle } = useAuth();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const redirectParam = useMemo(
    () => search.get("redirectTo") ?? search.get("redirect") ?? null,
    [search],
  );

  const redirectTo = useMemo(() => {
    return redirectParam ? safeDecode(redirectParam) : "/dashboard";
  }, [redirectParam]);

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await signInWithPassword(normalizedEmail, password);

      // Não precisa navegar aqui; o useEffect vai redirecionar quando o user atualizar.
      // Mas se você quiser manter navegação imediata, pode descomentar:
      // navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha no login");
      setLoading(false);
      return;
    }

    setLoading(false);
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
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-zinc-300" htmlFor="password">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-2">
          <Button type="submit" disabled={loading || !email.trim() || !password}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Button
            type="button"
            onClick={() => signInWithGoogle()}
            variant="secondary"
            disabled={loading}
          >
            <IconBrandGoogleFilled size={18} />
            Entrar com Google
          </Button>
        </div>

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

      <div className="mt-4 flex sm:hidden items-center justify-center">
        <Button
          variant="secondary"
          className="w-auto h-10 px-4"
          onClick={() => navigate("/dashboard/pokedex", { replace: true })}
        >
          <span>Ver Pokédex</span>
        </Button>
      </div>
    </AuthLayout>
  );
}