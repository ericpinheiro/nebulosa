import { useCallback, useEffect, useRef } from 'react';

import { energyAt, type EnergyEnvelope } from '@/galaxy/energy';
import { loadEnvelope } from '@/galaxy/envelopes';
import { estimatePosition, usePlayerStore } from '@/state/player';

/**
 * Energia atual da música para a pulsação. A posição é interpolada pelo relógio
 * entre as leituras do player, e o valor passa por ataque rápido / decaimento lento.
 */
export function useBeat(): () => number {
  const current = usePlayerStore((s) => s.current);
  const env = useRef<EnergyEnvelope | null>(null);
  const smooth = useRef(0);
  const last = useRef(Date.now());

  useEffect(() => {
    env.current = null;
    if (!current) return;
    let alive = true;
    void loadEnvelope(current.id, current.durationMs / 1000).then((e) => {
      if (alive) env.current = e;
    });
    return () => {
      alive = false;
    };
  }, [current]);

  return useCallback(() => {
    const now = Date.now();
    const dt = Math.min(0.1, (now - last.current) / 1000);
    last.current = now;
    const s = usePlayerStore.getState();
    const target = s.status === 'playing' && env.current ? energyAt(env.current, estimatePosition(s, now)) : 0;
    // Ataque ~40 ms, decaimento ~250 ms.
    const k = target > smooth.current ? 1 - Math.exp(-dt / 0.04) : 1 - Math.exp(-dt / 0.25);
    smooth.current += (target - smooth.current) * k;
    return smooth.current;
  }, []);
}
