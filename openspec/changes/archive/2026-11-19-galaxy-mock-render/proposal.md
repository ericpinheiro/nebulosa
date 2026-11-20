## Why

A galáxia 3D é o centro da experiência do Nebulosa. Os dados reais (UMAP do Bruno) ainda não existem em formato consumível, então o app precisa de um contrato JSON estável e de um mock com ids reais do Jellyfin para desenvolver a galáxia já com capas, rastro e destaque funcionando de verdade.

## What Changes

- Contrato v1 do JSON da galáxia (tipos, validação, normalização) e contrato do envelope de energia.
- Gerador de posições sintéticas com braços e aglomerados parecidos com o UMAP do vídeo, determinístico por id.
- Mock gerado no próprio app a partir dos ids da biblioteca local (sem servidor extra) e script Node que gera o mesmo JSON a partir do Jellyfin.
- Fonte remota opcional: baixar o JSON de uma URL, guardar em cache e só substituir quando `version` mudar.
- Envelope de energia mock (onda sintética) por música.
- Renderização 3D com three.js (react-three-fiber + expo-gl): todos os pontos num único objeto, shader próprio.
- Gestos: arrastar gira, pinça dá zoom, dois dedos deslocam; rotação automática lenta que pausa durante o gesto.
- Destaque da música tocando (brilho, cor e pulsação leve).
- 30 fps em rotação automática, 60 fps durante gestos, sem desenhar em segundo plano.

## Capabilities

### New Capabilities
- `galaxy-data`: contrato JSON v1, mock com ids reais, cache por versão, envelopes de energia.
- `galaxy`: renderização 3D, gestos, rotação automática e destaque da música tocando.

### Modified Capabilities
(nenhuma)

## Impact

- Novos módulos `src/galaxy/*` (dados, geração, índice espacial) e `src/ui/galaxy/*` (componentes 3D).
- Script `scripts/generate-galaxy-mock.ts`.
- Dependências: three, @react-three/fiber, expo-gl, expo-file-system.
