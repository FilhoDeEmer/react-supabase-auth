import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import { getIngredientImageUrl, RECIPE_PLACEHOLDER } from "../lib/urlImages";
import Pagination from "../components/ui/Pagination";

type IngredientsBaseRow = {
  id: number;
  nome: string;
  raridade: string;
};

const PAGE_SIZE = 24;
export default function SearchIngredients() {
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [items, setItems] = useState<IngredientsBaseRow[]>([]);
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

      const q = supabase
        .from("ingredientes")
        .select(
          `id,
                nome,
                raridade`,
          { count: "exact" },
        )
        .order("id", { ascending: true })
        .range(from, to);

      const { data, error, count } = await q;

      if (error) throw error;

      setItems((data ?? []) as any);
      setTotal(count ?? 0);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao carregar os ingredientes");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [page]);

  return (
    <DashboardLayout title="Ingredientes">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Ingredientes</h2>
          <p className="text-sm text-zinc-400">
            Lista de Ingredientes - {loading ? "..." : total}
          </p>
        </div>
      </div>
      {/*Error */}
      {errorMsg && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {errorMsg}
        </div>
      )}
      {/*Conteudo */}
      <div className="mt-5">
        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">Carregando ingresientes</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">
              Nenhum ingrediente encontrado
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 min-w-0"
              >
                {/*Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={getIngredientImageUrl(i.nome)}
                    alt={i.nome}
                    className="h-14 w-14 object-contain rounded-md bg-zinc-950/40 border border-zinc-800 p-1"
                    onError={(e) => (e.currentTarget.src = RECIPE_PLACEHOLDER)}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{i.nome}</p>
                    <p className="text-sm text-zinc-400">{i.raridade}</p>
                  </div>
                </div>
                {/*Body */}
              </div>
            ))}
          </div>
        )}
      </div>
      {/*Paginação */}
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
