import { getSessionApi } from '@jellyfin/sdk/lib/utils/api';

import { TICKS_PER_SECOND } from '@/config/server';

import { getApi } from './client';

export const secondsToTicks = (s: number): number => Math.max(0, Math.round(s * TICKS_PER_SECOND));

export interface PlayReport {
  itemId: string;
  positionS: number;
  isPaused: boolean;
  playSessionId: string;
}

const common = (r: PlayReport) => ({
  ItemId: r.itemId,
  PositionTicks: secondsToTicks(r.positionS),
  IsPaused: r.isPaused,
  PlaySessionId: r.playSessionId,
  CanSeek: true,
  PlayMethod: 'DirectPlay' as const,
});

export async function reportStart(r: PlayReport): Promise<void> {
  await getSessionApi(getApi()).reportPlaybackStart({ playbackStartInfo: common(r) });
}

export async function reportProgress(r: PlayReport): Promise<void> {
  await getSessionApi(getApi()).reportPlaybackProgress({ playbackProgressInfo: common(r) });
}

export async function reportStopped(r: PlayReport): Promise<void> {
  await getSessionApi(getApi()).reportPlaybackStopped({
    playbackStopInfo: {
      ItemId: r.itemId,
      PositionTicks: secondsToTicks(r.positionS),
      PlaySessionId: r.playSessionId,
    },
  });
}
