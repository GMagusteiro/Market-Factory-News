import { View } from 'react-native';
import type { ReactNode } from 'react';

import { space } from '@/design/tokens';

import { AppText } from './AppText';

interface SectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, subtitle, action, children }: SectionProps) {
  return (
    <View style={{ gap: space.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: space.md,
        }}>
        <View style={{ flexShrink: 1, gap: space.xs }}>
          <AppText variant="heading" accessibilityRole="header">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="small" tone="muted">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}
