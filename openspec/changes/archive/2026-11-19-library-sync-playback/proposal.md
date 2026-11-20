## Why

Com o login pronto, o próximo passo do briefing é tocar música de verdade: baixar os metadados das 7.258 faixas para navegação e busca instantâneas (`library-sync`) e um player mínimo que toque um álbum em segundo plano, com controles na tela de bloqueio e relatório ao Jellyfin (`playback`).

## What Changes

- Banco local em `expo-sqlite` com faixas, álbuns, artistas, playlists e estado de sincronização.
- Sincronização inicial paginada e atualização incremental (itens alterados desde a última sincronização + reconciliação de removidos).
- Busca local por música, álbum e artista, sem acento e sem diferenciar maiúsculas.
- Interface `AudioEngine` isolando o motor de áudio; adaptador para `react-native-track-player`.
- Store do player (Zustand) com fila própria, shuffle, anterior/próxima, seek e progresso.
- Fila: tocar uma música de uma lista enfileira o resto da lista; a fila não é exibida.
- Reprodução em segundo plano e controles remotos (tela de bloqueio, central de controle, fones).
- Relatório de reprodução ao Jellyfin: início, progresso periódico, pausa e parada.

## Capabilities

### New Capabilities
- `library-sync`: download e cache local dos metadados, atualização incremental e busca local.
- `playback`: player isolado, fila, shuffle, segundo plano, tela de bloqueio e relatório ao Jellyfin.

### Modified Capabilities
(nenhuma)

## Impact

- Novos módulos: `src/services/jellyfin/library.ts`, `src/services/jellyfin/playstate.ts`, `src/services/player/*`, `src/state/library/*`, `src/state/player.ts`.
- Entrada do app passa a ser `index.ts` (registra o serviço de reprodução antes do Expo Router).
- Dependências: expo-sqlite, react-native-track-player.
