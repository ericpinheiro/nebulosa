import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { lastfmEnabled } from '@/services/lastfm/client';
import { pendingScrobbles, useScrobbleStore } from '@/state/scrobble';
import { colors, spacing } from '@/ui/theme';

/** Conectar a conta do Last.fm (só aparece com chave de API configurada). */
export default function LastfmScreen() {
  const { user, error, connect, disconnect } = useScrobbleStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (!lastfmEnabled()) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Scrobble pelo app desligado (sem chave de API do Last.fm).</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.close}>
        <Text style={styles.link}>Fechar</Text>
      </Pressable>
      <Text style={styles.title}>Last.fm</Text>
      {user ? (
        <View style={{ gap: spacing.md }}>
          <Text style={styles.text}>Conectado como {user}.</Text>
          <Text style={styles.muted}>{pendingScrobbles().length} scrobbles aguardando envio.</Text>
          <Pressable style={styles.button} onPress={() => void disconnect()}>
            <Text style={styles.buttonText}>Desconectar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          <TextInput
            style={styles.input}
            placeholder="Usuário do Last.fm"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={styles.button}
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              const ok = await connect(username, password);
              setBusy(false);
              if (ok) setPassword('');
            }}
          >
            {busy ? <ActivityIndicator color={colors.panel} /> : <Text style={styles.buttonText}>Conectar</Text>}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.panel, padding: spacing.xl, gap: spacing.lg },
  close: { alignSelf: 'flex-end' },
  link: { color: colors.panelText, fontSize: 15 },
  title: { fontSize: 24, fontWeight: '700', color: colors.panelText },
  text: { fontSize: 15, color: colors.panelText },
  muted: { fontSize: 13, color: colors.panelMuted },
  input: {
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.panelHairline,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.panelText,
  },
  error: { color: colors.danger },
  button: {
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.panel, fontWeight: '600', fontSize: 15 },
});
