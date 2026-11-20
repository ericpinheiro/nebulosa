## MODIFIED Requirements

### Requirement: Capas no zoom próximo
Abaixo da distância configurada, os pontos no campo de visão SHALL virar capas pequenas, limitadas ao máximo configurado (40), priorizando as mais próximas da câmera. Cada capa SHALL surgir com fade in crescendo até o tamanho final, podendo passar levemente do tamanho e voltar uma única vez; a aparição MUST NOT oscilar como mola.

#### Scenario: Aproximar
- **WHEN** a câmera passa da distância de capas
- **THEN** até 40 capas aparecem sobre os pontos visíveis mais próximos, cada uma com fade in e crescimento suave

#### Scenario: Afastar
- **WHEN** a câmera volta além da distância de capas
- **THEN** as capas somem e só ficam os pontos

### Requirement: Toque em itens da galáxia
No zoom afastado, tocar num ponto MUST NOT fazer nada além de reexibir a interface. No zoom próximo, o 1º toque numa capa SHALL aumentá-la com transição suave (sem bounce), colocá-la acima das outras e deixar todas as outras capas em preto e branco e levemente esmaecidas; o 2º toque na mesma capa SHALL tocar a música, gerando a fila pelo rádio de proximidade. Tocar fora das capas ou afastar o zoom SHALL desfazer a seleção e devolver as cores.

#### Scenario: Dois toques numa capa
- **WHEN** o usuário toca uma capa e depois toca a mesma capa de novo
- **THEN** no primeiro toque a capa cresce suavemente e as outras ficam em preto e branco; no segundo a música começa com as vizinhas na fila

#### Scenario: Toque em outra capa
- **WHEN** uma capa está aumentada e o usuário toca outra
- **THEN** a primeira volta ao normal e fica em preto e branco, e a segunda aumenta e fica colorida

#### Scenario: Toque fora
- **WHEN** uma capa está aumentada e o usuário toca numa área sem capa
- **THEN** a capa volta ao tamanho normal e todas as capas voltam a ficar coloridas

## ADDED Requirements

### Requirement: Gestos por cima das capas
Girar, pinça e mover com dois dedos SHALL funcionar começando em qualquer ponto da galáxia, inclusive em cima das capas. As capas MUST NOT capturar toques; o toque simples numa capa SHALL ser reconhecido pela galáxia pela posição da capa na tela, dentro do raio de toque configurado, escolhendo a capa mais à frente quando houver sobreposição.

#### Scenario: Pinça sobre capas
- **WHEN** a tela está cheia de capas e o usuário faz pinça para afastar com os dedos em cima delas
- **THEN** a câmera afasta normalmente

#### Scenario: Girar começando numa capa
- **WHEN** o usuário encosta numa capa e arrasta
- **THEN** a galáxia gira e a capa não é selecionada

#### Scenario: Capas sobrepostas
- **WHEN** o usuário toca onde duas capas se sobrepõem
- **THEN** a capa mais próxima da câmera é a escolhida
