import { Link, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';

import { layout, space, typography } from '@/design/tokens';
import { AppText } from './ui/AppText';
import { useTheme } from '@/design/useTheme';
import { LANGS, useI18n } from '@/i18n';
import { useAuth } from '@/state/auth';
import { useWatchlist } from '@/state/watchlist';

export function TopNav() {
  const { colors } = useTheme();
  const pathname = usePathname();
  const { slugs, ready } = useWatchlist();
  const auth = useAuth();
  const { t, lang, setLang } = useI18n();

  const items = [
    { href: '/', label: t('nav.search'), active: pathname === '/' || pathname.startsWith('/ativo') },
    {
      href: '/watchlist',
      label: ready && slugs.length > 0 ? t('nav.watchlistN', { n: slugs.length }) : t('nav.watchlist'),
      active: pathname.startsWith('/watchlist'),
    },
    { href: '/calendario', label: t('nav.calendar'), active: pathname.startsWith('/calendario') },
    ...(auth.enabled
      ? [{ href: '/conta', label: auth.userId ? t('nav.account') : t('nav.signIn'), active: pathname.startsWith('/conta') }]
      : []),
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
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('nav.language')}
          style={{ flexDirection: 'row', gap: space.xs, marginLeft: 'auto' }}>
          {LANGS.map((option) => (
            <Pressable
              key={option.code}
              accessibilityRole="radio"
              accessibilityState={{ selected: lang === option.code }}
              accessibilityLabel={option.name}
              onPress={() => setLang(option.code)}
              style={{
                paddingHorizontal: space.sm,
                paddingVertical: space.xs,
                borderRadius: 6,
                backgroundColor: lang === option.code ? colors.primarySoft : 'transparent',
              }}>
              <AppText
                variant="small"
                style={{ fontWeight: '700', color: lang === option.code ? colors.primary : colors.textMuted }}>
                {option.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
