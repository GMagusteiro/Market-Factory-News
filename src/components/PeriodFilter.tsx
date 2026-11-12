import { useRouter } from 'expo-router';
import { TextInput, View } from 'react-native';

import { useDataset } from '@/data';
import { useI18n } from '@/i18n';
import { layout, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { canUsePeriod } from '@/lib/access';
import { PERIOD_KEYS, toDay, type PeriodKey } from '@/lib/period';
import type { PeriodState } from '@/lib/usePeriod';
import { useAuth } from '@/state/auth';

import { AppText } from './ui/AppText';
import { Chip } from './ui/Chip';

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Escolha do período: 24h, 7 dias, 30 dias ou datas personalizadas (AAAA-MM-DD). */
export function PeriodFilter({ period }: { period: PeriodState }) {
  const { colors } = useTheme();
  const { now } = useDataset();
  const router = useRouter();
  const { t } = useI18n();
  const auth = useAuth();
  const { key, from, to, range, onChange } = period;

  function selectKey(next: PeriodKey) {
    if (!canUsePeriod(next, auth.tier, auth.enabled)) {
      router.push('/conta');
      return;
    }
    if (next === 'custom' && (!from || !to)) {
      onChange(next, toDay(new Date(now.getTime() - WEEK)), toDay(now));
    } else {
      onChange(next, from, to);
    }
  }

  const inputStyle = {
    height: layout.controlHeight,
    minWidth: 140,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  } as const;

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {PERIOD_KEYS.map((key_) => (
          <Chip
            key={key_}
            label={
              canUsePeriod(key_, auth.tier, auth.enabled)
                ? t(`period.${key_}`)
                : `${t(`period.${key_}`)} · ${t('period.lockedSuffix')}`
            }
            selected={key === key_}
            onPress={() => selectKey(key_)}
          />
        ))}
      </View>
      {key === 'custom' ? (
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, alignItems: 'center' }}>
            <TextInput
              value={from}
              onChangeText={(text) => onChange(key, text, to)}
              placeholder={t('period.dateFormat')}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel={t('period.from')}
              maxLength={10}
              autoCorrect={false}
              style={inputStyle}
            />
            <AppText tone="muted">{t('period.until')}</AppText>
            <TextInput
              value={to}
              onChangeText={(text) => onChange(key, from, text)}
              placeholder={t('period.dateFormat')}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel={t('period.to')}
              maxLength={10}
              autoCorrect={false}
              style={inputStyle}
            />
          </View>
          {range === null ? (
            <AppText variant="small" style={{ color: colors.danger }}>
              {t('period.invalid')}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
