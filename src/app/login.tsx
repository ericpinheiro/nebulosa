import { LinearGradient } from 'expo-linear-gradient';
import { type ComponentRef, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSessionStore } from '@/state/session';
import { colors, spacing, type } from '@/ui/theme';

export default function LoginScreen() {
  const signIn = useSessionStore((s) => s.signIn);
  const submitting = useSessionStore((s) => s.submitting);
  const error = useSessionStore((s) => s.error);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const submit = () => {
    if (submitting) return;
    void signIn(username, password);
  };

  return (
    <LinearGradient colors={[colors.backgroundTop, colors.backgroundBottom]} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Text style={styles.brand}>NEBULOSA</Text>
          <Text style={styles.subtitle}>brunoflix</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Usuário"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              value={username}
              onChangeText={setUsername}
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!submitting}
            />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submit}
              editable={!submitting}
            />
            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
              onPress={submit}
              disabled={submitting}
              accessibilityRole="button"
            >
              {submitting ? (
                <ActivityIndicator color={colors.textOnLight} />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl },
  brand: { ...type.brand, color: colors.text, textAlign: 'center' },
  subtitle: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: 2,
  },
  form: { marginTop: spacing.xxl * 2, gap: spacing.md },
  input: {
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.xs,
  },
  error: {
    color: '#fff',
    backgroundColor: 'rgba(192,57,43,0.55)',
    padding: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    marginTop: spacing.lg,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.textOnLight, fontSize: 16, fontWeight: '600' },
});
