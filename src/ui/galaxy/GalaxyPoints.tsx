import { useFrame } from '@react-three/fiber/native';
import { useEffect, useMemo, useRef } from 'react';
import { PixelRatio } from 'react-native';
import * as THREE from 'three';

import { tuning } from '@/config/tuning';
import type { GalaxyData } from '@/galaxy/contract';
import { mulberry32 } from '@/galaxy/generator';
import { NO_TRAIL } from '@/galaxy/trail';

import { pointsFragmentShader, pointsVertexShader } from './shaders';

const g = tuning.galaxy;

export interface PointsDynamics {
  /** Índice do ponto tocando (-1 = nenhum). */
  currentIndex: number;
  /** Energia atual 0..1 da música (pulsação). */
  beat: number;
  /** 0..1: pulsação ligada (zoom afastado) ou desligada (zoom próximo). */
  pulseEnabled: number;
}

interface Props {
  data: GalaxyData;
  /** Segundos desde `epoch` em que cada ponto tocou (NO_TRAIL = sem rastro). */
  played?: Float32Array | null;
  epoch: number;
  dynamics: React.RefObject<PointsDynamics>;
}

export function GalaxyPoints({ data, played, epoch, dynamics }: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const n = data.positions.length / 3;
    const pos = new Float32Array(data.positions.length);
    for (let i = 0; i < pos.length; i++) pos[i] = data.positions[i] * g.worldRadius;
    const seed = new Float32Array(n);
    const rng = mulberry32(n);
    for (let i = 0; i < n; i++) seed[i] = rng();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aPlayed', new THREE.BufferAttribute(new Float32Array(n).fill(NO_TRAIL), 1));
    geo.computeBoundingSphere();
    return geo;
  }, [data]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Rastro: troca o atributo quando a lista de tocadas muda (raro).
  useEffect(() => {
    const attr = geometry.getAttribute('aPlayed') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    if (played && played.length === arr.length) arr.set(played);
    else arr.fill(NO_TRAIL);
    attr.needsUpdate = true;
  }, [geometry, played]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointSize: { value: g.pointSize },
      uPixelRatio: { value: PixelRatio.get() },
      uSizeRef: { value: 20 },
      uColor: { value: new THREE.Color(g.pointColor) },
      uHighlightColor: { value: new THREE.Color(g.highlightColor) },
      uTrailColor: { value: new THREE.Color(g.trailColor) },
      uTrailSeconds: { value: g.trailHours * 3600 },
      uCurrent: { value: new THREE.Vector3(9999, 9999, 9999) },
      uHasCurrent: { value: 0 },
      uHighlightScale: { value: g.highlightScale },
      uHighlightPulse: { value: new THREE.Vector2(g.highlightPulseAmplitude, g.highlightPulseHz) },
      uBeat: { value: 0 },
      uBeatAmp: { value: g.beatAmplitude * g.worldRadius },
      uBeatRadius: { value: g.beatRadius },
      uPulseEnabled: { value: 1 },
      uFade: { value: 1 },
    }),
    [],
  );

  useFrame(() => {
    const u = uniforms;
    const dyn = dynamics.current;
    u.uTime.value = (Date.now() - epoch) / 1000;
    const idx = dyn?.currentIndex ?? -1;
    if (idx >= 0 && idx * 3 < data.positions.length) {
      u.uCurrent.value.set(
        data.positions[idx * 3] * g.worldRadius,
        data.positions[idx * 3 + 1] * g.worldRadius,
        data.positions[idx * 3 + 2] * g.worldRadius,
      );
      u.uHasCurrent.value = 1;
    } else {
      u.uHasCurrent.value = 0;
    }
    u.uBeat.value = dyn?.beat ?? 0;
    // Transição suave da pulsação ao entrar/sair do zoom próximo.
    u.uPulseEnabled.value += ((dyn?.pulseEnabled ?? 1) - u.uPulseEnabled.value) * 0.1;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={pointsVertexShader}
        fragmentShader={pointsFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
