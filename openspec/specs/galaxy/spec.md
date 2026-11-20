# galaxy Specification

## Purpose
Galáxia 3D onde cada ponto é uma música: renderização, gestos, destaque, rastro de 24 h, pulsação com o som e capas no zoom próximo.

## Requirements
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

### Requirement: Rastro das últimas 24 horas
Cada música tocada nas últimas 24 horas SHALL aparecer com a cor do rastro, mais forte logo após tocar e voltando gradualmente à cor normal; depois do tempo configurado (24 h) MUST ficar igual aos demais pontos. O rastro SHALL usar a data da última reprodução do Jellyfin, para sobreviver a reinstalações e funcionar em mais de um aparelho.

#### Scenario: Música recém-tocada
- **WHEN** uma música termina de tocar
- **THEN** o ponto dela fica na cor do rastro com intensidade máxima

#### Scenario: Rastro expirado
- **WHEN** a última reprodução de uma música foi há mais de 24 horas
- **THEN** o ponto tem a mesma cor dos demais

#### Scenario: Outro aparelho
- **WHEN** a música foi tocada em outro cliente do Jellyfin nas últimas 24 h
- **THEN** o ponto aparece no rastro após a sincronização

### Requirement: Pulsação com o som
Os pontos em volta da música tocando SHALL balançar no ritmo da música usando o envelope de energia sincronizado com a posição de reprodução (interpolada entre leituras), com efeito mais forte perto dela e sumindo até o raio configurado. O efeito MUST ser sutil, MUST parar com a música pausada e MUST ser desligado no zoom próximo.

#### Scenario: Música pausada
- **WHEN** a música é pausada
- **THEN** os pontos voltam à posição de repouso

#### Scenario: Zoom próximo
- **WHEN** o usuário aproxima até o nível das capas
- **THEN** a pulsação desliga suavemente

### Requirement: Capas no zoom próximo
Abaixo da distância configurada, os pontos no campo de visão SHALL virar capas pequenas surgindo com efeito de bounce, limitadas ao máximo configurado (40), priorizando as mais próximas da câmera.

#### Scenario: Aproximar
- **WHEN** a câmera passa da distância de capas
- **THEN** até 40 capas aparecem sobre os pontos visíveis mais próximos

#### Scenario: Afastar
- **WHEN** a câmera volta além da distância de capas
- **THEN** as capas somem e só ficam os pontos

### Requirement: Toque em itens da galáxia
No zoom afastado, tocar num ponto MUST NOT fazer nada além de reexibir a interface. No zoom próximo, o 1º toque numa capa SHALL aumentá-la um pouco e o 2º toque na mesma capa SHALL tocar a música, gerando a fila pelo rádio de proximidade.

#### Scenario: Dois toques numa capa
- **WHEN** o usuário toca uma capa e depois toca a mesma capa de novo
- **THEN** no primeiro toque a capa cresce e no segundo a música começa com as vizinhas na fila

#### Scenario: Toque em outra capa
- **WHEN** uma capa está aumentada e o usuário toca outra
- **THEN** a primeira volta ao normal e a segunda aumenta

