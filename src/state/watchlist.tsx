import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { getAsset } from '@/data';
import { mergeWatchlists } from '@/lib/access';
import { getSupabase } from '@/lib/supabase';

import { useAuth } from './auth';

const STORAGE_KEY = 'marketlens.watchlist.v1';

interface WatchlistValue {
  /** Slugs dos ativos seguidos, pela ordem em que foram adicionados. */
  slugs: string[];
  /** false até a lista guardada no dispositivo ter sido lida. */
  ready: boolean;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
}

const WatchlistContext = createContext<WatchlistValue | null>(null);

/** Watchlist guardada no dispositivo; com sessão iniciada sincroniza com a conta. */
export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const { userId } = useAuth();
  const slugsRef = useRef<string[]>([]);
  const hadUser = useRef(false);

  useEffect(() => {
    slugsRef.current = slugs;
  }, [slugs]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled || !stored) return;
        try {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSlugs(parsed.filter((s): s is string => typeof s === 'string' && !!getAsset(s)));
          }
        } catch {
          // Dados corrompidos: começa com a lista vazia.
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(slugs)).catch(() => {});
  }, [slugs, ready]);

  // Ao iniciar sessão: junta a lista do dispositivo com a da conta. Ao sair: limpa o dispositivo.
  useEffect(() => {
    const supabase = getSupabase();
    if (!ready) return;
    if (!userId || !supabase) {
      if (hadUser.current) {
        hadUser.current = false;
        setSlugs([]);
      }
      return;
    }
    hadUser.current = true;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('watchlist_items').select('asset_slug');
      if (error || cancelled) return;
      const remote = (data ?? []).map((row) => row.asset_slug as string);
      const merged = mergeWatchlists(slugsRef.current, remote).filter((s) => !!getAsset(s));
      setSlugs(merged);
      const missing = merged.filter((s) => !remote.includes(s));
      if (missing.length > 0) {
        await supabase.from('watchlist_items').insert(missing.map((asset_slug) => ({ asset_slug })));
      }
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, ready]);

  const toggle = useCallback(
    (slug: string) => {
      const had = slugsRef.current.includes(slug);
      setSlugs((current) => (had ? current.filter((s) => s !== slug) : [...current, slug]));

      const supabase = getSupabase();
      if (!supabase || !userId) return;
      const request = had
        ? supabase.from('watchlist_items').delete().eq('asset_slug', slug)
        : supabase.from('watchlist_items').insert({ asset_slug: slug });
      void Promise.resolve(request).catch(() => {});
    },
    [userId],
  );

  const value = useMemo<WatchlistValue>(
    () => ({ slugs, ready, has: (slug) => slugs.includes(slug), toggle }),
    [slugs, ready, toggle],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist(): WatchlistValue {
  const value = useContext(WatchlistContext);
  if (!value) throw new Error('useWatchlist tem de ser usado dentro de WatchlistProvider');
  return value;
}
