import type { PlayerTrack } from '@/services/player/types';

import type { TrackRow } from './library/types';

export function toPlayerTrack(t: TrackRow): PlayerTrack {
  const useAlbumImage = !t.imageTag && !!t.albumId;
  return {
    id: t.id,
    title: t.name,
    artist: t.artist,
    album: t.album,
    albumId: t.albumId,
    durationMs: t.durationMs,
    imageItemId: useAlbumImage ? t.albumId : t.id,
    imageTag: useAlbumImage ? t.albumImageTag : t.imageTag,
  };
}
