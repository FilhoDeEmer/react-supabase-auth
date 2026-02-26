import { supabase } from "../../lib/supabase";

const SLOTS = [1, 2, 3, 4, 5] as const;
type Slot = (typeof SLOTS)[number];

function assertSlot(slot: number): asserts slot is Slot {
  if (!SLOTS.includes(slot as Slot)) {
    throw new Error(`Slot inválido: ${slot}. Use 1 a 5.`);
  }
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error("Usuário não autenticado");
  return userId;
}

export async function ensureTeamSlots() {
  const userId = await requireUserId();

  const { data: existing, error } = await supabase
    .from("user_team_slots")
    .select("slot")
    .eq("user_id", userId)
    .order("slot", { ascending: true });

  if (error) throw error;

  const existingSlots = new Set(existing?.map((s) => s.slot) ?? []);
  const missing = SLOTS.filter((n) => !existingSlots.has(n));

  if (missing.length === 0) return;

  const rows = missing.map((slot) => ({
    user_id: userId,
    slot,
    pokemon_banco_id: null as number | null,
  }));

  // mais idempotente (evita erro se rodar 2x)
  const { error: upsertErr } = await supabase
    .from("user_team_slots")
    .upsert(rows, { onConflict: "user_id,slot" });

  if (upsertErr) throw upsertErr;
}

export async function setPokemonInSlot(slot: number, pokemonBancoId: number | null) {
  assertSlot(slot);
  const userId = await requireUserId();

  const { error } = await supabase
    .from("user_team_slots")
    .upsert(
      { user_id: userId, slot, pokemon_banco_id: pokemonBancoId },
      { onConflict: "user_id,slot" }
    );

  if (error) throw error;
}

export async function clearSlot(slot: number) {
  await setPokemonInSlot(slot, null);
}

export async function swapSlots(slotA: number, slotB: number) {
  assertSlot(slotA);
  assertSlot(slotB);
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("user_team_slots")
    .select("slot, pokemon_banco_id")
    .eq("user_id", userId)
    .in("slot", [slotA, slotB]);

  if (error) throw error;

  const map = new Map<number, number | null>();
  data?.forEach((r) => map.set(r.slot, r.pokemon_banco_id ?? null));

  const a = map.get(slotA) ?? null;
  const b = map.get(slotB) ?? null;

  // reduz risco: 1 chamada (ainda não é transação)
  const { error: swapErr } = await supabase
    .from("user_team_slots")
    .upsert(
      [
        { user_id: userId, slot: slotA, pokemon_banco_id: b },
        { user_id: userId, slot: slotB, pokemon_banco_id: a },
      ],
      { onConflict: "user_id,slot" }
    );

  if (swapErr) throw swapErr;
}