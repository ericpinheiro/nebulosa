import type { AudioEngine, EngineEvents, PlayerTrack } from '@/services/player/types';

/** Motor de áudio falso para testes do store. */
export function createFakeEngine() {
  const handlers: { [K in keyof EngineEvents]: Set<EngineEvents[K]> } = {
    state: new Set(),
    advanced: new Set(),
    ended: new Set(),
    error: new Set(),
  };
  const fake = {
    window: [] as PlayerTrack[],
    position: 0,
    playing: false,
    emit<K extends keyof EngineEvents>(event: K, ...args: Parameters<EngineEvents[K]>) {
      for (const h of handlers[event]) (h as (...a: unknown[]) => void)(...args);
    },
  };
  const engine: AudioEngine = {
    setup: async () => undefined,
    load: async (window, { play, position }) => {
      fake.window = window.slice();
      fake.position = position ?? 0;
      fake.playing = play;
      fake.emit('state', play ? 'playing' : 'paused');
    },
    append: async (t) => {
      fake.window.push(t);
    },
    replaceUpcoming: async (tracks) => {
      fake.window = [fake.window[0], ...tracks];
    },
    trimPlayed: async () => undefined,
    play: async () => {
      fake.playing = true;
      fake.emit('state', 'playing');
    },
    pause: async () => {
      fake.playing = false;
      fake.emit('state', 'paused');
    },
    stop: async () => {
      fake.window = [];
      fake.playing = false;
    },
    seekTo: async (s) => {
      fake.position = s;
    },
    getProgress: async () => ({ position: fake.position, duration: 200, buffered: 200 }),
    on: (event, handler) => {
      handlers[event].add(handler as never);
      return () => handlers[event].delete(handler as never);
    },
  };
  return { engine, fake };
}

export function makeTracks(n: number): PlayerTrack[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `t${i + 1}`,
    title: `Faixa ${i + 1}`,
    artist: 'Artista',
    album: 'Álbum',
    albumId: 'a1',
    durationMs: 200_000,
    imageItemId: 'a1',
    imageTag: null,
  }));
}
