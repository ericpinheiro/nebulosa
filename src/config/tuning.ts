/**
 * Parâmetros ajustáveis do Nebulosa, reunidos num só lugar.
 * Mude aqui para ajustar a sensação da galáxia e da interface sem caçar valores no código.
 */
export const tuning = {
  galaxy: {
    /** Cor base dos pontos. Preparado para cor por agrupamento no futuro (campo `group`). */
    pointColor: '#ffffff',
    /** Cor de destaque da música tocando (exclusiva dela): laranja saturado sobre o fundo escuro. */
    highlightColor: '#ff6a00',
    /** Contorno fino do núcleo do destaque (claro, para separar do fundo escuro e dos pontos). */
    highlightOutlineColor: '#ffffff',
    /** Diâmetro do núcleo do destaque em relação a um ponto normal (acompanha o zoom como os outros pontos). */
    highlightPointScale: 5,
    /** Diâmetro mínimo do núcleo na tela, em pt, para não sumir no zoom bem afastado. */
    highlightMinCorePx: 6,
    /** Quanto o anel do destaque se expande no pico da energia (fração do raio). */
    highlightRingBeat: 0.25,
    /** Cor do rastro das músicas tocadas recentemente (azul, para não confundir com a música atual). */
    trailColor: '#4da3ff',
    /** Cor do halo ("sombra") em volta dos pontos do rastro. */
    trailGlowColor: '#1f6fd6',
    /** Tamanho do ponto do rastro com o halo, em relação ao ponto normal. */
    trailGlowScale: 3.2,
    /** Duração do rastro, em horas. Depois disso o ponto volta à cor normal. */
    trailHours: 24,
    /** Tamanho base do ponto, em pixels (multiplicado pela densidade da tela). */
    pointSize: 2.2,
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
    /** Distância mínima da câmera (mais perto). A máxima e a inicial são calculadas para caber a galáxia inteira. */
    cameraMinDistance: 2.5,
    /** Folga em volta da galáxia no enquadramento máximo (0.08 = 8%). */
    fitMargin: 0.08,
    /** Duração do deslize do centro da órbita até a música tocando, em ms. */
    focusDurationMs: 1200,
    /** Abaixo dessa distância os pontos viram capas (zoom próximo). */
    coverZoomDistance: 9,
    /** Máximo de capas simultâneas no zoom próximo. */
    maxCovers: 40,
    /** Tamanho da miniatura de capa pedida ao servidor, em px. */
    coverThumbSize: 96,
    /** Tamanho da capa no mundo 3D e escala ao receber o primeiro toque. */
    coverWorldSize: 0.55,
    coverSelectedScale: 1.6,
    /** Entrada da capa: fade + crescimento até passar um pouco do tamanho (uma vez) e voltar. */
    coverEnterMs: 220,
    coverSettleMs: 160,
    coverEnterOvershoot: 1.06,
    /** Duração do aumento da capa selecionada (sem mola). */
    coverSelectMs: 200,
    /** Véu claro sobre as capas fora de foco (além do preto e branco), 0..1. */
    coverDimOpacity: 0.3,
    /** Cor do véu sobre as capas não selecionadas (escura, combinando com o fundo). */
    coverDimColor: '#0b0b0f',
    /** Raio de toque em pixels para encontrar uma capa no zoom próximo. */
    coverHitRadiusPx: 34,
    /** Pulsação dos vizinhos com o som (deslocamento relativo ao raio, na distância de referência). */
    beatAmplitude: 0.05,
    /** Distância da câmera em que `beatAmplitude` vale como está; mais longe, o deslocamento cresce junto. */
    beatReferenceDistance: 14,
    /** Brilho e aumento de tamanho dos vizinhos no pico da energia. */
    beatGlow: 0.6,
    beatGrow: 0.8,
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
    /** Mistura da cor da capa com preto no fundo (0 = cor pura, 1 = preto). */
    backgroundDarkMix: 0.7,
    /** Opacidade do degradê de fundo. */
    backgroundOpacity: 0.85,
    /** Duração da transição de cor do fundo, em ms. */
    backgroundTransitionMs: 1200,
    /** Botão orbital: tocar/pausar no centro, arrastar para trocar de faixa, anel de progresso com seek. */
    orb: {
      /** Diâmetro do botão, em pt. */
      size: 100,
      /** Espessura do anel de progresso, em pt. */
      ringWidth: 3,
      /** Até que fração do raio o toque conta como "centro" (fora disso é o anel). */
      innerRatio: 0.62,
      /** Folga de toque fora do anel, em pt. */
      ringSlop: 14,
      /** Arrasto horizontal mínimo para trocar de faixa, em pt. */
      swipeThresholdPx: 44,
      /** Deslocamento máximo dos ícones (dentro do anel) acompanhando o dedo, em pt. */
      swipeMaxPx: 10,
      /** Distância do centro até os ícones pequenos de anterior/próxima, em pt. */
      sideIconOffset: 29,
      /** Opacidade dos ícones pequenos de anterior/próxima em repouso. */
      sideIconOpacity: 0.6,
      /** Velocidade (pt/s) que confirma a troca mesmo com arrasto curto. */
      swipeVelocity: 700,
      /** Passo de avançar/voltar pelo leitor de tela, em segundos. */
      seekStepS: 15,
    },
  },
  playback: {
    /** Intervalo de relatório de progresso ao Jellyfin, em ms. */
    progressReportMs: 10_000,
    /** Tempo ouvido para a faixa contar como tocada: entra no rastro e é reportada ao Jellyfin, em segundos. */
    trailMinListenS: 20,
    /** Até quantos segundos "anterior" volta para a faixa anterior em vez de reiniciar. */
    previousRestartThresholdS: 3,
  },
  energy: {
    /** Amostras de energia por segundo no envelope. */
    sampleRate: 20,
  },
} as const;

export type Tuning = typeof tuning;
