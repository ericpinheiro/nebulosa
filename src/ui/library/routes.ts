export type LibraryTab = 'albums' | 'tracks' | 'artists' | 'playlists' | 'favorites';

export type LibraryRoute =
  | { kind: 'tab' }
  | { kind: 'album'; id: string }
  | { kind: 'artist'; id: string }
  | { kind: 'playlist'; id: string; name: string };

export const TAB_LABELS: Record<LibraryTab, string> = {
  albums: 'Álbuns',
  tracks: 'Músicas',
  artists: 'Artistas',
  playlists: 'Playlists',
  favorites: 'Favoritos',
};
