import { useRouter } from 'expo-router';
import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { View } from 'react-native';

import { EventList } from '@/components/EventList';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { useDataset } from '@/data';
import { space } from '@/design/tokens';
import { calendarAheadDays, canSeeCalendarHistory } from '@/lib/access';
import type { Impact } from '@/lib/types';
import { useAuth } from '@/state/auth';

type View_ = 'upcoming' | 'past';
type ImpactFilter = 'all' | Impact;

const IMPACTS: { key: ImpactFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'high', label: 'Alto' },
  { key: 'medium', label: 'Médio' },
  { key: 'low', label: 'Baixo' },
];

const DAY = 24 * 60 * 60 * 1000;

export function generateMetadata(): Metadata {
  return {
    title: 'Calendário económico | MarketLens',
    description: 'Calendário económico com os eventos macro por data, moeda e impacto.',
  };
}

export default function CalendarScreen() {
  const router = useRouter();
  const auth = useAuth();
  const ahead = calendarAheadDays(auth.tier, auth.enabled);
  const history = canSeeCalendarHistory(auth.tier, auth.enabled);
  const views: { key: View_; label: string }[] = [
    { key: 'upcoming', label: `Próximos ${ahead} dias` },
    { key: 'past', label: history ? 'Últimos 14 dias' : 'Últimos 14 dias · com conta' },
  ];
  const [view, setView] = useState<View_>('upcoming');
  const [impact, setImpact] = useState<ImpactFilter>('all');

  const { calendarEvents, now: nowDate } = useDataset();
  const now = nowDate.getTime();
  const events = calendarEvents.filter((event) => {
    const time = Date.parse(event.datetime);
    const inView = view === 'upcoming' ? time >= now && time <= now + ahead * DAY : time < now && time >= now - 14 * DAY;
    return inView && (impact === 'all' || event.impact === impact);
  });

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        Calendário económico
      </AppText>

      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {views.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={view === option.key}
              onPress={() => (option.key === 'past' && !history ? router.push('/conta') : setView(option.key))}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm }}>
          <AppText variant="small" tone="muted">
            Impacto:
          </AppText>
          {IMPACTS.map((option) => (
            <Chip key={option.key} label={option.label} selected={impact === option.key} onPress={() => setImpact(option.key)} />
          ))}
        </View>
      </View>

      <EventList events={events} emptyText="Sem eventos com estes filtros." />
    </Screen>
  );
}
