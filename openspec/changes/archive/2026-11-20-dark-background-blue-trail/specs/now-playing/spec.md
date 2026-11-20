## MODIFIED Requirements

### Requirement: Fundo com a cor da capa
O fundo SHALL ser um degradê escuro e opaco com a cor dominante da capa tocando misturada com preto, para a interface branca e os pontos brancos da galáxia contrastarem, e a troca de cor SHALL acompanhar a troca de música com transição suave. Sem música, SHALL usar o cinza escuro padrão.

#### Scenario: Troca de música
- **WHEN** a música muda para um álbum de capa vermelha
- **THEN** o fundo transita suavemente para um degradê vinho escuro

#### Scenario: Contraste da interface
- **WHEN** qualquer música está tocando
- **THEN** o texto e os ícones da interface ficam brancos sobre o fundo escuro
