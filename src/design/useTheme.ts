import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import { palette, type Colors, type Scheme } from './tokens';

const subscribe = () => () => {};

/**
 * Devolve as cores do tema atual. Durante a hidratação usa sempre o tema
 * claro, para o HTML estático e o primeiro render do cliente serem iguais
 * (evita erros de hidratação); depois passa ao esquema do sistema.
 */
export function useTheme(): { scheme: Scheme; colors: Colors } {
  const system = useColorScheme();
  // false no servidor e na hidratação, true depois de a página estar no cliente.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const scheme: Scheme = hydrated && system === 'dark' ? 'dark' : 'light';
  return { scheme, colors: palette[scheme] };
}
