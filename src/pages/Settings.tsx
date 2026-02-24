/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  theme: string | null;
};

function getMetaName(meta: any) {
    return (
        meta?.full_name ??
        meta?.name ??
        meta?.preferred_username ??
        meta?.user_name ??
        null
    );
}

function getMetaAvater(meta: any) {
    return meta?.avatar_url ?? meta?.picture ?? null;
}


export default function Settings() {
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const userId = user?.id ?? "";
  const email = user?.email ?? "";

  const canSave = useMemo(() => !!user, [user]);

  async function loadProfile() {
    if (!user) return;

    setLoading(true);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, theme")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      const row = (data ?? null) as ProfileRow | null;

      const meta = user.user_metadata as any;
      const metaName = getMetaName(meta);
      const metaAvatar = getMetaAvater(meta);

      const needsInsert = !row;
      const needsName = !row?.avatar_url && !!metaName;
      const needsAvatar = !row?.avatar_url && !!metaAvatar;

      if (needsInsert || needsName || needsAvatar) {
        const payload: ProfileRow = {
            user_id: user.id,
            display_name: row?.display_name ?? metaName ?? null,
            avatar_url: row?.avatar_url ?? metaAvatar ?? null,
            theme: row?.theme ?? "dark",
        };

        const {error: upsertErr} = await supabase
            .from("profiles")
            .upsert(payload, {onConflict: "user_id"})

            if (upsertErr) throw upsertErr;

            const {data:after, error:afterErr} = await supabase
                .from("profiles")
                .select("user_id, display_name, avatar_url, theme")
                .eq("user_id", user.id)
                .maybeSingle();

            if (afterErr) throw afterErr;

            const saved = (after ?? null) as ProfileRow | null;
            setProfile(saved);

            setDisplayName(saved?.display_name ?? "");
            setAvatarUrl(saved?.avatar_url ?? "");
            setTheme(saved?.theme === "light" ? "light" : "dark");
            return;
      }
      
      setProfile(row);
      setDisplayName(row?.display_name ?? "");
      setAvatarUrl(row?.avatar_url ?? "");
      setTheme(row?.theme === "light" ? "light" : "dark");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao carregar perfil");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!user) return;

    setSaving(true);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const payload: ProfileRow = {
        user_id: user.id,
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        theme,
      };

      const { error } = await supabase.from("profiles").upsert(payload, {
        onConflict: "user_id",
      });

      if (error) throw error;

      setOkMsg("Perfil salvo com sucesso!");
      await loadProfile();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Falha ao salvar o perfil");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <DashboardLayout title="Configurações">
      <div className="max-w-3xl space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Conta</h2>
          <p className="text-sm text-zinc-400">
            Informações da sua sessão e perfil.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {okMsg && (
          <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
            {okMsg}
          </div>
        )}

        {/* Card: Conta */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          {loading ? (
            <p className="text-sm text-zinc-400">Carregando...</p>
          ) : (
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-zinc-400">E-mail</p>
                  <p className="text-sm text-zinc-100">{email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">User ID</p>
                  <p className="text-sm text-zinc-100 break-all">{userId}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="h-10 px-4 w-auto"
                  onClick={loadProfile}
                >
                  Recarregar
                </Button>

                <Button
                  variant="ghost"
                  className="h-10 px-4 w-auto"
                  onClick={signOut}
                >
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Card: Perfil */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div>
            <p className="font-semibold">Perfil</p>
            <p className="text-sm text-zinc-400">
              Dados personalizados do usuário.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Nome / apelido</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome"
                className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr,120px] sm:items-end">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Avatar URL</label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>

              <div className="h-20 w-20 rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden flex items-center justify-center">
                {avatarUrl.trim() ? (
                  <img
                    src={avatarUrl.trim()}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/200x200?text=Avatar";
                    }}
                  />
                ) : (
                  <span className="text-xs text-zinc-500">Sem avatar</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Tema</label>
              <select
                title="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as "dark" | "light")}
                className="w-full h-10 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/60"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                className="h-10 px-4 w-auto"
                onClick={() => {
                  setDisplayName(profile?.display_name ?? "");
                  setAvatarUrl(profile?.avatar_url ?? "");
                  setTheme(profile?.theme === "light" ? "light" : "dark");
                  setOkMsg(null);
                  setErrorMsg(null);
                }}
              >
                Desfazer
              </Button>

              <Button
                variant="primary"
                className="h-10 px-4 w-auto"
                onClick={saveProfile}
                disabled={!canSave || saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
