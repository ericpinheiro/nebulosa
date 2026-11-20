import { create } from 'zustand';

import { tuning } from '@/config/tuning';
import { getEngine } from '@/services/player';
import type { EngineState, PlayerTrack } from '@/services/player/types';

import {
  createQueue,
  currentItem,
  emptyQueue,
  hasNext,
  hasPrevious,
  next as queueNext,
  previous as queuePrevious,
  setShuffle,
  upcoming,
  type QueueState,
} from './queue';
import { onSignOut } from './session';

/** Faixas carregadas no motor: a atual + N pré-carregadas (gapless). */
const PRELOAD = 1;
const TICK_MS = 500;

export type PlaySource =
  | { kind: 'album'; id: string }
  | { kind: 'playlist'; id: string }
  | { kind: 'artist'; id: string }
  | { kind: 'tracks' }
  | { kind: 'favorites' }
  | { kind: 'search' }
  | { kind: 'radio'; seedId: string }
  | { kind: 'galaxy' };

export interface PlayerState {
  queue: QueueState<PlayerTrack>;
  current: PlayerTrack | null;
  status: EngineState;
  /** Posição em segundos e o instante (ms) em que foi lida, para interpolar. */
  position: number;
  positionAt: number;
  duration: number;
  shuffle: boolean;
  source: PlaySource | null;

  playList: (tracks: PlayerTrack[], startIndex: number, source: PlaySource) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  toggle: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  /**
   * Troca a fila mantendo a música atual tocando (ex.: iniciar rádio).
   * `tracks[0]` deve ser a música atual.
   */
  replaceQueue: (tracks: PlayerTrack[], source: PlaySource) => Promise<void>;
  stop: () => Promise<void>;
}

let ticker: ReturnType<typeof setInterval> | null = null;
let listenersBound = false;

function startTicker() {
  if (ticker) return;
  ticker = setInterval(() => void refreshProgress(), TICK_MS);
}

function stopTicker() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}

async function refreshProgress() {
  try {
    const p = await getEngine().getProgress();
    usePlayerStore.setState((s) => ({
      position: p.position,
      positionAt: Date.now(),
      duration: p.duration > 0 ? p.duration : (s.current?.durationMs ?? 0) / 1000,
    }));
  } catch {
    // motor ainda não pronto
  }
}

function bindEngine() {
  if (listenersBound) return;
  listenersBound = true;
  const engine = getEngine();

  engine.on('state', (status) => {
    usePlayerStore.setState({ status });
    if (status === 'playing') startTicker();
    else {
      stopTicker();
      void refreshProgress();
    }
  });

  engine.on('advanced', (track) => {
    const { queue } = usePlayerStore.getState();
    let q = queueNext(queue);
    // Garante consistência se o motor e a fila divergirem.
    if (currentItem(q)?.id !== track.id) {
      const idx = q.order.findIndex((i) => q.items[i].id === track.id);
      if (idx >= 0) q = { ...q, cursor: idx };
    }
    usePlayerStore.setState({ queue: q, current: currentItem(q) ?? track, position: 0, positionAt: Date.now() });
    void (async () => {
      await engine.trimPlayed();
      const [following] = upcoming(q, PRELOAD);
      if (following) await engine.append(following);
    })();
  });

  engine.on('ended', () => {
    const { current } = usePlayerStore.getState();
    usePlayerStore.setState({ status: 'paused', position: 0, positionAt: Date.now() });
    if (current) void engine.load([current], { play: false });
  });
}

async function loadCurrent(q: QueueState<PlayerTrack>, play: boolean) {
  const cur = currentItem(q);
  if (!cur) return;
  bindEngine();
  usePlayerStore.setState({
    queue: q,
    current: cur,
    position: 0,
    positionAt: Date.now(),
    duration: cur.durationMs / 1000,
    status: play ? 'loading' : 'paused',
  });
  await getEngine().load([cur, ...upcoming(q, PRELOAD)], { play });
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: emptyQueue(),
  current: null,
  status: 'idle',
  position: 0,
  positionAt: 0,
  duration: 0,
  shuffle: false,
  source: null,

  playList: async (tracks, startIndex, source) => {
    if (tracks.length === 0) return;
    const q = createQueue(tracks, startIndex, get().shuffle);
    set({ source });
    await loadCurrent(q, true);
  },

  play: async () => {
    if (!get().current) return;
    bindEngine();
    await getEngine().play();
  },

  pause: async () => {
    await getEngine().pause();
  },

  toggle: async () => {
    const { status } = get();
    if (status === 'playing' || status === 'loading') await get().pause();
    else await get().play();
  },

  next: async () => {
    const { queue } = get();
    if (!hasNext(queue)) return;
    await loadCurrent(queueNext(queue), true);
  },

  previous: async () => {
    const { queue, position } = get();
    if (position > tuning.playback.previousRestartThresholdS || !hasPrevious(queue)) {
      await get().seek(0);
      return;
    }
    await loadCurrent(queuePrevious(queue), true);
  },

  seek: async (seconds) => {
    set({ position: seconds, positionAt: Date.now() });
    await getEngine().seekTo(seconds);
  },

  toggleShuffle: async () => {
    const on = !get().shuffle;
    const q = setShuffle(get().queue, on);
    set({ shuffle: on, queue: q });
    // A próxima pré-carregada mudou: troca só as seguintes, sem interromper a atual.
    if (get().current) await getEngine().replaceUpcoming(upcoming(q, PRELOAD));
  },

  replaceQueue: async (tracks, source) => {
    const { current } = get();
    if (!current || tracks[0]?.id !== current.id) {
      await get().playList(tracks, 0, source);
      return;
    }
    // Rádio é uma sequência: shuffle desligado para respeitar a ordem.
    const q = createQueue(tracks, 0, false);
    set({ queue: q, source, shuffle: false });
    await getEngine().replaceUpcoming(upcoming(q, PRELOAD));
  },

  stop: async () => {
    stopTicker();
    await getEngine().stop();
    set({ queue: emptyQueue(), current: null, status: 'idle', position: 0, duration: 0, source: null });
  },
}));

/** Posição estimada agora, interpolando desde a última leitura (para animações). */
export function estimatePosition(s: Pick<PlayerState, 'position' | 'positionAt' | 'status'>, now = Date.now()): number {
  if (s.status !== 'playing') return s.position;
  return s.position + (now - s.positionAt) / 1000;
}

onSignOut(() => usePlayerStore.getState().stop());
