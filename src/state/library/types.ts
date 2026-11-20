/** Linhas do banco local da biblioteca. */
export interface TrackRow {
  id: string;
  name: string;
  sortName: string;
  albumId: string | null;
  album: string | null;
  artist: string;
  albumArtist: string | null;
  artistIds: string[];
  durationMs: number;
  year: number | null;
  genre: string | null;
  trackNumber: number | null;
  discNumber: number | null;
  imageTag: string | null;
  albumImageTag: string | null;
  isFavorite: boolean;
  /** Quando favoritou (ms). O Jellyfin não guarda essa data; registramos localmente. */
  favoritedAt: number | null;
  /** Última vez tocada (ms), vinda do Jellyfin. Alimenta o rastro de 24 h. */
  lastPlayedAt: number | null;
  dateCreated: number | null;
}

export interface AlbumRow {
  id: string;
  name: string;
  sortName: string;
  albumArtist: string;
  artistIds: string[];
  year: number | null;
  imageTag: string | null;
  isFavorite: boolean;
}

export interface ArtistRow {
  id: string;
  name: string;
  sortName: string;
  imageTag: string | null;
}

export interface PlaylistRow {
  id: string;
  name: string;
  sortName: string;
  imageTag: string | null;
  childCount: number;
}

export type TrackSort = 'name' | 'album' | 'genre';

export interface SyncProgress {
  phase: 'idle' | 'initial' | 'incremental' | 'done' | 'error';
  loaded: number;
  total: number;
}
