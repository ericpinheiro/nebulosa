import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { getMobileSession, lastfmEnabled, LastfmError, scrobble, updateNowPlaying } from '@/services/lastfm/client';
import { shouldScrobble, type ScrobbleEntry } from '@/services/lastfm/rules';
import type { PlayerTrack } from '@/services/player/types';
import { getJSON, setJSON } from '@/services/storage/kv';

import { onTrackStarted, onTrackStopped } from './reporter';
import { onSignOut } from './session';

const SK_KEY = 'nebulosa.lastfm';
const QUEUE_KEY = 'lastfm.queue';
const MAX_QUEUE = 500;

interface ScrobbleState {
  user: string | null;
  sessionKey: string | null;
  error: string | null;
  connect: (username: string, password: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useScrobbleStore = create<ScrobbleState>((set) => ({
  user: null,
  sessionKey: null,
  error: null,
  restore: async () => {
    if (!lastfmEnabled()) return;
    const raw = await SecureStore.getItemAsync(SK_KEY).catch(() => null);
    if (!raw) return;
    try {
      const s = JSON.parse(raw) as { name: string; key: string };
      set({ user: s.name, sessionKey: s.key });
    } catch {
      // ignora
    }
  },
  connect: async (username, password) => {
    set({ error: null });
    try {
      const s = await getMobileSession(username.trim(), password);
      await SecureStore.setItemAsync(SK_KEY, JSON.stringify(s));
      set({ user: s.name, sessionKey: s.key });
      void flushQueue();
      return true;
    } catch (e) {
      set({
        error:
          e instanceof LastfmError && e.code === 4
            ? 'Usuário ou senha do Last.fm incorretos'
            : 'Não foi possível conectar ao Last.fm',
      });
      return false;
    }
  },
  disconnect: async () => {
    await SecureStore.deleteItemAsync(SK_KEY).catch(() => undefined);
    set({ user: null, sessionKey: null });
  },
}));

export function pendingScrobbles(): ScrobbleEntry[] {
  return getJSON<ScrobbleEntry[]>(QUEUE_KEY) ?? [];
}

function enqueue(e: ScrobbleEntry) {
  const q = pendingScrobbles();
  q.push(e);
  setJSON(QUEUE_KEY, q.slice(-MAX_QUEUE));
}

let flushing = false;

/** Envia a fila em lotes de 50; o que falhar continua guardado. */
export async function flushQueue(): Promise<void> {
  const sk = useScrobbleStore.getState().sessionKey;
  if (!sk || flushing) return;
  flushing = true;
  try {
    let q = pendingScrobbles();
    while (q.length > 0) {
      const batch = q.slice(0, 50);
      await scrobble(sk, batch);
      q = q.slice(batch.length);
      setJSON(QUEUE_KEY, q);
    }
  } catch {
    // tenta de novo no próximo scrobble
  } finally {
    flushing = false;
  }
}

const entryOf = (t: PlayerTrack) => ({
  artist: t.artist,
  track: t.title,
  album: t.album ?? undefined,
  duration: t.durationMs / 1000,
});

/** Liga o scrobble aos eventos do player. Sem chave de API, não faz nada. */
export function startScrobbler(): () => void {
  if (!lastfmEnabled()) return () => undefined;
  void useScrobbleStore.getState().restore().then(flushQueue);
  const offStart = onTrackStarted((track) => {
    const sk = useScrobbleStore.getState().sessionKey;
    if (sk) void updateNowPlaying(sk, entryOf(track)).catch(() => undefined);
  });
  const offStop = onTrackStopped((track, listenedS, startedAt) => {
    if (!useScrobbleStore.getState().sessionKey) return;
    if (!shouldScrobble(track.durationMs / 1000, listenedS)) return;
    enqueue({ ...entryOf(track), timestamp: Math.floor(startedAt / 1000) });
    void flushQueue();
  });
  return () => {
    offStart();
    offStop();
  };
}

onSignOut(() => useScrobbleStore.getState().disconnect());
