import * as Crypto from 'expo-crypto';

import { tuning } from '@/config/tuning';
import { reportProgress, reportStart, reportStopped, type PlayReport } from '@/services/jellyfin/playstate';
import type { PlayerTrack } from '@/services/player/types';

import { setLastPlayed } from './library/repository';
import { useLibraryStore } from './library/sync';
import { estimatePosition, usePlayerStore } from './player';

type TrackListener = (track: PlayerTrack, startedAt: number) => void;
type StopListener = (track: PlayerTrack, playedS: number, startedAt: number) => void;

const startListeners = new Set<TrackListener>();
const stopListeners = new Set<StopListener>();

/** Avisado quando uma faixa começa (rastro da galáxia, scrobble "tocando agora"). */
export function onTrackStarted(l: TrackListener): () => void {
  startListeners.add(l);
  return () => startListeners.delete(l);
}

/** Avisado quando uma faixa sai (troca, fim ou parada), com quanto foi ouvido. */
export function onTrackStopped(l: StopListener): () => void {
  stopListeners.add(l);
  return () => stopListeners.delete(l);
}

const safe = (p: Promise<unknown>) => p.catch(() => undefined);

const LISTEN_TICK_MS = 1000;

/** A faixa já foi ouvida o bastante para contar como tocada (rastro e relatório ao Jellyfin)? */
export function shouldCommit(listenedS: number, minS: number = tuning.playback.trailMinListenS): boolean {
  return listenedS >= minS;
}

interface Active {
  track: PlayerTrack;
  sessionId: string;
  startedAt: number;
  lastPosition: number;
  /** Segundos efetivamente ouvidos (scrobble e mínimo do rastro). */
  listened: number;
  lastTickAt: number;
  /**
   * Ouvida pelo tempo mínimo: só então o Jellyfin fica sabendo (início, progresso, parada) e a faixa
   * entra no rastro. Faixa pulada antes disso não é reportada, para o Jellyfin não marcá-la como tocada.
   */
  committed: boolean;
}

let active: Active | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let listenTimer: ReturnType<typeof setInterval> | null = null;
let started = false;

function report(a: Active, isPaused: boolean): PlayReport {
  return { itemId: a.track.id, positionS: a.lastPosition, isPaused, playSessionId: a.sessionId };
}

function finish(a: Active) {
  if (a.committed) void safe(reportStopped(report(a, true)));
  for (const l of stopListeners) l(a.track, a.listened, a.startedAt);
}

/** Soma o tempo ouvido desde o último registro (só se estava tocando). */
function accumulate(a: Active, wasPlaying: boolean, now: number) {
  if (wasPlaying) a.listened += Math.max(0, Math.min(now - a.lastTickAt, 2000)) / 1000;
  a.lastTickAt = now;
}

/** Ao atingir o tempo mínimo: avisa o Jellyfin e marca a faixa como tocada (entra no rastro). */
function maybeCommit(a: Active, isPaused: boolean, now: number) {
  if (a.committed || !shouldCommit(a.listened)) return;
  a.committed = true;
  void safe(reportStart(report(a, isPaused)));
  void safe(setLastPlayed(a.track.id, now).then(() => useLibraryStore.getState().bump()));
}

/** Liga o relatório de reprodução ao Jellyfin. Idempotente. */
export function startPlaybackReporter(): () => void {
  if (started) return () => undefined;
  started = true;

  const unsub = usePlayerStore.subscribe((s, prev) => {
    const now = Date.now();

    if (active && s.current?.id === active.track.id) {
      const pos = estimatePosition(s, now);
      accumulate(active, prev.status === 'playing', now);
      // Seek: salto maior que 3 s em relação ao esperado.
      const jumped =
        Math.abs(s.position - prev.position) > 3 && s.positionAt !== prev.positionAt && prev.status !== 'loading';
      active.lastPosition = pos;
      maybeCommit(active, s.status !== 'playing', now);
      if (!active.committed) return;
      if (s.status !== prev.status && (s.status === 'playing' || s.status === 'paused')) {
        void safe(reportProgress(report(active, s.status === 'paused')));
      } else if (jumped) {
        void safe(reportProgress(report(active, s.status !== 'playing')));
      }
      return;
    }

    if (s.current?.id === prev.current?.id && !s.current) return;

    if (active) finish(active);
    active = null;

    if (s.current) {
      active = {
        track: s.current,
        sessionId: Crypto.randomUUID(),
        startedAt: now,
        lastPosition: 0,
        listened: 0,
        lastTickAt: now,
        committed: false,
      };
      const a = active;
      for (const l of startListeners) l(a.track, now);
    }
  });

  // Relógio do tempo ouvido: o store não muda de forma regular durante a reprodução.
  listenTimer = setInterval(() => {
    const s = usePlayerStore.getState();
    if (!active || s.current?.id !== active.track.id) return;
    const now = Date.now();
    accumulate(active, s.status === 'playing', now);
    active.lastPosition = estimatePosition(s, now);
    maybeCommit(active, s.status !== 'playing', now);
  }, LISTEN_TICK_MS);

  timer = setInterval(() => {
    const s = usePlayerStore.getState();
    if (active?.committed && s.status === 'playing') {
      active.lastPosition = estimatePosition(s);
      void safe(reportProgress(report(active, false)));
    }
  }, tuning.playback.progressReportMs);

  return () => {
    unsub();
    if (timer) clearInterval(timer);
    if (listenTimer) clearInterval(listenTimer);
    timer = null;
    listenTimer = null;
    active = null;
    started = false;
  };
}
