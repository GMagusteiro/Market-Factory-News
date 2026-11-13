import { useRouter } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { Linking, Platform, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { layout, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { LANGS, useI18n, type MessageKey } from '@/i18n';
import { feedUrl, googleAddUrl, webcalUrl } from '@/lib/calendarFeed';
import { DEVICE_TIME_ZONE, TIME_ZONE_OPTIONS } from '@/lib/timezones';
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
  const { t, lang, setLang, timeZone, setTimeZone } = useI18n();
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
          <AppText variant="subheading">{t('account.prefs.title')}</AppText>
          <AppText variant="small" tone="muted">
            {t('account.prefs.body')}
          </AppText>
          <ChoiceRow
            label={t('account.prefs.language')}
            value={lang}
            options={LANGS.map((l) => ({ value: l.code, label: l.name }))}
            onChange={(v) => setLang(v as typeof lang)}
          />
          <ChoiceRow
            label={t('account.prefs.timezone')}
            value={timeZone}
            options={[{ value: DEVICE_TIME_ZONE, label: t('account.prefs.device') }, ...TIME_ZONE_OPTIONS]}
            onChange={setTimeZone}
          />
        </Card>

        <CalendarFeedCard />

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

function ChoiceRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={{ gap: space.xs, marginTop: space.sm }}>
      <AppText variant="small" tone="muted">
        {label}
      </AppText>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {options.map((option) => (
          <Button
            key={option.value}
            label={option.label}
            variant={option.value === value ? 'primary' : 'secondary'}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

function CalendarFeedCard() {
  const auth = useAuth();
  const { t } = useI18n();
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(reset: boolean) {
    setBusy(true);
    setError(null);
    const { token, error: message } = await auth.calendarToken(reset);
    setBusy(false);
    if (message) return setError(message === 'unavailable' ? t('account.unavailable') : message);
    setUrl(feedUrl(process.env.EXPO_PUBLIC_SUPABASE_URL, token));
    setCopied(false);
  }

  async function copy() {
    if (!url) return;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card>
      <AppText variant="subheading">{t('account.cal.title')}</AppText>
      <AppText variant="small" tone="muted">
        {t('account.cal.body')}
      </AppText>
      {url ? (
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          <AppText variant="small" selectable numberOfLines={2} style={{ fontFamily: 'monospace' }}>
            {url}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            <Button label={t('account.cal.google')} onPress={() => void Linking.openURL(googleAddUrl(url))} />
            <Button label={t('account.cal.apple')} variant="secondary" onPress={() => void Linking.openURL(webcalUrl(url))} />
            <Button label={copied ? t('account.cal.copied') : t('account.cal.copy')} variant="secondary" onPress={copy} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' }}>
            <Button label={t('account.cal.reset')} variant="secondary" onPress={() => load(true)} />
            <AppText variant="small" tone="muted">
              {t('account.cal.resetNote')}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={{ alignSelf: 'flex-start', marginTop: space.sm }}>
          <Button label={busy ? '…' : t('account.cal.get')} onPress={() => load(false)} />
        </View>
      )}
      {error ? (
        <AppText variant="small" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </Card>
  );
}
