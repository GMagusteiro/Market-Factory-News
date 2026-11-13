import { Link, useLocalSearchParams } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { space } from '@/design/tokens';
import { useI18n } from '@/i18n';
import { LEGAL_IDS, LEGAL_UPDATED, legal, type LegalDocId } from '@/i18n/legal';
import { useConsent } from '@/state/consent';

const CONTACT = process.env.EXPO_PUBLIC_CONTACT_EMAIL;

export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return LEGAL_IDS.map((doc) => ({ doc }));
}

export function generateMetadata(_request: unknown, params: Record<string, string | string[]>): Metadata {
  const id = String(params.doc) as LegalDocId;
  return { title: `${legal.en[id]?.title ?? 'Legal'} | Market Factory News` };
}

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const { t, lang } = useI18n();
  const consent = useConsent();
  const id = LEGAL_IDS.find((x) => x === doc);
  const content = id ? legal[lang][id] : null;

  if (!content) {
    return (
      <Screen>
        <Link href="/">
          <AppText tone="primary">{t('asset.back')}</AppText>
        </Link>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: space.sm }}>
        <AppText variant="title" accessibilityRole="header">
          {content.title}
        </AppText>
        <AppText variant="small" tone="muted">
          {t('legal.updated', { date: LEGAL_UPDATED })}
        </AppText>
      </View>
      {content.sections.map((s) => (
        <View key={s.heading} style={{ gap: space.sm }}>
          <AppText variant="heading" accessibilityRole="header">
            {s.heading}
          </AppText>
          {s.paragraphs.map((p) => (
            <AppText key={p}>{p}</AppText>
          ))}
        </View>
      ))}
      {id === 'cookies' && (
        <View style={{ gap: space.md, alignItems: 'flex-start' }}>
          <AppText tone="muted">{t(`consent.status.${consent.consent}` as const)}</AppText>
          <Button label={t('consent.change')} variant="secondary" onPress={consent.reset} />
        </View>
      )}
      {CONTACT ? <AppText tone="muted">{t('legal.contact', { email: CONTACT })}</AppText> : null}
    </Screen>
  );
}
