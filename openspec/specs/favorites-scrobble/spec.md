# favorites-scrobble Specification

## Purpose
Favoritos sincronizados com o Jellyfin e scrobble no Last.fm pelo app (desligado até haver chave de API).

## Requirements
### Requirement: Favoritar música
O app SHALL permitir favoritar e desfavoritar a música tocando pela tela principal e pelo mini player, e qualquer música pela lista de favoritos, refletindo a mudança na interface imediatamente e enviando ao Jellyfin.

#### Scenario: Favoritar a música atual
- **WHEN** o usuário toca no coração da tela principal
- **THEN** o coração fica preenchido na hora, a música aparece em Favoritos no topo e o Jellyfin recebe o favorito

#### Scenario: Falha no servidor
- **WHEN** o Jellyfin recusa ou não responde ao favoritar
- **THEN** o app desfaz a mudança local e o coração volta ao estado anterior

### Requirement: Favoritos sincronizados
O app SHALL reaplicar a lista de favoritos do Jellyfin na sincronização e quando o app volta para o primeiro plano, para refletir favoritos feitos em outros clientes. A data em que favoritou SHALL ser registrada localmente, já que o Jellyfin não a guarda.

#### Scenario: Favorito feito no navegador
- **WHEN** o usuário favorita uma música no Jellyfin web e volta ao app
- **THEN** a música aparece em Favoritos

### Requirement: Scrobble configurável
O scrobble pelo app SHALL ficar desligado enquanto não houver chave de API do Last.fm configurada. Com chave, o usuário SHALL poder conectar a conta do Last.fm com usuário e senha; só a chave de sessão MUST ser guardada (no armazenamento seguro).

#### Scenario: Sem chave de API
- **WHEN** a chave de API do Last.fm não está configurada
- **THEN** nenhuma requisição ao Last.fm é feita e a opção de conectar não aparece

### Requirement: Regras de scrobble
Com o Last.fm conectado, o app SHALL enviar "tocando agora" ao iniciar cada música e SHALL fazer o scrobble quando a música, com mais de 30 segundos, tiver sido ouvida por metade da duração ou 4 minutos, o que vier primeiro. Scrobbles que falharem SHALL ficar numa fila e ser reenviados depois.

#### Scenario: Música ouvida até a metade
- **WHEN** uma música de 3 minutos é ouvida por 2 minutos e trocada
- **THEN** o scrobble é enviado com o horário em que ela começou

#### Scenario: Música pulada
- **WHEN** uma música é pulada depois de 20 segundos
- **THEN** não há scrobble

#### Scenario: Sem internet
- **WHEN** o envio do scrobble falha
- **THEN** ele fica guardado e é reenviado na próxima oportunidade

