## Context

- `backgroundGradient(color, whiteMix)` (`src/ui/color.ts`) mistura a cor da capa com branco; `NowPlayingScreen` escolhe a cor da interface pela luminância do topo do degradê (hoje às vezes escura). `Background.tsx` faz o cross-fade entre degradês.
- Cores da galáxia em `tuning.galaxy`: pontos `#ffffff`, destaque `#ff6a00`, rastro `#ffa31a`/halo `#d96a00`.
- O rastro vem de `tracks.last_played_at` (`getPlayedSince` → `buildTrail`). Esse campo é escrito em dois lugares: `reporter.ts` grava `now` assim que a faixa vira a atual, e `refreshUserData` copia o `LastPlayedDate` do Jellyfin. O Jellyfin atualiza `LastPlayedDate` (e a contagem de reproduções) já no `/Sessions/Playing` de um áudio.
- `reporter.ts` soma `listened` só quando o store do player muda, o que não acontece de forma regular durante a reprodução; não serve como relógio.

## Goals / Non-Goals

**Goals:** fundo escuro com a cor da capa; laranja só na música atual e rastro azul; faixa só entra no rastro depois de 20 s ouvidos, também quando os dados vêm do Jellyfin.

**Non-Goals:** mudar a cor dos pontos normais; mudar o scrobble do Last.fm (tem regra própria); tema claro/escuro da biblioteca.

## Decisions

### Degradê escuro
`backgroundGradient(color, darkMix)` mistura a cor da capa com **preto** (`mixWithBlack`), topo um pouco mais escuro que a base. `tuning.ui.backgroundWhiteMix` vira `backgroundDarkMix` (~0,7). Sem capa: `#141418` → `#26262c`. A regra de luminância do `NowPlayingScreen` continua, mas na prática sempre dá branco; fica como proteção.

### Rastro azul
`trailColor` ≈ `#4da3ff` e `trailGlowColor` ≈ `#1f6fd6` (só `tuning.ts`; o shader já usa as uniforms). O destaque laranja não muda. O `highlightOutlineColor` escuro continua bom sobre fundo escuro como borda.

### Véu das capas
O véu das capas não selecionadas passa de branco para quase preto (`tuning.galaxy.coverDimColor`), para "esmaecer" sem clarear sobre o fundo escuro.

### 20 segundos: adiar o "início" da faixa
Em vez de filtrar na leitura (o Jellyfin não informa quanto foi ouvido), a faixa só é **confirmada** depois de `tuning.playback.trailMinListenS` (20 s) ouvidos:
- `reporter.ts` ganha um relógio de 1 s que soma o tempo ouvido enquanto `status === 'playing'` (independente de eventos do store).
- Ao atingir o mínimo: envia `/Sessions/Playing`, grava `setLastPlayed(id, startedAt)` e faz `bump()` (o rastro aparece).
- Antes disso não envia progresso nem parada. Se a faixa muda antes, nada é enviado ao Jellyfin, então o `LastPlayedDate` dele não muda e a sincronização não traz a faixa pulada de volta.
- Os avisos internos (`onTrackStarted`/`onTrackStopped`, usados pelo scrobble) continuam como hoje.

A regra de "confirmar" vira uma função pura (`shouldCommit(listenedS, minS)`) e o acúmulo é testável com timers falsos do Jest.

Alternativa descartada: manter o relatório imediato e guardar uma coluna local "ouvida ≥ 20 s". Seria perdida ao reinstalar e conflitaria com o `LastPlayedDate` do Jellyfin (faixas puladas voltariam ao rastro pela sincronização).

### Correção: uniforms que não chegavam à GPU
O `<shaderMaterial uniforms={...}>` do react-three-fiber copia cada uniform para um objeto novo (`{...uniform}`). Cores e vetores continuavam compartilhados por referência, mas números (`uVisible`, `uBeat`, `uTime`, `uHasCurrent`, `uCurrentIndex`, `uPulseEnabled`) ficavam no valor inicial: o destaque nunca aparecia (`uVisible = 0`), os vizinhos não pulsavam e o rastro não esmaecia durante a sessão. Os dois materiais da galáxia passam a ser criados com `new THREE.ShaderMaterial({ uniforms })` e passados por `material={...}`, mantendo a referência.

## Risks / Trade-offs

- [O painel do Jellyfin só mostra "tocando" após 20 s] → aceitável; é o mesmo critério do rastro e evita contagens de faixas puladas.
- [Faixas com menos de 20 s nunca entram no rastro] → limite ajustável; raras em música.
- [Cores no aparelho] → ajustar em `tuning.ts` no build nativo.
