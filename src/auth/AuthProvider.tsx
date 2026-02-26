/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
const AUTH_CALLBACK_PATH = "/auth/callback";
const RESET_PASSWORD_PATH = "/reset-password";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // evita setState com user antigo (race condition)
  const latestUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    latestUserIdRef.current = user?.id ?? null;
  }, [user?.id]);

  const loadProfileCache = useCallback((userId: string) => {
    try {
      const raw = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Profile | null;
      if (!parsed || parsed.user_id !== userId) return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const saveProfileCache = useCallback((p: Profile | null) => {
    try {
      if (!p) localStorage.removeItem(PROFILE_CACHE_KEY);
      else localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    saveProfileCache(null);
  }, [saveProfileCache]);

  const refreshProfile = useCallback(async () => {
    const userId = latestUserIdRef.current;
    if (!userId) return;

    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, theme, updated_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      // se o user mudou durante a requisição, ignora
      if (latestUserIdRef.current !== userId) return;

      const p = (data ?? null) as Profile | null;
      setProfile(p);
      saveProfileCache(p);
    } catch (err) {
      console.error("Erro ao carregar profile:", err);
    } finally {
      // evita desligar loading de um user antigo
      if (latestUserIdRef.current === userId) setProfileLoading(false);
    }
  }, [saveProfileCache]);

  // init + listener
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!alive) return;

      if (error) console.error("getSession error:", error);

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // profile: cache + fetch
  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      clearProfile();
      return;
    }

    const cached = loadProfileCache(userId);
    if (cached) setProfile(cached);

    refreshProfile();
  }, [user?.id, clearProfile, loadProfileCache, refreshProfile]);

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}${AUTH_CALLBACK_PATH}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) throw error;
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    clearProfile();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function resetPassword(email: string) {
    const redirectTo = `${window.location.origin}${RESET_PASSWORD_PATH}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
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
    [user, session, loading, profile, profileLoading, refreshProfile, clearProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}