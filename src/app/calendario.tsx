import type { Metadata } from 'expo-router/server';
import { useState } from 'react';
import { View } from 'react-native';

import { EventList } from '@/components/EventList';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { calendarEvents, SAMPLE_NOW } from '@/data';
import { space } from '@/design/tokens';
import type { Impact } from '@/lib/types';

type View_ = 'upcoming' | 'past';
type ImpactFilter = 'all' | Impact;

const VIEWS: { key: View_; label: string }[] = [
  { key: 'upcoming', label: 'Próximos 14 dias' },
  { key: 'past', label: 'Últimos 14 dias' },
];

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
  const [view, setView] = useState<View_>('upcoming');
  const [impact, setImpact] = useState<ImpactFilter>('all');

  const now = SAMPLE_NOW.getTime();
  const events = calendarEvents.filter((event) => {
    const time = Date.parse(event.datetime);
    const inView = view === 'upcoming' ? time >= now && time <= now + 14 * DAY : time < now && time >= now - 14 * DAY;
    return inView && (impact === 'all' || event.impact === impact);
  });

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        Calendário económico
      </AppText>

      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {VIEWS.map((option) => (
            <Chip key={option.key} label={option.label} selected={view === option.key} onPress={() => setView(option.key)} />
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
