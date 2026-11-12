import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getAsset } from '@/data';

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

/** Watchlist guardada no dispositivo (Fase 1). Na Fase 2 passa a sincronizar com a conta. */
export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

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

  const toggle = useCallback((slug: string) => {
    setSlugs((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
    );
  }, []);

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
