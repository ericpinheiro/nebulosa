# now-playing Specification

## Purpose
Tela principal limpa com a galáxia no centro, capa e título no topo, controles embaixo, fundo com a cor da capa e interface que se esconde.
## Requirements
### Requirement: Layout da tela principal
A tela principal SHALL mostrar, de cima para baixo: capa pequena com título e artista ao lado, a galáxia no centro e, embaixo, uma linha com o botão da biblioteca à esquerda, o botão orbital no centro e o aleatório (shuffle) à direita. Não há botões de anterior, próxima nem repetir, nem barra de progresso horizontal. Os botões da biblioteca e do aleatório SHALL ser só o ícone, em traço fino, sem círculo em volta.

#### Scenario: Música tocando
- **WHEN** há uma música atual
- **THEN** a tela mostra capa, título, artista, galáxia e a linha com biblioteca, botão orbital e aleatório

### Requirement: Estado vazio
Sem música atual, a tela SHALL mostrar só a galáxia girando e o botão da biblioteca, na mesma posição que ele ocupa com música tocando.

#### Scenario: Primeira abertura
- **WHEN** o app abre sem nada tocando
- **THEN** só a galáxia e o botão da biblioteca aparecem, sem botão orbital nem aleatório

### Requirement: Esconder a interface
Depois do tempo configurado (10 s) sem toque, tudo menos a galáxia SHALL sumir com animação; qualquer toque na tela SHALL trazer tudo de volta e reiniciar a contagem. Com o painel da biblioteca ou a capa expandida abertos, a interface MUST NOT sumir.

#### Scenario: Inatividade
- **WHEN** passam 10 segundos sem toque com a galáxia visível
- **THEN** capa, título, progresso, controles e botão da biblioteca somem

#### Scenario: Toque traz de volta
- **WHEN** a interface está escondida e o usuário toca em qualquer ponto
- **THEN** a interface reaparece e a contagem recomeça

### Requirement: Fundo com a cor da capa
O fundo SHALL ser um degradê escuro e opaco com a cor dominante da capa tocando misturada com preto, para a interface branca e os pontos brancos da galáxia contrastarem, e a troca de cor SHALL acompanhar a troca de música com transição suave. Sem música, SHALL usar o cinza escuro padrão.

#### Scenario: Troca de música
- **WHEN** a música muda para um álbum de capa vermelha
- **THEN** o fundo transita suavemente para um degradê vinho escuro

#### Scenario: Contraste da interface
- **WHEN** qualquer música está tocando
- **THEN** o texto e os ícones da interface ficam brancos sobre o fundo escuro

### Requirement: Capa expandida
Tocar na capa pequena SHALL fazer a capa crescer e ocupar o lugar da galáxia, com a lista de faixas do álbum logo abaixo. Tocar numa faixa SHALL tocá-la e enfileirar o resto do álbum. Tocar de novo na capa ou arrastar para baixo SHALL voltar à galáxia.

#### Scenario: Abrir e tocar faixa
- **WHEN** o usuário toca na capa e depois na faixa 3 da lista
- **THEN** a faixa 3 toca e as seguintes do álbum ficam na fila

#### Scenario: Voltar arrastando
- **WHEN** a capa está expandida e o usuário arrasta para baixo
- **THEN** a galáxia volta a aparecer

### Requirement: Botão orbital
O botão orbital SHALL mostrar, dentro do anel, o ícone de tocar/pausar no centro e ícones pequenos de anterior à esquerda e próxima à direita. Um toque rápido em qualquer parte do botão SHALL alternar tocar/pausar. Tocar no centro e arrastar na horizontal SHALL fazer os três ícones sumirem e o ícone da ação (próxima ou anterior) ocupar o centro no lugar do tocar/pausar, de forma gradual até a distância configurada; o anel não se move. Ao soltar além da distância configurada, arrastar para a direita SHALL ir para a próxima música e para a esquerda SHALL ir para a anterior, com vibração leve. Soltar antes da distância MUST NOT trocar de música, e o botão SHALL voltar ao centro.

#### Scenario: Tocar e pausar
- **WHEN** o usuário toca no centro do botão com a música tocando
- **THEN** a música pausa e o ícone vira "tocar"

#### Scenario: Próxima música
- **WHEN** o usuário arrasta o centro do botão para a direita além da distância configurada e solta
- **THEN** a próxima música da fila começa e o botão volta a mostrar anterior, tocar/pausar e próxima

#### Scenario: Música anterior
- **WHEN** o usuário arrasta o centro do botão para a esquerda além da distância configurada e solta
- **THEN** o player executa "anterior" (reinicia a faixa se passou do limite configurado, senão volta para a anterior)

#### Scenario: Arrasto curto
- **WHEN** o usuário arrasta o centro só um pouco e solta
- **THEN** nada muda na reprodução e o botão volta a mostrar anterior, tocar/pausar e próxima

#### Scenario: Ícone da ação no arrasto
- **WHEN** o usuário arrasta o centro para a direita até a distância configurada, sem soltar
- **THEN** o centro mostra só o ícone de próxima

### Requirement: Progresso no anel do botão orbital
Um anel em volta do botão orbital SHALL mostrar a posição da música, começando no topo e crescendo no sentido horário. Girar o dedo em volta do anel SHALL avançar (sentido horário) ou retroceder (anti-horário) a posição a partir de onde a música está, na proporção do giro (uma volta inteira = a música toda), mostrar o tempo atual e o total enquanto gira, e fazer seek ao soltar. Tocar no anel sem girar MUST NOT mudar a posição. A posição SHALL parar no começo e no fim da música.

#### Scenario: Avançar girando
- **WHEN** a música está em 10% e o usuário gira o dedo um quarto de volta no sentido horário em volta do anel e solta
- **THEN** a música vai para 35% da duração

#### Scenario: Tocar no anel sem girar
- **WHEN** o usuário toca num ponto do anel e solta sem girar
- **THEN** a posição da música não muda

#### Scenario: Limite no fim
- **WHEN** o usuário continua girando no sentido horário depois de chegar ao fim
- **THEN** a posição fica no fim da música

#### Scenario: Progresso andando
- **WHEN** a música está tocando
- **THEN** o anel cresce de forma contínua acompanhando a posição

### Requirement: Acessibilidade do botão orbital
O botão orbital SHALL expor ao leitor de tela as ações tocar/pausar, próxima, anterior, avançar e voltar alguns segundos, já que os gestos não são acessíveis por si.

#### Scenario: VoiceOver
- **WHEN** o usuário do VoiceOver seleciona o botão e escolhe a ação "Próxima"
- **THEN** a próxima música começa

