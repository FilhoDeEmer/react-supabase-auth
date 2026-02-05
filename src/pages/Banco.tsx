import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";
import Button from "../components/ui/Button";
import { getPokemonImageUrl, RECIPE_PLACEHOLDER } from "../lib/urlImages";
import { Plus, Sparkles, X } from "lucide-react";
import Pagination from "../components/ui/Pagination";
import { NumberStepper } from "../components/ui/InputIncrement";

type PokemonBancoRow = {
  id: number;
  level: number | null;

  is_shiny: boolean | null;
  gold_seed: string | null;
  hab_level: number | null;

  ingredient_1: number | null;
  ingredient_2: number | null;
  ingredient_3: number | null;

  sub_skill1: number | null;
  sub_skill2: number | null;
  sub_skill3: number | null;
  sub_skill4: number | null;
  sub_skill5: number | null;

  ing1: null | { id: number; nome: string | null };
  ing2: null | { id: number; nome: string | null };
  ing3: null | { id: number; nome: string | null };

  ss1: null | { id: number; nome: string | null };
  ss2: null | { id: number; nome: string | null };
  ss3: null | { id: number; nome: string | null };
  ss4: null | { id: number; nome: string | null };
  ss5: null | { id: number; nome: string | null };

  natures: null | { id: number; nome: string | null };

  pokemon_base: {
    id: number;
    pokemon: string;
    dex_num: number;
    specialty: string | null;
    main_skill: number | null;
    main_skill_obj?: null | { id: number; nome: string };
  };
};

type PokemonBaseOption = {
  id: number;
  pokemon: string;
  dex_num: number | null;
};

type NatureOption = { id: number; nome: string | null };
type IngredientOpt = { id: number; nome: string | null };
type SubSkillOpt = { id: number; nome: string | null };

type FormState = {
  id?: number;
  id_base: number | "";
  level: number | "";
  nature: number | "";
  is_shiny: boolean;
  hab_level: number | "";

  ingredient_1: number | "";
  ingredient_2: number | "";
  ingredient_3: number | "";

  sub_skill1: number | "";
  sub_skill2: number | "";
  sub_skill3: number | "";
  sub_skill4: number | "";
  sub_skill5: number | "";
};

const PAGE_SIZE = 24;

const baseSelect = `
  id,
  level,
  is_shiny,
  gold_seed,
  hab_level,

  ingredient_1,
  ingredient_2,
  ingredient_3,
  sub_skill1,
  sub_skill2,
  sub_skill3,
  sub_skill4,
  sub_skill5,
  
  ing1:ingredient_1 (id, nome),
  ing2:ingredient_2 (id, nome),
  ing3:ingredient_3 (id, nome),

  ss1:sub_skill1 (id,nome),
  ss2:sub_skill2 (id,nome),
  ss3:sub_skill3 (id,nome),
  ss4:sub_skill4 (id,nome),
  ss5:sub_skill5 (id,nome),
  
  pokemon_base:id_base!inner (
    id,
    pokemon,
    dex_num,
    specialty,
    type,
    main_skill,
    main_skill_obj:main_skill (id,nome),
    tipo:type (id, tipo, berry)
  ),
  natures:nature (id, nome)
`;

const emptyForm: FormState = {
  id_base: "",
  level: "",
  nature: "",
  is_shiny: false,

  ingredient_1: "",
  ingredient_2: "",
  ingredient_3: "",

  sub_skill1: "",
  sub_skill2: "",
  sub_skill3: "",
  sub_skill4: "",
  sub_skill5: "",
};

const SUB_KEYS = [
  "sub_skill1",
  "sub_skill2",
  "sub_skill3",
  "sub_skill4",
  "sub_skill5",
] as const;

