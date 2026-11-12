import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const KEY = 'marketlens.consent.v1';

/** unset = ainda não escolheu (nada de análise é carregado). */
export type Consent = 'unset' | 'accepted' | 'rejected';

interface ConsentValue {
  consent: Consent;
  ready: boolean;
  accept: () => void;
  reject: () => void;
  reset: () => void;
}

const Ctx = createContext<ConsentValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent>('unset');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'accepted' || v === 'rejected') setConsent(v);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const save = useCallback((value: Consent) => {
    setConsent(value);
    const op = value === 'unset' ? AsyncStorage.removeItem(KEY) : AsyncStorage.setItem(KEY, value);
    op.catch(() => {});
  }, []);

  const value = useMemo<ConsentValue>(
    () => ({
      consent,
      ready,
      accept: () => save('accepted'),
      reject: () => save('rejected'),
      reset: () => save('unset'),
    }),
    [consent, ready, save],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConsent(): ConsentValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useConsent fora de ConsentProvider');
  return v;
}
