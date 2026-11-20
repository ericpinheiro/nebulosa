## 1. Biblioteca local

- [x] 1.1 Normalização de texto para busca e mapeadores BaseItemDto → linhas (com testes)
- [x] 1.2 Banco SQLite com esquema e migração (`src/state/library/db.ts`)
- [x] 1.3 Serviço Jellyfin de biblioteca: páginas de faixas, álbuns, artistas, playlists, ids e itens de playlist
- [x] 1.4 Sincronização inicial e incremental com progresso (`src/state/library/sync.ts`)
- [x] 1.5 Consultas: álbuns, faixas por álbum, faixas ordenadas, artistas, álbuns por artista, playlists, busca
- [x] 1.6 Limpeza do banco no logout

## 2. Player

- [x] 2.1 Interface `AudioEngine` e tipos de faixa do player
- [x] 2.2 Lógica de fila pura (shuffle, anterior/próxima, janela) com testes
- [x] 2.3 URLs de áudio e de capa do Jellyfin
- [x] 2.4 Adaptador `react-native-track-player` e serviço de reprodução (controles remotos)
- [x] 2.5 Store do player (Zustand): playList, toggle, next, previous, seek, shuffle, progresso
- [x] 2.6 Entrada `index.ts` registrando o serviço antes do Expo Router

## 3. Relatório ao Jellyfin

- [x] 3.1 Serviço playstate (start, progress, stopped) com conversão para ticks
- [x] 3.2 Reporter ligado ao store, a cada 10 s e em pausa/seek/troca, sem quebrar a reprodução
- [x] 3.3 Parar e reportar no logout

## 4. Verificação

- [x] 4.1 Typecheck e testes passando
