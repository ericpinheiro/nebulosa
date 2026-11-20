/** Faixa como o player enxerga: o mínimo para tocar e mostrar na tela de bloqueio. */
export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  albumId: string | null;
  durationMs: number;
  /** Item cuja imagem Primary é a capa (álbum ou a própria faixa) e sua tag. */
  imageItemId: string | null;
  imageTag: string | null;
}

export type EngineState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export interface EngineProgress {
  /** Segundos. */
  position: number;
  duration: number;
  buffered: number;
}

export interface EngineEvents {
  state: (state: EngineState) => void;
  /** O motor passou sozinho para a próxima faixa da janela (fim natural da anterior). */
  advanced: (track: PlayerTrack) => void;
  /** A janela acabou (última faixa terminou). */
  ended: () => void;
  error: (message: string) => void;
}

/**
 * Interface do motor de áudio. Telas e stores dependem só dela,
 * para trocar react-native-track-player por outro motor sem mexer na UI.
 */
export interface AudioEngine {
  setup(): Promise<void>;
  /** Substitui a janela: a primeira é a atual; as seguintes ficam pré-carregadas. */
  load(window: PlayerTrack[], options: { play: boolean; position?: number }): Promise<void>;
  /** Acrescenta uma faixa ao fim da janela (pré-carregamento). */
  append(track: PlayerTrack): Promise<void>;
  /** Troca as faixas seguintes à atual sem interromper a reprodução. */
  replaceUpcoming(tracks: PlayerTrack[]): Promise<void>;
  /** Remove da janela as faixas já tocadas, mantendo a atual. */
  trimPlayed(): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seekTo(seconds: number): Promise<void>;
  getProgress(): Promise<EngineProgress>;
  on<K extends keyof EngineEvents>(event: K, handler: EngineEvents[K]): () => void;
}
