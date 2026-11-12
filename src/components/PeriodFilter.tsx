import { TextInput, View } from 'react-native';

import { useDataset } from '@/data';
import { layout, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/useTheme';
import { PERIOD_OPTIONS, toDay, type PeriodKey } from '@/lib/period';
import type { PeriodState } from '@/lib/usePeriod';

import { AppText } from './ui/AppText';
import { Chip } from './ui/Chip';

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Escolha do período: 24h, 7 dias, 30 dias ou datas personalizadas (AAAA-MM-DD). */
export function PeriodFilter({ period }: { period: PeriodState }) {
  const { colors } = useTheme();
  const { now } = useDataset();
  const { key, from, to, range, onChange } = period;

  function selectKey(next: PeriodKey) {
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
        {PERIOD_OPTIONS.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={key === option.key}
            onPress={() => selectKey(option.key)}
          />
        ))}
      </View>
      {key === 'custom' ? (
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, alignItems: 'center' }}>
            <TextInput
              value={from}
              onChangeText={(text) => onChange(key, text, to)}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Data inicial"
              maxLength={10}
              autoCorrect={false}
              style={inputStyle}
            />
            <AppText tone="muted">até</AppText>
            <TextInput
              value={to}
              onChangeText={(text) => onChange(key, from, text)}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Data final"
              maxLength={10}
              autoCorrect={false}
              style={inputStyle}
            />
          </View>
          {range === null ? (
            <AppText variant="small" style={{ color: colors.danger }}>
              Datas inválidas. Usa o formato AAAA-MM-DD, com a data inicial antes da final.
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
