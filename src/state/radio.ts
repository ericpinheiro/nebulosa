import { tuning } from '@/config/tuning';
import { radioWalk } from '@/galaxy/radio';
import { useGalaxyStore } from '@/galaxy/store';
import { fetchInstantMix } from '@/services/jellyfin/library';

import { getTracksByIds } from './library/repository';
import { usePlayerStore } from './player';
import { toPlayerTrack } from './player-track';
import { useSessionStore } from './session';

/** Ids da fila do rádio a partir de uma música: vizinhos na galáxia ou Instant Mix. */
export async function radioIds(seedId: string, size: number = tuning.radio.queueSize): Promise<string[]> {
  const { data, index } = useGalaxyStore.getState();
  const start = data?.indexById.get(seedId);
  if (data && index && start != null) {
    const path = radioWalk(data.positions, index, start, size, (i) => data.ids[i] != null);
    return path.map((i) => data.ids[i]!).filter(Boolean);
  }
  const userId = useSessionStore.getState().session?.userId;
  if (!userId) return [seedId];
  const mix = await fetchInstantMix(userId, seedId, size).catch(() => [] as string[]);
  return [seedId, ...mix.filter((id) => id !== seedId)];
}

/**
 * Inicia o rádio. Sem `seedId`, parte da música atual sem interrompê-la;
 * com `seedId`, toca essa música com as vizinhas na fila.
 */
export async function startRadio(seedId?: string): Promise<void> {
  const player = usePlayerStore.getState();
  const seed = seedId ?? player.current?.id;
  if (!seed) return;
  const ids = await radioIds(seed);
  const tracks = (await getTracksByIds(ids)).map(toPlayerTrack);
  if (tracks.length === 0) return;
  if (!seedId && player.current) {
    const rest = tracks.filter((t) => t.id !== player.current!.id);
    await player.replaceQueue([player.current, ...rest], { kind: 'radio', seedId: seed });
  } else {
    await player.playList(tracks, 0, { kind: 'radio', seedId: seed });
  }
}
