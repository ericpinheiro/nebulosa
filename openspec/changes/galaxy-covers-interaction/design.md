## Context

`useGalaxyCovers` posiciona até 40 `CoverSprite` sobre os pontos a cada quadro (`frame` compartilhado com x, y, escala, visível, zIndex por slot). Cada sprite tem `entering={BounceIn.duration(500)}`, um `Pressable` e escala de seleção com `withSpring(damping 12)`. A camada de capas é `children` de `GalaxyView`, renderizada **acima** do `GestureDetector`; por isso toques que começam numa capa vão para o `Pressable` e não para a pinça/rotação. `tuning.galaxy.coverHitRadiusPx` (34) existe mas não é usado.

## Goals / Non-Goals

**Goals:** gestos em qualquer lugar; entrada suave com no máximo uma passada; seleção sem mola e com foco por preto e branco.

**Non-Goals:** mudar quantas/quais capas aparecem; mudar o "2º toque toca".

## Decisions

### Toque detectado pela galáxia
A camada de capas passa a `pointerEvents="none"`. `useGalaxyCovers` guarda numa ref (JS) a última posição/tamanho/profundidade de cada slot e expõe `hitTest(x, y) → index | null`: candidatos cujo centro está a até `max(coverHitRadiusPx, metade do tamanho na tela)` do toque, escolhendo o de menor profundidade. `GalaxyView` passa a chamar `onTapAt(x, y)` no `Tap` (coordenadas locais); a tela principal tenta `covers.hitTest` e, se nada, limpa a seleção e reexibe a interface. Como o `Tap` já disputa em `Race` com rotação/pinça, encostar numa capa e arrastar vira rotação, não seleção.
Alternativa: manter `Pressable` e usar `simultaneousWithExternalGesture` — frágil com 40 botões e não resolve a pinça começando com um dedo em cada capa.

### Entrada com uma passada
Animação `entering` própria (worklet): `opacity` 0 → 1 em ~220 ms; `scale` 0,6 → `coverEnterOvershoot` (ex. 1,06) em ~220 ms ease-out e → 1 em ~140 ms ease-in-out (`withSequence` de `withTiming`). Saída continua `FadeOut` curto.

### Seleção sem mola
`scale` com `withTiming(selected ? coverSelectedScale : 1, { duration: 200, easing: Easing.out(Easing.cubic) })`. A capa selecionada recebe zIndex acima de todas (somado ao zIndex por profundidade).

### Preto e branco nas outras
Cada sprite recebe `dimmed = selected != null && selected !== i` e anima uma camada por cima da capa com `mixBlendMode: 'saturation'` (cor cinza neutra) e um véu leve para esmaecer, com `opacity` 0 → 1 em ~200 ms. `mixBlendMode` é suportado no iOS e Android com a New Architecture (RN ≥ 0.77; o projeto está em 0.88) — confirmar na documentação da versão. Alternativas: `filter: grayscale()` do RN (no iOS só aceita brilho/opacidade); imagem P&B via servidor (Jellyfin não oferece); `react-native-svg` com `feColorMatrix` (mais pesado por capa).

### Parâmetros
`tuning.galaxy`: `coverEnterMs`, `coverEnterOvershoot`, `coverSelectMs`, `coverDimOpacity`; `coverHitRadiusPx` passa a ser usado.

## Risks / Trade-offs

- [Teste de toque com um quadro de atraso] → irrelevante na prática (capas se movem devagar); usar a última posição publicada.
- [`mixBlendMode` não funcionar em algum caso com `expo-image`] → fallback: só esmaecer (opacidade) e registrar no aparelho.
- [Perder o feedback de "pressionado" do `Pressable`] → a própria seleção (crescer + P&B) é o feedback; haptic leve opcional na seleção.
