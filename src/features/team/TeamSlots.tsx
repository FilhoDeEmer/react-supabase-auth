/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/Button";
import { clearSlot, ensureTeamSlots, setPokemonInSlot } from "./teamService";
import {X} from "lucide-react"

type TeamRow = {
  slot: number;
  pokemon_banco: null | {
    id: number;
    level: number | null;
    pokemon_base: null | {
      pokemon: string;
      dex_num: number | null;
      specialty: string | null;
    };
    natures: null | { nome: string | null };
  };
};

type PokemonBancoOption = {
  id: number;
  level: number | null;
  pokemon_base: { pokemon: string; dex_num: number | null } | null;
};

export default function TeamSlots() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [options, setOptions] = useState<PokemonBancoOption[]>([]);
  const [selectedBySlot, setSelectedBySlot] = useState<
    Record<number, number | "">
  >({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
  });

  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function loadAll() {
    setErrorMsg(null);
    setLoading(true);
    try {
      await ensureTeamSlots();

      const { data: team, error: teamErr } = await supabase
        .from("user_team_slots")
        .select(
          `
                    slot,
                    pokemon_banco:pokemon_banco_id (
                        id,
                        level,
                        pokemon_base:id_base ( pokemon, dex_num, specialty),
                        natures: nature (nome)
                    )`,
        )
        .order("slot", { ascending: true });

      if (teamErr) throw teamErr;

      const normalized = (team ?? []).map((r: any) => ({
        slot: r.slot,
        pokemon_banco: r.pokemon_banco ?? null,
      })) as TeamRow[];

      setRows(normalized);

      //carregar banco
      const { data: banco, error: bancoErr } = await supabase
        .from("pokemon_banco")
        .select(
          `
                        id,
                        level,
                        pokemon_base: id_base (pokemon,dex_num)    
                        `,
        )
        .order("level", { ascending: false });

      if (bancoErr) throw bancoErr;

      setOptions((banco ?? []) as any);

      //preenche selects com valor atual
      const init: Record<number, number | ""> = {
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
      };
      normalized.forEach((r) => {
        init[r.slot] = r.pokemon_banco?.id ?? "";
      });
      setSelectedBySlot(init);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao carregar o time");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const optionsById = useMemo(() => {
    const m = new Map<number, PokemonBancoOption>();
    options.forEach((o) => m.set(o.id, o));
    return m;
  }, [options]);

  async function onSave(slot: number) {
    setErrorMsg(null);
    setSavingSlot(slot);
    try {
      const selected = selectedBySlot[slot];
      await setPokemonInSlot(slot, selected === "" ? null : Number(selected));
      await loadAll();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao salvar slot.");
    } finally {
      setSavingSlot(null);
    }
  }

  async function onClear(slot: number) {
    setErrorMsg(null);
    setSavingSlot(slot);
    try {
      await clearSlot(slot);
      await loadAll();
    } catch (e: any) {
      setErrorMsg(e?.message ?? " Falha ao limpar slot");
    } finally {
      setSavingSlot(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <p className="text-sm text-zinc-400"> Carregando time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">Meu Time</h2>
          <p className="text-sm text-zinc-400">
            5 slots - Selecione os pokémon do seu banco
          </p>
        </div>
        <button
          onClick={() => loadAll()}
          className="text-sm text-zinc-300 hover:text-white underline underline-offset-4"
        >
          Recarregar
        </button>
      </div>
      {errorMsg && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {rows.map((r) => {
          const filled = r.pokemon_banco?.id != null;
          const current = r.pokemon_banco;
          const selected = selectedBySlot[r.slot];

          const selectedObj =
            selected === ""
              ? null
              : (optionsById.get(Number(selected)) ?? null);

          const displayName =
            current?.pokemon_base?.pokemon ??
            selectedObj?.pokemon_base?.pokemon ??
            "Vazio";

          const displayLevel = current?.level ?? selectedObj?.level ?? null;

          return (
            <div
              key={r.slot}
              className="relative group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3 min-w-0 overflow-hidden"
            >
              {filled && (
                <button
                  onClick={() => onClear(r.slot)}
                  title="Remover Pokémon do slot"
                  className="  absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                               inline-flex items-center justify-center
                               h-7 w-7 rounded-full bg-zinc-800 text-zinc-300
                               hover:bg-red-600 hover:text-white transition
                                disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-300"
                >
                  <X className="h-4 w-4"/>
                </button>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-200">
                  Slot {r.slot}
                </p>
              </div>

              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-xs text-zinc-400">
                  {displayLevel != null ? `Lv ${displayLevel}` : "Sem level"}
                  {current?.natures?.nome ? ` • ${current.natures.nome}` : ""}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">
                  Escolher Pokémon
                </label>
                <select
                  value={selected}
                  onChange={(e) =>
                    setSelectedBySlot((prev) => ({
                      ...prev,
                      [r.slot]:
                        e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
                >
                  <option value="">(Vazio)</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.pokemon_base?.pokemon ?? "?"} - Lv {o.level ?? 0}
                    </option>
                  ))}
                </select>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    className="h-10 w-full"
                    onClick={() => onSave(r.slot)}
                    disabled={savingSlot === r.slot}
                  >
                    {savingSlot === r.slot ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
