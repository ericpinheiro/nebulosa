## Context

Hoje `NowPlayingScreen` empilha `ProgressBar` (barra horizontal com Pan/Tap) e `Controls` (anterior, play com anel, próxima, aleatório) e, abaixo, um botão de biblioteca de 56 px com borda e fundo translúcido. O player expõe `toggle`, `next`, `previous` (com o limite `previousRestartThresholdS`), `seek` e `estimatePosition`. Gestos usam `react-native-gesture-handler` 3 e animações Reanimated 4. Não há biblioteca de SVG no projeto.

## Goals / Non-Goals

**Goals:**
- Um único controle com tocar/pausar, trocar faixa por arrasto e seek circular, fluido a 60 fps (UI thread).
- Linha inferior simétrica: biblioteca · botão orbital · aleatório, ícones de traço fino sem círculo.
- Lógica dos gestos em funções puras testáveis.

**Non-Goals:** mudar o mini player da biblioteca; mudar o comportamento do player; gestos na galáxia.

## Decisions

### Desenho do anel com `react-native-svg`
Anel de fundo (cor do texto com baixa opacidade) + arco de progresso via `strokeDasharray`/`strokeDashoffset` animado (`useAnimatedProps`), girado -90° para começar no topo. Alternativas: truque das duas metades com `View` rotacionadas (sem dependência, mas complicado para arco suave e ponta arredondada); Skia (pesado demais para isso). `react-native-svg` é a opção recomendada pelo Expo e também serve para os ícones de traço fino.

### Áreas de toque por raio
O ponto inicial do toque decide o gesto (`classifyTouch` em `orb-math.ts`):
- `r ≤ innerRatio · raio` → **centro**: pan horizontal = trocar faixa.
- `innerRatio · raio < r ≤ raio + ringSlop` → **anel**: pan = seek circular relativo.
- Tap em qualquer uma das duas = tocar/pausar (o anel não faz seek por toque).
Um único `Gesture.Pan` (com `minDistance` pequeno) + `Gesture.Tap` em `Exclusive`, decidindo o modo no `onBegin` pelo ponto do toque. O tamanho do botão cresce para ~84 px (anel ~3 px) para o anel ser alcançável; a área de toque do anel tem folga extra (`ringSlop`).

### Arrasto para trocar faixa
Em repouso o botão mostra ⏮ ▶ ⏭ dentro do anel (laterais pequenas, `sideIconOffset`/`sideIconOpacity`). `swipeProgress(dx, threshold)` ∈ [-1, 1] dirige a troca: os três ícones somem e o ícone da ação cresce no centro, completo no limiar. Só os ícones deslizam um pouco com o dedo (`rubberBand`, `swipeMaxPx` pequeno); o anel fica parado. No limiar, uma vibração leve (`expo-haptics`) marca que soltar vai confirmar; ao soltar: chama `next()`/`previous()` e volta com `withSpring` suave (sem overshoot exagerado). Velocidade alta (fling) também confirma. Arrasto vertical é ignorado (`activeOffsetX`, `failOffsetY` só no modo centro).

### Seek circular relativo
`angleOf(x, y)` → ângulo a partir do topo no sentido horário em [0, 2π). O seek parte da posição atual (não do ponto tocado): a cada evento, `scrubFraction(fração, ânguloAnterior, ângulo)` soma a menor diferença de ângulo (`angleDelta`) dividida por 2π e prende em [0, 1]. Uma volta = a música toda, então a ponta do arco anda junto com o dedo. Vibração leve ao bater no começo/fim. O ângulo inicial é guardado no `onBegin` para não perder o começo do giro. Tempo mostrado num rótulo pequeno acima do botão (atual / total); `seek` só ao soltar. A posição em repouso vem de `estimatePosition`, lida num `useFrameCallback`/intervalo de 250 ms e animada com `withTiming` linear para o anel andar contínuo.

### Ícones minimalistas
Biblioteca e aleatório como SVG de traço fino (mesmo peso do anel, ~1.5 px), sem borda nem fundo; área de toque de 44 px. Biblioteca: três lombadas, a última inclinada. Aleatório: setas cruzadas; desligado com opacidade reduzida.

### Interface que se esconde
Enquanto um gesto do botão está ativo, a tela avisa `onInteraction(true)` (mesmo mecanismo da galáxia) para a interface não sumir no meio do arrasto.

### Parâmetros
`tuning.ui.orb = { size, ringWidth, innerRatio, ringSlop, swipeThresholdPx, swipeMaxPx, seekStepS }`.

## Risks / Trade-offs

- [Nova dependência nativa] → `npx expo install react-native-svg`; exige novo dev build (registrar nas tarefas).
- [Conflito com o gesto do painel/galáxia] → o botão fica na camada da interface acima da galáxia; o painel só abre pelo botão da biblioteca.
- [Arrastar no anel por engano ao querer tocar/pausar] → `innerRatio` e `ringSlop` ajustáveis no aparelho; tap no centro tem prioridade.
- [Descoberta dos gestos] → ícones de pista aparecem no arrasto; a ação acessível cobre leitores de tela.
