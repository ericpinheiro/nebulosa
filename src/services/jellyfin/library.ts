import { getArtistApi, getInstantMixApi, getLibraryApi, getPlaylistApi } from '@jellyfin/sdk/lib/utils/api';
import type { BaseItemDto, BaseItemKind, ItemFields } from '@jellyfin/sdk/lib/generated-client/models';

import { LIBRARY_PAGE_SIZE } from '@/config/server';

import { getApi } from './client';

export interface Page {
  items: BaseItemDto[];
  total: number;
}

const TRACK_FIELDS: ItemFields[] = ['Genres', 'DateCreated', 'SortName'];

interface PageOptions {
  startIndex: number;
  limit?: number;
  minDateLastSaved?: string;
}

async function itemsPage(
  userId: string,
  kind: BaseItemKind,
  { startIndex, limit = LIBRARY_PAGE_SIZE, minDateLastSaved }: PageOptions,
  fields: ItemFields[] = TRACK_FIELDS,
): Promise<Page> {
  const { data } = await getLibraryApi(getApi()).getItems({
    userId,
    includeItemTypes: [kind],
    recursive: true,
    startIndex,
    limit,
    fields,
    sortBy: ['SortName'],
    sortOrder: ['Ascending'],
    enableUserData: true,
    enableTotalRecordCount: true,
    imageTypeLimit: 1,
    enableImageTypes: ['Primary'],
    minDateLastSaved,
  });
  return { items: data.Items ?? [], total: data.TotalRecordCount ?? 0 };
}

export const fetchTracksPage = (userId: string, opts: PageOptions) => itemsPage(userId, 'Audio', opts);
export const fetchAlbumsPage = (userId: string, opts: PageOptions) =>
  itemsPage(userId, 'MusicAlbum', opts, ['SortName', 'DateCreated']);
export const fetchPlaylistsPage = (userId: string, opts: PageOptions) =>
  itemsPage(userId, 'Playlist', opts, ['SortName', 'ChildCount']);

export async function fetchAlbumArtistsPage(
  userId: string,
  { startIndex, limit = LIBRARY_PAGE_SIZE }: PageOptions,
): Promise<Page> {
  const { data } = await getArtistApi(getApi()).getAlbumArtists({
    userId,
    startIndex,
    limit,
    fields: ['SortName'],
    enableTotalRecordCount: true,
    imageTypeLimit: 1,
    enableImageTypes: ['Primary'],
  });
  return { items: data.Items ?? [], total: data.TotalRecordCount ?? 0 };
}

/** Só os ids de um tipo de item, para reconciliar remoções. */
export async function fetchAllIds(userId: string, kind: BaseItemKind): Promise<string[]> {
  const { data } = await getLibraryApi(getApi()).getItems({
    userId,
    includeItemTypes: [kind],
    recursive: true,
    fields: [],
    enableImages: false,
    enableUserData: false,
    enableTotalRecordCount: false,
  });
  return (data.Items ?? []).map((i) => i.Id).filter((x): x is string => !!x);
}

/** Faixas de uma playlist, na ordem da playlist. */
export async function fetchPlaylistTrackIds(userId: string, playlistId: string): Promise<string[]> {
  const { data } = await getPlaylistApi(getApi()).getPlaylistItems({
    playlistId,
    userId,
    fields: [],
    enableImages: false,
    enableUserData: false,
  });
  return (data.Items ?? []).map((i) => i.Id).filter((x): x is string => !!x);
}

/** Últimas faixas tocadas (para o rastro de 24 h). */
export async function fetchRecentlyPlayed(userId: string, limit = 300): Promise<BaseItemDto[]> {
  const { data } = await getLibraryApi(getApi()).getItems({
    userId,
    includeItemTypes: ['Audio'],
    recursive: true,
    sortBy: ['DatePlayed'],
    sortOrder: ['Descending'],
    filters: ['IsPlayed'],
    limit,
    enableUserData: true,
    enableImages: false,
    fields: [],
  });
  return data.Items ?? [];
}

/** Ids dos favoritos no servidor. */
export async function fetchFavoriteIds(userId: string, kind: BaseItemKind): Promise<string[]> {
  const { data } = await getLibraryApi(getApi()).getItems({
    userId,
    includeItemTypes: [kind],
    recursive: true,
    filters: ['IsFavorite'],
    fields: [],
    enableImages: false,
    enableUserData: false,
  });
  return (data.Items ?? []).map((i) => i.Id).filter((x): x is string => !!x);
}

/** Plano B do rádio: Instant Mix do Jellyfin a partir de uma música. */
export async function fetchInstantMix(userId: string, itemId: string, limit = 50): Promise<string[]> {
  const { data } = await getInstantMixApi(getApi()).getInstantMixFromSong({
    itemId,
    userId,
    limit,
    enableImages: false,
    enableUserData: false,
  });
  return (data.Items ?? []).map((i) => i.Id).filter((x): x is string => !!x);
}
