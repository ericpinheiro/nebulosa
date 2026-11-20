## ADDED Requirements

### Requirement: Cabeçalho do painel sempre acessível
O cabeçalho do painel (busca, conta, abas, "Voltar" e aviso de sincronização) SHALL ficar acima da lista, ocupando seu próprio espaço. O conteúdo das visões MUST começar abaixo do cabeçalho e MUST NOT cobrir nem bloquear toques nele, em qualquer altura do painel.

#### Scenario: Abrir a biblioteca
- **WHEN** o usuário abre o painel na aba Álbuns
- **THEN** a busca e as abas aparecem inteiras acima da grade e respondem ao toque

#### Scenario: Voltar de um álbum
- **WHEN** o usuário abre um álbum e toca em "Voltar"
- **THEN** o painel volta para a grade de álbuns

#### Scenario: Rolar a lista
- **WHEN** o usuário rola a grade de álbuns para baixo
- **THEN** os álbuns somem por baixo do cabeçalho sem desenhar por cima dele
