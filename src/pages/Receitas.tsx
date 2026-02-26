import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { supabase } from "../lib/supabase";
import FilterPills from "../components/ui/FilterPills";
import { getRecipeImageUrl, RECIPE_PLACEHOLDER } from "../lib/urlImages";
import Pagination from "../components/ui/Pagination";
import Button from "../components/ui/Button";

const RECIPE_TYPE_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "Curry", value: "Curry" },
  { label: "Salad", value: "Salad" },
  { label: "Dessert", value: "Desserts/Drinks" },
];

type RecipeIngredientRow = {
  id: number;
  quantidade: number;
  ingredientes: { nome: string | null } | { nome: string | null }[] | null;
};

type RecipesBaseRow = {
  id: number;
  nome: string;
  tipo: string | null;
  energia_base: number | null;
  receita_ingredientes: RecipeIngredientRow[] | null;
};

const PAGE_SIZE = 24;

export default function SearchRecipes() {
  const [page, setPage] = useState(1);
  const [tipoFiltro, setTipoFiltro] = useState("all");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [items, setItems] = useState<RecipesBaseRow[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  // se totalPages mudar (ex: filtro), garante que page não fique fora do range
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // monta query SEM range primeiro (filtra antes de paginar)
      let q = supabase
        .from("receitas")
        .select(
          `
          id,
          nome,
          tipo,
          energia_base,
          receita_ingredientes (id, quantidade, ingredientes:id_ingrediente (nome))
        `,
          { count: "exact" },
        )
        .order("id", { ascending: true });

      if (tipoFiltro !== "all") {
        q = q.eq("tipo", tipoFiltro);
      }

      // agora pagina
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      q = q.range(from, to);

      const { data, error, count } = await q;
      if (error) throw error;

      setItems((data ?? []) as RecipesBaseRow[]);
      setTotal(count ?? 0);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao carregar as receitas");
    } finally {
      setLoading(false);
    }
  }, [page, tipoFiltro]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardLayout title="Receitas">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Receitas</h2>
          <p className="text-sm text-zinc-400">
            Lista de receitas — {loading ? "..." : total}
          </p>

          <FilterPills
            options={RECIPE_TYPE_OPTIONS}
            value={tipoFiltro}
            onChange={(v) => {
              setTipoFiltro(v);
              setPage(1);
            }}
            className="mt-3"
          />
        </div>

        <Button
          variant="secondary"
          className="h-10 px-4 w-auto"
          onClick={load}
          disabled={loading}
        >
          Recarregar
        </Button>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">Carregando receitas...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">Nenhuma receita encontrada</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 min-w-0"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.nome}</p>
                    <p className="text-xs text-zinc-400">{r.tipo ?? "-"}</p>
                  </div>

                  <span className="shrink-0 text-[10px] rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-200">
                    BP: {r.energia_base ?? "--"}
                  </span>
                </div>

                <div className="mt-3 flex justify-center">
                  <img
                    src={getRecipeImageUrl(r.nome)}
                    alt={r.nome}
                    className="h-24 w-24 object-contain"
                    onError={(e) => (e.currentTarget.src = RECIPE_PLACEHOLDER)}
                  />
                </div>

                <div className="mt-3 border-t border-zinc-800/60 pt-3" />

                {/* Body */}
                <div>
                  <p className="text-xs text-zinc-400 mt-3">Ingredientes:</p>

                  {r.receita_ingredientes?.length ? (
                    <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                      {r.receita_ingredientes.slice(0, 4).map((ing) => (
                        <li
                          key={ing.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="min-w-0 truncate">
                            {(Array.isArray(ing.ingredientes)
                              ? ing.ingredientes[0]?.nome
                              : ing.ingredientes?.nome) ??
                              "Ingrediente desconhecido"}
                          </span>
                          <span className="shrink-0 text-zinc-400">
                            x{ing.quantidade}
                          </span>
                        </li>
                      ))}

                      {r.receita_ingredientes.length > 4 && (
                        <li className="text-xs text-zinc-500">
                          +{r.receita_ingredientes.length - 4} ingredientes
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-zinc-300">-</p>
                  )}
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
    </DashboardLayout>
  );
}
