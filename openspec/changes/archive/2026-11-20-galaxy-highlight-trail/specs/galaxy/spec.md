## MODIFIED Requirements

### Requirement: Destaque da música tocando
O ponto da música tocando SHALL ficar claramente visível em qualquer nível de zoom e sobre o fundo claro: núcleo maior na cor de destaque (de alto contraste com o fundo), halo suave em volta com tamanho mínimo na tela configurado e um anel que pulsa no ritmo da música. Com a música pausada, o halo SHALL continuar visível, sem pulsar. A identificação do ponto MUST usar o índice do ponto na galáxia. Os demais pontos não mudam de cor.

#### Scenario: Troca de música
- **WHEN** a música tocando muda
- **THEN** o destaque passa para o ponto da nova música

#### Scenario: Música sem ponto
- **WHEN** a música tocando não está na galáxia
- **THEN** nenhum ponto é destacado

#### Scenario: Zoom afastado
- **WHEN** a galáxia está no zoom máximo afastado com uma música tocando
- **THEN** o ponto da música aparece com halo de pelo menos o tamanho mínimo configurado, distinguível dos demais à primeira vista

#### Scenario: Pausado
- **WHEN** a música é pausada
- **THEN** o ponto continua destacado com halo, mas o anel para de pulsar

### Requirement: Pulsação com o som
Os pontos em volta da música tocando SHALL balançar no ritmo da música usando o envelope de energia sincronizado com a posição de reprodução (interpolada entre leituras), com efeito mais forte perto dela e sumindo até o raio configurado. O deslocamento SHALL ser proporcional à distância da câmera, para ser perceptível em qualquer zoom, e os vizinhos SHALL também ganhar um leve aumento de brilho e tamanho no pico da energia. O efeito MUST continuar sutil (sem desfazer a forma da nuvem), MUST parar com a música pausada e MUST ser desligado no zoom próximo.

#### Scenario: Música tocando
- **WHEN** uma música está tocando com a galáxia no zoom inicial
- **THEN** a região em volta do ponto dela vibra visivelmente no ritmo da música

#### Scenario: Música pausada
- **WHEN** a música é pausada
- **THEN** os pontos voltam à posição de repouso

#### Scenario: Zoom próximo
- **WHEN** o usuário aproxima até o nível das capas
- **THEN** a pulsação desliga suavemente

### Requirement: Rastro das últimas 24 horas
Cada música tocada nas últimas 24 horas SHALL aparecer na cor do rastro com um halo colorido ("sombra") em volta do ponto, que se destaca sobre o fundo claro; cor, tamanho e halo SHALL ser mais fortes logo após tocar e voltar gradualmente ao normal; depois do tempo configurado (24 h) o ponto MUST ficar igual aos demais. O rastro SHALL usar a data da última reprodução do Jellyfin, para sobreviver a reinstalações e funcionar em mais de um aparelho.

#### Scenario: Música recém-tocada
- **WHEN** uma música termina de tocar
- **THEN** o ponto dela fica na cor do rastro com halo em intensidade máxima, fácil de distinguir dos demais

#### Scenario: Rastro expirado
- **WHEN** a última reprodução de uma música foi há mais de 24 horas
- **THEN** o ponto tem a mesma cor dos demais e não tem halo

#### Scenario: Outro aparelho
- **WHEN** a música foi tocada em outro cliente do Jellyfin nas últimas 24 h
- **THEN** o ponto aparece no rastro após a sincronização
