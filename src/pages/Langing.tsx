import DashboardLayout from "../layout/DashboardLayout";

export default function Landing() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HERO */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Sleep Calc</h1>

          <p className="text-zinc-400 max-w-2xl mx-auto">
            Simule e descubra o melhor time para cada ilha no Pokémon Sleep.
            Cálculo baseado em frequência real, bônus da ilha, berry favorita,
            nature e sub skills.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <a
              href="/dashboard/banco"
              className="h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium flex items-center"
            >
              Começar agora
            </a>

            <a
              href="/dashboard"
              className="h-10 px-5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition text-sm font-medium flex items-center"
            >
              Gerar recomendação
            </a>
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
            <h3 className="font-semibold">1️⃣ Cadastre seus Pokémon</h3>
            <p className="text-sm text-zinc-400">
              Informe level, nature, sub skills e frequência. O cálculo
              considera seus bônus reais.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
            <h3 className="font-semibold">2️⃣ Escolha a ilha</h3>
            <p className="text-sm text-zinc-400">
              Informe o bônus percentual da sua ilha e o objetivo (berries,
              cooking ou equilibrado).
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
            <h3 className="font-semibold">3️⃣ Veja o Top 5</h3>
            <p className="text-sm text-zinc-400">
              O sistema calcula força por dia considerando berry strength, skill
              strength e helps/dia efetivo.
            </p>
          </div>
        </div>

        {/* O QUE O SLEEPCALC ANALISA */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold">O que o sleepcalc considera</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm text-zinc-400">
            <div>🍓 Berry favorita da ilha (×2)</div>
            <div>🏝️ Bônus percentual da ilha</div>
            <div>⏱️ Helps por dia efetivo</div>
            <div>⚡ Helping Speed (nature + sub skills)</div>
            <div>✨ Trigger de skill</div>
            <div>📊 Força total estimada por dia</div>
          </div>
        </div>

        {/* BETA */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400">
          <p>
            🚧 Projeto em desenvolvimento (Beta). Sugestões e feedback são
            bem-vindos.
            <br/>
            <br/>
            Contatos: <a href="https://discord.gg/57VS8Femn" className="text-indigo-500 hover:underline">Sleep Calc Discord</a>
          </p>
          <p className="pt-2 text-xs text-zinc-500">
            Projeto independente, não afiliado à Nintendo ou The Pokémon
            Company.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
