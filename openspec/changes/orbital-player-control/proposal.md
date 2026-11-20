## Why

A parte de baixo da tela principal tem quatro peças separadas (barra de progresso, anterior, play/pause, próxima) mais o botão da biblioteca isolado num círculo. Queremos um controle mais criativo e enxuto, coerente com a galáxia: um único botão orbital que concentra tocar/pausar, trocar de faixa e avançar/voltar na música (itens 2 e 3 da lista de ajustes).

## What Changes

- Novo **botão orbital** no lugar dos controles atuais:
  - toque no centro: tocar/pausar;
  - tocar no centro e arrastar para a direita: próxima música; para a esquerda: música anterior (o botão acompanha o dedo, com ícone de pista e vibração ao confirmar);
  - o progresso da música é um anel em volta do botão; arrastar o dedo em volta do anel avança ou volta na música.
- **BREAKING (interface)**: saem a barra de progresso horizontal e os botões de anterior e próxima da tela principal.
- O botão da biblioteca vai para a esquerda do botão orbital, sem o círculo em volta e com ícone de traço fino mais minimalista. O aleatório fica à direita, no mesmo estilo, formando uma linha simétrica.
- Nova dependência `react-native-svg` para desenhar o anel e os ícones de traço fino (exige novo build de desenvolvimento).
- Parâmetros do botão (tamanho, espessura do anel, distância do arrasto) em `src/config/tuning.ts`.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `now-playing`: layout da parte de baixo, estado vazio e barra de progresso passam a ser o botão orbital com biblioteca e aleatório ao lado.

## Impact

- Novo `src/ui/now-playing/OrbControl.tsx` e matemática pura em `src/ui/now-playing/orb-math.ts` (com testes).
- `NowPlayingScreen.tsx`: nova linha inferior; remove `ProgressBar` e `Controls` (arquivos apagados).
- `src/config/tuning.ts`: grupo `ui.orb`.
- `package.json`: `react-native-svg` via `npx expo install` (módulo nativo → novo dev build).
- Sem mudança no estado do player (`toggle`, `next`, `previous`, `seek` já existem). O mini player da biblioteca não muda.
