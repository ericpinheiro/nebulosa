import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Nebulosa',
  slug: 'nebulosa',
  scheme: 'nebulosa',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.rizomalivre.nebulosa',
    appleTeamId: 'C3BPHPRVD3',
    supportsTablet: false,
    infoPlist: {
      // Reprodução em segundo plano + controles na tela de bloqueio.
      UIBackgroundModes: ['audio'],
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.rizomalivre.nebulosa',
    adaptiveIcon: {
      backgroundColor: '#d9d9db',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_MEDIA_PLAYBACK', 'WAKE_LOCK'],
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    'expo-secure-store',
    'expo-sqlite',
    'expo-image',
    'expo-asset',
    'expo-status-bar',
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 160, resizeMode: 'contain', backgroundColor: '#d9d9db' },
    ],
    [
      'expo-build-properties',
      {
        ios: { deploymentTarget: '16.4' },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    // Desligado de propósito: a galáxia e as animações usam refs e mutação imperativa
    // (three.js, shared values do Reanimated), o que o React Compiler não suporta bem.
    reactCompiler: false,
  },
};

export default config;
