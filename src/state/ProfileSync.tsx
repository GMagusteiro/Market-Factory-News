import { useEffect, useRef } from 'react';

import { useI18n, type Lang } from '@/i18n';
import { useAuth } from '@/state/auth';

/**
 * Liga as preferências da conta às do dispositivo.
 * Ao entrar: se a conta já tem idioma/fuso, aplica-os; se não tem, guarda os atuais.
 * Depois, cada mudança feita pela pessoa é guardada na conta.
 */
export function ProfileSync() {
  const { userId, prefs, updatePrefs } = useAuth();
  const { lang, setLang, timeZone, setTimeZone } = useI18n();
  const syncedFor = useRef<string | null>(null);
  // Últimos valores que a conta já conhece (ou que acabámos de aplicar a partir dela).
  const known = useRef<{ lang: Lang; timeZone: string }>({ lang, timeZone });

  // A ordem importa: este efeito corre antes do seguinte no mesmo render, e só guarda mudanças já sincronizadas.
  useEffect(() => {
    if (!userId || syncedFor.current !== userId) return;
    const patch: { lang?: Lang; timeZone?: string } = {};
    if (lang !== known.current.lang) patch.lang = lang;
    if (timeZone !== known.current.timeZone) patch.timeZone = timeZone;
    if (!Object.keys(patch).length) return;
    known.current = { lang, timeZone };
    void updatePrefs(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, timeZone]);

  useEffect(() => {
    if (!userId) {
      syncedFor.current = null;
      return;
    }
    if (!prefs || syncedFor.current === userId) return;
    syncedFor.current = userId;
    const next = { lang: prefs.lang ?? lang, timeZone: prefs.timeZone ?? timeZone };
    known.current = next;
    if (next.lang !== lang) setLang(next.lang);
    if (next.timeZone !== timeZone) setTimeZone(next.timeZone);
    const missing: { lang?: Lang; timeZone?: string } = {};
    if (!prefs.lang) missing.lang = next.lang;
    if (!prefs.timeZone) missing.timeZone = next.timeZone;
    if (Object.keys(missing).length) void updatePrefs(missing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, prefs]);

  return null;
}
