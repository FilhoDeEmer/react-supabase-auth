/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import {
  getIngredientImageUrl,
  getPokemonImageUrl,
  RECIPE_PLACEHOLDER,
} from "../lib/urlImages";
import Pagination from "../components/ui/Pagination";
import { X } from "lucide-react";

type PokemonBaseRow = {
  id: number;
  pokemon: string;
  dex_num: number;
  specialty: string | null;
  sleep_type: string | null;
  carry_base: string | null;
  ingredientes: string | null;
  pokemon_ingrediente?: {
    ingredientes: { id: number; nome: string | null } | null;
  }[];
  tipo: null | {
    tipo: string | null;
    berry: string | null;
  };
  frequency: string | null;
  main_skill: null | {
    id: number;
    nome: string;
    descricao: string;
  };
};

const PAGE_SIZE = 24;

export default function Pokedex() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PokemonBaseRow | null>(null);

  const [items, setItems] = useState<PokemonBaseRow[]>([]);
  const [total, setTotal] = useState(0);

  // debounce do search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // quando muda busca, volta pra página 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  const ingList = useMemo(() => {
    return (
      selected?.pokemon_ingrediente
        ?.map((x) => x.ingredientes)
        .filter(
          (ing): ing is { id: number; nome: string | null } =>
            !!ing && typeof ing.id === "number",
        ) ?? []
    );
  }, [selected]);

  async function load() {
    setLoading(true);
    setErrorMsg(null);

    try {
      let q = supabase
        .from("pokemon_base")
        .select(
          `
            id,
            pokemon,
            dex_num,
            specialty,
            sleep_type,
            carry_base,
            frequency,
            tipo:type (tipo, berry),

            main_skill:main_skill (id, nome, descricao),

            ingredientes,
            pokemon_ingrediente:pokemon_ingrediente (
              ingredientes:id_ingrediente (id, nome)
            )
          `,
          { count: "exact" },
        );

      // filtros
      const term = debouncedSearch;
      if (term) {
        const maybeDex = Number(term);
        if (!Number.isNaN(maybeDex)) {
          q = q.or(`pokemon.ilike.%${term}%,dex_num.eq.${maybeDex}`);
        } else {
          q = q.ilike("pokemon", `%${term}%`);
        }
      }

      // order
      q = q.order("dex_num", { ascending: true });

      // 2) aplica range no final
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      q = q.range(from, to);

      const { data, error, count } = await q;
      if (error) throw error;

      setItems((data ?? []) as any);
      setTotal(count ?? 0);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao carregar pokédex.");
    } finally {
      setLoading(false);
    }
  }

  // carrega quando page ou busca “debounced” mudarem
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  function openInfo(pokemon: PokemonBaseRow) {
    setSelected(pokemon);
    setOpen(true);
  }

  function closeInfo() {
    setOpen(false);
    setSelected(null);
  }

  return (
    <DashboardLayout title="Pokédex">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pokémons disponíveis</h2>
          <p className="text-sm text-zinc-400">
            Catálogo (pokemon_base) — {loading ? "..." : total} resultados
          </p>
        </div>

        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou número da Pokédex..."
            className="h-10 w-full sm:w-96 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">Carregando pokémons...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">Nenhum pokémon encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 min-w-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{p.pokemon}</p>
                    <p className="text-xs text-zinc-400">
                      #{p.dex_num ?? "—"} • {p.tipo?.tipo ?? "Sem tipo"}
                    </p>
                  </div>
                  <img
                    src={getPokemonImageUrl(p.dex_num, false, p.pokemon)}
                    alt={p.pokemon}
                    className="h-24 w-24 object-cover"
                    onError={(e) => (e.currentTarget.src = RECIPE_PLACEHOLDER)}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="text-xs text-zinc-400">
                    <span>Sleep:</span>{" "}
                    <span className="text-zinc-200">{p.sleep_type ?? "—"}</span>
                  </div>

                  <span className="text-[10px] rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-200">
                    {p.specialty ?? "—"}
                  </span>
                </div>

                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => openInfo(p)}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={total}
        pageSize={PAGE_SIZE}
      />

      {open && selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={closeInfo} />
          <div className="absolute left-1/2 top-1/2 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-semibold">
                  #{selected.dex_num} - {selected.pokemon}
                </p>
                <p className="text-sm text-zinc-400">
                  {selected.tipo?.tipo ?? "Sem tipo"} • {selected.specialty ?? "-"}
                </p>
              </div>

              <button
                className="text-zinc-400 hover:text-white"
                onClick={closeInfo}
                type="button"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-[70%_30%] gap-4 items-start">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 space-y-2">
                <p className="text-xs text-zinc-400">Sleep type</p>
                <p className="text-xs text-zinc-100">{selected.sleep_type ?? "-"}</p>

                <p className="text-xs text-zinc-400">Main Skill</p>
                <p className="text-xs text-zinc-100">{selected.main_skill?.nome ?? "-"}</p>
                <p className="text-xs text-zinc-100">{selected.main_skill?.descricao ?? "-"}</p>

                <p className="text-xs text-zinc-400">Ingredientes</p>
                {ingList.length ? (
                  <div className="flex flex-wrap gap-2">
                    {ingList.map((ing) => (
                      <div
                        key={ing.id}
                        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1"
                      >
                        <img
                          src={getIngredientImageUrl(ing.nome ?? "")}
                          alt={ing.nome ?? `Ingrediente ${ing.id}`}
                          className="h-5 w-5 object-contain"
                          onError={(e) => (e.currentTarget.src = RECIPE_PLACEHOLDER)}
                        />
                        <span className="text-xs text-zinc-100">{ing.nome ?? "-"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-100">-</p>
                )}

                <p className="text-xs text-zinc-400">Frequência de ajuda</p>
                <p className="text-xs text-zinc-100">{selected.frequency ?? "-"}</p>

                <p className="text-xs text-zinc-400">Carry base</p>
                <p className="text-xs text-zinc-100">{selected.carry_base ?? "-"}</p>
              </div>

              <div className="flex justify-center">
                <img
                  src={getPokemonImageUrl(selected.dex_num, false, selected.pokemon)}
                  alt={selected.pokemon}
                  className="h-40 w-40 object-contain"
                  onError={(e) => (e.currentTarget.src = RECIPE_PLACEHOLDER)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}