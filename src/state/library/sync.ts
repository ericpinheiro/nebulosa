import { create } from 'zustand';

import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';

import {
  fetchAlbumArtistsPage,
  fetchAlbumsPage,
  fetchAllIds,
  fetchFavoriteIds,
  fetchPlaylistsPage,
  fetchRecentlyPlayed,
  fetchTracksPage,
  type Page,
} from '@/services/jellyfin/library';

import { onSignOut, useSessionStore } from '../session';
import { getMeta, setMeta, wipeLibrary } from './db';
import { mapAlbum, mapArtist, mapPlaylist, mapTrack } from './mappers';
import {
  applyFavoriteIds,
  countTracks,
  deleteMissing,
  replacePlaylists,
  setLastPlayed,
  upsertAlbums,
  upsertArtists,
  upsertTracks,
} from './repository';
import type { SyncProgress } from './types';

const LAST_SYNC_KEY = 'lastSyncAt';
/** Folga para não perder itens salvos durante a sincronização anterior. */
const SYNC_SLACK_MS = 60_000;

interface LibraryState {
  progress: SyncProgress;
  /** Incrementa a cada mudança no banco; consultas da UI usam como chave. */
  version: number;
  bump: () => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  progress: { phase: 'idle', loaded: 0, total: 0 },
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
}));

const setProgress = (p: Partial<SyncProgress>) =>
  useLibraryStore.setState((s) => ({ progress: { ...s.progress, ...p } }));

type Fetcher = (userId: string, opts: { startIndex: number; minDateLastSaved?: string }) => Promise<Page>;

async function pageThrough(
  userId: string,
  fetcher: Fetcher,
  onPage: (items: BaseItemDto[]) => Promise<void>,
  minDateLastSaved?: string,
  onCount?: (loaded: number, total: number) => void,
): Promise<number> {
  let start = 0;
  let total = Infinity;
  while (start < total) {
    const page = await fetcher(userId, { startIndex: start, minDateLastSaved });
    total = page.total;
    const items = page.items.filter((i) => !!i.Id);
    await onPage(items);
    start += page.items.length;
    onCount?.(start, total);
    if (page.items.length === 0) break;
  }
  return start;
}

let running: Promise<void> | null = null;

/** Sincroniza a biblioteca: inicial se o banco estiver vazio, incremental nos demais casos. */
export function syncLibrary(): Promise<void> {
  if (!running) {
    running = doSync().finally(() => {
      running = null;
    });
  }
  return running;
}

async function doSync(): Promise<void> {
  const userId = useSessionStore.getState().session?.userId;
  if (!userId) return;

  const startedAt = Date.now();
  const lastSync = await getMeta(LAST_SYNC_KEY);
  const hasData = (await countTracks()) > 0;
  const incremental = !!lastSync && hasData;
  const since = incremental ? new Date(Number(lastSync) - SYNC_SLACK_MS).toISOString() : undefined;

  setProgress({ phase: incremental ? 'incremental' : 'initial', loaded: 0, total: 0 });
  try {
    await pageThrough(
      userId,
      fetchTracksPage,
      async (items) => {
        await upsertTracks(items.map((i) => mapTrack(i)));
      },
      since,
      (loaded, total) => {
        setProgress({ loaded, total });
        if (!incremental) useLibraryStore.getState().bump();
      },
    );
    await pageThrough(userId, fetchAlbumsPage, (items) => upsertAlbums(items.map(mapAlbum)), since);
    // Artistas e playlists são poucos: sempre completos.
    await pageThrough(userId, fetchAlbumArtistsPage, (items) => upsertArtists(items.map(mapArtist)));
    const playlists: BaseItemDto[] = [];
    await pageThrough(userId, fetchPlaylistsPage, async (items) => {
      playlists.push(...items);
    });
    await replacePlaylists(playlists.map(mapPlaylist));

    if (incremental) {
      const [trackIds, albumIds, artistIds] = await Promise.all([
        fetchAllIds(userId, 'Audio'),
        fetchAllIds(userId, 'MusicAlbum'),
        fetchAllIds(userId, 'MusicArtist').catch(() => null),
      ]);
      await deleteMissing('tracks', trackIds);
      await deleteMissing('albums', albumIds);
      if (artistIds && artistIds.length > 0) await deleteMissing('artists', artistIds);
      // Favoritos e "tocado por último" mudam sem alterar DateLastSaved.
      await refreshUserData(userId);
    }

    await setMeta(LAST_SYNC_KEY, String(startedAt));
    setProgress({ phase: 'done' });
  } catch (e) {
    setProgress({ phase: 'error' });
    if (!hasData) throw e;
    // Com dados locais, falha de rede não bloqueia nada.
  } finally {
    useLibraryStore.getState().bump();
  }
}

/** Atualiza favoritos e últimas reproduções, que não mudam o DateLastSaved do item. */
export async function refreshUserData(userId: string): Promise<void> {
  const [favs, recent] = await Promise.all([fetchFavoriteIds(userId, 'Audio'), fetchRecentlyPlayed(userId)]);
  await applyFavoriteIds(favs);
  for (const item of recent) {
    const at = item.UserData?.LastPlayedDate ? Date.parse(item.UserData.LastPlayedDate) : NaN;
    if (item.Id && !Number.isNaN(at)) await setLastPlayed(item.Id, at);
  }
  useLibraryStore.getState().bump();
}

onSignOut(async () => {
  await wipeLibrary();
  useLibraryStore.setState({ progress: { phase: 'idle', loaded: 0, total: 0 }, version: 0 });
});
