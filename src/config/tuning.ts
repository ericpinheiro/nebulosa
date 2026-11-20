/**
 * Parâmetros ajustáveis do Nebulosa, reunidos num só lugar.
 * Mude aqui para ajustar a sensação da galáxia e da interface sem caçar valores no código.
 */
export const tuning = {
  galaxy: {
    /** Cor base dos pontos. Preparado para cor por agrupamento no futuro (campo `group`). */
    pointColor: '#ffffff',
    /** Cor de destaque da música tocando (a definir no protótipo). */
    highlightColor: '#ffd27a',
    /** Cor do rastro das músicas tocadas recentemente. */
    trailColor: '#ffe6b0',
    /** Duração do rastro, em horas. Depois disso o ponto volta à cor normal. */
    trailHours: 24,
    /** Tamanho base do ponto, em pixels (multiplicado pela densidade da tela). */
    pointSize: 2.2,
    /** Escala do ponto da música tocando em relação ao normal. */
    highlightScale: 2.6,
    /** Raio da nuvem em unidades do mundo (posições vêm normalizadas em [-1, 1]). */
    worldRadius: 10,
    /** Velocidade da rotação automática, em radianos por segundo. */
    autoRotateSpeed: 0.04,
    /** Tempo parado depois de um gesto até a rotação automática voltar, em ms. */
    autoRotateResumeMs: 4000,
    /** Sensibilidade do arrasto para girar (radianos por pixel). */
    dragSensitivity: 0.005,
    /** Inércia do arrasto (0 = para na hora, perto de 1 = desliza muito). */
    dragDamping: 0.92,
    /** Distância da câmera: mínima (mais perto), máxima e inicial. */
    cameraMinDistance: 2.5,
    cameraMaxDistance: 34,
    cameraInitialDistance: 26,
    /** Abaixo dessa distância os pontos viram capas (zoom próximo). */
    coverZoomDistance: 9,
    /** Máximo de capas simultâneas no zoom próximo. */
    maxCovers: 40,
    /** Tamanho da miniatura de capa pedida ao servidor, em px. */
    coverThumbSize: 96,
    /** Tamanho da capa no mundo 3D e escala ao receber o primeiro toque. */
    coverWorldSize: 0.55,
    coverSelectedScale: 1.6,
    /** Raio de toque em pixels para encontrar uma capa no zoom próximo. */
    coverHitRadiusPx: 34,
    /** Pulsação da música tocando (amplitude relativa, frequência em Hz). */
    highlightPulseAmplitude: 0.18,
    highlightPulseHz: 0.8,
    /** Pulsação dos vizinhos com o som. */
    beatAmplitude: 0.06,
    /** Raio de alcance da pulsação, em unidades do mundo. */
    beatRadius: 3.2,
    /** FPS alvo: com gesto/zoom e em rotação automática (economia de bateria). */
    fpsActive: 60,
    fpsIdle: 30,
  },
  radio: {
    /** Quantas músicas vizinhas entram na fila do rádio. */
    queueSize: 50,
  },
  ui: {
    /** Tempo sem toque até esconder a interface, em ms. */
    hideUiAfterMs: 10_000,
    /** Mistura da cor da capa com branco no fundo (0 = cor pura, 1 = branco). */
    backgroundWhiteMix: 0.62,
    /** Opacidade do degradê de fundo. */
    backgroundOpacity: 0.85,
    /** Duração da transição de cor do fundo, em ms. */
    backgroundTransitionMs: 1200,
  },
  playback: {
    /** Intervalo de relatório de progresso ao Jellyfin, em ms. */
    progressReportMs: 10_000,
    /** Até quantos segundos "anterior" volta para a faixa anterior em vez de reiniciar. */
    previousRestartThresholdS: 3,
  },
  energy: {
    /** Amostras de energia por segundo no envelope. */
    sampleRate: 20,
  },
} as const;

export type Tuning = typeof tuning;
