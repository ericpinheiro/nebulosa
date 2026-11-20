import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { usePlayerStore } from '@/state/player';

function IconButton({
  name,
  size,
  onPress,
  label,
  color,
  dim,
  ring,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  onPress: () => void;
  label: string;
  color: string;
  dim?: boolean;
  ring?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        ring && [styles.ring, { borderColor: color }],
        { opacity: pressed ? 0.5 : dim ? 0.45 : 1 },
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

/** Anterior, play/pause, próxima e shuffle. Sem repetir. */
export function Controls({ color = '#ffffff' }: { color?: string }) {
  const status = usePlayerStore((s) => s.status);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const playing = status === 'playing' || status === 'loading';

  return (
    <View style={styles.row}>
      <View style={styles.side} />
      <IconButton name="play-skip-back" size={26} color={color} label="Anterior" onPress={() => void previous()} />
      <IconButton
        name={playing ? 'pause' : 'play'}
        size={30}
        color={color}
        ring
        label={playing ? 'Pausar' : 'Tocar'}
        onPress={() => void toggle()}
      />
      <IconButton name="play-skip-forward" size={26} color={color} label="Próxima" onPress={() => void next()} />
      <View style={styles.side}>
        <IconButton
          name="shuffle"
          size={22}
          color={color}
          dim={!shuffle}
          label={shuffle ? 'Desligar aleatório' : 'Ligar aleatório'}
          onPress={() => void toggleShuffle()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { width: 44, alignItems: 'center' },
  button: { alignItems: 'center', justifyContent: 'center', padding: 6 },
  ring: { width: 64, height: 64, borderRadius: 32, borderWidth: StyleSheet.hairlineWidth * 2 },
});
