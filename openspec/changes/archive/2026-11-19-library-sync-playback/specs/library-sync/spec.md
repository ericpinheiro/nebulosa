## ADDED Requirements

### Requirement: Sincronização inicial da biblioteca
Na primeira abertura com sessão, o app SHALL baixar em páginas os metadados de todas as faixas (`Audio`), álbuns (`MusicAlbum`), artistas de álbum e playlists do usuário e gravá-los no banco local.

#### Scenario: Primeira sincronização
- **WHEN** o usuário entra pela primeira vez e o banco local está vazio
- **THEN** o app busca as faixas em páginas de até 500 itens, grava tudo localmente e registra o horário da sincronização

#### Scenario: Progresso visível
- **WHEN** a sincronização inicial está em andamento
- **THEN** o app expõe o progresso (itens baixados / total) para a interface

### Requirement: Atualização incremental
Nas aberturas seguintes, o app SHALL buscar apenas os itens salvos no servidor depois da última sincronização e SHALL remover do banco local os itens que não existem mais no servidor.

#### Scenario: Faixa nova no servidor
- **WHEN** uma faixa foi adicionada ao Jellyfin desde a última sincronização
- **THEN** ela aparece no banco local após a atualização incremental

#### Scenario: Faixa removida do servidor
- **WHEN** uma faixa local não aparece mais na lista de ids do servidor
- **THEN** ela é removida do banco local

#### Scenario: Sem rede
- **WHEN** a atualização falha por falta de conexão
- **THEN** o app continua usando os dados locais sem mostrar erro bloqueante

### Requirement: Navegação local
Telas de biblioteca SHALL ler álbuns, faixas, artistas e playlists do banco local, sem esperar a rede.

#### Scenario: Abrir álbum
- **WHEN** a interface pede as faixas de um álbum
- **THEN** o banco devolve as faixas ordenadas por disco e número da faixa

### Requirement: Busca local
O app SHALL buscar por música, álbum e artista no banco local, ignorando acentos e maiúsculas.

#### Scenario: Busca sem acento
- **WHEN** o usuário busca "sao paulo"
- **THEN** faixas, álbuns e artistas com "São Paulo" no nome aparecem nos resultados

### Requirement: Limpeza no logout
Ao sair da conta, o app SHALL apagar o banco local da biblioteca.

#### Scenario: Logout limpa biblioteca
- **WHEN** o usuário sai da conta
- **THEN** o banco local não contém mais faixas, álbuns, artistas nem playlists
