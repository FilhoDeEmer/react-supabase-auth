/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return;

    setMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      await signUp(normalizedEmail, password);

      setMsg("Conta criada! Verifique seu e-mail para confirmar sua conta.");

      timerRef.current = window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 900);
    } catch (error: any) {
      setErrorMsg(error?.message ?? "Falha no cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Preencha os campos abaixo para criar sua conta."
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
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-zinc-500">
            Dica: use pelo menos 8 caracteres.
          </p>
        </div>

        {(msg || errorMsg) && (
          <div className="space-y-2">
            {msg && (
              <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
                {msg}
              </div>
            )}
            {errorMsg && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        <Button disabled={loading || !email.trim() || !password} type="submit">
          {loading ? "Criando..." : "Criar"}
        </Button>
      </form>

      <div className="mt-4 text-sm text-zinc-300">
        <Link to="/login" className="hover:text-white underline underline-offset-4">
          Já tem uma conta? Entre
        </Link>
      </div>
    </AuthLayout>
  );
}