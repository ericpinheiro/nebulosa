## Why

Com o zoom totalmente afastado a galáxia ainda é cortada nas bordas, porque a distância máxima (34) e a inicial (26) são fixas e não levam em conta a tela em retrato, onde o campo de visão horizontal é bem mais estreito (item 1). Além disso, ao tocar uma música a órbita continua girando em torno do centro do mundo, e a música atual pode ficar num canto ou fora da tela; ela deveria virar o centro da galáxia (item 11).

## What Changes

- A distância inicial e a máxima passam a ser calculadas para caber a galáxia inteira na área visível da tela (descontando cabeçalho e controles), com margem, em qualquer rotação. O app abre com a galáxia inteira centralizada; aproximar fica a cargo do usuário.
- O centro inicial da órbita passa a ser o centro da nuvem de pontos (e não a origem do mundo).
- Ao começar uma música (escolhida pelo usuário ou troca automática de faixa), o centro da órbita desliza suavemente até o ponto dela, mantendo o zoom atual. Se o usuário estiver mexendo na galáxia, o recentro espera o gesto terminar.
- Se o zoom estiver no máximo afastado, ele acompanha o novo máximo para a galáxia continuar inteira em volta da música.
- Novos parâmetros em `src/config/tuning.ts` (margem do enquadramento, duração do recentro); `cameraMaxDistance`/`cameraInitialDistance` fixos saem.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `galaxy`: novos requisitos de enquadramento inicial/zoom máximo e de centro da órbita na música tocando.

## Impact

- `src/ui/galaxy/orbit.ts` (enquadramento, alvo animado, distância máxima dinâmica) e testes em `src/__tests__/orbit.test.ts`.
- `src/ui/galaxy/GalaxyView.tsx` (medir área visível, informar recentro quando a música muda).
- `src/galaxy/` (esfera envolvente da nuvem, calculada uma vez por versão dos dados).
- `src/ui/now-playing/NowPlayingScreen.tsx` (informar à galáxia as áreas ocupadas pela interface).
- `src/config/tuning.ts`.