export default function Banco() {
  const { user } = useAuth();
  const [loading, setloading] = useState(true);
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [items, setItems] = useState<PokemonBancoRow[]>([]);
  const [pokemonOptions, setPokemonOptions] = useState<PokemonBaseOption[]>([]);
  const [natureOption, setNatureOptions] = useState<NatureOption[]>([]);
  const [total, setTotal] = useState(0);

  const [dex, setDex] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [levelMin, setLevelMin] = useState<string>("");
  const [levelMax, setLevelMax] = useState<string>("");
  const [typeId, setTypeId] = useState<string>(""); // id do tipo (tabela tipo)
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOpt[]>(
    [],
  );
  const [subSkillOptions, setSubSkillOptions] = useState<SubSkillOpt[]>([]);

  //modal
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [debouncedName, setDebouncedName] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(name.trim()), 300);
    return () => clearTimeout(t);
  }, [name]);

  function isSubTaken(
    value: number | "",
    currentKey: (typeof SUB_KEYS)[number],
  ) {
    if (value === "") return false;
    return SUB_KEYS.some((k) => k !== currentKey && form[k] === value);
  }

  const [form, setForm] = useState<FormState>({
    id_base: "",
    level: "",
    nature: "",
    is_shiny: false,
    hab_level: "",

    ingredient_1: "",
    ingredient_2: "",
    ingredient_3: "",

    sub_skill1: "",
    sub_skill2: "",
    sub_skill3: "",
    sub_skill4: "",
    sub_skill5: "",
  });

  const title = useMemo(
    () => (form.id ? "Editar Pokémon" : "Adicionar Pokémon"),
    [form.id],
  );

  type TipoOption = { id: number; tipo: string | null };
  const [typeOptions, setTypeOptions] = useState<TipoOption[]>([]);

  async function loadTypes() {
    const { data, error } = await supabase
      .from("tipo")
      .select("id, tipo")
      .order("tipo", { ascending: true });

    if (!error) setTypeOptions((data ?? []) as any);
  }

  async function loadDropdowns() {
    const [base, nats] = await Promise.all([
      supabase
        .from("pokemon_base")
        .select("id, pokemon, dex_num")
        .order("dex_num"),
      supabase.from("natures").select("id, nome").order("nome"),
    ]);

    if (!base.error) setPokemonOptions((base.data ?? []) as any);
    if (!nats.error) setNatureOptions((nats.data ?? []) as any);
  }

  async function loadRefs() {
    const [ings, subs] = await Promise.all([
      supabase.from("ingredientes").select("id,nome").order("nome"),
      supabase.from("sub_skills").select("id,nome").order("nome"),
      supabase.from("main_skills").select("id,nome").order("nome"),
    ]);

    if (!ings.error) setIngredientOptions((ings.data ?? []) as any);
    if (!subs.error) setSubSkillOptions((subs.data ?? []) as any);
  }

  async function loadAll() {
    if (!user?.id) return;

    setloading(true);
    setErrorMsg(null);

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let q = supabase
        .from("pokemon_banco")
        .select(baseSelect, { count: "exact" })
        .eq("user_id", user.id);

      if (dex.trim()) {
        const dexNum = Number(dex.trim());
        if (!Number.isNaN(dexNum)) {
          q = q.eq("pokemon_base.dex_num", dexNum);
        }
      }

      if (debouncedName) {
        q = q.ilike("pokemon_base.pokemon", `%${debouncedName}%`);
      }

      if (levelMin.trim()) {
        const min = Number(levelMin);
        if (!Number.isNaN(min)) q = q.gte("level", min);
      }
      if (levelMax.trim()) {
        const max = Number(levelMax);
        if (!Number.isNaN(max)) q = q.lte("level", max);
      }

      if (typeId) {
        q = q.eq("pokemon_base.type", Number(typeId));
      }

      q = q.order("dex_num", {
        foreignTable: "pokemon_base",
        ascending: true,
        nullsFirst: false,
      });

      q = q.range(from, to);

      const { data, error, count } = await q;
      if (error) throw error;

      setItems((data ?? []) as any);
      setTotal(count ?? 0);
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
    loadTypes();
    loadRefs();
    loadDropdowns();
  }, []);
  useEffect(() => {
    if (!user?.id) return;
    loadAll();
  }, [user?.id, page, dex, debouncedName, levelMin, levelMax, typeId]);
  useEffect(() => {
    setPage(1);
  }, [dex, debouncedName, levelMin, levelMax, typeId]);

  function openCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(row: PokemonBancoRow) {
    setForm({
      id: row.id,
      id_base: row.pokemon_base?.id ?? "",
      level: row.level ?? "",
      nature: row.natures?.id ?? "",
      is_shiny: row.is_shiny ?? false,
      hab_level: row.hab_level ?? "",

      ingredient_1: row.ingredient_1 ?? "",
      ingredient_2: row.ingredient_2 ?? "",
      ingredient_3: row.ingredient_3 ?? "",

      sub_skill1: row.sub_skill1 ?? "",
      sub_skill2: row.sub_skill2 ?? "",
      sub_skill3: row.sub_skill3 ?? "",
      sub_skill4: row.sub_skill4 ?? "",
      sub_skill5: row.sub_skill5 ?? "",
    });
    setOpen(true);
  }

  async function save() {
    if (!user?.id) return;

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
        hab_level: form.hab_level,

        ingredient_1:
          form.ingredient_1 === "" ? null : Number(form.ingredient_1),
        ingredient_2:
          form.ingredient_2 === "" ? null : Number(form.ingredient_2),
        ingredient_3:
          form.ingredient_3 === "" ? null : Number(form.ingredient_3),

        sub_skill1: form.sub_skill1 === "" ? null : Number(form.sub_skill1),
        sub_skill2: form.sub_skill2 === "" ? null : Number(form.sub_skill2),
        sub_skill3: form.sub_skill3 === "" ? null : Number(form.sub_skill3),
        sub_skill4: form.sub_skill4 === "" ? null : Number(form.sub_skill4),
        sub_skill5: form.sub_skill5 === "" ? null : Number(form.sub_skill5),
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
    if (!user?.id) return;

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
            Seus pokémon Cadastrados - {loading ? "..." : total}
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
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={dex}
          onChange={(e) => {
            setDex(e.target.value);
            setPage(1);
          }}
          placeholder="Dex #"
          className="h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100"
        />

        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setPage(1);
          }}
          placeholder="Nome"
          className="h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100"
        />

        <input
          value={levelMin}
          onChange={(e) => {
            setLevelMin(e.target.value);
            setPage(1);
          }}
          placeholder="Lv mín"
          className="h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100"
        />

        <input
          value={levelMax}
          onChange={(e) => {
            setLevelMax(e.target.value);
            setPage(1);
          }}
          placeholder="Lv máx"
          className="h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100"
        />

        <select
          value={typeId}
          onChange={(e) => {
            setTypeId(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100"
        >
          <option value="">Todos os tipos</option>
          {typeOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.tipo ?? "-"}
            </option>
          ))}
        </select>
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

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={total}
        pageSize={PAGE_SIZE}
      />

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
              <div className="grid grid-cols-2 gap-4 items-start">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm text-zinc-200">
                    <input
                      type="checkbox"
                      checked={form.is_shiny}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          is_shiny: e.target.checked,
                        }))
                      }
                    />
                    <Sparkles className="h-4 w-4" />
                    <span>Shiny</span>
                  </label>
                  {form.id_base !== "" && (
                    <p className="text-xs text-zinc-400">
                      Main Skill:{" "}
                      <span className="text-zinc-200">
                        {items.find((i) => i.id === form.id)?.pokemon_base
                          ?.main_skill_obj?.nome ?? "-"}
                      </span>
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-zinc-400">
                    Main Skill Level
                  </label>
                  <NumberStepper
                    value={form.hab_level}
                    min={1}
                    max={9}
                    step={1}
                    placeholder="Lv"
                    onChange={(v) => setForm((p) => ({ ...p, hab_level: v }))}
                  />
                </div>
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

              <div className="grid grid-cols-3 gap-3">
                {(
                  ["ingredient_1", "ingredient_2", "ingredient_3"] as const
                ).map((key, idx) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-zinc-400">
                      Ingrediente {idx + 1}
                    </label>
                    <select
                      value={form[key]}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          [key]:
                            e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
                    >
                      <option value="">(Vazio)</option>
                      {ingredientOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.nome ?? "-"}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    "sub_skill1",
                    "sub_skill2",
                    "sub_skill3",
                    "sub_skill4",
                    "sub_skill5",
                  ] as const
                ).map((key, idx) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-zinc-400">
                      Sub_Skills {idx + 1}
                    </label>
                    <select
                      value={form[key]}
                      onChange={(e) => {
                        const v =
                          e.target.value === "" ? "" : Number(e.target.value);

                        if (v !== "" && isSubTaken(v, key)) return;

                        setForm((p) => ({ ...p, [key]: v }));
                      }}
                      className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
                    >
                      <option value="">(Vazio)</option>
                      {subSkillOptions.map((o) => {
                        const disabled = isSubTaken(o.id, key);
                        return (
                          <option key={o.id} value={o.id} disabled={disabled}>
                            {o.nome ?? "-"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  className="h-10 px-4 w-auto"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="h-10 px-4 w-auto"
                  onClick={save}
                  disabled={saving}
                >
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
