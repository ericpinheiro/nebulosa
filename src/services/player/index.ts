import { useSessionStore } from '@/state/session';

import { createRntpEngine } from './rntp-engine';
import type { AudioEngine } from './types';

let engine: AudioEngine | null = null;

/** Motor de áudio atual. Trocar o motor = trocar esta fábrica. */
export function getEngine(): AudioEngine {
  engine ??= createRntpEngine(() => useSessionStore.getState().session?.userId ?? '');
  return engine;
}

/** Para testes. */
export function setEngine(e: AudioEngine | null): void {
  engine = e;
}

export type { AudioEngine, PlayerTrack, EngineState, EngineProgress } from './types';
