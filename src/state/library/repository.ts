import { getDb } from './db';
import { likePattern, normalizeSearch } from './normalize';
import type { AlbumRow, ArtistRow, PlaylistRow, TrackRow, TrackSort } from './types';

// ---------- escrita ----------

export async function upsertTracks(rows: TrackRow[]): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    const stmt = await db.prepareAsync(
      `INSERT INTO tracks (id, name, sort_name, album_id, album, artist, album_artist, artist_ids,
        duration_ms, year, genre, track_number, disc_number, image_tag, album_image_tag,
        is_favorite, favorited_at, last_played_at, date_created, search)
       VALUES ($id, $name, $sort, $albumId, $album, $artist, $albumArtist, $artistIds,
        $duration, $year, $genre, $track, $disc, $image, $albumImage,
        $fav, $favAt, $played, $created, $search)
       ON CONFLICT(id) DO UPDATE SET
        name = excluded.name, sort_name = excluded.sort_name, album_id = excluded.album_id,
        album = excluded.album, artist = excluded.artist, album_artist = excluded.album_artist,
        artist_ids = excluded.artist_ids, duration_ms = excluded.duration_ms, year = excluded.year,
        genre = excluded.genre, track_number = excluded.track_number, disc_number = excluded.disc_number,
        image_tag = excluded.image_tag, album_image_tag = excluded.album_image_tag,
        is_favorite = excluded.is_favorite,
        favorited_at = CASE
          WHEN excluded.is_favorite = 0 THEN NULL
          WHEN tracks.is_favorite = 1 AND tracks.favorited_at IS NOT NULL THEN tracks.favorited_at
          ELSE excluded.favorited_at END,
        last_played_at = MAX(COALESCE(tracks.last_played_at, 0), COALESCE(excluded.last_played_at, 0)),
        date_created = excluded.date_created, search = excluded.search`,
    );
    try {
      for (const r of rows) {
        await stmt.executeAsync({
          $id: r.id,
          $name: r.name,
          $sort: r.sortName,
          $albumId: r.albumId,
          $album: r.album,
          $artist: r.artist,
          $albumArtist: r.albumArtist,
          $artistIds: JSON.stringify(r.artistIds),
          $duration: r.durationMs,
          $year: r.year,
          $genre: r.genre,
          $track: r.trackNumber,
          $disc: r.discNumber,
          $image: r.imageTag,
          $albumImage: r.albumImageTag,
          $fav: r.isFavorite ? 1 : 0,
          $favAt: r.favoritedAt,
          $played: r.lastPlayedAt,
          $created: r.dateCreated,
          $search: normalizeSearch(`${r.name} ${r.artist} ${r.album ?? ''}`),
        });
      }
    } finally {
      await stmt.finalizeAsync();
    }
  });
}

