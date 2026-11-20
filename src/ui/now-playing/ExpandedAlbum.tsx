import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { PlayerTrack } from '@/services/player/types';
import { usePlayerStore } from '@/state/player';
import { toPlayerTrack } from '@/state/player-track';
import { Cover } from '@/ui/components/Cover';
import { formatDuration } from '@/ui/color';
import { useAlbumTracks } from '@/ui/hooks/useLibrary';

const SMALL = 48;

/**
 * Capa expandida: cresce a partir da capa pequena do topo e ocupa o lugar da galáxia,
 * com as faixas do álbum abaixo. Toque na capa ou arraste para baixo para fechar.
 */
export function ExpandedAlbum({ track, color, onClose }: { track: PlayerTrack; color: string; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 64, 360);
  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);
  const { data: tracks = [] } = useAlbumTracks(track.albumId);
  const playList = usePlayerStore((s) => s.playList);

  useEffect(() => {
    progress.value = withSpring(1, { damping: 18, stiffness: 160 });
  }, [progress]);

  const close = () => {
    progress.value = withTiming(0, { duration: 220 }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };

  const coverStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const s = interpolate(p, [0, 1], [SMALL / size, 1]);
    return {
      transformOrigin: 'top left',
      transform: [
        { translateX: interpolate(p, [0, 1], [-(width - size) / 2 + 20, 0]) },
        { translateY: interpolate(p, [0, 1], [-SMALL - 24, 0]) + dragY.value },
        { scale: s * interpolate(dragY.value, [0, 300], [1, 0.85], 'clamp') },
      ],
      borderRadius: 6 / s,
    };
  });

  const listStyle = useAnimatedStyle(() => ({
    opacity:
      interpolate(progress.value, [0.4, 1], [0, 1], 'clamp') * interpolate(dragY.value, [0, 200], [1, 0], 'clamp'),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [40, 0]) + dragY.value }],
  }));

  const pan = Gesture.Pan()
    .activeOffsetY(12)
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 90 || e.velocityY > 800) {
        dragY.value = withTiming(0, { duration: 220 });
        runOnJS(close)();
      } else {
        dragY.value = withSpring(0);
      }
    });

  const tap = Gesture.Tap().onEnd((_e, ok) => {
    if (ok) runOnJS(close)();
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <Animated.View style={[styles.cover, { width: size, height: size }, coverStyle]}>
          <Cover itemId={track.imageItemId} tag={track.imageTag} size={size} radius={10} requestWidth={800} />
        </Animated.View>
      </GestureDetector>
      <Animated.View style={[styles.list, listStyle]}>
        <Text style={[styles.album, { color }]} numberOfLines={1}>
          {track.album}
        </Text>
        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item, index }) => {
            const active = item.id === track.id;
            return (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
                onPress={() => void playList(tracks.map(toPlayerTrack), index, { kind: 'album', id: track.albumId! })}
              >
                <Text style={[styles.num, { color }]}>{item.trackNumber ?? index + 1}</Text>
                <Text style={[styles.name, { color, fontWeight: active ? '700' : '400' }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.dur, { color }]}>{formatDuration(item.durationMs)}</Text>
              </Pressable>
            );
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 8 },
  cover: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  list: { flex: 1, alignSelf: 'stretch', paddingHorizontal: 24, marginTop: 16 },
  album: { fontSize: 13, opacity: 0.7, marginBottom: 6, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  num: { width: 22, fontSize: 13, opacity: 0.6, textAlign: 'right', fontVariant: ['tabular-nums'] },
  name: { flex: 1, fontSize: 15 },
  dur: { fontSize: 12, opacity: 0.6, fontVariant: ['tabular-nums'] },
});
