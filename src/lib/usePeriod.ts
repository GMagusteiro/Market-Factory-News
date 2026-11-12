import { useCallback, useMemo, useState } from 'react';

import { useDataset } from '@/data';

import { resolveRange, type DateRange, type PeriodKey } from './period';

export interface PeriodState {
  key: PeriodKey;
  from: string;
  to: string;
  /** null se o período personalizado for inválido. */
  range: DateRange | null;
  onChange: (key: PeriodKey, from: string, to: string) => void;
}

/** Estado do filtro de período (24h, 7 dias, 30 dias ou personalizado). */
export function usePeriod(initial: PeriodKey = '7d'): PeriodState {
  const { now } = useDataset();
  const [key, setKey] = useState<PeriodKey>(initial);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const range = useMemo(() => resolveRange(key, from, to, now), [key, from, to, now]);

  const onChange = useCallback((nextKey: PeriodKey, nextFrom: string, nextTo: string) => {
    setKey(nextKey);
    setFrom(nextFrom);
    setTo(nextTo);
  }, []);

  return { key, from, to, range, onChange };
}
