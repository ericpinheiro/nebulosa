## Context

O app já tem login. Agora precisa tocar música. A biblioteca tem ~7,3 mil faixas em FLAC; navegar e buscar direto na API seria lento, por isso o briefing pede cache local em SQLite. O player precisa ficar atrás de uma interface própria para permitir trocar o motor (ex.: AVAudioEngine) depois.

## Goals / Non-Goals

**Goals:** biblioteca local consultável; tocar álbum/lista com fila, shuffle, segundo plano e tela de bloqueio; relatório ao Jellyfin.

**Non-Goals:** fila visível/editável, repetir, crossfade, offline, qualidade por rede (próximos passos).

## Decisions

- **Esquema SQLite**: tabelas `tracks`, `albums`, `artists`, `playlists`, `meta`. Cada tabela tem `search` (nome normalizado sem acento, minúsculo) para `LIKE`. Alternativa FTS5 foi descartada: 7 mil linhas com `LIKE` respondem em poucos ms e evita depender de FTS no Android.
- **Mapeamento puro** `BaseItemDto → Row` em `src/state/library/mappers.ts`, testado sem banco.
- **Incremental** com `MinDateLastSaved` = última sincronização (menos 1 min de folga) + busca de todos os ids (`Fields` vazios, sem imagens) para reconciliar remoções.
- **Fila própria no store + janela no motor**: o store guarda a lista completa e a ordem (com ou sem shuffle). O motor recebe só a faixa atual e a próxima (pré-carregamento para gapless). Quando o motor avança sozinho, o store avança o cursor e entrega a seguinte. Evita mandar 7 mil faixas para o motor nativo quando se toca a lista de músicas.
- **Lógica de fila pura** (`src/state/queue.ts`): ordem com shuffle (Fisher-Yates mantendo a atual na frente), desligar shuffle restaurando a ordem original, cálculo de anterior/próxima. Testada em Jest.
- **`react-native-track-player` 4.1.2 como adaptador inicial**: a v5 citada no briefing não está publicada no npm (só `5.0.0-alpha0`). A 4.x é módulo legado e roda pela camada de interop da New Architecture; se o build nativo falhar, troca-se o adaptador (v5 licenciada, ou `expo-audio`) sem mexer em telas — é exatamente o papel da interface `AudioEngine`.
- **Serviço de reprodução registrado em `index.ts`** antes de `expo-router/entry`, como exige o RNTP.
- **URL de áudio**: `/Audio/{id}/universal` com `Container=flac,mp3,m4a,aac,ogg,opus,wav`, `MaxStreamingBitrate` alto (direct play), `ApiKey` e cabeçalho `Authorization` (compatível de 10.8 a 10.11).
- **Relatório** em `src/services/jellyfin/playstate.ts`, chamado por um "reporter" que observa o store; erros são engolidos.

## Risks / Trade-offs

- [RNTP 4.x na New Architecture] → interface `AudioEngine`; validar no primeiro build com Xcode.
- [Janela de 2 faixas no motor] → anterior/próxima sempre recarregam a janela; custo baixo.
- [Reconciliação de ids custa uma requisição grande] → só roda na atualização incremental, no máximo uma vez por abertura.
