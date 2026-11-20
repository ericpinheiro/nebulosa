## 1. Gestos por cima das capas

- [x] 1.1 Camada de capas com `pointerEvents="none"`; remover os `Pressable` dos sprites
- [x] 1.2 `hitTest(x, y)` em `useGalaxyCovers` usando a última posição/tamanho/profundidade de cada slot e `coverHitRadiusPx`; extrair a escolha do candidato para função pura com teste
- [x] 1.3 `GalaxyView`: `onTapAt(x, y)` no gesto de toque; tela principal tenta a capa e, se nada, limpa a seleção e reexibe a interface

## 2. Animações

- [x] 2.1 `entering` próprio: fade in + crescimento com uma única passada (`coverEnterMs`, `coverEnterOvershoot`)
- [x] 2.2 Seleção com `withTiming` (sem mola) e zIndex acima das demais

## 3. Foco em preto e branco

- [x] 3.1 Camada de saturação (`mixBlendMode: 'saturation'`) + véu animados nas capas não selecionadas (confirmar suporte na doc do RN 0.88)
- [x] 3.2 Desfazer a seleção ao tocar fora, ao trocar de capa e ao sair do zoom próximo, com transição das cores
- [x] 3.3 Novos parâmetros em `tuning.ts`

## 4. Validação

- [x] 4.1 `npm run typecheck && npm test && npm run lint` e `CI=1 npx expo export --platform ios`
- [x] 4.2 (build nativo) Pinça e rotação começando em cima das capas com a tela cheia delas
- [x] 4.3 (build nativo) Entrada das capas suave; seleção sem bounce; outras em preto e branco; 2º toque toca a música
