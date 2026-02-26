import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { supabase } from "../lib/supabase";
import FilterPills from "../components/ui/FilterPills";
import Pagination from "../components/ui/Pagination";
import Button from "../components/ui/Button";

type MainSkillRow = {
  id: number;
  nome: string;
  descricao: string | null;
  informacao: string | null;
};

type SubSkillRow = {
  id: number;
  nome: string;
  qualidade: string | null;
  efeito: string | null;
  informacao: string | null;
};

const PAGE_SIZE = 20;

const MODE_OPTIONS = [
  { label: "Main Skills", value: "main" },
  { label: "Sub Skills", value: "sub" },
];

type Mode = "main" | "sub";
type SortDir = "asc" | "desc";
type SortBy = "nome" | "qualidade";

export default function Skills() {
  const [mode, setMode] = useState<Mode>("main");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [sortBy, setSortBy] = useState<SortBy>("nome");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mainItems, setMainItems] = useState<MainSkillRow[]>([]);
  const [subItems, setSubItems] = useState<SubSkillRow[]>([]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  // debounce do search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // quando muda filtros, volta page 1
  useEffect(() => {
    setPage(1);
  }, [mode, debouncedSearch, sortBy, sortDir]);

  // quando muda totalPages, garante page dentro do range
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  // evita "flash" de itens do modo anterior ao trocar mode
  useEffect(() => {
    setErrorMsg(null);
    if (mode === "main") setSubItems([]);
    else setMainItems([]);
  }, [mode]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const term = debouncedSearch;

      if (mode === "main") {
        // monta query sem range primeiro
        let q = supabase
          .from("main_skills")
          .select("id, nome, descricao, informacao", { count: "exact" });

        if (term) q = q.ilike("nome", `%${term}%`);

        // sort
        q = q.order("nome", { ascending: sortDir === "asc" });

        // range no final
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        q = q.range(from, to);

        const { data, error, count } = await q;
        if (error) throw error;

        setMainItems((data ?? []) as MainSkillRow[]);
        setTotal(count ?? 0);
      } else {
        let q = supabase
          .from("sub_skills")
          .select("id, nome, qualidade, efeito, informacao", { count: "exact" });

        if (term) q = q.ilike("nome", `%${term}%`);

        // sort
        q =
          sortBy === "qualidade"
            ? q.order("qualidade", {
                ascending: sortDir === "asc",
                nullsFirst: false,
              })
            : q.order("nome", { ascending: sortDir === "asc" });

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        q = q.range(from, to);

        const { data, error, count } = await q;
        if (error) throw error;

        setSubItems((data ?? []) as SubSkillRow[]);
        setTotal(count ?? 0);
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao carregar skills");
    } finally {
      setLoading(false);
    }
  }, [mode, page, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSort(col: SortBy) {
    if (sortBy !== col) {
      setSortBy(col);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  const rowsCount = mode === "main" ? mainItems.length : subItems.length;

  return (
    <DashboardLayout title="Skills">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Skills</h2>
          <p className="text-sm text-zinc-400">
            {mode === "main" ? "Main Skills" : "Sub Skills"} —{" "}
            {loading ? "..." : total} resultados
          </p>

          <FilterPills
            className="mt-3"
            options={MODE_OPTIONS}
            value={mode}
            onChange={(v) => setMode(v as Mode)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome"
            className="h-10 w-full sm:w-80 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60"
          />

          <Button
            variant="secondary"
            className="h-10 px-4 w-auto"
            onClick={load}
            disabled={loading}
          >
            Recarregar
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        {loading ? (
          <div className="p-5">
            <p className="text-sm text-zinc-400">Carregando...</p>
          </div>
        ) : rowsCount === 0 ? (
          <div className="p-5">
            <p className="text-sm text-zinc-400">Nenhum resultado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/40 text-zinc-300">
                <tr className="border-b border-zinc-800">
                  <th className="text-left font-semibold px-4 py-3">#</th>

                  <th className="text-left font-semibold px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("nome")}
                      className="inline-flex items-center gap-2 hover:text-white"
                    >
                      Nome
                      {sortBy === "nome"
                        ? sortDir === "asc"
                          ? "▲"
                          : "▼"
                        : null}
                    </button>
                  </th>

                  {mode === "sub" && (
                    <th className="text-left font-semibold px-4 py-3 w-40">
                      <button
                        type="button"
                        onClick={() => toggleSort("qualidade")}
                        className="inline-flex items-center gap-2 hover:text-white"
                      >
                        Qualidade
                        {sortBy === "qualidade"
                          ? sortDir === "asc"
                            ? "▲"
                            : "▼"
                          : null}
                      </button>
                    </th>
                  )}

                  <th className="text-left font-semibold px-4 py-3">
                    Detalhes
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {mode === "main"
                  ? mainItems.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-950/30">
                        <td className="px-4 py-3 text-zinc-400">{r.id}</td>
                        <td className="px-4 py-3 font-medium text-zinc-100">
                          {r.nome}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">
                          <span className="block line-clamp-2">
                            {r.descricao ?? r.informacao ?? "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  : subItems.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-950/30">
                        <td className="px-4 py-3 text-zinc-400">{r.id}</td>
                        <td className="px-4 py-3 font-medium text-zinc-100">
                          {r.nome}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">
                          {r.qualidade ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">
                          <span className="block line-clamp-2">
                            {r.efeito ?? r.informacao ?? "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
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