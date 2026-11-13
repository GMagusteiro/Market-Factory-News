import { useRouter } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { useDataset } from '@/data';
import { space } from '@/design/tokens';
import { useI18n } from '@/i18n';
import { assetsForInterest, canFinish, MIN_PICKS, type Interest } from '@/lib/onboarding';
import { track } from '@/state/analytics';
import { useOnboarding } from '@/state/onboarding';
import { useWatchlist } from '@/state/watchlist';

export function generateMetadata(): Metadata {
  return { title: 'Welcome | MarketLens', robots: 'noindex' };
}

export default function WelcomeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { assets } = useDataset();
  const watchlist = useWatchlist();
  const { mark } = useOnboarding();
  const [interest, setInterest] = useState<Interest | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const options: { value: Interest; label: string }[] = [
    { value: 'stock', label: t('onboarding.interest.stock') },
    { value: 'forex', label: t('onboarding.interest.forex') },
    { value: 'both', label: t('onboarding.interest.both') },
  ];

  const togglePick = (slug: string) =>
    setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  function finish() {
    for (const slug of picked) if (!watchlist.has(slug)) watchlist.toggle(slug);
    mark('done');
    track('onboarding_completed', { picks: picked.length, interest: interest ?? 'both' });
    router.replace('/watchlist');
  }

  function skip() {
    mark('skipped');
    router.replace('/');
  }

  return (
    <Screen>
      <View style={{ gap: space.md }}>
        <AppText variant="title" accessibilityRole="header">
          {t('onboarding.title')}
        </AppText>
        <AppText tone="muted">{t('onboarding.intro')}</AppText>
      </View>

      <View style={{ gap: space.md }}>
        <AppText variant="heading">{t('onboarding.step1')}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {options.map((o) => (
            <Chip key={o.value} label={o.label} selected={interest === o.value} onPress={() => setInterest(o.value)} />
          ))}
        </View>
      </View>

      {interest && (
        <View style={{ gap: space.md }}>
          <AppText variant="heading">{t('onboarding.step2', { n: MIN_PICKS })}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {assetsForInterest(assets, interest).map((a) => (
              <Chip key={a.slug} label={a.symbol} selected={picked.includes(a.slug)} onPress={() => togglePick(a.slug)} />
            ))}
          </View>
          <AppText variant="small" tone="muted">
            {t('onboarding.selected', { n: picked.length })}
          </AppText>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {canFinish(picked) && <Button label={t('onboarding.finish')} onPress={finish} />}
        <Button label={t('onboarding.skip')} variant="secondary" onPress={skip} />
      </View>
    </Screen>
  );
}
