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
import { useI18n } from '@/i18n';
import { calendarAheadDays, canSeeCalendarHistory } from '@/lib/access';
import type { Impact } from '@/lib/types';
import { useAuth } from '@/state/auth';

type View_ = 'upcoming' | 'past';
type ImpactFilter = 'all' | Impact;

const IMPACTS: ImpactFilter[] = ['all', 'high', 'medium', 'low'];

const DAY = 24 * 60 * 60 * 1000;

export function generateMetadata(): Metadata {
  return {
    title: 'Calendário económico | MarketLens',
    description: 'Calendário económico com os eventos macro por data, moeda e impacto.',
  };
}

export default function CalendarScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const auth = useAuth();
  const ahead = calendarAheadDays(auth.tier, auth.enabled);
  const history = canSeeCalendarHistory(auth.tier, auth.enabled);
  const views: { key: View_; label: string }[] = [
    { key: 'upcoming', label: t('calendar.upcoming', { n: ahead }) },
    { key: 'past', label: t(history ? 'calendar.past' : 'calendar.pastLocked') },
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
        {t('calendar.title')}
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
            {t('calendar.impact')}
          </AppText>
          {IMPACTS.map((option) => (
            <Chip key={option} label={t(`calendar.impact.${option}`)} selected={impact === option} onPress={() => setImpact(option)} />
          ))}
        </View>
      </View>

      <EventList events={events} emptyText={t('calendar.empty')} />
    </Screen>
  );
}