export async function upsertAlbums(rows: AlbumRow[]): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const r of rows) {
      await db.runAsync(
        `INSERT OR REPLACE INTO albums (id, name, sort_name, album_artist, year, image_tag, is_favorite, search)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        r.id,
        r.name,
        r.sortName,
        r.albumArtist,
        r.year,
        r.imageTag,
        r.isFavorite ? 1 : 0,
        normalizeSearch(`${r.name} ${r.albumArtist}`),
      );
      await db.runAsync('DELETE FROM album_artists WHERE album_id = ?', r.id);
      for (const artistId of r.artistIds) {
        await db.runAsync('INSERT OR IGNORE INTO album_artists (album_id, artist_id) VALUES (?, ?)', r.id, artistId);
      }
    }
  });
}

export async function upsertArtists(rows: ArtistRow[]): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const r of rows) {
      await db.runAsync(
        'INSERT OR REPLACE INTO artists (id, name, sort_name, image_tag, search) VALUES (?, ?, ?, ?, ?)',
        r.id,
        r.name,
        r.sortName,
        r.imageTag,
        normalizeSearch(r.name),
      );
    }
  });
}

export async function replacePlaylists(rows: PlaylistRow[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM playlists');
    for (const r of rows) {
      await db.runAsync(
        'INSERT OR REPLACE INTO playlists (id, name, sort_name, image_tag, child_count) VALUES (?, ?, ?, ?, ?)',
        r.id,
        r.name,
        r.sortName,
        r.imageTag,
        r.childCount,
      );
    }
  });
}

/** Remove linhas cujo id não existe mais no servidor. */
export async function deleteMissing(table: 'tracks' | 'albums' | 'artists', keepIds: string[]): Promise<number> {
  const db = await getDb();
  const keep = new Set(keepIds);
  const local = await db.getAllAsync<{ id: string }>(`SELECT id FROM ${table}`);
  const gone = local.map((r) => r.id).filter((id) => !keep.has(id));
  if (gone.length === 0) return 0;
  await db.withTransactionAsync(async () => {
    for (const id of gone) {
      await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, id);
      if (table === 'albums') await db.runAsync('DELETE FROM album_artists WHERE album_id = ?', id);
    }
  });
  return gone.length;
}

export async function setTrackFavorite(id: string, isFavorite: boolean, at = Date.now()): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE tracks SET is_favorite = ?, favorited_at = ? WHERE id = ?',
    isFavorite ? 1 : 0,
    isFavorite ? at : null,
    id,
  );
}

/** Aplica a lista de favoritos do servidor: marca quem entrou (agora) e desmarca quem saiu. */
export async function applyFavoriteIds(ids: string[], at = Date.now()): Promise<void> {
  const db = await getDb();
  const fav = new Set(ids);
  const local = await db.getAllAsync<{ id: string }>('SELECT id FROM tracks WHERE is_favorite = 1');
  const localSet = new Set(local.map((r) => r.id));
  await db.withTransactionAsync(async () => {
    for (const id of localSet)
      if (!fav.has(id)) await db.runAsync('UPDATE tracks SET is_favorite = 0, favorited_at = NULL WHERE id = ?', id);
    for (const id of fav)
      if (!localSet.has(id))
        await db.runAsync('UPDATE tracks SET is_favorite = 1, favorited_at = ? WHERE id = ?', at, id);
  });
}

export async function setLastPlayed(id: string, at: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE tracks SET last_played_at = MAX(COALESCE(last_played_at, 0), ?) WHERE id = ?', at, id);
}

// ---------- leitura ----------

interface TrackDbRow {
  id: string;
  name: string;
  sort_name: string;
  album_id: string | null;
  album: string | null;
  artist: string;
  album_artist: string | null;
  artist_ids: string;
  duration_ms: number;
  year: number | null;
  genre: string | null;
  track_number: number | null;
  disc_number: number | null;
  image_tag: string | null;
  album_image_tag: string | null;
  is_favorite: number;
  favorited_at: number | null;
  last_played_at: number | null;
  date_created: number | null;
}

function toTrack(r: TrackDbRow): TrackRow {
  return {
    id: r.id,
    name: r.name,
    sortName: r.sort_name,
    albumId: r.album_id,
    album: r.album,
    artist: r.artist,
    albumArtist: r.album_artist,
    artistIds: JSON.parse(r.artist_ids) as string[],
    durationMs: r.duration_ms,
    year: r.year,
    genre: r.genre,
    trackNumber: r.track_number,
    discNumber: r.disc_number,
    imageTag: r.image_tag,
    albumImageTag: r.album_image_tag,
    isFavorite: r.is_favorite === 1,
    favoritedAt: r.favorited_at,
    lastPlayedAt: r.last_played_at,
    dateCreated: r.date_created,
  };
}

interface AlbumDbRow {
  id: string;
  name: string;
  sort_name: string;
  album_artist: string;
  year: number | null;
  image_tag: string | null;
  is_favorite: number;
}

const toAlbum = (r: AlbumDbRow): AlbumRow => ({
  id: r.id,
  name: r.name,
  sortName: r.sort_name,
  albumArtist: r.album_artist,
  artistIds: [],
  year: r.year,
  imageTag: r.image_tag,
  isFavorite: r.is_favorite === 1,
});

const toArtist = (r: { id: string; name: string; sort_name: string; image_tag: string | null }): ArtistRow => ({
  id: r.id,
  name: r.name,
  sortName: r.sort_name,
  imageTag: r.image_tag,
});

const toPlaylist = (r: {
  id: string;
  name: string;
  sort_name: string;
  image_tag: string | null;
  child_count: number;
}): PlaylistRow => ({
  id: r.id,
  name: r.name,
  sortName: r.sort_name,
  imageTag: r.image_tag,
  childCount: r.child_count,
});

const TRACK_ORDER: Record<TrackSort, string> = {
  name: 'sort_name, album, disc_number, track_number',
  album: "COALESCE(album, 'zzzz') COLLATE NOCASE, disc_number, track_number, sort_name",
  genre: 'genre IS NULL, genre COLLATE NOCASE, sort_name',
};

export async function countTracks(): Promise<number> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM tracks');
  return r?.n ?? 0;
}

export async function getTracks(sort: TrackSort = 'name'): Promise<TrackRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TrackDbRow>(`SELECT * FROM tracks ORDER BY ${TRACK_ORDER[sort]}`);
  return rows.map(toTrack);
}

export async function getTracksByIds(ids: string[]): Promise<TrackRow[]> {
  if (ids.length === 0) return [];
  const db = await getDb();
  const out: TrackRow[] = [];
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const rows = await db.getAllAsync<TrackDbRow>(
      `SELECT * FROM tracks WHERE id IN (${chunk.map(() => '?').join(',')})`,
      chunk,
    );
    out.push(...rows.map(toTrack));
  }
  const byId = new Map(out.map((t) => [t.id, t]));
  return ids.map((id) => byId.get(id)).filter((t): t is TrackRow => !!t);
}

export async function getTrack(id: string): Promise<TrackRow | null> {
  const [t] = await getTracksByIds([id]);
  return t ?? null;
}

export async function getAlbumTracks(albumId: string): Promise<TrackRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TrackDbRow>(
    'SELECT * FROM tracks WHERE album_id = ? ORDER BY COALESCE(disc_number, 1), COALESCE(track_number, 9999), sort_name',
    albumId,
  );
  return rows.map(toTrack);
}

export async function getAlbums(): Promise<AlbumRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<AlbumDbRow>('SELECT * FROM albums ORDER BY sort_name');
  return rows.map(toAlbum);
}

export async function getAlbum(id: string): Promise<AlbumRow | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<AlbumDbRow>('SELECT * FROM albums WHERE id = ?', id);
  return r ? toAlbum(r) : null;
}

export async function getAlbumsByArtist(artistId: string): Promise<AlbumRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<AlbumDbRow>(
    `SELECT a.* FROM albums a JOIN album_artists aa ON aa.album_id = a.id
     WHERE aa.artist_id = ? ORDER BY a.year IS NULL, a.year, a.sort_name`,
    artistId,
  );
  return rows.map(toAlbum);
}

export async function getArtists(): Promise<ArtistRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string; name: string; sort_name: string; image_tag: string | null }>(
    'SELECT * FROM artists ORDER BY sort_name',
  );
  return rows.map(toArtist);
}

export async function getArtist(id: string): Promise<ArtistRow | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ id: string; name: string; sort_name: string; image_tag: string | null }>(
    'SELECT * FROM artists WHERE id = ?',
    id,
  );
  return r ? toArtist(r) : null;
}

export async function getPlaylists(): Promise<PlaylistRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    sort_name: string;
    image_tag: string | null;
    child_count: number;
  }>('SELECT * FROM playlists ORDER BY sort_name');
  return rows.map(toPlaylist);
}

export async function getFavoriteTracks(): Promise<TrackRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TrackDbRow>(
    'SELECT * FROM tracks WHERE is_favorite = 1 ORDER BY favorited_at DESC, sort_name',
  );
  return rows.map(toTrack);
}

/** Faixas tocadas desde `sinceMs` (rastro da galáxia). */
export async function getPlayedSince(sinceMs: number): Promise<{ id: string; lastPlayedAt: number }[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string; last_played_at: number }>(
    'SELECT id, last_played_at FROM tracks WHERE last_played_at >= ? ORDER BY last_played_at',
    sinceMs,
  );
  return rows.map((r) => ({ id: r.id, lastPlayedAt: r.last_played_at }));
}

export interface SearchResults {
  tracks: TrackRow[];
  albums: AlbumRow[];
  artists: ArtistRow[];
}

export async function search(query: string, limit = 50): Promise<SearchResults> {
  if (!normalizeSearch(query)) return { tracks: [], albums: [], artists: [] };
  const db = await getDb();
  const pattern = likePattern(query);
  const [tracks, albums, artists] = await Promise.all([
    db.getAllAsync<TrackDbRow>(
      "SELECT * FROM tracks WHERE search LIKE ? ESCAPE '\\' ORDER BY sort_name LIMIT ?",
      pattern,
      limit,
    ),
    db.getAllAsync<AlbumDbRow>(
      "SELECT * FROM albums WHERE search LIKE ? ESCAPE '\\' ORDER BY sort_name LIMIT ?",
      pattern,
      limit,
    ),
    db.getAllAsync<{ id: string; name: string; sort_name: string; image_tag: string | null }>(
      "SELECT * FROM artists WHERE search LIKE ? ESCAPE '\\' ORDER BY sort_name LIMIT ?",
      pattern,
      limit,
    ),
  ]);
  return { tracks: tracks.map(toTrack), albums: albums.map(toAlbum), artists: artists.map(toArtist) };
}

export interface CoverInfo {
  imageItemId: string;
  imageTag: string | null;
  title: string;
}

/** Capa de cada faixa (própria ou do álbum), para as capas da galáxia. */
export async function getCoverLookup(): Promise<Map<string, CoverInfo>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    album_id: string | null;
    image_tag: string | null;
    album_image_tag: string | null;
  }>('SELECT id, name, album_id, image_tag, album_image_tag FROM tracks');
  const map = new Map<string, CoverInfo>();
  for (const r of rows) {
    const useAlbum = !r.image_tag && !!r.album_id;
    map.set(r.id, {
      imageItemId: useAlbum ? r.album_id! : r.id,
      imageTag: useAlbum ? r.album_image_tag : r.image_tag,
      title: r.name,
    });
  }
  return map;
}
