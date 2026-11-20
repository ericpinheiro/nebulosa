## ADDED Requirements

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
