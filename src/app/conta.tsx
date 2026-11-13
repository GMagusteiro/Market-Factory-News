import { useRouter } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { layout, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { useI18n, type MessageKey } from '@/i18n';
import { useAuth } from '@/state/auth';

const GOOGLE_ENABLED = process.env.EXPO_PUBLIC_GOOGLE_LOGIN === '1';

export function generateMetadata(): Metadata {
  return { title: 'Account | MarketLens', robots: 'noindex' };
}

const BENEFITS: MessageKey[] = ['login.benefit1', 'login.benefit2', 'login.benefit3'];

export default function AccountScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const auth = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function run(action: () => Promise<string | null>, onOk?: () => void) {
    setBusy(true);
    setError(null);
    const message = await action();
    setBusy(false);
    if (message) setError(message === 'unavailable' ? t('account.unavailable') : message);
    else onOk?.();
  }

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  if (!auth.enabled) {
    return (
      <Screen>
        <AppText variant="title" accessibilityRole="header">
          {t('account.title')}
        </AppText>
        <Card>
          <AppText tone="muted">{t('account.disabled')}</AppText>
        </Card>
      </Screen>
    );
  }

  if (!auth.ready) {
    return (
      <Screen>
        <AppText variant="title" accessibilityRole="header">
          {t('account.title')}
        </AppText>
      </Screen>
    );
  }

  if (auth.userId) {
    return (
      <Screen>
        <AppText variant="title" accessibilityRole="header">
          {t('account.title')}
        </AppText>
        <Card>
          <AppText variant="subheading">{auth.email}</AppText>
          <Badge label={t(auth.tier === 'premium' ? 'account.premium' : 'account.free')} tone={auth.tier === 'premium' ? 'positive' : 'primary'} />
          <AppText variant="small" tone="muted">
            {t('account.synced')}
          </AppText>
          <View style={{ alignSelf: 'flex-start', marginTop: space.sm }}>
            <Button label={t('account.signOut')} variant="secondary" onPress={() => run(async () => { await auth.signOut(); return null; }, () => router.replace('/'))} />
          </View>
        </Card>

        <Card>
          <AppText variant="subheading">{t('account.delete.title')}</AppText>
          <AppText variant="small" tone="muted">
            {t('account.delete.body')}
          </AppText>
          {confirmDelete ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
              <Button label={t('account.delete.confirm')} onPress={() => run(auth.deleteAccount, () => router.replace('/'))} />
              <Button label={t('account.delete.cancel')} variant="secondary" onPress={() => setConfirmDelete(false)} />
            </View>
          ) : (
            <View style={{ alignSelf: 'flex-start', marginTop: space.sm }}>
              <Button label={t('account.delete.title')} variant="secondary" onPress={() => setConfirmDelete(true)} />
            </View>
          )}
        </Card>
        {error ? (
          <AppText variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
            {error}
          </AppText>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('login.title')}
      </AppText>
      <AppText tone="muted">
        {t('login.intro')}
      </AppText>
      <View style={{ gap: space.xs }}>
        {BENEFITS.map((benefit) => (
          <AppText key={benefit}>• {t(benefit)}</AppText>
        ))}
      </View>

      <Card>
        {sent ? (
          <>
            <AppText variant="subheading">{t('login.sent.title')}</AppText>
            <AppText tone="muted">
              {t('login.sent.body', { email: email.trim() })}
            </AppText>
          </>
        ) : (
          <>
            <AppText variant="subheading">{t('login.email.title')}</AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('login.email.placeholder')}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel={t('login.email.label')}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              style={{
                height: layout.controlHeight,
                paddingHorizontal: space.md,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: 16,
              }}
            />
            <View style={{ alignSelf: 'flex-start' }}>
              <Button
                label={busy ? t('login.sending') : t('login.send')}
                onPress={() => {
                  if (!validEmail) return setError(t('login.invalidEmail'));
                  void run(() => auth.signInWithEmail(email), () => setSent(true));
                }}
              />
            </View>
            {GOOGLE_ENABLED ? (
              <View style={{ alignSelf: 'flex-start' }}>
                <Button label={t('login.google')} variant="secondary" onPress={() => run(auth.signInWithGoogle)} />
              </View>
            ) : null}
            <AppText variant="small" tone="muted">
              {t('login.note')}
            </AppText>
          </>
        )}
      </Card>
      {error ? (
        <AppText variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </Screen>
  );
}
