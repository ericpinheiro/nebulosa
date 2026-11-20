import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { AlbumRow, ArtistRow, PlaylistRow, TrackRow } from '@/state/library/types';
import { Cover } from '@/ui/components/Cover';
import { formatDuration } from '@/ui/color';
import { colors } from '@/ui/theme';

export function TrackItem({
  track,
  onPress,
  active,
  showCover = true,
  trailing,
}: {
  track: TrackRow;
  onPress: () => void;
  active?: boolean;
  showCover?: boolean;
  trailing?: React.ReactNode;
}) {
  const sub = [track.artist, track.album].filter(Boolean).join(' · ');
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      {showCover ? (
        <Cover
          itemId={track.imageTag ? track.id : track.albumId}
          tag={track.imageTag ?? track.albumImageTag}
          size={44}
          radius={8}
        />
      ) : (
        <Text style={styles.num}>{track.trackNumber ?? ''}</Text>
      )}
      <View style={styles.texts}>
        <Text style={[styles.title, active && styles.active]} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{formatDuration(track.durationMs)}</Text>
        {track.year ? <Text style={styles.metaText}>{track.year}</Text> : null}
      </View>
      {trailing}
    </Pressable>
  );
}

export function AlbumTile({ album, onPress }: { album: AlbumRow; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const size = (width - 16 * 2 - 12 * 2) / 3;
  return (
    <Pressable style={({ pressed }) => [{ width: size }, styles.tile, pressed && styles.pressed]} onPress={onPress}>
      <Cover itemId={album.id} tag={album.imageTag} size={size} radius={10} />
      <Text style={styles.tileTitle} numberOfLines={1}>
        {album.name}
      </Text>
      <Text style={styles.tileSub} numberOfLines={1}>
        {album.albumArtist}
      </Text>
    </Pressable>
  );
}

export function ArtistItem({ artist, onPress }: { artist: ArtistRow; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      <Cover itemId={artist.imageTag ? artist.id : null} tag={artist.imageTag} size={44} radius={22} />
      <Text style={[styles.title, styles.texts]} numberOfLines={1}>
        {artist.name}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.panelMuted} />
    </Pressable>
  );
}

export function PlaylistItem({ playlist, onPress }: { playlist: PlaylistRow; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      <Cover itemId={playlist.imageTag ? playlist.id : null} tag={playlist.imageTag} size={44} radius={8} />
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {playlist.name}
        </Text>
        <Text style={styles.sub}>{playlist.childCount} músicas</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.panelMuted} />
    </Pressable>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Empty({ children }: { children: string }) {
  return <Text style={styles.empty}>{children}</Text>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 16 },
  pressed: { opacity: 0.55 },
  texts: { flex: 1 },
  title: { fontSize: 15, color: colors.panelText, fontWeight: '500' },
  active: { fontWeight: '700' },
  sub: { fontSize: 12, color: colors.panelMuted, marginTop: 2 },
  meta: { alignItems: 'flex-end' },
  metaText: { fontSize: 11, color: colors.panelMuted, fontVariant: ['tabular-nums'] },
  num: { width: 44, textAlign: 'center', color: colors.panelMuted, fontVariant: ['tabular-nums'] },
  tile: { marginBottom: 16 },
  tileTitle: { fontSize: 13, color: colors.panelText, fontWeight: '600', marginTop: 6 },
  tileSub: { fontSize: 12, color: colors.panelMuted, marginTop: 1 },
  section: {
    fontSize: 12,
    color: colors.panelMuted,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  empty: { textAlign: 'center', color: colors.panelMuted, padding: 32 },
});
