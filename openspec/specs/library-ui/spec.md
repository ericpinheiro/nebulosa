# library-ui Specification

## Purpose
Painel arrastável da biblioteca com álbuns, músicas, artistas, playlists, favoritos, busca e mini player.
## Requirements
### Requirement: Painel arrastável
A biblioteca SHALL abrir como um painel que sobe de baixo, pode ser arrastado entre meia altura e quase tela cheia e fechado arrastando para baixo, com a galáxia visível atrás.

#### Scenario: Abrir biblioteca
- **WHEN** o usuário toca no botão da biblioteca
- **THEN** o painel sobe e a galáxia continua visível acima dele

### Requirement: Mini player
O painel SHALL ter um mini player flutuante fixo com capa, título, artista e play/pause enquanto houver música atual.

#### Scenario: Pausar pelo mini player
- **WHEN** o usuário toca em pausa no mini player
- **THEN** a música pausa

### Requirement: Visão de álbuns
A visão Álbuns SHALL mostrar uma grade de 3 colunas com destaque para as capas, em ordem A–Z; tocar num álbum SHALL abrir a lista de faixas do álbum.

#### Scenario: Abrir álbum
- **WHEN** o usuário toca num álbum da grade
- **THEN** o painel mostra capa, nome, artista e faixas do álbum

### Requirement: Visão de músicas
A visão Músicas SHALL listar faixas com capinha à esquerda, título, artista, álbum, duração e ano quando houver, ordenáveis por A–Z, por álbum e por gênero (só quando houver gênero). Tocar numa faixa SHALL tocá-la e enfileirar o resto da lista na ordem exibida.

#### Scenario: Tocar da lista
- **WHEN** o usuário toca na 10ª música da lista ordenada por álbum
- **THEN** ela toca e as músicas seguintes da lista ficam na fila

#### Scenario: Sem gêneros
- **WHEN** nenhuma faixa tem gênero
- **THEN** a opção de ordenar por gênero não aparece

### Requirement: Visões de artistas, playlists e favoritos
Artistas SHALL ser uma lista A–Z que abre os álbuns do artista; Playlists SHALL ser uma lista A–Z que abre as faixas da playlist; Favoritos SHALL ser a lista de músicas favoritas ordenada pela data em que favoritou, e tocar SHALL enfileirar o resto.

#### Scenario: Abrir artista
- **WHEN** o usuário toca num artista
- **THEN** o painel mostra os álbuns desse artista

### Requirement: Busca
O painel SHALL ter um campo de busca que mostra resultados agrupados em artistas, álbuns e músicas, ignorando acentos.

#### Scenario: Buscar
- **WHEN** o usuário digita "jobim"
- **THEN** aparecem artistas, álbuns e músicas que contêm "Jobim"

### Requirement: Progresso da sincronização
Durante a sincronização inicial, o painel SHALL mostrar quantas faixas já foram baixadas do total.

#### Scenario: Primeira abertura
- **WHEN** a sincronização inicial está em andamento
- **THEN** o painel mostra "Sincronizando biblioteca… N de M"

### Requirement: Cabeçalho do painel sempre acessível
O cabeçalho do painel (busca, conta, abas, "Voltar" e aviso de sincronização) SHALL ficar acima da lista, ocupando seu próprio espaço. O conteúdo das visões MUST começar abaixo do cabeçalho e MUST NOT cobrir nem bloquear toques nele, em qualquer altura do painel.

#### Scenario: Abrir a biblioteca
- **WHEN** o usuário abre o painel na aba Álbuns
- **THEN** a busca e as abas aparecem inteiras acima da grade e respondem ao toque

#### Scenario: Voltar de um álbum
- **WHEN** o usuário abre um álbum e toca em "Voltar"
- **THEN** o painel volta para a grade de álbuns

#### Scenario: Rolar a lista
- **WHEN** o usuário rola a grade de álbuns para baixo
- **THEN** os álbuns somem por baixo do cabeçalho sem desenhar por cima dele

