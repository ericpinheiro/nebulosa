import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { estimatePosition, usePlayerStore } from '@/state/player';
import { formatDuration } from '@/ui/color';

/** Barra fina e sutil; arrastar ou tocar faz seek. Mostra os tempos só durante o arrasto. */
export function ProgressBar({ color = '#ffffff' }: { color?: string }) {
  const duration = usePlayerStore((s) => s.duration);
  const seek = usePlayerStore((s) => s.seek);
  const [width, setWidth] = useState(1);
  const [scrub, setScrub] = useState<number | null>(null);
  const [now, setNow] = useState(() => estimatePosition(usePlayerStore.getState()));

  // Atualiza 4x por segundo para a barra andar suave sem depender do ticker do player.
  useEffect(() => {
    const id = setInterval(() => setNow(estimatePosition(usePlayerStore.getState())), 250);
    return () => clearInterval(id);
  }, []);

  const position = scrub ?? now;
  const fraction = duration > 0 ? Math.max(0, Math.min(1, position / duration)) : 0;

  const toSeconds = (x: number) => Math.max(0, Math.min(1, x / width)) * duration;

  const gesture = Gesture.Race(
    Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-4, 4])
      .onStart((e) => setScrub(toSeconds(e.x)))
      .onUpdate((e) => setScrub(toSeconds(e.x)))
      .onEnd((e) => void seek(toSeconds(e.x)))
      .onFinalize(() => setScrub(null)),
    Gesture.Tap()
      .runOnJS(true)
      .onEnd((e, ok) => {
        if (ok) void seek(toSeconds(e.x));
      }),
  );

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.max(1, e.nativeEvent.layout.width));

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <View style={styles.hit} onLayout={onLayout} accessibilityRole="adjustable" accessibilityLabel="Progresso">
          <View style={[styles.track, { backgroundColor: color, opacity: 0.25 }]} />
          <View
            style={[
              styles.fill,
              { backgroundColor: color, width: `${fraction * 100}%`, height: scrub != null ? 4 : 2 },
            ]}
          />
        </View>
      </GestureDetector>
      <View style={[styles.times, { opacity: scrub != null ? 1 : 0 }]}>
        <Text style={[styles.time, { color }]}>{formatDuration(position * 1000)}</Text>
        <Text style={[styles.time, { color }]}>{formatDuration(duration * 1000)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { height: 24, justifyContent: 'center' },
  track: { position: 'absolute', left: 0, right: 0, height: 2, borderRadius: 1 },
  fill: { position: 'absolute', left: 0, borderRadius: 2 },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  time: { fontSize: 11, fontVariant: ['tabular-nums'] },
});
