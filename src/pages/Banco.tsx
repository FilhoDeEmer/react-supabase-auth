import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";
import Button from "../components/ui/Button";
import { getPokemonImageUrl, RECIPE_PLACEHOLDER } from "../lib/urlImages";
import { Plus, Sparkles, X } from "lucide-react";

type PokemonBancoRow = {
  id: number;
  level: number | null;
  natures: null | { id:number; nome: string | null };
  is_shiny: boolean | null;
  gold_seed: string | null;
  hab_level: number | null;
  pokemon_base: {
    id: number;
    pokemon: string;
    dex_num: number;
    specialty: string | null;
  };
};

type PokemonBaseOption = {
  id: number;
  pokemon: string;
  dex_num: number | null;
};

type NatureOption = { id: number; nome: string | null };

type FormState = {
  id?: number;
  id_base: number | "";
  level: number | "";
  nature: number | "";
  is_shiny: boolean;
};

const PAGE_SIZE = 24;

export default function Banco() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setloading] = useState(true);
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [items, setItems] = useState<PokemonBancoRow[]>([]);
  const [pokemonOptions, setPokemonOptions] = useState<PokemonBaseOption[]>([]);
  const [natureOption, setNatureOptions] = useState<NatureOption[]>([]);
  const [total, setTotal] = useState(0);

  //modal
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    id_base: "",
    level: "",
    nature: "",
    is_shiny: false,
  });

  const title = useMemo(
    () => (form.id ? "Editar Pokémon" : "Adicionar Pokémon"),
    [form.id],
  );

  async function loadAll() {
    if (!user) return;

    setloading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("pokemon_banco")
        .select(
          `
                id,
                level,
                is_shiny,
                gold_seed,
                hab_level,
                pokemon_base: id_base (id, pokemon, dex_num, specialty),
                natures: nature (id,nome)
                `,
        )
        .eq("user_id", user.id)
        .order("level", { ascending: false });

      if (error) throw error;
      setItems((data ?? []) as any);

      const { data: baseData, error: baseErr } = await supabase
        .from("pokemon_base")
        .select("id, pokemon, dex_num")
        .order("dex_num", { ascending: true });

      if (baseErr) throw baseErr;
      setPokemonOptions((baseData ?? []) as any);

      const { data: natData, error: natErr } = await supabase
        .from("natures")
        .select("id, nome")
        .order("nome", { ascending: true });

      if (natErr) throw natErr;
      setNatureOptions((natData ?? []) as any);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao carregar");
    } finally {
      setloading(false);
    }
  }

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  useEffect(() => {
    loadAll();
  }, [user?.id]);

  function openCreate() {
    setForm({ id_base: "", level: "", nature: "", is_shiny: false });
    setOpen(true);
  }

  function openEdit(row: PokemonBancoRow) {
    setForm({
      id: row.id,
      id_base: row.pokemon_base?.id ?? "",
      level: row.level ?? "",
      nature: row.natures?.id ?? "",
      is_shiny: row.is_shiny ?? false,
    });
    setOpen(true);
  }

  async function save() {
    if (!user) return;

    if (form.id_base === "") {
      setErrorMsg("Selecione um pokémon");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        user_id: user.id,
        id_base: Number(form.id_base),
        level: form.level === "" ? null : Number(form.level),
        nature: form.nature === "" ? null : Number(form.nature),
        is_shiny: form.is_shiny,
      };

      if (form.id) {
        const { error } = await supabase
          .from("pokemon_banco")
          .update(payload)
          .eq("id", form.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("pokemon_banco").insert(payload);
        if (error) throw error;
      }

      setOpen(false);
      await loadAll();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function remove(rowId: number) {
    if (!user) return;

    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("pokemon_banco")
        .delete()
        .eq("id", rowId)
        .eq("user_id", user.id);

      if (error) throw error;
      await loadAll();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao excluir");
    }
  }

  return (
    <DashboardLayout title="Banco">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Banco</h2>
          <p className="text-sm text-zinc-400">
            Seus pokémon Cadastrados - {loading ? "..." : items.length}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            className="h-10 px-4 w-auto"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            className="h-10 px-4 w-auto"
            onClick={() => loadAll()}
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

      <div className="mt-5">
        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">Carregando Banco...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-sm text-zinc-400">
              Você ainda não cadastrou nenhum Pokémon...
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => {
              const dex = p.pokemon_base?.dex_num ?? null;
              const name = p.pokemon_base?.pokemon ?? "Pokémon";
              const isShiny = p.is_shiny ?? false;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 min-w-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{name}</p>
                      <p className="text-xs text-zinc-400">Lv {p.level ?? 0}</p>
                    </div>
                    {dex ? (
                      <img
                        src={getPokemonImageUrl(dex, isShiny)}
                        alt={name}
                        className="h-20 w-20 object-contain"
                        onError={(e) =>
                          (e.currentTarget.src = RECIPE_PLACEHOLDER)
                        }
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      className="h-10 w-full"
                      onClick={() => openEdit(p)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 w-full hover:bg-red-600/20"
                      onClick={() => remove(p.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/*Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{title}</p>
                <p className="text-sm text-zinc-400">Cadastre seu Pokémon</p>
              </div>
              <button
                className="text-zinc-400 hover:text-white"
                onClick={() => setOpen(false)}
                type="button"
              >
                {" "}
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Pokémon</label>
                <select
                  value={form.id_base}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      id_base:
                        e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
                >
                  <option value="">Selecione</option>
                  {pokemonOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.dex_num ?? "-"} - {o.pokemon}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Level</label>
                  <input
                    value={form.level}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        level:
                          e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    placeholder="Ex: 25"
                    className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Nature</label>
                  <select
                    value={form.nature}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        nature:
                          e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
                  >
                    <option value="">(Opcional)</option>
                    {natureOption.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.nome ?? "-"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={form.is_shiny}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, is_shiny: e.target.checked }))
                  }
                />
                <Sparkles className="h-4 w-4"/>
                <span>Shiny</span>
              </label>

              <div className="pt-2 flex gap-2 justify-end">
                <Button variant="secondary" className="h-10 px-4 w-auto" onClick={() => setOpen(false)}>
                    Cancelar
                </Button>                
                <Button variant="primary" className="h-10 px-4 w-auto" onClick={save} disabled={saving}>
                    {saving ? "Salvando" : "Salvar"}
                </Button>                
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
