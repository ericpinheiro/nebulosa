## ADDED Requirements

### Requirement: Layout da tela principal
A tela principal SHALL mostrar, de cima para baixo: capa pequena com título e artista ao lado, a galáxia no centro, uma barra de progresso fina, os controles anterior, play/pause, próxima e shuffle (sem repetir) e o botão de abrir a biblioteca.

#### Scenario: Música tocando
- **WHEN** há uma música atual
- **THEN** a tela mostra capa, título, artista, galáxia, progresso, controles e botão da biblioteca

### Requirement: Estado vazio
Sem música atual, a tela SHALL mostrar só a galáxia girando e o botão da biblioteca.

#### Scenario: Primeira abertura
- **WHEN** o app abre sem nada tocando
- **THEN** só a galáxia e o botão da biblioteca aparecem

### Requirement: Barra de progresso
A barra SHALL mostrar a posição da música e permitir arrastar ou tocar para ir a outro ponto.

#### Scenario: Seek pela barra
- **WHEN** o usuário arrasta a barra até a metade e solta
- **THEN** a música vai para a metade da duração

### Requirement: Esconder a interface
Depois do tempo configurado (10 s) sem toque, tudo menos a galáxia SHALL sumir com animação; qualquer toque na tela SHALL trazer tudo de volta e reiniciar a contagem. Com o painel da biblioteca ou a capa expandida abertos, a interface MUST NOT sumir.

#### Scenario: Inatividade
- **WHEN** passam 10 segundos sem toque com a galáxia visível
- **THEN** capa, título, progresso, controles e botão da biblioteca somem

#### Scenario: Toque traz de volta
- **WHEN** a interface está escondida e o usuário toca em qualquer ponto
- **THEN** a interface reaparece e a contagem recomeça

### Requirement: Fundo com a cor da capa
O fundo SHALL ser um degradê claro e opaco com a cor dominante da capa tocando misturada com branco, e a troca de cor SHALL acompanhar a troca de música com transição suave. Sem música, SHALL usar o cinza claro padrão.

#### Scenario: Troca de música
- **WHEN** a música muda para um álbum de capa vermelha
- **THEN** o fundo transita suavemente para um degradê rosado claro

### Requirement: Capa expandida
Tocar na capa pequena SHALL fazer a capa crescer e ocupar o lugar da galáxia, com a lista de faixas do álbum logo abaixo. Tocar numa faixa SHALL tocá-la e enfileirar o resto do álbum. Tocar de novo na capa ou arrastar para baixo SHALL voltar à galáxia.

#### Scenario: Abrir e tocar faixa
- **WHEN** o usuário toca na capa e depois na faixa 3 da lista
- **THEN** a faixa 3 toca e as seguintes do álbum ficam na fila

#### Scenario: Voltar arrastando
- **WHEN** a capa está expandida e o usuário arrasta para baixo
- **THEN** a galáxia volta a aparecer
