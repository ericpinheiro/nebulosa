import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  IOSCategory,
  State,
  type Track,
} from 'react-native-track-player';

import { authorizationHeader } from '../jellyfin/client';
import type { AudioEngine, EngineEvents, EngineState, PlayerTrack } from './types';
import { imageUrl, streamUrl } from './urls';

type Handlers = { [K in keyof EngineEvents]: Set<EngineEvents[K]> };

function mapState(state: State | undefined): EngineState {
  switch (state) {
    case State.Playing:
      return 'playing';
    case State.Paused:
    case State.Ready:
    case State.Stopped:
      return 'paused';
    case State.Loading:
    case State.Buffering:
      return 'loading';
    case State.Ended:
      return 'ended';
    case State.Error:
      return 'error';
    default:
      return 'idle';
  }
}

/** Adaptador do react-native-track-player para a interface AudioEngine. */
export function createRntpEngine(getUserId: () => string): AudioEngine {
  const handlers: Handlers = { state: new Set(), advanced: new Set(), ended: new Set(), error: new Set() };
  let ready: Promise<void> | null = null;
  let suppressAdvance = false;
  const byId = new Map<string, PlayerTrack>();

  const emit = <K extends keyof EngineEvents>(event: K, ...args: Parameters<EngineEvents[K]>) => {
    for (const h of handlers[event]) (h as (...a: Parameters<EngineEvents[K]>) => void)(...args);
  };

  const toTrack = (t: PlayerTrack): Track => {
    byId.set(t.id, t);
    return {
      id: t.id,
      url: streamUrl(t.id, getUserId()),
      title: t.title,
      artist: t.artist,
      album: t.album ?? undefined,
      artwork: imageUrl(t.imageItemId, t.imageTag, 600),
      duration: t.durationMs / 1000,
      headers: { Authorization: authorizationHeader() },
    };
  };

  async function doSetup() {
    try {
      await TrackPlayer.setupPlayer({
        iosCategory: IOSCategory.Playback,
        autoHandleInterruptions: true,
        autoUpdateMetadata: true,
        waitForBuffer: true,
      });
    } catch (e) {
      // Já configurado (ex.: recarga do JS em desenvolvimento).
      if (!String(e).includes('already been initialized')) throw e;
    }
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      progressUpdateEventInterval: 1,
      android: { appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification },
    });

    TrackPlayer.addEventListener(Event.PlaybackState, (e) => emit('state', mapState(e.state)));
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (e) => {
      if (suppressAdvance) return;
      if (e.index != null && e.index > 0 && e.track?.id) {
        const t = byId.get(String(e.track.id));
        if (t) emit('advanced', t);
      }
    });
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => emit('ended'));
    TrackPlayer.addEventListener(Event.PlaybackError, (e) => emit('error', e.message));
  }

  return {
    setup() {
      ready ??= doSetup();
      return ready;
    },
    async load(window, { play, position }) {
      await this.setup();
      suppressAdvance = true;
      try {
        byId.clear();
        await TrackPlayer.reset();
        await TrackPlayer.add(window.map(toTrack));
        if (position) await TrackPlayer.seekTo(position);
      } finally {
        suppressAdvance = false;
      }
      if (play) await TrackPlayer.play();
    },
    async append(track) {
      await TrackPlayer.add(toTrack(track));
    },
    async replaceUpcoming(tracks) {
      await TrackPlayer.removeUpcomingTracks();
      if (tracks.length > 0) await TrackPlayer.add(tracks.map(toTrack));
    },
    async trimPlayed() {
      const active = await TrackPlayer.getActiveTrackIndex();
      if (active == null || active === 0) return;
      suppressAdvance = true;
      try {
        await TrackPlayer.remove(Array.from({ length: active }, (_, i) => i));
      } finally {
        suppressAdvance = false;
      }
    },
    play: () => TrackPlayer.play(),
    pause: () => TrackPlayer.pause(),
    async stop() {
      await TrackPlayer.reset();
      byId.clear();
    },
    seekTo: (s) => TrackPlayer.seekTo(s),
    async getProgress() {
      const p = await TrackPlayer.getProgress();
      return { position: p.position, duration: p.duration, buffered: p.buffered };
    },
    on(event, handler) {
      handlers[event].add(handler as never);
      return () => handlers[event].delete(handler as never);
    },
  };
}
