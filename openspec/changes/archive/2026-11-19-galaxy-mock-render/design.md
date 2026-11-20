## Context

Galáxia de ~7,3 mil pontos em RN com three.js via react-three-fiber + expo-gl. Posições reais virão do UMAP do Bruno (vídeo em `estudo/`: forma de 3–4 braços saindo de um núcleo, com aglomerados densos). Até lá, mock.

## Goals / Non-Goals

**Goals:** contrato estável; mock visualmente parecido com o UMAP; render fluido; gestos; destaque.

**Non-Goals (próxima mudança):** rastro de 24 h, pulsação com o som, capas no zoom, rádio. O shader já recebe os uniforms/atributos dessas funções para não precisar ser reescrito.

## Decisions

- **Mock gerado no app**: em vez de hospedar um JSON mock, o app gera as posições a partir dos ids da biblioteca local. Mesmo resultado do briefing (ids reais, posição falsa), sem servidor. O script Node existe para gerar o arquivo quando o endpoint real for montado, e usa o mesmo gerador (`src/galaxy/generator.ts`, sem dependências).
- **Gerador**: PRNG `mulberry32` semeado pelo hash FNV-1a do id; cada id cai num de 4 braços (curva paramétrica a partir do núcleo com torção) ou em aglomerados gaussianos ao longo dos braços; ruído; normalização final pelo maior valor absoluto por eixo. Determinístico por id e independente da ordem.
- **Fonte remota**: `GALAXY_URL` em `src/config/server.ts` (vazia por enquanto). Cache em `Paths.document/galaxy.json` via `expo-file-system`; a versão em MMKV.
- **Envelopes**: `ENVELOPE_BASE_URL/{id}.json` com `{ "id", "rate", "e": [0..255] }` (inteiros para arquivo menor). Mock: batidas a um BPM entre 80 e 140 derivado do id, com decaimento exponencial e variação lenta.
- **Render**: `THREE.Points` com `BufferGeometry` (posição, `aSeed`, `aPlayed`) e `ShaderMaterial`. Uniforms: tempo, cores, tamanho, posição da música atual, batida, raio da batida, fator de pulsação. Destaque calculado no shader comparando a posição com `uCurrent` (atualizar um uniform é mais barato que reescrever atributos).
- **Câmera**: órbita própria (yaw, pitch, distância, alvo) em refs, sem OrbitControls (que depende de DOM). Gestos com Gesture Handler (`runOnJS`) alimentam a órbita; inércia e rotação automática no `useFrame`.
- **Frame loop**: `frameloop="demand"` e um ticker por `requestAnimationFrame` que chama `invalidate()` respeitando 30/60 fps e pausando com `AppState` diferente de `active`.
- **Índice espacial**: grade uniforme 3D (`src/galaxy/spatial-index.ts`) para buscas por raio/vizinhos — usada pelo rádio e pelas capas no zoom. Testada em Jest.

## Risks / Trade-offs

- [expo-gl + R3F no SDK atual] → só validável no aparelho; o componente isola o Canvas para facilitar troca.
- [Precisão de float no tempo do shader] → tempo relativo ao início da sessão.
- [Mock diferente do UMAP real] → contrato idêntico; trocar é só configurar a URL.
