import { useThree } from '@react-three/fiber/native';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { tuning } from '@/config/tuning';

/**
 * Controla o ritmo de desenho (frameloop "demand"):
 * 60 fps quando `isActive()` (gesto, inércia, animação), 30 fps em rotação automática,
 * e nada com o app em segundo plano.
 */
export function FrameDriver({ isActive }: { isActive: () => boolean }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let raf: number | null = null;
    let last = 0;
    let foreground = AppState.currentState === 'active';

    const loop = (t: number) => {
      raf = null;
      if (!foreground) return;
      const fps = isActive() ? tuning.galaxy.fpsActive : tuning.galaxy.fpsIdle;
      if (t - last >= 1000 / fps - 2) {
        last = t;
        invalidate();
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf == null) raf = requestAnimationFrame(loop);
    };
    const sub = AppState.addEventListener('change', (state) => {
      foreground = state === 'active';
      if (foreground) start();
      else if (raf != null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
    start();
    return () => {
      sub.remove();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [invalidate, isActive]);

  return null;
}
