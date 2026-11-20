import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';

import { TICKS_PER_SECOND } from '@/config/server';

import { sortKey } from './normalize';
import type { AlbumRow, ArtistRow, PlaylistRow, TrackRow } from './types';

const toMs = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
};

export const ticksToMs = (ticks: number | null | undefined): number =>
  ticks ? Math.round((ticks / TICKS_PER_SECOND) * 1000) : 0;

export const msToTicks = (ms: number): number => Math.round((ms / 1000) * TICKS_PER_SECOND);

export function mapTrack(item: BaseItemDto, now = Date.now()): TrackRow {
  const artist = item.Artists?.filter(Boolean).join(', ') || item.AlbumArtist || 'Artista desconhecido';
  const isFavorite = item.UserData?.IsFavorite === true;
  return {
    id: item.Id!,
    name: item.Name ?? 'Sem título',
    sortName: sortKey(item.SortName ?? item.Name),
    albumId: item.AlbumId ?? null,
    album: item.Album ?? null,
    artist,
    albumArtist: item.AlbumArtist ?? null,
    artistIds: [...(item.ArtistItems ?? []).map((a) => a.Id), ...(item.AlbumArtists ?? []).map((a) => a.Id)].filter(
      (id, i, arr): id is string => !!id && arr.indexOf(id) === i,
    ),
    durationMs: ticksToMs(item.RunTimeTicks),
    year: item.ProductionYear ?? null,
    genre: item.Genres?.[0] ?? null,
    trackNumber: item.IndexNumber ?? null,
    discNumber: item.ParentIndexNumber ?? null,
    imageTag: item.ImageTags?.Primary ?? null,
    albumImageTag: item.AlbumPrimaryImageTag ?? null,
    isFavorite,
    favoritedAt: isFavorite ? now : null,
    lastPlayedAt: toMs(item.UserData?.LastPlayedDate),
    dateCreated: toMs(item.DateCreated),
  };
}

export function mapAlbum(item: BaseItemDto): AlbumRow {
  return {
    id: item.Id!,
    name: item.Name ?? 'Sem título',
    sortName: sortKey(item.SortName ?? item.Name),
    albumArtist: item.AlbumArtist ?? item.Artists?.[0] ?? 'Vários artistas',
    artistIds: (item.AlbumArtists ?? []).map((a) => a.Id).filter((x): x is string => !!x),
    year: item.ProductionYear ?? null,
    imageTag: item.ImageTags?.Primary ?? null,
    isFavorite: item.UserData?.IsFavorite === true,
  };
}

export function mapArtist(item: BaseItemDto): ArtistRow {
  return {
    id: item.Id!,
    name: item.Name ?? 'Sem nome',
    sortName: sortKey(item.SortName ?? item.Name),
    imageTag: item.ImageTags?.Primary ?? null,
  };
}

export function mapPlaylist(item: BaseItemDto): PlaylistRow {
  return {
    id: item.Id!,
    name: item.Name ?? 'Sem nome',
    sortName: sortKey(item.SortName ?? item.Name),
    imageTag: item.ImageTags?.Primary ?? null,
    childCount: item.ChildCount ?? 0,
  };
}
