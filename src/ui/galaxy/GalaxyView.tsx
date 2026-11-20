import { Canvas } from '@react-three/fiber/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type * as THREE from 'three';

import { tuning } from '@/config/tuning';
import { useGalaxyStore } from '@/galaxy/store';
import { usePlayerStore } from '@/state/player';

import { CameraRig } from './CameraRig';
import { CurrentHighlight } from './CurrentHighlight';
import { SESSION_EPOCH } from './epoch';
import { FrameDriver } from './FrameDriver';
import { GalaxyPoints, type PointsDynamics } from './GalaxyPoints';
import {
  beginInteraction,
  CAMERA_FOV,
  configureFit,
  createOrbit,
  drag,
  endInteraction,
  fitFactor,
  focusOn,
  isCloseZoom,
  pan,
  pinch,
  type Orbit,
  type ViewInsets,
} from './orbit';

export interface GalaxyViewProps {
  style?: ViewStyle;
  /** Id do Jellyfin da música tocando. */
  currentId: string | null;
  /** Rastro: segundos desde `epoch` por ponto. */
  played?: Float32Array | null;
  epoch?: number;
  /** Energia atual 0..1 (pulsação), lida a cada quadro. */
  getBeat?: () => number;
  /** Chamado a cada quadro com a câmera (capas no zoom). */
  onFrame?: (camera: THREE.PerspectiveCamera, size: { width: number; height: number }, orbit: Orbit) => void;
  /** Toque simples na galáxia, em coordenadas locais (capas são achadas pela posição). */
  onTap?: (x: number, y: number) => void;
  /** Avisado quando o usuário começa/termina de mexer na galáxia. */
  onInteraction?: (active: boolean) => void;
  /** Altura (px) coberta pela interface em cima e embaixo: a galáxia é enquadrada no espaço entre elas. */
  viewInsets?: ViewInsets;
  /** Elementos sobrepostos (capas). */
  children?: React.ReactNode;
}

const NO_INSETS: ViewInsets = { top: 0, bottom: 0 };

export function GalaxyView({
  style,
  currentId,
  played,
  epoch = SESSION_EPOCH,
  getBeat,
  onFrame,
  onTap,
  onInteraction,
  viewInsets = NO_INSETS,
  children,
}: GalaxyViewProps) {
  const data = useGalaxyStore((s) => s.data);
  const load = useGalaxyStore((s) => s.load);
  const bounds = useGalaxyStore((s) => s.bounds);
  const orbit = useRef<Orbit>(createOrbit()).current;
  const activeRef = useRef(false);
  const dynamics = useRef<PointsDynamics>({ currentIndex: -1, beat: 0, pulseEnabled: 1, playing: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const height = Math.max(size.height, 1);

  useEffect(() => {
    void load();
  }, [load]);

  const currentIndex = currentId && data ? (data.indexById.get(currentId) ?? -1) : -1;
  dynamics.current.currentIndex = currentIndex;

  // Enquadramento: galáxia inteira na área livre entre cabeçalho e controles.
  useEffect(() => {
    if (!bounds || size.width <= 0 || size.height <= 0) return;
    const R = tuning.galaxy.worldRadius;
    const center: [number, number, number] = [bounds.center[0] * R, bounds.center[1] * R, bounds.center[2] * R];
    const k = fitFactor(size, viewInsets, CAMERA_FOV);
    configureFit(orbit, center, bounds.radius * R, k, (viewInsets.top - viewInsets.bottom) / 2);
  }, [bounds, size, viewInsets, orbit]);

  // Centro da órbita na música tocando (troca escolhida ou automática).
  useEffect(() => {
    if (!data || currentIndex < 0) return;
    const R = tuning.galaxy.worldRadius;
    const p = data.positions;
    focusOn(orbit, [p[currentIndex * 3] * R, p[currentIndex * 3 + 1] * R, p[currentIndex * 3 + 2] * R]);
  }, [data, currentIndex, orbit]);

  // Diagnóstico do destaque: a música tocando foi achada na galáxia?
  const source = useGalaxyStore((s) => s.source);
  useEffect(() => {
    if (__DEV__ && currentId) {
      console.log(`[galaxy] atual=${currentId} índice=${currentIndex} fonte=${source} pontos=${data?.ids.length ?? 0}`);
    }
  }, [currentId, currentIndex, source, data]);

  const isActive = useCallback(() => activeRef.current || orbit.interacting, [orbit]);

  const handleFrame = useCallback(
    (camera: THREE.PerspectiveCamera, size: { width: number; height: number }) => {
      const close = isCloseZoom(orbit);
      dynamics.current.pulseEnabled = close ? 0 : 1;
      dynamics.current.beat = getBeat ? getBeat() : 0;
      dynamics.current.playing = usePlayerStore.getState().status === 'playing' ? 1 : 0;
      onFrame?.(camera, size, orbit);
    },
    [getBeat, onFrame, orbit],
  );

  const gesture = useMemo(() => {
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let lastScale = 1;
    let lastPanX = 0;
    let lastPanY = 0;

    const rotate = Gesture.Pan()
      .runOnJS(true)
      .maxPointers(1)
      .onStart((e) => {
        beginInteraction(orbit);
        onInteraction?.(true);
        lastX = e.translationX;
        lastY = e.translationY;
        lastT = Date.now();
      })
      .onUpdate((e) => {
        const now = Date.now();
        drag(orbit, e.translationX - lastX, e.translationY - lastY, now - lastT);
        lastX = e.translationX;
        lastY = e.translationY;
        lastT = now;
        orbit.lastInteraction = now;
      })
      .onFinalize(() => {
        endInteraction(orbit);
        onInteraction?.(false);
      });

    const zoom = Gesture.Pinch()
      .runOnJS(true)
      .onStart(() => {
        beginInteraction(orbit);
        onInteraction?.(true);
        lastScale = 1;
      })
      .onUpdate((e) => {
        pinch(orbit, e.scale / lastScale);
        lastScale = e.scale;
        orbit.lastInteraction = Date.now();
      })
      .onFinalize(() => {
        endInteraction(orbit);
        onInteraction?.(false);
      });

    const move = Gesture.Pan()
      .runOnJS(true)
      .minPointers(2)
      .onStart((e) => {
        beginInteraction(orbit);
        lastPanX = e.translationX;
        lastPanY = e.translationY;
      })
      .onUpdate((e) => {
        pan(orbit, e.translationX - lastPanX, e.translationY - lastPanY, height);
        lastPanX = e.translationX;
        lastPanY = e.translationY;
        orbit.lastInteraction = Date.now();
      })
      .onFinalize(() => endInteraction(orbit));

    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDuration(250)
      .onEnd((e, success) => {
        if (success) onTap?.(e.x, e.y);
      });

    return Gesture.Race(Gesture.Simultaneous(zoom, move), rotate, tap);
  }, [orbit, height, onInteraction, onTap]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setSize((s) => (s.width === width && s.height === h ? s : { width, height: h }));
  };

  return (
    <View style={[styles.fill, style]} onLayout={onLayout}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Canvas
          frameloop="demand"
          camera={{ fov: CAMERA_FOV, position: [0, 0, orbit.distance] }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={styles.fill}
        >
          <CameraRig orbit={orbit} activeRef={activeRef} onFrame={handleFrame} />
          {data ? <GalaxyPoints data={data} played={played} epoch={epoch} dynamics={dynamics} /> : null}
          {data ? <CurrentHighlight data={data} dynamics={dynamics} /> : null}
          <FrameDriver isActive={isActive} />
        </Canvas>
      </View>
      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFill} collapsable={false} />
      </GestureDetector>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
