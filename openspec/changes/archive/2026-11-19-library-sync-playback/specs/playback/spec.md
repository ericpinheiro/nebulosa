## ADDED Requirements

### Requirement: Controles básicos
O player SHALL oferecer play/pause, anterior, próxima, shuffle e seek pela barra de progresso. Não há modo de repetição.

#### Scenario: Próxima
- **WHEN** o usuário toca em "próxima" e há faixa seguinte na fila
- **THEN** a faixa seguinte começa a tocar

#### Scenario: Fim da fila
- **WHEN** a última faixa da fila termina
- **THEN** a reprodução para e a faixa atual continua selecionada na posição inicial

#### Scenario: Anterior reinicia a faixa
- **WHEN** o usuário toca em "anterior" depois de 3 segundos de reprodução
- **THEN** a faixa atual volta ao início

#### Scenario: Anterior volta faixa
- **WHEN** o usuário toca em "anterior" nos 3 primeiros segundos e há faixa anterior
- **THEN** a faixa anterior começa a tocar

### Requirement: Fila a partir de uma lista
Tocar uma música de uma lista SHALL colocar o resto da lista na fila, a partir da música tocada. A fila não é exibida nem editável.

#### Scenario: Tocar do meio de um álbum
- **WHEN** o usuário toca a faixa 4 de um álbum de 10 faixas
- **THEN** a faixa 4 começa e as faixas 5 a 10 ficam na fila, e "anterior" nos primeiros segundos leva à faixa 3

### Requirement: Shuffle
Ligar o shuffle SHALL embaralhar as faixas restantes mantendo a faixa atual tocando; desligar SHALL restaurar a ordem original a partir da faixa atual.

#### Scenario: Ligar e desligar shuffle
- **WHEN** o usuário liga e depois desliga o shuffle durante a faixa 4 de 10
- **THEN** a faixa 4 continua tocando o tempo todo e, desligado, a próxima é a faixa 5

### Requirement: Motor de áudio isolado
O player SHALL depender apenas da interface `AudioEngine`; nenhuma tela ou store importa a biblioteca de áudio diretamente.

#### Scenario: Troca de motor
- **WHEN** o motor de áudio for trocado por outra implementação de `AudioEngine`
- **THEN** nenhuma tela precisa ser alterada

### Requirement: Reprodução em segundo plano e controles remotos
O app SHALL continuar tocando com o app em segundo plano ou com a tela bloqueada e SHALL mostrar título, artista, álbum, capa e progresso na tela de bloqueio e na central de controle, aceitando play, pause, próxima, anterior e seek por lá.

#### Scenario: Tela bloqueada
- **WHEN** o usuário bloqueia o iPhone durante a reprodução
- **THEN** a música continua e os controles na tela de bloqueio funcionam

### Requirement: Áudio em direct play com pré-carregamento
O app SHALL tocar pelo endpoint universal do Jellyfin aceitando FLAC em direct play e SHALL entregar a próxima faixa ao motor antes da atual terminar, para emenda sem silêncio.

#### Scenario: Próxima faixa pré-carregada
- **WHEN** uma faixa está tocando e existe próxima na fila
- **THEN** o motor já tem a próxima faixa carregada

### Requirement: Relatório de reprodução ao Jellyfin
O app SHALL informar ao Jellyfin o início (`/Sessions/Playing`), o progresso a cada 10 segundos e em pausa/seek (`/Sessions/Playing/Progress`) e a parada ou troca de faixa (`/Sessions/Playing/Stopped`) com a posição em ticks. Falhas de relatório MUST NOT interromper a reprodução.

#### Scenario: Troca de faixa
- **WHEN** a faixa atual muda para a próxima
- **THEN** o app envia "Stopped" da faixa anterior com a posição final e "Playing" da nova

#### Scenario: Servidor fora do ar
- **WHEN** o relatório falha
- **THEN** a música continua tocando normalmente

### Requirement: Limpeza no logout
Ao sair da conta, o player SHALL parar, reportar a parada e esvaziar a fila.

#### Scenario: Logout durante a reprodução
- **WHEN** o usuário sai da conta com música tocando
- **THEN** a música para e a fila fica vazia
