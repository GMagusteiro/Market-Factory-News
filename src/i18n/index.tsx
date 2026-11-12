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

import { LANGS, messages, type Lang, type MessageKey } from './messages';

export { LANGS, type Lang, type MessageKey };

const STORAGE_KEY = 'marketlens.lang.v1';

export type Params = Record<string, string | number>;

/** Substitui {nome} pelos valores. Pura, para poder ser testada. */
export function translate(lang: Lang, key: MessageKey, params?: Params): string {
  const template = messages[lang][key] ?? messages.pt[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}

export const isLang = (value: unknown): value is Lang =>
  value === 'pt' || value === 'en' || value === 'es';

/** Idioma preferido do browser: pt, en ou es; senão português. */
export function detectLang(languages: readonly string[]): Lang {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return 'pt';
}

interface I18nValue {
  lang: Lang;
  /** Código para Intl (datas, listas). */
  locale: string;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, params?: Params) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Começa sempre em português (igual ao HTML estático); depois ajusta ao guardado ou ao browser.
  const [lang, setLangState] = useState<Lang>('pt');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (isLang(stored)) setLangState(stored);
        else if (typeof navigator !== 'undefined') {
          setLangState(detectLang(navigator.languages?.length ? navigator.languages : [navigator.language]));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      locale: LANGS.find((l) => l.code === lang)?.locale ?? 'pt-PT',
      setLang,
      t: (key, params) => translate(lang, key, params),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n tem de ser usado dentro de LanguageProvider');
  return value;
}

/** Nome do tema no idioma atual (cai para o nome guardado se não houver tradução). */
export function useThemeName(): (theme: { slug: string; name: string }) => string {
  const { lang } = useI18n();
  return (theme) => {
    const key = `theme.${theme.slug}` as MessageKey;
    return key in messages.pt ? translate(lang, key) : theme.name;
  };
}
