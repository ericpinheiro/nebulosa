## 1. Fundo escuro

- [x] 1.1 `mixWithBlack` e `backgroundGradient` escuro em `src/ui/color.ts`; `backgroundDarkMix` em `tuning.ui`
- [x] 1.2 `Background.tsx` e `NowPlayingScreen.tsx` usam o novo parâmetro; interface branca
- [x] 1.3 Atualizar `color.test.ts`

## 2. Cores da galáxia

- [x] 2.1 Rastro azul (`trailColor`, `trailGlowColor`) e comentários de contraste em `tuning.galaxy`
- [x] 2.2 Véu escuro das capas não selecionadas (`coverDimColor`)
- [x] 2.3 Destaque da música tocando visível no fundo escuro: núcleo laranja com ~5x o diâmetro de um ponto normal (acompanha o zoom, mínimo de 6 pt), contorno claro, halo curto (`highlightPointScale`, `highlightMinCorePx`, `highlightOutlineColor`)
- [x] 2.4 Correção: materiais da galáxia criados com `new THREE.ShaderMaterial` (o `<shaderMaterial uniforms>` do r3f copia os uniforms e os valores numéricos — `uVisible`, `uBeat`, `uTime`, `uHasCurrent` — nunca chegavam à GPU: destaque invisível, sem pulsação, rastro sem esmaecer)

## 3. Rastro só após 20 s

- [x] 3.1 `trailMinListenS` em `tuning.playback`
- [x] 3.2 `reporter.ts`: relógio de 1 s somando o tempo ouvido; ao atingir o mínimo, envia início ao Jellyfin, grava `setLastPlayed` e atualiza o rastro; antes disso, sem progresso nem parada
- [x] 3.3 Testes do reporter (faixa pulada não é reportada nem marcada; faixa ouvida 20 s é)

## 4. Validação

- [x] 4.1 `npm run typecheck && npm test && npm run lint` e `CI=1 npx expo export --platform ios`
- [x] 4.2 (build nativo) Fundo escuro com várias capas; rastro azul visível; laranja só na atual; pular faixa antes de 20 s não entra no rastro
