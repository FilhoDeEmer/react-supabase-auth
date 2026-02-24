/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Profile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  theme: string | null;
  updated_at: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;

  profile: Profile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;

  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_CACHE_KEY = "sleepcalc:profile:v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  function loadProfileCache(userId: string) {
    try {
      const raw = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Profile;
      if (parsed?.user_id !== userId) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function saveProfileCache(p: Profile | null) {
    try {
      if (!p) localStorage.removeItem(PROFILE_CACHE_KEY);
      else localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
  }

  async function refreshProfile() {
    if (!user?.id) return;

    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, theme, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      const p = (data ?? null) as Profile | null;
      setProfile(p);
      saveProfileCache(p);
    } finally {
      setProfileLoading(false);
    }
  }

  function clearProfile() {
    setProfile(null);
    saveProfileCache(null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false); // ✅ importante
      },
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  // quando user muda: tenta cache e revalida
  useEffect(() => {
    if (!user?.id) {
      clearProfile();
      return;
    }

    // 1) carrega cache instantâneo
    const cached = loadProfileCache(user.id);
    if (cached) setProfile(cached);

    // 2) revalida do banco
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) throw error;
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    clearProfile(); // ✅ limpa cache ao sair
    if (error) throw error;
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading,

      profile,
      profileLoading,
      refreshProfile,
      clearProfile,

      signInWithPassword,
      signInWithGoogle,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [user, session, loading, profile, profileLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}