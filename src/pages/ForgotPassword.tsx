import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/ui/Button";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      await resetPassword(normalizedEmail);
      setMsg("Um e-mail de redefinição de senha foi enviado. Verifique sua caixa de entrada.");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha na solicitação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Preencha seu email para redefinir sua senha."
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

        <div className="pt-2 flex items-center justify-between">
          <Button type="submit" disabled={loading || !email.trim()}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>

          <Link to="/login" className="text-sm text-indigo-500 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}