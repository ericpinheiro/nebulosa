## 1. Diagnóstico

- [x] 1.1 Log em `__DEV__` de `source` da galáxia, `currentIndex` e envelope carregado ao trocar de música
- [x] 1.2 Garantir que `useGalaxyStore.load()` gere o mock quando a biblioteca local já tem faixas (sem depender da transição para `done`) — verificado: já acontece no `load()` da montagem; sem mudança de código
- [x] 1.3 Corrigir qualquer outra falha encontrada (ids, envelope) — nenhuma: a comparação por posição não perdia precisão; o problema era visibilidade

## 2. Destaque da música tocando

- [x] 2.1 Atributo `aIndex` + uniforme `uCurrentIndex` no shader da nuvem (substitui a comparação por posição)
- [x] 2.2 Componente `CurrentHighlight` (um vértice) com núcleo, contorno, halo com tamanho mínimo na tela e anel guiado pelo beat
- [x] 2.3 Halo parado (sem anel pulsando) com a música pausada

## 3. Pulsação dos vizinhos

- [x] 3.1 Deslocamento proporcional à distância da câmera (`uCameraDistance`)
- [x] 3.2 Brilho e tamanho extra no pico da energia dentro do raio

## 4. Rastro

- [x] 4.1 `vTrail` + halo colorido no fragment shader e tamanho maior para pontos com rastro
- [x] 4.2 Novas cores (`trailColor` saturado, `trailGlowColor`) e `trailGlowScale` em `tuning.ts`

## 5. Validação

- [x] 5.1 `npm run typecheck && npm test && npm run lint` e `CI=1 npx expo export --platform ios`
- [x] 5.2 (build nativo) Música tocando visível no zoom máximo e intermediário, com capas claras e escuras
- [x] 5.3 (build nativo) Vizinhos vibrando tocando e parados pausado; rastro fácil de ver
- [x] 5.4 (build nativo) Ajustar cores e intensidades em `tuning.ts`; conferir fps
