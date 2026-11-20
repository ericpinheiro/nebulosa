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

interface Active {
  track: PlayerTrack;
  sessionId: string;
  startedAt: number;
  lastPosition: number;
  /** Segundos efetivamente ouvidos (para scrobble). */
  listened: number;
  lastTickAt: number;
}

let active: Active | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let started = false;

function report(a: Active, isPaused: boolean): PlayReport {
  return { itemId: a.track.id, positionS: a.lastPosition, isPaused, playSessionId: a.sessionId };
}

function finish(a: Active) {
  void safe(reportStopped(report(a, true)));
  for (const l of stopListeners) l(a.track, a.listened, a.startedAt);
}

/** Liga o relatório de reprodução ao Jellyfin. Idempotente. */
export function startPlaybackReporter(): () => void {
  if (started) return () => undefined;
  started = true;

  const unsub = usePlayerStore.subscribe((s, prev) => {
    const now = Date.now();

    if (active && s.current?.id === active.track.id) {
      const pos = estimatePosition(s, now);
      if (prev.status === 'playing') active.listened += Math.max(0, Math.min(now - active.lastTickAt, 2000)) / 1000;
      active.lastTickAt = now;
      // Seek: salto maior que 3 s em relação ao esperado.
      const jumped =
        Math.abs(s.position - prev.position) > 3 && s.positionAt !== prev.positionAt && prev.status !== 'loading';
      active.lastPosition = pos;
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
      };
      const a = active;
      void safe(reportStart(report(a, false)));
      void safe(setLastPlayed(a.track.id, now).then(() => useLibraryStore.getState().bump()));
      for (const l of startListeners) l(a.track, now);
    }
  });

  timer = setInterval(() => {
    const s = usePlayerStore.getState();
    if (active && s.status === 'playing') {
      active.lastPosition = estimatePosition(s);
      void safe(reportProgress(report(active, false)));
    }
  }, tuning.playback.progressReportMs);

  return () => {
    unsub();
    if (timer) clearInterval(timer);
    timer = null;
    started = false;
  };
}
