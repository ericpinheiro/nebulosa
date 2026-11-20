## MODIFIED Requirements

### Requirement: Destaque da música tocando
O ponto da música tocando SHALL ficar claramente visível em qualquer nível de zoom e sobre o fundo escuro: núcleo na cor de destaque laranja com cerca de 5x o diâmetro de um ponto normal (acompanhando o zoom, com tamanho mínimo na tela configurado), contorno claro, halo curto em volta e um anel que pulsa no ritmo da música. Com a música pausada, o halo SHALL continuar visível, sem pulsar. A identificação do ponto MUST usar o índice do ponto na galáxia. Os demais pontos não mudam de cor.

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

### Requirement: Rastro das últimas 24 horas
Cada música ouvida por ao menos o tempo mínimo configurado (20 segundos) nas últimas 24 horas SHALL aparecer na cor do rastro (azul) com um halo azul ("sombra") em volta do ponto, que se destaca sobre o fundo escuro; cor, tamanho e halo SHALL ser mais fortes logo após tocar e voltar gradualmente ao normal; depois do tempo configurado (24 h) o ponto MUST ficar igual aos demais. A cor laranja MUST ficar reservada para a música tocando agora. Uma música ouvida por menos que o tempo mínimo MUST NOT entrar no rastro. O rastro SHALL usar a data da última reprodução do Jellyfin, para sobreviver a reinstalações e funcionar em mais de um aparelho.

#### Scenario: Música recém-tocada
- **WHEN** uma música é ouvida por mais de 20 segundos e termina
- **THEN** o ponto dela fica azul com halo em intensidade máxima, fácil de distinguir dos demais e do laranja da música tocando

#### Scenario: Música pulada
- **WHEN** o usuário pula uma música depois de 8 segundos
- **THEN** o ponto dela não entra no rastro

#### Scenario: Rastro expirado
- **WHEN** a última reprodução de uma música foi há mais de 24 horas
- **THEN** o ponto tem a mesma cor dos demais e não tem halo

#### Scenario: Outro aparelho
- **WHEN** a música foi tocada em outro cliente do Jellyfin nas últimas 24 h
- **THEN** o ponto aparece no rastro após a sincronização

### Requirement: Toque em itens da galáxia
No zoom afastado, tocar num ponto MUST NOT fazer nada além de reexibir a interface. No zoom próximo, o 1º toque numa capa SHALL aumentá-la com transição suave (sem bounce), colocá-la acima das outras e deixar todas as outras capas em preto e branco e levemente escurecidas; o 2º toque na mesma capa SHALL tocar a música, gerando a fila pelo rádio de proximidade. Tocar fora das capas ou afastar o zoom SHALL desfazer a seleção e devolver as cores.

#### Scenario: Dois toques numa capa
- **WHEN** o usuário toca uma capa e depois toca a mesma capa de novo
- **THEN** no primeiro toque a capa cresce suavemente e as outras ficam em preto e branco e escurecidas; no segundo a música começa com as vizinhas na fila

#### Scenario: Toque em outra capa
- **WHEN** uma capa está aumentada e o usuário toca outra
- **THEN** a primeira volta ao normal e fica em preto e branco, e a segunda aumenta e fica colorida

#### Scenario: Toque fora
- **WHEN** uma capa está aumentada e o usuário toca numa área sem capa
- **THEN** a capa volta ao tamanho normal e todas as capas voltam a ficar coloridas
