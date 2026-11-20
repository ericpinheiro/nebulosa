## ADDED Requirements

### Requirement: Nuvem de partículas
A galáxia SHALL desenhar um ponto por música, monocromático na cor configurada, num único objeto de partículas com shader próprio, com pontos redondos e suaves.

#### Scenario: Biblioteca completa
- **WHEN** a galáxia tem 7.258 pontos
- **THEN** todos são desenhados num único draw call

### Requirement: Gestos de navegação
Arrastar com um dedo SHALL girar a galáxia, pinça SHALL aproximar e afastar dentro dos limites configurados e arrastar com dois dedos SHALL deslocar o centro da órbita.

#### Scenario: Girar
- **WHEN** o usuário arrasta um dedo na horizontal
- **THEN** a galáxia gira em torno do eixo vertical, com inércia ao soltar

#### Scenario: Limite de zoom
- **WHEN** o usuário continua a pinça além do limite
- **THEN** a distância da câmera para no mínimo ou no máximo configurado

### Requirement: Rotação automática
Sem gesto, a galáxia SHALL girar lentamente na velocidade configurada. A rotação automática MUST parar durante um gesto e voltar depois do tempo configurado sem toques.

#### Scenario: Retomar depois do gesto
- **WHEN** o usuário solta a galáxia e fica 4 segundos sem tocar
- **THEN** a rotação automática volta suavemente

### Requirement: Destaque da música tocando
O ponto da música tocando SHALL ficar maior, na cor de destaque e pulsar de leve. Os demais pontos não mudam.

#### Scenario: Troca de música
- **WHEN** a música tocando muda
- **THEN** o destaque passa para o ponto da nova música

#### Scenario: Música sem ponto
- **WHEN** a música tocando não está na galáxia
- **THEN** nenhum ponto é destacado

### Requirement: Economia de bateria
A galáxia SHALL desenhar a 30 fps em rotação automática, a 60 fps durante gestos e animações, e MUST parar de desenhar com o app em segundo plano.

#### Scenario: App em segundo plano
- **WHEN** o app vai para segundo plano com música tocando
- **THEN** nenhum quadro da galáxia é desenhado até o app voltar

### Requirement: Parâmetros centralizados
Cores, tamanhos, velocidades, limites de zoom e fps da galáxia SHALL vir de `src/config/tuning.ts`.

#### Scenario: Ajustar velocidade
- **WHEN** o desenvolvedor muda `autoRotateSpeed` em `tuning.ts`
- **THEN** a rotação automática usa o novo valor sem outra alteração
