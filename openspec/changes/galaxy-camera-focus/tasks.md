## 1. Geometria

- [x] 1.1 `boundingSphere(positions)` em `src/galaxy/` com teste; guardar no `useGalaxyStore` junto com o índice
- [x] 1.2 `fitDistance(radius, viewport, insets, fov, margin)` em `orbit.ts` com testes (retrato, paisagem, recortes)
- [x] 1.3 Parâmetros `fitMargin` e `focusDurationMs` em `tuning.ts`; remover `cameraMaxDistance`/`cameraInitialDistance`

## 2. Órbita

- [x] 2.1 Distância máxima dinâmica (depende do alvo) usada por `pinch` e pelo enquadramento inicial
- [x] 2.2 `focusOn` + interpolação do alvo em `step()` (ease-in-out, quadro ativo), acompanhando o máximo quando a câmera está no limite
- [x] 2.3 Pedido de recentro adiado durante gesto e aplicado em `endInteraction`; pan de dois dedos cancela a animação
- [x] 2.4 Testes em `orbit.test.ts` (recentro, adiamento, cancelamento, limite)

## 3. Integração

- [x] 3.1 `NowPlayingScreen` mede cabeçalho e linha de controles e passa os recortes para `GalaxyView`
- [x] 3.2 `GalaxyView`/`CameraRig`: enquadramento inicial com centro da nuvem, `setViewOffset` para centralizar na área livre, recalcular ao mudar tamanho/dados
- [x] 3.3 `GalaxyView` chama `focusOn` quando `currentIndex` muda para um ponto válido

## 4. Validação

- [x] 4.1 `npm run typecheck && npm test && npm run lint` e `CI=1 npx expo export --platform ios`
- [ ] 4.2 (build nativo) Abrir o app: galáxia inteira e centralizada; afastar ao máximo girando sem cortes
- [ ] 4.3 (build nativo) Tocar música pela capa, pela biblioteca e por troca automática; conferir que espera o gesto terminar
