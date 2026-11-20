import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { getEngine } from '@/services/player';
import { startForegroundRefresh } from '@/state/favorites';
import { syncLibrary } from '@/state/library/sync';
import { startPlaybackReporter } from '@/state/reporter';
import { startScrobbler } from '@/state/scrobble';

export default function MainLayout() {
  useEffect(() => {
    void getEngine()
      .setup()
      .catch(() => undefined);
    const stopReporter = startPlaybackReporter();
    const stopScrobbler = startScrobbler();
    const stopRefresh = startForegroundRefresh();
    void syncLibrary().catch(() => undefined);
    return () => {
      stopReporter();
      stopScrobbler();
      stopRefresh();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="lastfm" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
