/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";
import Button from "../components/ui/Button";
import { getPokemonImageUrl, RECIPE_PLACEHOLDER } from "../lib/urlImages";

type IlhaOption = {
  id: number;
  nome: string | null;
  berries: string | null;
  bonus: number | null;
};

type Goal = "balanced" | "berries" | "cooking" | "support";

type RecommendationRow = {
  pokemon_banco_id: number;
  pokemon: string;
  dex_num: number;
  level: number | null;
  specialty: string | null;
  tipo: string | null;
  tipo_berry: string | null;
  main_skill_nome: string | null;
  island_berry_match: boolean;
  score: number;
  reasons: string | null;
};

export default function TeamRecommendation() {
  const { user } = useAuth();

  const [ilhas, setIlhas] = useState<IlhaOption[]>([]);
  const [ilhaId, setIlhaId] = useState<number | "">("");
  const [goal, setGoal] = useState<Goal>("balanced");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reco, setReco] = useState<RecommendationRow[]>([]);

  const ilhaSelected = useMemo(
    () => ilhas.find((i) => i.id === ilhaId) ?? null,
    [ilhas, ilhaId],
  );

  async function loadIlhas() {
    const { data, error } = await supabase
      .from("ilhas")
      .select("id, nome, berries, bonus")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }
    setIlhas((data ?? []) as any);
  }

  async function recommend() {
    if (!user?.id) return;
    if (ilhaId === "") {
      setErrorMsg("Selecione uma ilha.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("recommend_team", {
        p_user_id: user.id,
        p_ilha_id: Number(ilhaId),
        p_goal: goal,
      });

      if (error) throw error;
      setReco((data ?? []) as any);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao gerar recomendação");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIlhas();
  }, []);

  // opcional: auto-recomendar quando escolher ilha
  useEffect(() => {
    if (!user?.id) return;
    if (ilhaId === "") return;
    recommend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, ilhaId, goal]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Recomendação de Time</h2>
          <p className="text-sm text-zinc-400">
            Escolha a ilha e veja os 5 melhores do seu banco.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="h-10 px-4 w-auto"
            onClick={recommend}
            disabled={loading || ilhaId === "" || !user?.id}
          >
            {loading ? "Gerando..." : "Recomendar"}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Ilha</label>
          <select
            value={ilhaId}
            onChange={(e) =>
              setIlhaId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="h-10 w-full rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
          >
            <option value="">Selecione a ilha</option>
            {ilhas.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome ?? `Ilha ${i.id}`}
              </option>
            ))}
          </select>
          {ilhaSelected?.berries && (
            <p className="text-xs text-zinc-500">
              Berries: {ilhaSelected.berries}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Objetivo</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as Goal)}
            className="h-10 w-full rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
          >
            <option value="balanced">Equilibrado</option>
            <option value="berries">Força por Berries</option>
            <option value="cooking">Foco em Cozinha</option>
            <option value="support">Suporte / Energia</option>
          </select>
          <p className="text-xs text-zinc-500">Ajusta pesos do algoritmo.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Dica</label>
          <div className="h-10 w-full rounded-lg bg-zinc-900/40 border border-zinc-800 px-3 flex items-center text-sm text-zinc-300">
            {ilhaId === "" ? "Selecione uma ilha" : "Top 5 do seu banco"}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      {/* Cards */}
      {reco.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-sm text-zinc-400">
            {ilhaId === ""
              ? "Selecione uma ilha para gerar recomendação."
              : "Nenhuma recomendação encontrada (você tem pokémon no banco?)."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {reco.map((p, idx) => (
            <div
              key={p.pokemon_banco_id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 min-w-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500">#{idx + 1}</p>
                  <p className="font-semibold truncate">{p.pokemon}</p>
                  <p className="text-xs text-zinc-400">
                    Dex {p.dex_num} • Lv {p.level ?? 0}
                  </p>
                </div>

                {p.dex_num ? (
                  <img
                    src={getPokemonImageUrl(p.dex_num, false)}
                    alt={p.pokemon}
                    className="h-20 w-20 object-contain"
                    onError={(e) => (e.currentTarget.src = RECIPE_PLACEHOLDER)}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                    Sem imagem
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-xs text-zinc-400">
                  Score:{" "}
                  <span className="text-zinc-100">
                    {Number(p.score).toFixed(1)}
                  </span>
                </p>

                <p className="text-xs text-zinc-400">
                  Tipo: <span className="text-zinc-100">{p.tipo ?? "-"}</span>
                </p>

                <p className="text-xs text-zinc-400">
                  Berry:{" "}
                  <span
                    className={
                      p.island_berry_match ? "text-green-300" : "text-zinc-100"
                    }
                  >
                    {p.tipo_berry ?? "-"}{" "}
                    {p.island_berry_match ? "(match)" : ""}
                  </span>
                </p>

                <p className="text-xs text-zinc-400">
                  Skill:{" "}
                  <span className="text-zinc-100">
                    {p.main_skill_nome ?? "-"}
                  </span>
                </p>

                {p.reasons && (
                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                    {p.reasons}
                  </p>
                )}
              </div>

              {/* Próximo passo (opcional): aplicar no time */}
              {/* <div className="mt-3">
                <Button variant="secondary" className="h-9 w-full">
                  Aplicar
                </Button>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
