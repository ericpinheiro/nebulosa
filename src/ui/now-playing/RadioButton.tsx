import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import { usePlayerStore } from '@/state/player';
import { startRadio } from '@/state/radio';

/** Gera a fila pelo rádio de proximidade a partir da música atual, sem interrompê-la. */
export function RadioButton({ color }: { color: string }) {
  const source = usePlayerStore((s) => s.source);
  const [busy, setBusy] = useState(false);
  const active = source?.kind === 'radio';
  const onPress = async () => {
    setBusy(true);
    try {
      await startRadio();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Pressable
      onPress={() => void onPress()}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Rádio por proximidade"
      style={{ opacity: active ? 1 : 0.7, padding: 4 }}
    >
      {busy ? (
        <ActivityIndicator color={color} />
      ) : (
        <Ionicons name={active ? 'radio' : 'radio-outline'} size={24} color={color} />
      )}
    </Pressable>
  );
}
