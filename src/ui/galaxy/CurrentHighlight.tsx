import { useFrame } from '@react-three/fiber/native';
import { useEffect, useMemo } from 'react';
import { PixelRatio } from 'react-native';
import * as THREE from 'three';

import { tuning } from '@/config/tuning';
import type { GalaxyData } from '@/galaxy/contract';

import type { PointsDynamics } from './GalaxyPoints';
import { highlightFragmentShader, highlightVertexShader } from './shaders';

const g = tuning.galaxy;

/**
 * Destaque da música tocando: um vértice desenhado por cima da nuvem, com núcleo,
 * contorno, halo e anel que pulsa com o som. Tem tamanho mínimo na tela.
 */
export function CurrentHighlight({ data, dynamics }: { data: GalaxyData; dynamics: React.RefObject<PointsDynamics> }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uPixelRatio: { value: PixelRatio.get() },
      uSizeRef: { value: 20 },
      uPointSize: { value: g.pointSize },
      uPointScale: { value: g.highlightPointScale },
      uMinCorePx: { value: g.highlightMinCorePx },
      uBeat: { value: 0 },
      uRingBeat: { value: g.highlightRingBeat },
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uColor: { value: new THREE.Color(g.highlightColor) },
      uOutline: { value: new THREE.Color(g.highlightOutlineColor) },
      uVisible: { value: 0 },
    }),
    [],
  );

  // Material criado aqui: com <shaderMaterial uniforms> o r3f copia os uniforms e `uVisible`,
  // `uBeat` etc. ficariam presos no valor inicial (o destaque nunca aparecia).
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: highlightVertexShader,
        fragmentShader: highlightFragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    [uniforms],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const dyn = dynamics.current;
    const idx = dyn?.currentIndex ?? -1;
    const u = uniforms;
    const valid = idx >= 0 && idx * 3 < data.positions.length;
    // Aparece/some com fade curto.
    u.uVisible.value += ((valid ? 1 : 0) - u.uVisible.value) * 0.15;
    if (!valid) return;
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const x = data.positions[idx * 3] * g.worldRadius;
    const y = data.positions[idx * 3 + 1] * g.worldRadius;
    const z = data.positions[idx * 3 + 2] * g.worldRadius;
    if (arr[0] !== x || arr[1] !== y || arr[2] !== z) {
      arr[0] = x;
      arr[1] = y;
      arr[2] = z;
      attr.needsUpdate = true;
    }
    u.uBeat.value = dyn?.beat ?? 0;
    u.uBreath.value += ((dyn?.playing ?? 0) - u.uBreath.value) * 0.1;
    u.uTime.value = performance.now() / 1000;
  });

  return (
    <points geometry={geometry} material={material} frustumCulled={false} renderOrder={10} />
  );
}
