import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PlayerTrack } from '@/services/player/types';
import { Cover } from '@/ui/components/Cover';

/** Capa pequena com título e artista ao lado. Tocar na capa expande. */
export function Header({
  track,
  color,
  onCoverPress,
  coverHidden,
}: {
  track: PlayerTrack;
  color: string;
  onCoverPress: () => void;
  coverHidden?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onCoverPress}
        accessibilityRole="button"
        accessibilityLabel="Abrir álbum"
        style={{ opacity: coverHidden ? 0 : 1 }}
      >
        <Cover itemId={track.imageItemId} tag={track.imageTag} size={48} radius={6} />
      </Pressable>
      <View style={styles.texts}>
        <Text style={[styles.title, { color }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={[styles.artist, { color }]} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  texts: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  artist: { fontSize: 13, opacity: 0.75, marginTop: 2 },
});
