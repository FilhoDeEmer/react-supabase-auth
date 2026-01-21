import DashboardLayout from "../layout/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout title="Inicio">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-sm text-zinc-400">Card 1</p>
          <p className="text-2xl font-semibold mt-2">123</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-sm text-zinc-400">Card 2</p>
          <p className="text-2xl font-semibold mt-2">R$ 9.999,99</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-sm text-zinc-400">Card 3</p>
          <p className="text-2xl font-semibold mt-2">Ativo</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="font-semibold">Área principal</h2>
      <p className="text-sm text-zinc-400 mt-2">
        Conteudo Real do dashbord (perfilm lista, gráficos, etc).
      </p>
      </div>
      </DashboardLayout>
  );
}
