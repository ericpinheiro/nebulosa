import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFooter, type BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlayerStore } from '@/state/player';
import { Cover } from '@/ui/components/Cover';
import { colors } from '@/ui/theme';

/** Mini player flutuante fixo no rodapé do painel. */
export function MiniPlayerFooter(props: BottomSheetFooterProps & { extra?: React.ReactNode }) {
  const current = usePlayerStore((s) => s.current);
  const status = usePlayerStore((s) => s.status);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const insets = useSafeAreaInsets();
  if (!current) return null;
  const playing = status === 'playing' || status === 'loading';
  return (
    <BottomSheetFooter {...props} bottomInset={insets.bottom}>
      <View style={styles.card}>
        <Cover itemId={current.imageItemId} tag={current.imageTag} size={40} radius={6} />
        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={1}>
            {current.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {current.artist}
          </Text>
        </View>
        {props.extra}
        <Pressable hitSlop={8} onPress={() => void toggle()} accessibilityLabel={playing ? 'Pausar' : 'Tocar'}>
          <Ionicons name={playing ? 'pause' : 'play'} size={26} color={colors.panelText} />
        </Pressable>
        <Pressable hitSlop={8} onPress={() => void next()} accessibilityLabel="Próxima">
          <Ionicons name="play-skip-forward" size={22} color={colors.panelText} />
        </Pressable>
      </View>
    </BottomSheetFooter>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    paddingRight: 16,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  texts: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: colors.panelText },
  artist: { fontSize: 12, color: colors.panelMuted, marginTop: 1 },
});
