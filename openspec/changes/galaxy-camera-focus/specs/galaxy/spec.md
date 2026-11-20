## ADDED Requirements

### Requirement: Enquadramento da galáxia inteira
O zoom máximo afastado SHALL ser calculado a partir da esfera que envolve todos os pontos, do campo de visão vertical e horizontal da tela e da área livre entre o cabeçalho e os controles, com a margem configurada, de forma que nenhum ponto fique fora da tela em nenhuma rotação. O app SHALL abrir nesse zoom, com a órbita centrada no centro da nuvem.

#### Scenario: Abrir o app
- **WHEN** o app abre na tela principal em retrato
- **THEN** a galáxia inteira aparece centralizada na área livre, sem pontos cortados nas bordas

#### Scenario: Afastar ao máximo girando
- **WHEN** o usuário afasta o zoom até o limite e a galáxia gira
- **THEN** nenhum ponto sai da tela durante a rotação

#### Scenario: Aproximar
- **WHEN** o usuário faz pinça para aproximar a partir do enquadramento inicial
- **THEN** a câmera aproxima até o mínimo configurado

### Requirement: Centro da órbita na música tocando
Quando uma música começa a tocar e tem ponto na galáxia, o centro da órbita SHALL deslizar suavemente até o ponto dela na duração configurada, mantendo a distância da câmera; a rotação e os gestos SHALL passar a girar em torno dela. Isso vale para música escolhida pelo usuário e para troca automática de faixa. Durante um gesto na galáxia, o recentro MUST esperar o gesto terminar. Se a câmera estiver no zoom máximo afastado, a distância SHALL acompanhar o novo máximo para a galáxia continuar inteira na tela.

#### Scenario: Tocar uma capa
- **WHEN** o usuário toca uma música pela galáxia
- **THEN** o ponto dela vai suavemente para o centro da tela e a galáxia passa a girar em volta dele, sem mudar o zoom

#### Scenario: Troca automática durante gesto
- **WHEN** a faixa muda sozinha enquanto o usuário arrasta a galáxia
- **THEN** a câmera não se move por conta própria até o usuário soltar, e então desliza até a nova música

#### Scenario: Música fora da galáxia
- **WHEN** a música tocando não tem ponto na galáxia
- **THEN** o centro da órbita não muda

#### Scenario: Zoom no máximo
- **WHEN** a câmera está totalmente afastada e a música atual fica perto da borda da nuvem
- **THEN** a música vai para o centro e a galáxia continua inteira visível
