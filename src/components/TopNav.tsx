import { Link, usePathname } from 'expo-router';
import { View } from 'react-native';

import { layout, space, typography } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { useWatchlist } from '@/state/watchlist';

export function TopNav() {
  const { colors } = useTheme();
  const pathname = usePathname();
  const { slugs, ready } = useWatchlist();

  const items = [
    { href: '/', label: 'Pesquisa', active: pathname === '/' || pathname.startsWith('/ativo') },
    {
      href: '/watchlist',
      label: ready && slugs.length > 0 ? `Watchlist (${slugs.length})` : 'Watchlist',
      active: pathname.startsWith('/watchlist'),
    },
    { href: '/calendario', label: 'Calendário', active: pathname.startsWith('/calendario') },
  ] as const;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
        paddingHorizontal: space.lg,
      }}>
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: space.xl,
          rowGap: space.sm,
          paddingVertical: space.md,
        }}>
        <Link href="/" style={[typography.heading, { color: colors.primary, marginRight: space.sm }]}>
          MarketLens
        </Link>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={[
              typography.subheading,
              {
                color: item.active ? colors.text : colors.textMuted,
                borderBottomWidth: 2,
                borderBottomColor: item.active ? colors.primary : 'transparent',
              },
            ]}>
            {item.label}
          </Link>
        ))}
      </View>
    </View>
  );
}
