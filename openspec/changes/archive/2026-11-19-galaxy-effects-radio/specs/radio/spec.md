## ADDED Requirements

### Requirement: Fila por proximidade
O rádio SHALL gerar uma fila a partir de uma música da galáxia, percorrendo as músicas vizinhas no espaço 3D: cada próxima é a mais perto da anterior entre as ainda não incluídas, até o tamanho configurado. A música de partida MUST ser a primeira da fila e nenhuma música MUST se repetir.

#### Scenario: Iniciar rádio
- **WHEN** o usuário inicia o rádio a partir da música atual
- **THEN** a música atual continua tocando e as próximas são vizinhas na galáxia, sem repetição

### Requirement: Iniciar rádio pela tela principal
A tela principal SHALL ter um botão de rádio, visível quando há música tocando, que gera a fila a partir da música atual sem interrompê-la.

#### Scenario: Botão de rádio
- **WHEN** o usuário toca no botão de rádio durante uma música
- **THEN** a fila passa a ser a do rádio e a música atual não reinicia

### Requirement: Plano B com Instant Mix
Quando a música não está na galáxia, o rádio SHALL usar o Instant Mix do Jellyfin a partir da música.

#### Scenario: Música fora da galáxia
- **WHEN** o rádio é iniciado com uma música sem ponto na galáxia
- **THEN** a fila vem do Instant Mix do Jellyfin
