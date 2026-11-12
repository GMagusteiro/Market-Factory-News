import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { SampleBanner } from '@/components/SampleBanner';
import { TopNav } from '@/components/TopNav';
import { syncFromSupabase } from '@/data/remote';
import { useTheme } from '@/design/useTheme';
import { WatchlistProvider } from '@/state/watchlist';

export default function RootLayout() {
  const { colors } = useTheme();

  useEffect(() => {
    void syncFromSupabase();
  }, []);

  return (
    <WatchlistProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <SampleBanner />
        <TopNav />
        <Slot />
      </View>
      <StatusBar style="auto" />
    </WatchlistProvider>
  );
}
