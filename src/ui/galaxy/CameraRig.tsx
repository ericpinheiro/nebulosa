import { useFrame, useThree } from '@react-three/fiber/native';
import { useEffect } from 'react';
import type * as THREE from 'three';

import { cameraPosition, step, type Orbit } from './orbit';

/** Aplica a órbita à câmera a cada quadro e reporta se está "ativa" (para o fps). */
export function CameraRig({
  orbit,
  activeRef,
  onFrame,
}: {
  orbit: Orbit;
  activeRef: React.RefObject<boolean>;
  onFrame?: (camera: THREE.PerspectiveCamera, size: { width: number; height: number }) => void;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    camera.near = 0.05;
    camera.far = 200;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    // Centro óptico no meio da área livre (entre cabeçalho e controles), não no meio da tela.
    const shift = orbit.viewShiftPx;
    const v = camera.view;
    if (size.width > 0 && (!v || v.offsetY !== -shift || v.fullWidth !== size.width || v.fullHeight !== size.height)) {
      camera.setViewOffset(size.width, size.height, 0, -shift, size.width, size.height);
      camera.updateProjectionMatrix();
    }
    activeRef.current = step(orbit, dt);
    const [x, y, z] = cameraPosition(orbit);
    camera.position.set(x, y, z);
    camera.lookAt(orbit.target[0], orbit.target[1], orbit.target[2]);
    camera.updateMatrixWorld();
    onFrame?.(camera, size);
  });

  return null;
}
