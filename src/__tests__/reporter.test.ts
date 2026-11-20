jest.mock('expo-crypto', () => ({ randomUUID: () => 'sessao' }));
jest.mock('@/services/jellyfin/playstate', () => ({
  reportStart: jest.fn(async () => undefined),
  reportProgress: jest.fn(async () => undefined),
  reportStopped: jest.fn(async () => undefined),
}));
jest.mock('@/state/library/repository', () => ({ setLastPlayed: jest.fn(async () => undefined) }));
jest.mock('@/state/library/sync', () => ({ useLibraryStore: { getState: () => ({ bump: jest.fn() }) } }));

import { reportProgress, reportStart, reportStopped } from '@/services/jellyfin/playstate';
import { setLastPlayed } from '@/state/library/repository';
import { usePlayerStore } from '@/state/player';
import { shouldCommit, startPlaybackReporter } from '@/state/reporter';
import { makeTracks } from '@/test-utils/fake-engine';

const [a, b] = makeTracks(2);

function play(track: typeof a | null) {
  usePlayerStore.setState({ current: track, status: track ? 'playing' : 'idle', position: 0, positionAt: Date.now() });
}

describe('tempo mínimo ouvido', () => {
  let stop: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    usePlayerStore.setState({ current: null, status: 'idle', position: 0, positionAt: Date.now() });
    stop = startPlaybackReporter();
  });

  afterEach(() => {
    stop();
    jest.useRealTimers();
  });

  it('regra', () => {
    expect(shouldCommit(19.9, 20)).toBe(false);
    expect(shouldCommit(20, 20)).toBe(true);
  });

  it('faixa pulada antes de 20 s não é reportada nem entra no rastro', () => {
    play(a);
    jest.advanceTimersByTime(8000);
    play(b);
    expect(reportStart).not.toHaveBeenCalled();
    expect(reportStopped).not.toHaveBeenCalled();
    expect(setLastPlayed).not.toHaveBeenCalled();
  });

  it('faixa ouvida 20 s é reportada e marcada; a parada também', () => {
    play(a);
    jest.advanceTimersByTime(19_000);
    expect(reportStart).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    expect(reportStart).toHaveBeenCalledTimes(1);
    expect(setLastPlayed).toHaveBeenCalledWith('t1', expect.any(Number));
    play(b);
    expect(reportStopped).toHaveBeenCalledTimes(1);
  });

  it('tempo pausado não conta', () => {
    play(a);
    jest.advanceTimersByTime(10_000);
    usePlayerStore.setState({ status: 'paused' });
    jest.advanceTimersByTime(60_000);
    expect(reportStart).not.toHaveBeenCalled();
    usePlayerStore.setState({ status: 'playing', positionAt: Date.now() });
    jest.advanceTimersByTime(11_000);
    expect(reportStart).toHaveBeenCalledTimes(1);
  });

  it('sem progresso antes do mínimo', () => {
    play(a);
    jest.advanceTimersByTime(5000);
    usePlayerStore.setState({ status: 'paused' });
    expect(reportProgress).not.toHaveBeenCalled();
  });
});
