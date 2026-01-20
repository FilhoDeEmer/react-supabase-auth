import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import AuthLayout from "../layout/AuthLayout";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setMsg(
        "Um e-mail de redefinição de senha foi enviado, verifique sua caixa de entrada.",
      );
    } catch (err: any) {
      setErrorMsg(err.message ?? "Falha na solicitação");
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
        <br></br>
        <br></br>
        <div className="flex items-center justify-between">
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
          <Link to="/login" className="text-sm text-indigo-500 hover:underline">
            Login
          </Link>
        </div>
      </form>
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </AuthLayout>
  );
}
