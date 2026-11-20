import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  BounceIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import * as THREE from 'three';

import { tuning } from '@/config/tuning';
import { useGalaxyStore } from '@/galaxy/store';
import { getCoverLookup, type CoverInfo } from '@/state/library/repository';
import { useLibraryStore } from '@/state/library/sync';
import { Cover } from '@/ui/components/Cover';

import { isCloseZoom, type Orbit } from './orbit';

const g = tuning.galaxy;
const MAX = g.maxCovers;
/** x, y, escala, visível, zIndex por slot. */
const STRIDE = 5;
const BASE = 64;
const SELECT_INTERVAL_MS = 160;

type FrameHandler = (camera: THREE.PerspectiveCamera, size: { width: number; height: number }, orbit: Orbit) => void;

function useCoverLookup() {
  const v = useLibraryStore((s) => s.version);
  return useQuery({ queryKey: ['coverLookup', v], queryFn: getCoverLookup, staleTime: Infinity }).data;
}

function CoverSprite({
  slot,
  frame,
  info,
  selected,
  onPress,
}: {
  slot: number;
  frame: SharedValue<number[]>;
  info: CoverInfo;
  selected: boolean;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const o = slot * STRIDE;
    const f = frame.value;
    return {
      opacity: f[o + 3],
      zIndex: f[o + 4],
      transform: [{ translateX: f[o] - BASE / 2 }, { translateY: f[o + 1] - BASE / 2 }, { scale: f[o + 2] }],
    };
  });
  const selectStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? g.coverSelectedScale : 1, { damping: 12, stiffness: 220 }) }],
  }));
  return (
    <Animated.View style={[styles.sprite, style]}>
      <Animated.View entering={BounceIn.duration(500)} exiting={FadeOut.duration(150)} style={selectStyle}>
        <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={info.title}>
          <Cover itemId={info.imageItemId} tag={info.imageTag} size={BASE} radius={6} requestWidth={g.coverThumbSize} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Capas no zoom próximo: escolhe até `maxCovers` pontos visíveis mais próximos da câmera
 * (índice espacial + projeção) e posiciona miniaturas sobre eles a cada quadro.
 * 1º toque aumenta a capa; 2º toque chama `onPlay`.
 */
export function useGalaxyCovers(onPlay: (id: string) => void): {
  onFrame: FrameHandler;
  element: React.ReactNode;
  clearSelection: () => void;
} {
  const lookup = useCoverLookup();
  const frame = useSharedValue<number[]>(new Array(MAX * STRIDE).fill(0));
  const [slots, setSlots] = useState<(number | null)[]>(() => new Array(MAX).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const slotsRef = useRef(slots);
  const lastSelect = useRef(0);
  const v = useMemo(() => new THREE.Vector3(), []);
  const camSpace = useMemo(() => new THREE.Vector3(), []);

  const updateSlots = (next: (number | null)[]) => {
    slotsRef.current = next;
    setSlots(next);
  };

  const onFrame = useCallback<FrameHandler>(
    (camera, size, orbit) => {
      const { data, index } = useGalaxyStore.getState();
      if (!data || !index || !lookup) return;
      const current = slotsRef.current;

      if (!isCloseZoom(orbit)) {
        if (current.some((s) => s != null)) {
          updateSlots(new Array(MAX).fill(null));
          setSelected(null);
        }
        return;
      }

      const R = g.worldRadius;
      const project = (i: number) => {
        v.set(data.positions[i * 3] * R, data.positions[i * 3 + 1] * R, data.positions[i * 3 + 2] * R);
        camSpace.copy(v).applyMatrix4(camera.matrixWorldInverse);
        const depth = -camSpace.z;
        v.project(camera);
        return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height, depth };
      };
      const onScreen = (p: { x: number; y: number; depth: number }) =>
        p.depth > camera.near && p.x > -BASE && p.x < size.width + BASE && p.y > -BASE && p.y < size.height + BASE;

      // Seleção dos pontos (~6 Hz).
      const now = Date.now();
      if (now - lastSelect.current > SELECT_INTERVAL_MS) {
        lastSelect.current = now;
        const c = camera.position;
        const near = index.withinRadius(c.x / R, c.y / R, c.z / R, (g.coverZoomDistance * 1.3) / R);
        const chosen: number[] = [];
        for (const i of near) {
          const id = data.ids[i];
          if (!id || !lookup.has(id)) continue;
          if (!onScreen(project(i))) continue;
          chosen.push(i);
          if (chosen.length >= MAX) break;
        }
        const wanted = new Set(chosen);
        const next = current.map((s) => (s != null && wanted.has(s) ? s : null));
        const kept = new Set(next.filter((s): s is number => s != null));
        let free = 0;
        for (const i of chosen) {
          if (kept.has(i)) continue;
          while (free < MAX && next[free] != null) free++;
          if (free >= MAX) break;
          next[free] = i;
        }
        if (next.some((s, k) => s !== current[k])) updateSlots(next);
      }

      // Posição de cada capa neste quadro.
      const out = new Array(MAX * STRIDE).fill(0);
      const focal = size.height / (2 * Math.tan(((camera.fov / 2) * Math.PI) / 180));
      slotsRef.current.forEach((i, k) => {
        if (i == null) return;
        const p = project(i);
        if (!onScreen(p)) return;
        const px = Math.max(22, Math.min(110, (g.coverWorldSize * focal) / p.depth));
        const o = k * STRIDE;
        out[o] = p.x;
        out[o + 1] = p.y;
        out[o + 2] = px / BASE;
        out[o + 3] = 1;
        out[o + 4] = Math.round(10000 - p.depth * 100);
      });
      frame.value = out;
    },
    [lookup, frame, v, camSpace],
  );

  const data = useGalaxyStore((s) => s.data);
  const element = (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {slots.map((i, k) => {
        const id = i != null ? data?.ids[i] : null;
        const info = id ? lookup?.get(id) : undefined;
        if (i == null || !id || !info) return null;
        return (
          <CoverSprite
            key={`${k}:${i}`}
            slot={k}
            frame={frame}
            info={info}
            selected={selected === i}
            onPress={() => {
              if (selected === i) {
                setSelected(null);
                onPlay(id);
              } else {
                setSelected(i);
              }
            }}
          />
        );
      })}
    </View>
  );

  return { onFrame, element, clearSelection: () => setSelected(null) };
}

const styles = StyleSheet.create({
  sprite: { position: 'absolute', left: 0, top: 0, width: BASE, height: BASE },
});
