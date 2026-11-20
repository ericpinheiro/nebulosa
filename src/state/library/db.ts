import * as SQLite from 'expo-sqlite';

const DB_NAME = 'library.db';
const SCHEMA_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  sort_name TEXT NOT NULL,
  album_id TEXT,
  album TEXT,
  artist TEXT NOT NULL,
  album_artist TEXT,
  artist_ids TEXT NOT NULL DEFAULT '[]',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  year INTEGER,
  genre TEXT,
  track_number INTEGER,
  disc_number INTEGER,
  image_tag TEXT,
  album_image_tag TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  favorited_at INTEGER,
  last_played_at INTEGER,
  date_created INTEGER,
  search TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_id, disc_number, track_number);
CREATE INDEX IF NOT EXISTS idx_tracks_sort ON tracks(sort_name);
CREATE INDEX IF NOT EXISTS idx_tracks_fav ON tracks(is_favorite, favorited_at);
CREATE INDEX IF NOT EXISTS idx_tracks_played ON tracks(last_played_at);
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  sort_name TEXT NOT NULL,
  album_artist TEXT NOT NULL,
  year INTEGER,
  image_tag TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  search TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_albums_sort ON albums(sort_name);
CREATE TABLE IF NOT EXISTS album_artists (
  album_id TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  PRIMARY KEY (album_id, artist_id)
);
CREATE INDEX IF NOT EXISTS idx_album_artists_artist ON album_artists(artist_id);
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  sort_name TEXT NOT NULL,
  image_tag TEXT,
  search TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_artists_sort ON artists(sort_name);
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  sort_name TEXT NOT NULL,
  image_tag TEXT,
  child_count INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
`;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  const opened = await SQLite.openDatabaseAsync(DB_NAME);
  const row = await opened.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((row?.user_version ?? 0) < SCHEMA_VERSION) {
    await opened.execAsync(SCHEMA);
    await opened.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
  db = opened;
  return db;
}

export async function getMeta(key: string): Promise<string | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<{ value: string | null }>('SELECT value FROM meta WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const d = await getDb();
  await d.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', key, value);
}

/** Apaga tudo (logout). */
export async function wipeLibrary(): Promise<void> {
  const d = await getDb();
  await d.execAsync(
    'DELETE FROM tracks; DELETE FROM albums; DELETE FROM album_artists; DELETE FROM artists; DELETE FROM playlists; DELETE FROM meta;',
  );
}
