## ADDED Requirements

### Requirement: Servidor fixo
O app SHALL se conectar exclusivamente ao Jellyfin em `https://brunoflix.rizomalivre.com`, sem nenhuma tela ou opção para escolher outro servidor.

#### Scenario: Tela de login sem campo de servidor
- **WHEN** o usuário abre a tela de login
- **THEN** a tela mostra apenas os campos de usuário e senha e o botão de entrar

### Requirement: Login com usuário e senha
O app SHALL autenticar o usuário via `POST /Users/AuthenticateByName` com o nome de usuário e a senha informados e, em caso de sucesso, iniciar a sessão com o token e o id do usuário devolvidos.

#### Scenario: Credenciais corretas
- **WHEN** o usuário informa usuário e senha válidos e toca em "Entrar"
- **THEN** o app guarda a sessão e abre a tela principal

#### Scenario: Credenciais erradas
- **WHEN** o servidor responde 401 ao login
- **THEN** o app mostra a mensagem "Usuário ou senha incorretos" e continua na tela de login

#### Scenario: Servidor indisponível
- **WHEN** a requisição de login falha por rede ou o servidor responde erro 5xx
- **THEN** o app mostra a mensagem "Não foi possível falar com o servidor" e continua na tela de login

#### Scenario: Campos vazios
- **WHEN** o usuário toca em "Entrar" com usuário vazio
- **THEN** o app não faz a requisição e indica que o usuário é obrigatório

### Requirement: Armazenamento seguro do token
O app MUST guardar o token de acesso, o id e o nome do usuário somente no armazenamento seguro do sistema (Keychain no iOS, Keystore no Android) via `expo-secure-store`. A senha MUST NOT ser guardada.

#### Scenario: Sessão persistida
- **WHEN** o login é bem-sucedido
- **THEN** token, id e nome do usuário ficam gravados no secure store e a senha não é gravada em lugar nenhum

### Requirement: Restauração da sessão
Na abertura, o app SHALL ler a sessão do armazenamento seguro e, se existir, entrar direto na tela principal sem pedir login.

#### Scenario: Abertura com sessão salva
- **WHEN** o app abre e existe uma sessão salva
- **THEN** a tela principal aparece sem passar pelo login

#### Scenario: Token revogado
- **WHEN** qualquer chamada ao servidor responde 401 com uma sessão ativa
- **THEN** o app apaga a sessão salva e volta para a tela de login

### Requirement: Encerrar sessão
O app SHALL permitir sair da conta, avisando o servidor (`POST /Sessions/Logout`) quando possível e apagando a sessão local em qualquer caso.

#### Scenario: Logout
- **WHEN** o usuário escolhe "Sair"
- **THEN** a sessão local é apagada e o app mostra a tela de login, mesmo que o aviso ao servidor falhe

### Requirement: Identificação do dispositivo
Toda requisição ao Jellyfin SHALL enviar o cabeçalho de autorização com cliente "Nebulosa", versão do app, nome do aparelho e um id de dispositivo estável gerado na primeira abertura.

#### Scenario: Id de dispositivo estável
- **WHEN** o app é aberto várias vezes no mesmo aparelho
- **THEN** o id de dispositivo enviado ao servidor é sempre o mesmo
