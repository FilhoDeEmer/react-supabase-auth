import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";

type PokemonBaseRow = {
  id: number;
  pokemon: string;
  dex_num: number | null;
  specialty: string | null;
  sleep_type: string | null;
  tipo: null | {
    tipo: string | null;
    berry: string | null;
  };
};

const PAGE_SIZE = 24;

export default function Pokedex() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [items, setItems] = useState<PokemonBaseRow[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  async function load() {
    setLoading(true);
    setErrorMsg(null);

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Query base
      let q = supabase
        .from("pokemon_base")
        .select(
          `
            id,
            pokemon,
            dex_num,
            specialty,
            sleep_type,
            tipo:type ( tipo, berry )
          `,
          { count: "exact" }
        )
        .order("dex_num", { ascending: true })
        .range(from, to);

      // Filtro de busca
      const term = search.trim();
      if (term) {
        // Busca por nome (ilike) OU por dex_num (se for número)
        const maybeDex = Number(term);
        if (!Number.isNaN(maybeDex)) {
          q = q.or(`pokemon.ilike.%${term}%,dex_num.eq.${maybeDex}`);
        } else {
          q = q.ilike("pokemon", `%${term}%`);
        }
      }

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

  // carrega quando mudar página
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // quando mudar search, volta pra página 1 e recarrega
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300); // debounce simples
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <DashboardLayout title="Pokédex">
      {/* Barra de topo */}
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

      {/* Erro */}
      {errorMsg && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      {/* Conteúdo */}
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

                  <span className="text-[10px] rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-200">
                    {p.specialty ?? "—"}
                  </span>
                </div>

                <div className="mt-3 text-sm text-zinc-300">
                  <p className="text-xs text-zinc-400">Sleep type</p>
                  <p>{p.sleep_type ?? "—"}</p>
                </div>

                {/* espaço pra botões futuros */}
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => alert(`Abrir detalhes de ${p.pokemon}`)}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Página {page} de {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
