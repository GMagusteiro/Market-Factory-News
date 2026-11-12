import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import type { Tier } from '@/lib/access';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthValue {
  /** false se o Supabase não estiver configurado: sem contas, sem bloqueios. */
  enabled: boolean;
  /** false até a sessão guardada ter sido lida. */
  ready: boolean;
  email: string | null;
  userId: string | null;
  tier: Tier;
  /** Envia a ligação de acesso por email. Devolve uma mensagem de erro, se houver. */
  signInWithEmail: (email: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<string | null>;
}

const AuthContext = createContext<AuthValue | null>(null);

const redirectUrl = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' ? `${window.location.origin}/conta` : undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [profile, setProfile] = useState<{ userId: string; tier: 'free' | 'premium' } | null>(null);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setSession(data.session);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  // O nível (free/premium) vem do perfil. O utilizador só o lê; quem o altera és tu.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile({ userId, tier: data?.tier === 'premium' ? 'premium' : 'free' });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return 'unavailable';
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl() },
    });
    return error ? error.message : null;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return 'unavailable';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl() },
    });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return 'unavailable';
    const { error } = await supabase.rpc('delete_my_account');
    if (error) return error.message;
    await supabase.auth.signOut({ scope: 'local' });
    return null;
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      enabled: isSupabaseConfigured,
      ready,
      email: session?.user.email ?? null,
      userId,
      tier: !userId ? 'guest' : profile?.userId === userId ? profile.tier : 'free',
      signInWithEmail,
      signInWithGoogle,
      signOut,
      deleteAccount,
    }),
    [ready, session, userId, profile, signInWithEmail, signInWithGoogle, signOut, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth tem de ser usado dentro de AuthProvider');
  return value;
}
