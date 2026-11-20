## Why

A galáxia já gira e destaca a música tocando, mas ainda não conta a história da escuta nem responde à música. O briefing pede o rastro das últimas 24 h, a pulsação sutil com o som, as capas que surgem no zoom próximo (com toque para tocar) e o rádio por proximidade — o que torna a galáxia uma forma de navegar, não só um enfeite.

## What Changes

- Rastro de 24 h: músicas tocadas ficam com a cor do rastro, que se apaga até voltar ao normal em 24 h; dados vêm do "tocado por último" do Jellyfin e da reprodução local.
- Pulsação com o som: vizinhos da música tocando balançam com o envelope de energia, sincronizado e interpolado com a posição de reprodução; desligada no zoom próximo.
- Capas no zoom próximo: pontos visíveis viram capas pequenas com bounce, até o limite configurado; 1º toque aumenta, 2º toque toca. No zoom afastado, toque em ponto não faz nada.
- Rádio por proximidade: fila gerada pelas músicas vizinhas no espaço 3D, a partir da música atual (botão) ou da capa tocada na galáxia; plano B com Instant Mix do Jellyfin quando a música não está na galáxia.

## Capabilities

### New Capabilities
- `radio`: fila por proximidade na galáxia, com plano B Instant Mix.

### Modified Capabilities
- `galaxy`: novos requisitos de rastro, pulsação com o som e capas no zoom próximo.

## Impact

- `src/ui/galaxy/*` (overlay de capas, hooks de rastro e batida), `src/galaxy/radio.ts`, `src/state/radio.ts`.
- Shader recebe ajuste no sentinela do rastro.
