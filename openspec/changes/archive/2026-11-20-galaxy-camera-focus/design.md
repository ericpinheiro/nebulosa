## Context

`orbit.ts` guarda `yaw`, `pitch`, `distance` e `target` (alvo da órbita) e limita a distância entre `cameraMinDistance` (2.5) e `cameraMaxDistance` (34), começando em 26 com alvo `[0,0,0]`. A câmera tem FOV vertical de 50°. Os pontos vêm em [-1, 1] e são multiplicados por `worldRadius` (10), então a nuvem pode chegar a ~10–17 unidades do centro dependendo dos dados. Em retrato (aspecto ~0.46), o FOV horizontal é ~24°, então caber uma esfera de raio r exige d ≈ r / sin(12°) ≈ 4.8·r — bem acima de 34 para r = 10. Por isso as bordas cortam. Além disso, cabeçalho e controles cobrem parte de cima e de baixo da tela.

A música atual já chega à galáxia como `currentId` → `currentIndex` (`GalaxyView`).

## Goals / Non-Goals

**Goals:** galáxia inteira e centralizada ao abrir; zoom máximo que nunca corta; recentro suave na música tocando sem mudar o zoom.

**Non-Goals:** mudar a rotação automática, os gestos em si ou o limite mínimo; recentrar ao tocar numa capa sem tocar música.

## Decisions

### Esfera envolvente
Calcular uma vez por versão dos dados (`boundingSphere(positions)`; centro = média dos pontos, raio = maior distância ao centro, ambos × `worldRadius`), guardada junto com o índice espacial no `useGalaxyStore`. Usar a esfera (e não a caixa) garante que nada corta em qualquer rotação. Alternativa: caixa alinhada recalculada por quadro — mais justa, mas muda com a rotação e faria o zoom "respirar".

### Distância de enquadramento
`fitDistance(radius, viewport, insets, fovV, margin)`: a área livre é a tela menos os recortes de cima e de baixo informados pela tela principal (`GalaxyView` recebe `insets` em px). Com o centro da esfera projetado no meio da área livre, a distância é o maior entre `r / sin(fovV_livre/2)` e `r / sin(fovH/2)`, multiplicado por `1 + margin`. Para o centro ficar no meio da área livre (e não no meio da tela), aplica-se `camera.setViewOffset` deslocando o centro óptico — assim o "centro" visual da galáxia é o centro da área livre, sem mexer no alvo.

### Distância máxima dinâmica
`maxDistance = fitDistance(r + |target − centro|, …)`: com o alvo fora do centro da nuvem, o máximo cresce o suficiente para tudo continuar visível em volta do alvo. `pinch` passa a limitar por esse valor. Se a câmera estava "colada" no máximo (`distance ≥ maxAnterior − ε`) quando o alvo muda, a distância acompanha o novo máximo durante a animação.

### Recentro animado
`orbit.focus = { from, to, t0, durationMs }`; `step()` interpola o alvo com ease-in-out (cúbica) e marca o quadro como ativo (60 fps durante a animação). `GalaxyView` observa `currentIndex`: quando muda para um índice válido, chama `focusOn(orbit, pos)`; se `orbit.interacting`, guarda o pedido e aplica em `endInteraction`. Pan de dois dedos cancela a animação em curso (o usuário assume o controle). Alternativa considerada: mudar só o alvo do `lookAt` sem mover a câmera junto — distorce a órbita e gira em torno do lugar errado.

### Parâmetros
`tuning.galaxy.fitMargin` (ex. 0.08), `focusDurationMs` (ex. 1200); `cameraMaxDistance` e `cameraInitialDistance` saem (passam a ser calculados). `coverZoomDistance` continua absoluto.

## Risks / Trade-offs

- [Galáxia pequena demais em telas muito estreitas] → margem ajustável; o usuário aproxima com pinça.
- [Recentro inesperado enquanto explora capas no zoom próximo] → decisão do usuário: recentrar também na troca automática, mas nunca durante um gesto.
- [`setViewOffset` e projeção das capas] → as capas usam `camera.project`, que já considera a matriz de projeção com o offset; validar no aparelho.
- [Dados reais (UMAP) com outliers aumentam o raio] → opcional: raio pelo percentil 99.5 se ficar pequeno demais; decidir com os dados reais.
