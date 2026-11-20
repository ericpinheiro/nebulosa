import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/state/query';
import { useSessionStore } from '@/state/session';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const status = useSessionStore((s) => s.status);
  const restore = useSessionStore((s) => s.restore);

  useEffect(() => {
    void restore();
  }, [restore]);

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
  }, [status]);

  if (status === 'loading') return null;

  const signedIn = status === 'signedIn';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Protected guard={signedIn}>
              <Stack.Screen name="(main)" />
            </Stack.Protected>
            <Stack.Protected guard={!signedIn}>
              <Stack.Screen name="login" />
            </Stack.Protected>
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
