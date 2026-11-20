## Why

A música tocando não aparece destacada na galáxia e a região em volta dela não vibra (item 6); as músicas do rastro ficam num amarelo claro difícil de ver (item 7). O fundo da tela é um degradê claro (cor da capa misturada com branco), e tanto o destaque (`#ffd27a`) quanto o rastro (`#ffe6b0`) são tons claros com pouca diferença de tamanho; a pulsação dos vizinhos desloca os pontos só ~0,6 unidade, o que some com a câmera afastada. Também vale descartar uma falha real (ponto atual não encontrado) antes de só aumentar os efeitos.

## What Changes

- Diagnóstico: confirmar que a música tocando é encontrada na galáxia (índice válido, dados não são os pontos decorativos) e que o envelope de energia chega à galáxia; corrigir o que estiver quebrado.
- A identificação do ponto atual no shader passa a usar o índice do ponto em vez de comparar posições (mais robusto).
- Destaque da música tocando bem visível em qualquer zoom e sobre fundo claro: núcleo maior em cor de alto contraste, halo suave com tamanho mínimo na tela e um anel que pulsa com o som.
- Vizinhos vibram de forma perceptível: deslocamento maior e proporcional ao zoom, mais um leve brilho/aumento no ritmo da música, sumindo até o raio configurado.
- Rastro com "sombra" destacada: cada ponto tocado nas últimas 24 h ganha um halo colorido em volta, forte logo após tocar e sumindo junto com o rastro; cor do rastro mais saturada.
- Novos parâmetros de cor/tamanho/intensidade em `src/config/tuning.ts`.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `galaxy`: destaque da música tocando, pulsação com o som e rastro de 24 h passam a ter requisitos de visibilidade (halo, anel, contraste).

## Impact

- `src/ui/galaxy/shaders.ts`, `src/ui/galaxy/GalaxyPoints.tsx` (atributo de índice, halo do rastro, novo objeto para o halo/anel da música atual).
- Possível ajuste em `src/galaxy/store.ts` / `src/ui/galaxy/useBeat.ts` conforme o diagnóstico.
- `src/config/tuning.ts`.
- Combina com `galaxy-camera-focus` (a música atual passa a ficar no centro), mas não depende dela.
