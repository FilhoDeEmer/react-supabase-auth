import { supabase } from "../../lib/supabase";

export async function ensureTeamSlots() {
    const { data: existing, error } = await supabase
        .from("user_team_slots")
        .select("slot")
        .order("slot", {ascending: true});

    if (error) throw error;

    const existingSlots = new Set(existing?.map((s) => s.slot) ?? []);
    const missing = [1,2,3,4,5].filter((n) => !existingSlots.has(n));

    if (missing.length ===0) return;

    const {data: userRes, error: userErr} = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const userId = userRes.user?.id;
    if (!userId) throw new Error("Usuário não autenticado")

        const rows = missing.map((slot) => ({
            user_id: userId,
            slot,
            pokemon_banco_id: null,
        }));

        const {error: insertErr} = await supabase
            .from("user_team_slots")
            .insert(rows);

        if (insertErr) throw insertErr;
}


export async function setPokemonInSlot(slot:number, pokemonBancoId: number|null) {
    const { data:userRes, error: userErr} = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const userId = userRes.user?.id;
    if (!userId) throw new Error("Usuário não autenticado");

    const { error } = await supabase
        .from("user_team_slots")
        .upsert(
            { user_id: userId, slot, pokemon_banco_id: pokemonBancoId},
            { onConflict: "user_id,slot"}
        );

    if (error) throw error;
}

export async function clearSlot(slot: number) {
    await setPokemonInSlot(slot, null);
}

export async function swapSlots(slotA:number, slotB: number) {
    const { data, error } = await supabase 
        .from("user_team_slots")
        .select("slot, pokemon_banco_id")
        .in("slot", [slotA, slotB]);
    
        if (error) throw error;

        const map = new Map<number, number | null>();
        data?.forEach((r) => map.set(r.slot, r.pokemon_banco_id ?? null));

        const a = map.get(slotA) ?? null;
        const b = map.get(slotB) ?? null;

        await setPokemonInSlot(slotA, b);
        await setPokemonInSlot(slotB, a);
    
}
