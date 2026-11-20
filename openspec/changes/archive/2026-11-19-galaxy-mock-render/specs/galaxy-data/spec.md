## ADDED Requirements

### Requirement: Contrato JSON v1
O app SHALL consumir um JSON com `version` (string), `generatedAt` (ISO 8601), `count` e `points`, onde cada ponto tem `id` (id do item de áudio no Jellyfin), `p` (três números entre -1 e 1) e `group` opcional. Pontos inválidos MUST ser descartados sem derrubar o carregamento.

#### Scenario: JSON válido
- **WHEN** o app recebe um JSON v1 com 7.258 pontos válidos
- **THEN** a galáxia tem 7.258 pontos, cada um ligado ao id do Jellyfin

#### Scenario: Ponto fora do intervalo
- **WHEN** um ponto tem coordenada fora de [-1, 1] ou `p` com tamanho diferente de 3
- **THEN** esse ponto é descartado e os demais são carregados

#### Scenario: Ids duplicados
- **WHEN** o mesmo id aparece mais de uma vez
- **THEN** só a primeira ocorrência é usada

### Requirement: Mock com ids reais
Enquanto não houver URL de dados reais configurada, o app SHALL gerar a galáxia a partir dos ids das faixas da biblioteca local, com posições sintéticas em braços e aglomerados, normalizadas em [-1, 1] e determinísticas por id.

#### Scenario: Mesmo id, mesma posição
- **WHEN** o mock é gerado duas vezes com os mesmos ids
- **THEN** cada id recebe a mesma posição nas duas vezes

#### Scenario: Biblioteca ainda vazia
- **WHEN** a biblioteca local ainda não tem faixas
- **THEN** o app gera uma galáxia de pontos sem id para a animação de fundo e substitui quando a biblioteca chegar

### Requirement: Script de mock
O repositório SHALL ter um script que busca no Jellyfin os ids de todas as faixas e grava um JSON v1 com as posições sintéticas, usando o mesmo gerador do app.

#### Scenario: Gerar arquivo
- **WHEN** o script roda com usuário e senha do Jellyfin
- **THEN** um arquivo JSON v1 com um ponto por faixa é gravado

### Requirement: Fonte remota com cache por versão
Quando houver URL configurada, o app SHALL baixar o JSON, guardá-lo em disco e, nas aberturas seguintes, usar o cache e só substituí-lo quando a `version` remota for diferente.

#### Scenario: Versão igual
- **WHEN** o JSON remoto tem a mesma `version` do cache
- **THEN** o app continua usando o cache sem reprocessar

#### Scenario: Sem rede com cache
- **WHEN** o download falha e há cache
- **THEN** o app usa o cache

### Requirement: Envelope de energia
O app SHALL obter, para cada música, uma série de valores de energia entre 0 e 1 amostrados a cerca de 20 por segundo, e SHALL consultar o valor correspondente à posição de reprodução com interpolação. Enquanto não houver envelopes reais, SHALL usar uma onda sintética determinística por id.

#### Scenario: Consulta interpolada
- **WHEN** a posição de reprodução cai entre duas amostras
- **THEN** o valor devolvido é a interpolação linear entre elas

#### Scenario: Mock de envelope
- **WHEN** não há URL de envelopes configurada
- **THEN** o envelope é uma onda sintética com batidas regulares e valores entre 0 e 1
