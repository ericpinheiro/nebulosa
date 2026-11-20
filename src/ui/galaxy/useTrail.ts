import { useEffect, useState } from 'react';

import { tuning } from '@/config/tuning';
import { useGalaxyStore } from '@/galaxy/store';
import { buildTrail } from '@/galaxy/trail';
import { getPlayedSince } from '@/state/library/repository';
import { useLibraryStore } from '@/state/library/sync';

/**
 * Rastro das últimas 24 h, vindo do "tocado por último" (Jellyfin + reprodução local).
 * Recalcula quando a biblioteca muda (o reporter marca a faixa ao começar) e a cada 10 min.
 */
export function useTrail(epoch: number): Float32Array | null {
  const data = useGalaxyStore((s) => s.data);
  const version = useLibraryStore((s) => s.version);
  const [tick, setTick] = useState(0);
  const [trail, setTrail] = useState<Float32Array | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10 * 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!data) return;
    let alive = true;
    const windowMs = tuning.galaxy.trailHours * 3600_000;
    const now = Date.now();
    getPlayedSince(now - windowMs)
      .then((played) => {
        if (alive) setTrail(buildTrail(data.ids.length, data.indexById, played, epoch, now, windowMs));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [data, version, tick, epoch]);

  return trail;
}
