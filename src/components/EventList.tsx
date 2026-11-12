import { View } from 'react-native';

import { space } from '@/design/tokens';
import { useI18n } from '@/i18n';
import { dayKey, formatDay, formatTime } from '@/lib/format';
import type { CalendarEvent, Impact } from '@/lib/types';

import { AppText } from './ui/AppText';
import { Badge, type BadgeTone } from './ui/Badge';
import { Card } from './ui/Card';

const IMPACT_TONE: Record<Impact, BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function EventRow({ event }: { event: CalendarEvent }) {
  const { t, locale } = useI18n();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <AppText variant="subheading" style={{ width: 52 }}>
        {formatTime(event.datetime, locale)}
      </AppText>
      <View style={{ flex: 1, gap: space.xs }}>
        <AppText>{event.title}</AppText>
        <AppText variant="small" tone="muted">
          {event.country}
        </AppText>
      </View>
      <View style={{ alignItems: 'flex-end', gap: space.xs }}>
        <Badge label={event.currency} tone="primary" />
        <Badge label={t(`event.impact.${event.impact}`)} tone={IMPACT_TONE[event.impact]} />
      </View>
    </View>
  );
}

interface EventListProps {
  /** Já filtrados e ordenados por data. */
  events: CalendarEvent[];
  emptyText: string;
}

/** Eventos do calendário económico agrupados por dia. */
export function EventList({ events, emptyText }: EventListProps) {
  const { locale } = useI18n();
  if (events.length === 0) {
    return (
      <Card>
        <AppText tone="muted">{emptyText}</AppText>
      </Card>
    );
  }

  const groups: { key: string; label: string; events: CalendarEvent[] }[] = [];
  for (const event of events) {
    const key = dayKey(event.datetime);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.events.push(event);
    } else {
      groups.push({ key, label: capitalize(formatDay(event.datetime, locale)), events: [event] });
    }
  }

  return (
    <View style={{ gap: space.lg }}>
      {groups.map((group) => (
        <View key={group.key} style={{ gap: space.sm }}>
          <AppText variant="label" tone="muted">
            {group.label.toUpperCase()}
          </AppText>
          <Card style={{ gap: space.lg }}>
            {group.events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
}
