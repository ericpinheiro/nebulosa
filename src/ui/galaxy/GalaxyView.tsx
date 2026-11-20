import { Canvas } from '@react-three/fiber/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type * as THREE from 'three';

import { useGalaxyStore } from '@/galaxy/store';

import { CameraRig } from './CameraRig';
import { SESSION_EPOCH } from './epoch';
import { FrameDriver } from './FrameDriver';
import { GalaxyPoints, type PointsDynamics } from './GalaxyPoints';
import { beginInteraction, createOrbit, drag, endInteraction, isCloseZoom, pan, pinch, type Orbit } from './orbit';

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
  /** Toque simples em área vazia (ex.: reexibir a interface). */
  onTap?: () => void;
  /** Avisado quando o usuário começa/termina de mexer na galáxia. */
  onInteraction?: (active: boolean) => void;
  /** Elementos sobrepostos que recebem toque (capas). */
  children?: React.ReactNode;
}

export function GalaxyView({
  style,
  currentId,
  played,
  epoch = SESSION_EPOCH,
  getBeat,
  onFrame,
  onTap,
  onInteraction,
  children,
}: GalaxyViewProps) {
  const data = useGalaxyStore((s) => s.data);
  const load = useGalaxyStore((s) => s.load);
  const orbit = useRef<Orbit>(createOrbit()).current;
  const activeRef = useRef(false);
  const dynamics = useRef<PointsDynamics>({ currentIndex: -1, beat: 0, pulseEnabled: 1 });
  const [height, setHeight] = useState(1);

  useEffect(() => {
    void load();
  }, [load]);

  const currentIndex = currentId && data ? (data.indexById.get(currentId) ?? -1) : -1;
  dynamics.current.currentIndex = currentIndex;

  const isActive = useCallback(() => activeRef.current || orbit.interacting, [orbit]);

  const handleFrame = useCallback(
    (camera: THREE.PerspectiveCamera, size: { width: number; height: number }) => {
      const close = isCloseZoom(orbit);
      dynamics.current.pulseEnabled = close ? 0 : 1;
      dynamics.current.beat = getBeat ? getBeat() : 0;
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
      .onEnd((_e, success) => {
        if (success) onTap?.();
      });

    return Gesture.Race(Gesture.Simultaneous(zoom, move), rotate, tap);
  }, [orbit, height, onInteraction, onTap]);

  const onLayout = (e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height);

  return (
    <View style={[styles.fill, style]} onLayout={onLayout}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Canvas
          frameloop="demand"
          camera={{ fov: 50, position: [0, 0, orbit.distance] }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={styles.fill}
        >
          <CameraRig orbit={orbit} activeRef={activeRef} onFrame={handleFrame} />
          {data ? <GalaxyPoints data={data} played={played} epoch={epoch} dynamics={dynamics} /> : null}
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
