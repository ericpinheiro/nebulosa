import { useQuery } from '@tanstack/react-query';

import { fetchPlaylistTrackIds } from '@/services/jellyfin/library';
import * as repo from '@/state/library/repository';
import { useLibraryStore } from '@/state/library/sync';
import type { TrackSort } from '@/state/library/types';
import { useSessionStore } from '@/state/session';

/** Consultas locais: a chave inclui a versão do banco, então recarregam após cada sincronização. */
function useVersion() {
  return useLibraryStore((s) => s.version);
}

export function useAlbums() {
  const v = useVersion();
  return useQuery({ queryKey: ['albums', v], queryFn: repo.getAlbums, staleTime: Infinity });
}

export function useAlbum(id: string | null | undefined) {
  const v = useVersion();
  return useQuery({
    queryKey: ['album', id, v],
    queryFn: () => repo.getAlbum(id!),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useAlbumTracks(id: string | null | undefined) {
  const v = useVersion();
  return useQuery({
    queryKey: ['albumTracks', id, v],
    queryFn: () => repo.getAlbumTracks(id!),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useTracks(sort: TrackSort) {
  const v = useVersion();
  return useQuery({ queryKey: ['tracks', sort, v], queryFn: () => repo.getTracks(sort), staleTime: Infinity });
}

export function useArtists() {
  const v = useVersion();
  return useQuery({ queryKey: ['artists', v], queryFn: repo.getArtists, staleTime: Infinity });
}

export function useArtist(id: string) {
  const v = useVersion();
  return useQuery({ queryKey: ['artist', id, v], queryFn: () => repo.getArtist(id), staleTime: Infinity });
}

export function useArtistAlbums(id: string) {
  const v = useVersion();
  return useQuery({
    queryKey: ['artistAlbums', id, v],
    queryFn: () => repo.getAlbumsByArtist(id),
    staleTime: Infinity,
  });
}

export function usePlaylists() {
  const v = useVersion();
  return useQuery({ queryKey: ['playlists', v], queryFn: repo.getPlaylists, staleTime: Infinity });
}

/** Faixas de playlist: ordem vem do servidor, metadados do banco local. */
export function usePlaylistTracks(id: string) {
  const v = useVersion();
  const userId = useSessionStore((s) => s.session?.userId);
  return useQuery({
    queryKey: ['playlistTracks', id, v],
    queryFn: async () => repo.getTracksByIds(await fetchPlaylistTrackIds(userId!, id)),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useFavoriteTracks() {
  const v = useVersion();
  return useQuery({ queryKey: ['favorites', v], queryFn: repo.getFavoriteTracks, staleTime: Infinity });
}

export function useSearch(query: string) {
  const v = useVersion();
  const q = query.trim();
  return useQuery({
    queryKey: ['search', q, v],
    queryFn: () => repo.search(q),
    enabled: q.length > 0,
    staleTime: Infinity,
    placeholderData: (prev) => prev,
  });
}

export function useHasGenres() {
  const v = useVersion();
  return useQuery({
    queryKey: ['hasGenres', v],
    queryFn: async () => (await repo.getTracks('genre')).some((t) => !!t.genre),
    staleTime: Infinity,
  });
}
