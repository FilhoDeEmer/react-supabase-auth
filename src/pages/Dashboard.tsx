import { useAuth } from "../auth/AuthProvider";


export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ maxWidth: 720, margin: "40px auto" }}>
      <h1>Dashboard (protegido)</h1>

      <p>
        Logado como: <b>{user?.email}</b>
      </p>

      <button onClick={() => signOut()}>Sair</button>
    </div>
  );
}
