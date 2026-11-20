## Why

O fundo da galáxia é um degradê claro (cor da capa misturada com branco), mas toda a interface por cima é branca: o contraste fica ruim e os pontos brancos da galáxia somem. O rastro usa laranja, a mesma família de cor do destaque da música tocando, então não dá para distinguir "tocando agora" de "já tocou". E qualquer música que começa entra no rastro, mesmo pulada em 2 segundos, o que suja o rastro com faixas que não foram ouvidas.

## What Changes

- Fundo da galáxia passa a ser um degradê **escuro** com a cor da capa (misturada com preto em vez de branco), com a mesma transição suave entre músicas; sem música, cinza escuro.
- Pontos da galáxia continuam brancos.
- Laranja fica só no destaque da música tocando; o **rastro passa a ser azul** (ponto e halo).
- O véu das capas não selecionadas no zoom próximo passa a escurecer em vez de clarear, combinando com o fundo escuro.
- Uma música só entra no rastro depois de **20 segundos ouvidos** (parâmetro ajustável). Para o Jellyfin não marcar faixas puladas como tocadas (o que traria a faixa de volta ao rastro na sincronização), o relatório de início ao Jellyfin também só é enviado ao atingir esse tempo; faixa pulada antes disso não é reportada.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `now-playing`: fundo com a cor da capa passa a ser escuro.
- `galaxy`: rastro azul, só para músicas ouvidas por ao menos 20 s; laranja exclusivo da música tocando; véu das capas escuro.
- `playback`: relatório ao Jellyfin começa após o tempo mínimo ouvido.

## Impact

- `src/ui/color.ts` (`backgroundGradient`), `src/ui/now-playing/Background.tsx`, `src/ui/now-playing/NowPlayingScreen.tsx`.
- `src/config/tuning.ts` (cores do rastro, mistura escura do fundo, `trailMinListenS`).
- `src/ui/galaxy/GalaxyCovers.tsx` (cor do véu).
- `src/state/reporter.ts` (contagem do tempo ouvido e início adiado do relatório e da marcação de reprodução).
- Testes: `color.test.ts` e novo teste do reporter.
