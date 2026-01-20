import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import AuthLayout from "../layout/AuthLayout";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [repitNewPassword, setRepitNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      if (newPassword != repitNewPassword) {
        setErrorMsg("As senhas não coincidem");
        return;
      }
      await updatePassword(newPassword);
      setMsg("Senha atualizada com sucesso!");
      setTimeout(() => navigate("/dashboard", { replace: true }), 800);
    } catch (err: any) {
      setErrorMsg(err.message ?? "Falha na solicitação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Redefinir Senha"
      subtitle="Defina uma nova senha para sua conta."
      footer={
        <span>
          Desenvolvido como protótipo por{" "}
          <span className="text-zinc-200">GIT: FilhoDeEmer</span>
        </span>
      }
    >
      <div style={{ maxWidth: 420, margin: "40px auto" }}>
        <h2>Nova senha</h2>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            id="nova-senha"
            placeholder="nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full h-11 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
          />
          <h2>Repetir senha</h2>
          <input
            id="repi-nova-senha"
            placeholder="repetir nova senha"
            type="password"
            value={repitNewPassword}
            onChange={(e) => setRepitNewPassword(e.target.value)}
            required
            className="w-full h-11 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
          />
          <br></br>
          <br></br>
          <button type="submit" disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </form>
        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </div>
    </AuthLayout>
  );
}
