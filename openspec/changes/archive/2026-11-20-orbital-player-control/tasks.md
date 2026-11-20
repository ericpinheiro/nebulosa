## 1. Base

- [x] 1.1 `npx expo install react-native-svg` (módulo nativo — exige novo dev build)
- [x] 1.2 Adicionar `tuning.ui.orb` (tamanho, espessura do anel, `innerRatio`, `ringSlop`, `swipeThresholdPx`, `swipeMaxPx`, `seekStepS`)

## 2. Lógica pura

- [x] 2.1 `src/ui/now-playing/orb-math.ts`: `classifyTouch`, `angleOf`, `unwrapAngle` (depois trocado por `scrubFraction`, ver 6.2), `angleToFraction`, `swipeAction`, `rubberBand`
- [x] 2.2 Testes em `src/__tests__/orb.test.ts` (centro vs. anel, quarto de volta, cruzar o topo nos dois sentidos, limiar do arrasto, fling)

## 3. Componente

- [x] 3.1 `OrbControl.tsx`: anel SVG animado com a posição (início no topo, sentido horário) e ícone tocar/pausar
- [x] 3.2 Gesto do centro: tap = `toggle`; pan horizontal com resistência, ícone de pista, haptic ao passar o limiar, `next`/`previous` ao soltar e retorno suave
- [x] 3.3 Gesto do anel: seek circular com rótulo de tempo durante o arrasto e `seek` ao soltar
- [x] 3.4 Ações de acessibilidade (tocar/pausar, próxima, anterior, avançar/voltar `seekStepS`)
- [x] 3.5 Avisar interação ativa para a interface não se esconder durante o gesto

## 4. Tela principal

- [x] 4.1 Ícones SVG de traço fino para biblioteca e aleatório, sem círculo
- [x] 4.2 Linha inferior em `NowPlayingScreen`: biblioteca · botão orbital · aleatório; sem música, só a biblioteca na mesma posição
- [x] 4.3 Remover `ProgressBar.tsx` e `Controls.tsx` e seus usos

## 5. Validação

- [x] 5.1 `npm run typecheck && npm test && npm run lint` e `CI=1 npx expo export --platform ios`
- [x] 5.2 (build nativo) Tocar/pausar, arrastar para os dois lados (curto e longo), seek circular cruzando o topo, VoiceOver
- [x] 5.3 (build nativo) Ajustar `tuning.ui.orb` no aparelho

## 6. Ajustes após o teste no aparelho

- [x] 6.1 Ícones ⏮ ▶ ⏭ dentro do anel; no arrasto, o ícone da ação substitui o tocar/pausar (`swipeProgress`), sem mover o anel
- [x] 6.2 Seek relativo girando o dedo (`angleDelta`, `scrubFraction`), sem salto ao tocar no anel; tap em qualquer parte = tocar/pausar
- [x] 6.3 Testes do seek relativo e da troca de ícone
- [x] 6.4 (build nativo) Conferir no aparelho (arrasto corrigido: estado do gesto em `useRef`)
- [x] 6.5 Ícones de anterior/próxima em traço fino (`PreviousLineIcon`/`NextLineIcon`), só a seta aberta (‹ ›), mesmo estilo da biblioteca e do aleatório; botão maior (`size` 100)
