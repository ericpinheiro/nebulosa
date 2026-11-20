import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Serviço de reprodução do RNTP: recebe os comandos da tela de bloqueio,
 * central de controle e fones, e repassa ao store do player.
 */
export async function PlaybackService(): Promise<void> {
  // require tardio: evita ciclo de import com o store do player.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const player = () => require('@/state/player').usePlayerStore.getState() as import('@/state/player').PlayerState;
  TrackPlayer.addEventListener(Event.RemotePlay, () => void player().play());
  TrackPlayer.addEventListener(Event.RemotePause, () => void player().pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => void player().pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => void player().next());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => void player().previous());
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => void player().seek(e.position));
}
