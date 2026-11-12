import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'marketlens.onboarding.v1';

/** 'done' = escolheu ativos; 'skipped' = dispensou. Qualquer um esconde o convite na página inicial. */
export function useOnboarding() {
  const [status, setStatus] = useState<'loading' | 'new' | 'done' | 'skipped'>('loading');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => setStatus(v === 'done' || v === 'skipped' ? v : 'new'))
      .catch(() => setStatus('new'));
  }, []);

  const mark = useCallback((value: 'done' | 'skipped') => {
    setStatus(value);
    AsyncStorage.setItem(KEY, value).catch(() => {});
  }, []);

  return { status, mark };
}
