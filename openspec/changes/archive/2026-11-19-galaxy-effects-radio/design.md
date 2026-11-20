## Context

O shader da mudança anterior já recebe `aPlayed`, `uBeat` e `uPulseEnabled`. Falta alimentar esses dados, desenhar as capas e criar o rádio.

## Goals / Non-Goals

**Goals:** rastro, pulsação, capas no zoom, rádio.
**Non-Goals:** cor por agrupamento (próximo passo), envelopes reais (pipeline do Bruno).

## Decisions

- **Rastro**: `aPlayed` = segundos entre o início da sessão (`epoch`) e a última reprodução; sentinela `-1e9` para "sem rastro" (valores negativos são válidos para reproduções antes da abertura). Fonte: `tracks.last_played_at` no SQLite, que recebe o `LastPlayedDate` do Jellyfin na sincronização e a reprodução local em tempo real (o reporter grava ao iniciar a faixa). Recalcula quando a versão da biblioteca muda.
- **Pulsação**: `useBeat` carrega o envelope ao trocar de música e expõe `getBeat()` lido a cada quadro: `energyAt(env, estimatePosition())` — a posição é interpolada pelo relógio entre leituras do player (risco de atraso do briefing). Suavização ataque/decaimento para não tremer.
- **Capas como overlay nativo** em vez de texturas no GL: até 40 `expo-image` posicionados por projeção da câmera a cada quadro (valores num shared value do Reanimated). Ganha cache de imagem, toque nativo (Pressable) e bounce com Reanimated sem carregar texturas no GL. A seleção de quais pontos viram capa roda a ~6 Hz usando o índice espacial (raio em torno da câmera) e projeção para filtrar o campo de visão.
- **Rádio**: caminhada gulosa pelo vizinho mais próximo (`radioWalk`), pura e testada, usando `SpatialIndex.nearest`. Mantém transições suaves (cada faixa perto da anterior). Iniciar do botão usa `replaceQueue` no player para não reiniciar a música atual.
- **Plano B**: `getInstantMixFromSong` do Jellyfin quando o id não está na galáxia.

## Risks / Trade-offs

- [Overlay de capas não é ocluído pelos pontos] → no zoom próximo os pontos ficam em segundo plano; aceitável e mais legível.
- [Escrever 40 posições por quadro do JS] → custo baixo; só roda no zoom próximo.
