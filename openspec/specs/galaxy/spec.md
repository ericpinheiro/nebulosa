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

