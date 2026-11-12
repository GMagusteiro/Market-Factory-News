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
import { useAuth } from '@/state/auth';

const GOOGLE_ENABLED = process.env.EXPO_PUBLIC_GOOGLE_LOGIN === '1';

export function generateMetadata(): Metadata {
  return { title: 'Conta | MarketLens', robots: 'noindex' };
}

const BENEFITS = [
  'Notícias dos últimos 30 dias e períodos personalizados',
  'Calendário económico com histórico e 14 dias à frente',
  'Watchlist sincronizada entre dispositivos',
];

export default function AccountScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const auth = useAuth();
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
    if (message) setError(message);
    else onOk?.();
  }

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  if (!auth.enabled) {
    return (
      <Screen>
        <AppText variant="title" accessibilityRole="header">
          Conta
        </AppText>
        <Card>
          <AppText tone="muted">O registo ainda não está ativo nesta versão.</AppText>
        </Card>
      </Screen>
    );
  }

  if (!auth.ready) {
    return (
      <Screen>
        <AppText variant="title" accessibilityRole="header">
          Conta
        </AppText>
      </Screen>
    );
  }

  if (auth.userId) {
    return (
      <Screen>
        <AppText variant="title" accessibilityRole="header">
          Conta
        </AppText>
        <Card>
          <AppText variant="subheading">{auth.email}</AppText>
          <Badge label={auth.tier === 'premium' ? 'Premium' : 'Conta gratuita'} tone={auth.tier === 'premium' ? 'positive' : 'primary'} />
          <AppText variant="small" tone="muted">
            A tua watchlist está sincronizada com a conta.
          </AppText>
          <View style={{ alignSelf: 'flex-start', marginTop: space.sm }}>
            <Button label="Sair" variant="secondary" onPress={() => run(async () => { await auth.signOut(); return null; }, () => router.replace('/'))} />
          </View>
        </Card>

        <Card>
          <AppText variant="subheading">Apagar conta</AppText>
          <AppText variant="small" tone="muted">
            Remove a tua conta e a tua watchlist de forma permanente. Não é possível desfazer.
          </AppText>
          {confirmDelete ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
              <Button label="Sim, apagar a minha conta" onPress={() => run(auth.deleteAccount, () => router.replace('/'))} />
              <Button label="Cancelar" variant="secondary" onPress={() => setConfirmDelete(false)} />
            </View>
          ) : (
            <View style={{ alignSelf: 'flex-start', marginTop: space.sm }}>
              <Button label="Apagar conta" variant="secondary" onPress={() => setConfirmDelete(true)} />
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
        Entrar ou criar conta
      </AppText>
      <AppText tone="muted">
        Podes usar o MarketLens sem registo. Com uma conta gratuita ganhas mais:
      </AppText>
      <View style={{ gap: space.xs }}>
        {BENEFITS.map((benefit) => (
          <AppText key={benefit}>• {benefit}</AppText>
        ))}
      </View>

      <Card>
        {sent ? (
          <>
            <AppText variant="subheading">Verifica o teu email</AppText>
            <AppText tone="muted">
              Enviámos uma ligação de acesso para {email.trim()}. Abre-a neste dispositivo para entrar.
            </AppText>
          </>
        ) : (
          <>
            <AppText variant="subheading">Entrar com email</AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="o-teu@email.com"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Email"
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
                label={busy ? 'A enviar…' : 'Enviar ligação de acesso'}
                onPress={() => {
                  if (!validEmail) return setError('Escreve um email válido.');
                  void run(() => auth.signInWithEmail(email), () => setSent(true));
                }}
              />
            </View>
            {GOOGLE_ENABLED ? (
              <View style={{ alignSelf: 'flex-start' }}>
                <Button label="Continuar com Google" variant="secondary" onPress={() => run(auth.signInWithGoogle)} />
              </View>
            ) : null}
            <AppText variant="small" tone="muted">
              Sem palavra-passe: enviamos-te uma ligação para entrares. Ao continuares aceitas que guardemos o teu email e a tua watchlist.
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
