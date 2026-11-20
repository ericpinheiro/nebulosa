## Context

Tudo é um único `THREE.Points` com shader próprio (`shaders.ts`). O ponto atual é detectado no vertex shader comparando `position` com `uCurrent` (`step(0.0005, d)`); ele recebe `highlightScale` 2,6× do tamanho base 2,2 e a cor `#ffd27a`. O rastro mistura `#ffe6b0` e aumenta o ponto até 1,6×. A pulsação desloca vizinhos em `beatAmplitude · worldRadius` = 0,6 unidade dentro de `beatRadius` 3,2. O fundo é um degradê claro (`Background.tsx`, mistura com 62% de branco, opacidade 0,85), com pontos brancos e semitransparentes por cima.

Possíveis causas de "não aparece": (a) contraste baixo; (b) tamanho pequeno (~4 px lógicos no zoom inicial); (c) `currentIndex = -1` se a galáxia ainda estiver com os pontos decorativos (o mock só é regerado quando a sincronização transita para `done`) ou se os ids não baterem; (d) envelope não carregado. (a) e (b) já explicam o sintoma, mas (c) e (d) precisam ser descartados.

## Goals / Non-Goals

**Goals:** música atual e região em volta inconfundíveis; rastro visível sobre fundo claro; tudo em GPU, sem custo extra relevante.

**Non-Goals:** cor por agrupamento; mudar o fundo; mudar a janela de 24 h.

## Decisions

### Diagnóstico primeiro
Log em `__DEV__` (`source`, `currentIndex`, envelope carregado) e um teste para o caso "sincronização já concluída ao abrir" no `useGalaxyStore`: se a biblioteca local já tem faixas, `load()` gera o mock na hora (hoje depende da transição para `done`). Corrigir o que aparecer.

### Índice em vez de posição
Novo atributo `aIndex` (float) e uniforme `uCurrentIndex`; `isCurrent = 1 − step(0.5, abs(aIndex − uCurrentIndex))`. Evita falhas de precisão e pontos coincidentes.

### Destaque em objeto separado
Um segundo `THREE.Points` com um único vértice na posição atual, desenhado depois da nuvem, com shader de halo: núcleo sólido + halo radial + anel cujo raio/opacidade seguem `uBeat`. Tamanho em pixels com mínimo de tela (`highlightMinPx`), para não sumir com zoom afastado. Mistura normal (não aditiva): mistura aditiva some sobre fundo claro. Cor de destaque mais escura e saturada (ex. âmbar profundo) com borda escura fina para contraste. Alternativa: fazer tudo no shader da nuvem — limitado porque `gl_PointSize` do ponto atual teria de ser enorme e o halo competiria com o depth/ordem de desenho.

### Vizinhos mais vivos
Deslocamento = `beat · beatAmp · distânciaDaCâmera/distânciaRef · falloff` (perceptível no zoom afastado, contido no próximo, onde já é desligado) e, no mesmo falloff, `+brilho` e `+tamanho` proporcionais ao beat (`beatGlow`, `beatGrow`).

### Halo do rastro ("sombra")
No fragment shader, novo `vTrail`: além do núcleo, um halo radial na cor `trailGlowColor` com alcance maior que o núcleo; o `gl_PointSize` dos pontos com rastro cresce para caber o halo (`trailGlowScale`), e a intensidade segue a mesma curva do rastro. `trailColor` passa para um tom mais saturado (ex. laranja/âmbar), `trailGlowColor` um pouco mais escuro para funcionar como sombra no fundo claro.

### Parâmetros
`tuning.galaxy`: `highlightColor`, `highlightOutlineColor`, `highlightMinPx`, `highlightRingPx`, `trailColor`, `trailGlowColor`, `trailGlowScale`, `beatGlow`, `beatGrow`, `beatAmplitude` revisado. Valores finais ajustados no aparelho.

## Risks / Trade-offs

- [Halos grandes aumentam overdraw] → só o ponto atual e os pontos do rastro (dezenas) crescem; a nuvem continua igual.
- [Cores fixas podem contrastar mal com algumas capas] → começar com tons escuros/saturados; se necessário, derivar a cor de destaque da cor da capa escurecida (em aberto).
- [Vibração forte demais desfaz a forma] → amplitude relativa ao zoom e limitada pelo raio; ajustar no aparelho.
